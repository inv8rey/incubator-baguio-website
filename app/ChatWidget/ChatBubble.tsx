"use client";

export default function ChatBubble({ onClick, showPulse }: { onClick: () => void; showPulse: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Incubator Baguio Assistant"
      className="ib-chat-bubble"
      style={{
        position: "fixed",
        bottom: 84,
        right: 22,
        zIndex: 95,
        width: 56,
        height: 56,
        borderRadius: 9999,
        background: "#F26522",
        border: "none",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 12px 28px -8px rgba(242,101,34,0.6)",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      {showPulse && (
        <span
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: "#1A6B3C",
            border: "2px solid #F6F2EA",
          }}
        />
      )}
    </button>
  );
}
