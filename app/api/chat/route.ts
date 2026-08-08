import { checkRateLimit, getClientIp, RATE_LIMIT_MESSAGES } from "../../../lib/chatRateLimit";
import { classifyIntent, fetchChatContext, formatContextBlock, hydrateMatches, suggestFollowUps } from "../../../lib/chatContext";
import { requestChatCompletion, SYSTEM_PROMPT, ChatServiceError, type ChatMessage } from "../../../lib/chatCompletion";
import { parseChatCompletion } from "../../../lib/chatParse";

export const maxDuration = 30;

const MAX_HISTORY_MESSAGES = 6; // last ~3 user/assistant turns — bounds prompt size regardless of client history length
const MAX_MESSAGE_LENGTH = 800; // characters — guards against pasted essays blowing the token budget

export async function POST(req: Request) {
  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = (body.messages ?? []).slice(-MAX_HISTORY_MESSAGES);
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content?.trim();
  if (!lastUserMessage) {
    return Response.json({ error: "No message provided." }, { status: 400 });
  }
  if (lastUserMessage.length > MAX_MESSAGE_LENGTH) {
    return Response.json({ error: "Message is too long. Please shorten it." }, { status: 400 });
  }

  const ip = getClientIp(req);
  const rate = await checkRateLimit(ip);
  if (!rate.allowed) {
    // Distinct copy per reason: "slow down" and "the assistant is out of
    // capacity for today" call for completely different things from the
    // visitor, and the old single message told them to retry in a moment even
    // when the answer was "not until tomorrow".
    return Response.json(
      { error: RATE_LIMIT_MESSAGES[rate.reason ?? "ip-burst"], retryable: rate.reason === "ip-burst" },
      { status: 429, headers: rate.retryAfterSeconds ? { "Retry-After": String(rate.retryAfterSeconds) } : undefined }
    );
  }

  try {
    const intent = classifyIntent(lastUserMessage);
    const context = await fetchChatContext(intent, lastUserMessage);
    const contextBlock = formatContextBlock(context);

    const cfMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: `CONTEXT:\n\n${contextBlock}` },
      ...messages.map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.content.slice(0, MAX_MESSAGE_LENGTH),
      })),
    ];

    const raw = await requestChatCompletion(cfMessages);
    const parsed = parseChatCompletion(raw);
    const cards = hydrateMatches(parsed.matches, context);

    return Response.json({
      reply: parsed.text,
      cards,
      // Sent so the panel can show the visitor that an answer rests on the
      // team's uploaded programme documents rather than model recall. Titles
      // only, never content or a link -- those documents are private.
      sources: context.documentTitles,
      followUps: suggestFollowUps(context, cards),
    });
  } catch (err: any) {
    if (err instanceof ChatServiceError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("Unexpected chat error:", err);
    return Response.json(
      { error: "The assistant is temporarily unavailable. Please try again shortly." },
      { status: 502 }
    );
  }
}
