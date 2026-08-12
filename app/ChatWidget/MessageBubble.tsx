"use client";

import ResultCards from "./ResultCards";
import type { ChatUiMessage } from "./types";

export default function MessageBubble({
  message,
  onRetry,
  onFollowUp,
}: {
  message: ChatUiMessage;
  onRetry?: () => void;
  onFollowUp?: (prompt: string) => void;
}) {
  const isUser = message.role === "user";
  const followUps = message.followUps ?? [];

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div style={{ maxWidth: "88%", minWidth: 0 }}>
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

        {!isUser && message.error && onRetry && message.retryable !== false && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: "#FF8A80",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 4v6h-6" />
            </svg>
            Retry
          </button>
        )}

        {!isUser && message.cards && <ResultCards cards={message.cards} />}

        {/* Without these a visitor has nothing to do after the first reply but
            invent their own next question. */}
        {!isUser && !message.error && followUps.length > 0 && onFollowUp && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {followUps.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFollowUp(f)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.8)",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 9999,
                  padding: "6px 12px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
