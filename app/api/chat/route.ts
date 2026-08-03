import { checkRateLimit, getClientIp } from "../../../lib/chatRateLimit";
import { classifyIntent, fetchChatContext, formatContextBlock, hydrateMatches } from "../../../lib/chatContext";
import { requestChatCompletion, SYSTEM_PROMPT, type ChatMessage } from "../../../lib/chatCompletion";
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
    return Response.json(
      { error: "You're sending messages too quickly. Please wait a moment and try again." },
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

    return Response.json({ reply: parsed.text, cards });
  } catch (err: any) {
    return Response.json({ error: err.message || "Couldn't get a response. Please try again." }, { status: 502 });
  }
}
