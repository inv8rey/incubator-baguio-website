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

const UUID_SRC = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

// Belt-and-suspenders against the model leaking a raw id into the
// human-readable part of the reply despite the system prompt telling it not
// to — strips "(id: ...)" asides and bare UUIDs, then tidies up the
// whitespace/punctuation left behind.
function stripLeakedIds(text: string): string {
  return text
    .replace(new RegExp(`\\s*\\([^()]*\\bid\\s*:?\\s*${UUID_SRC}[^()]*\\)`, "gi"), "")
    .replace(new RegExp(`\\bid\\s*:?\\s*${UUID_SRC}\\b`, "gi"), "")
    .replace(new RegExp(UUID_SRC, "gi"), "")
    .replace(/\(\s*\)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([.,;:!?])/g, "$1")
    .trim();
}

export function parseChatCompletion(raw: string): ParsedChatReply {
  const markerStart = raw.indexOf("<<<MATCHES>>>");
  if (markerStart === -1) return { text: stripLeakedIds(raw.trim()), matches: [] };

  const text = stripLeakedIds(raw.slice(0, markerStart).trim());
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
