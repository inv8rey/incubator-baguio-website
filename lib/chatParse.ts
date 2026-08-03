import type { ChatEntityType } from "./chatContext";

export interface ParsedChatMatch {
  type: ChatEntityType;
  id: string;
  reason: string;
}

export interface ParsedChatReply {
  text: string;
  matches: ParsedChatMatch[];
}

const VALID_TYPES = ["challenge", "mentor", "startup", "resource"];

export function parseChatCompletion(raw: string): ParsedChatReply {
  const markerStart = raw.indexOf("<<<MATCHES>>>");
  if (markerStart === -1) return { text: raw.trim(), matches: [] };

  const text = raw.slice(0, markerStart).trim();
  const markerEnd = raw.indexOf("<<<END>>>", markerStart);
  const jsonStr = raw.slice(markerStart + "<<<MATCHES>>>".length, markerEnd === -1 ? undefined : markerEnd).trim();

  try {
    const parsed = JSON.parse(jsonStr);
    const matches: ParsedChatMatch[] = Array.isArray(parsed?.matches)
      ? parsed.matches
          .filter((m: any) => m && typeof m.id === "string" && VALID_TYPES.includes(m.type))
          .map((m: any) => ({ type: m.type, id: m.id, reason: typeof m.reason === "string" ? m.reason : "" }))
      : [];
    return { text, matches };
  } catch {
    // Malformed JSON from the model — degrade to text-only, don't crash the request.
    return { text, matches: [] };
  }
}
