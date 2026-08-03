"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import QuickActions from "./QuickActions";
import type { ChatUiMessage } from "./types";

interface ChatPanelProps {
  messages: ChatUiMessage[];
  loading: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
  onQuickPick: (prompt: string) => void;
}

export default function ChatPanel({ messages, loading, input, onInputChange, onSend, onClose, onQuickPick }: ChatPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div
      className="ib-chat-panel"
      role="dialog"
      aria-label="Incubator Baguio Assistant"
      style={{
        position: "fixed",
        bottom: 84,
        right: 22,
        zIndex: 96,
        width: 380,
        maxHeight: 600,
        height: "70vh",
        background: "#0B0B0D",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 24px 60px -12px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Incubator Baguio Assistant</div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)" }}>Find opportunities, mentors &amp; resources faster</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 4 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div ref={listRef} aria-live="polite" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.6)" }}>
            Hi! Ask me to find open challenges, mentors, potential collaborators, or Knowledge Hub resources — or try one of the prompts below.
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {loading && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>Thinking…</div>
        )}
      </div>

      {messages.length === 0 && !loading && <QuickActions onPick={onQuickPick} />}

      <div style={{ display: "flex", gap: 8, padding: 14, borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Describe your idea or ask a question…"
          disabled={loading}
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13.5,
            color: "#fff",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 9999,
            padding: "10px 16px",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          style={{
            width: 40,
            height: 40,
            borderRadius: 9999,
            background: loading || !input.trim() ? "rgba(242,101,34,0.4)" : "#F26522",
            border: "none",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: loading || !input.trim() ? "default" : "pointer",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
    </div>
  );
}
