"use client";

import ResultCards from "./ResultCards";
import type { ChatUiMessage } from "./types";

export default function MessageBubble({ message }: { message: ChatUiMessage }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div style={{ maxWidth: "88%" }}>
        <div
          style={{
            fontSize: 13.5,
            lineHeight: 1.55,
            padding: "10px 14px",
            borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
            background: isUser ? "#F26522" : message.error ? "rgba(226,58,46,0.16)" : "rgba(255,255,255,0.08)",
            color: isUser ? "#fff" : message.error ? "#FF8A80" : "rgba(255,255,255,0.92)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </div>
        {!isUser && message.cards && <ResultCards cards={message.cards} />}
      </div>
    </div>
  );
}
