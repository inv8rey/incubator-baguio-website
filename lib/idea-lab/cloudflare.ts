// Cloudflare Workers AI client for the Idea Lab. Reuses the account and token
// the site chatbot already uses (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN),
// so it costs nothing until the free daily allowance is exceeded.
//
// IDEA_LAB_CF_MODEL picks the model. The 70B default writes the best titles but
// uses the free allowance fastest; "@cf/meta/llama-3.1-8b-instruct" goes much
// further per day at lower quality.

const ACCOUNT_ID = (process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
const API_TOKEN = (process.env.CLOUDFLARE_API_TOKEN || '').trim();
export const CF_MODEL = (process.env.IDEA_LAB_CF_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast').trim();

export function cloudflareConfigured() {
  return !!ACCOUNT_ID && !!API_TOKEN;
}

export interface CfMessage { role: 'system' | 'user' | 'assistant'; content: string }

const url = () => `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${CF_MODEL}`;
const headers = () => ({ Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' });

const approxTokens = (s: string) => Math.ceil(s.length / 4);

/** One JSON answer that must match `schema`. Returns the parsed object. */
export async function cfJson(messages: CfMessage[], schema: object, maxTokens: number): Promise<{ data: unknown; input_tokens: number; output_tokens: number }> {
  const res = await fetch(url(), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ messages, max_tokens: maxTokens, temperature: 0.9, response_format: { type: 'json_schema', json_schema: schema } }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) throw new Error(`Cloudflare AI responded ${res.status}: ${JSON.stringify(body?.errors ?? '').slice(0, 200)}`);
  const raw = body.result?.response;
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const inTok = body.result?.usage?.prompt_tokens ?? approxTokens(messages.map((m) => m.content).join(''));
  const outTok = body.result?.usage?.completion_tokens ?? approxTokens(typeof raw === 'string' ? raw : JSON.stringify(raw ?? ''));
  return { data, input_tokens: inTok, output_tokens: outTok };
}

/**
 * Streams a JSON answer as text. `onText` receives each new piece as it
 * arrives (feed it to the incremental idea parser). Returns token usage.
 */
export async function cfStream(messages: CfMessage[], schema: object, maxTokens: number, onText: (t: string) => Promise<void> | void): Promise<{ input_tokens: number; output_tokens: number }> {
  const res = await fetch(url(), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ messages, max_tokens: maxTokens, temperature: 0.9, stream: true, response_format: { type: 'json_schema', json_schema: schema } }),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '');
    throw new Error(`Cloudflare AI responded ${res.status}: ${body.slice(0, 200)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let outChars = 0;
  let usage: { prompt_tokens?: number; completion_tokens?: number } | undefined;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        // Chunks come as either { response } or OpenAI-style { choices: [{ delta: { content } }] }.
        const chunk = JSON.parse(payload) as { response?: string; usage?: typeof usage; choices?: { delta?: { content?: string } }[] };
        if (chunk.usage) usage = chunk.usage;
        const text = typeof chunk.response === 'string' ? chunk.response : chunk.choices?.[0]?.delta?.content;
        if (text) {
          outChars += text.length;
          await onText(text);
        }
      } catch {
        // A partial or non-JSON line: ignore it.
      }
    }
  }
  return {
    input_tokens: usage?.prompt_tokens ?? approxTokens(messages.map((m) => m.content).join('')),
    output_tokens: usage?.completion_tokens ?? Math.ceil(outChars / 4),
  };
}
