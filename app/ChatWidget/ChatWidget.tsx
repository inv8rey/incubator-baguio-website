"use client";

import { useEffect, useState } from "react";
import ChatBubble from "./ChatBubble";
import ChatPanel from "./ChatPanel";
import type { ChatUiMessage } from "./types";

const HISTORY_KEY = "ib-chat-history";
const SEEN_KEY = "ib-chat-seen";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(HISTORY_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      // sessionStorage unavailable or corrupted — start fresh, non-fatal.
    }
    setShowPulse(!localStorage.getItem(SEEN_KEY));
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
    } catch {
      // Ignore quota/availability errors — persistence is a nice-to-have.
    }
  }, [messages]);

  function openWidget() {
    setOpen(true);
    setShowPulse(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }

  async function sendRequest(history: ChatUiMessage[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();

      if (!res.ok) {
        const friendly = res.status === 429 ? data.error : data.error || "Couldn't get a response. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content: friendly, error: true }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, cards: data.cards }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong reaching the assistant. Please try again.", error: true }]);
    } finally {
      setLoading(false);
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatUiMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    await sendRequest(nextMessages);
  }

  function retry() {
    if (loading) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || !last.error) return;
    const withoutError = messages.slice(0, -1);
    setMessages(withoutError);
    sendRequest(withoutError);
  }

  return (
    <>
      {!open && <ChatBubble onClick={openWidget} showPulse={showPulse} />}
      {open && (
        <ChatPanel
          messages={messages}
          loading={loading}
          input={input}
          onInputChange={setInput}
          onSend={() => send(input)}
          onClose={() => setOpen(false)}
          onQuickPick={(prompt) => send(prompt)}
          onRetry={retry}
        />
      )}
    </>
  );
}
