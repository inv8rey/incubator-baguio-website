"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const DARK = "#1A1714";
const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const MIN_QUERY = 2;
const DROPDOWN_LIMIT = 8;

type Kind = "Startup" | "Mentor" | "Organization" | "Challenge" | "Resource" | "Event";

const KIND_STYLE: Record<Kind, { color: string; bg: string }> = {
  Startup: { color: "#D9531E", bg: "rgba(217,83,30,0.10)" },
  Mentor: { color: "#3A5FA0", bg: "rgba(58,95,160,0.10)" },
  Organization: { color: "#22596F", bg: "rgba(34,89,111,0.10)" },
  Challenge: { color: "#8E2749", bg: "rgba(142,39,73,0.10)" },
  Resource: { color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  Event: { color: "#5A4BC4", bg: "rgba(90,75,196,0.10)" },
};

interface Hit {
  kind: Kind;
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  href: string;
  rank: number;
}

/**
 * Replaces the header search icon's old behavior (a hard navigation to
 * /search) with an inline expanding bar + type-ahead, reusing the same
 * search_site() RPC the full /search page uses. The icon itself stays a
 * real `<a href="/search">` in the static nav markup (chrome.ts) for
 * no-JS/SEO fallback; this component just intercepts its click once JS is
 * up, the same pattern AuthNav.tsx uses for the auth slot.
 */
export default function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const triggers = document.querySelectorAll<HTMLAnchorElement>(".ib-search-trigger");
    function onClick(e: MouseEvent) {
      e.preventDefault();
      setOpen((o) => !o);
    }
    triggers.forEach((t) => t.addEventListener("click", onClick));
    return () => triggers.forEach((t) => t.removeEventListener("click", onClick));
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && !(e.target as HTMLElement).closest(".ib-search-trigger")) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const run = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < MIN_QUERY) {
      setHits([]);
      setStatus("idle");
      return;
    }
    if (!supabase) {
      setStatus("error");
      return;
    }
    const mine = ++requestId.current;
    setStatus("loading");
    const { data, error } = await supabase.rpc("search_site", { q: trimmed, max_results: 30 });
    if (mine !== requestId.current) return;
    if (error) {
      setStatus("error");
      return;
    }
    setHits((data as Hit[]) ?? []);
    setStatus("done");
  }, []);

  useEffect(() => {
    const t = setTimeout(() => run(query), 250);
    return () => clearTimeout(t);
  }, [query, run]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHits([]);
      setStatus("idle");
    }
  }, [open]);

  if (!open) return null;

  const shown = hits.slice(0, DROPDOWN_LIMIT);
  const tooShort = query.trim().length > 0 && query.trim().length < MIN_QUERY;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(16,13,11,0.5)", backdropFilter: "blur(2px)" }}>
      <div
        ref={panelRef}
        style={{
          maxWidth: 640,
          margin: "88px auto 0",
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 30px 70px -20px rgba(0,0,0,0.45)",
          overflow: "hidden",
          animation: "ibsearchdrop .18s cubic-bezier(.22,.61,.36,1)",
        }}
      >
        <div style={{ position: "relative", padding: 14, borderBottom: hits.length > 0 || status !== "idle" ? "1px solid rgba(64,50,34,0.1)" : "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6E685F" strokeWidth={2} style={{ position: "absolute", left: 30, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim().length >= MIN_QUERY) {
                window.location.href = `${BP}/search?q=${encodeURIComponent(query.trim())}`;
              }
            }}
            placeholder="Search startups, mentors, organizations, challenges…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: 16,
              padding: "12px 16px 12px 50px",
              borderRadius: 12,
              border: "1px solid rgba(64,50,34,0.14)",
              background: "#F6F2EA",
              color: DARK,
              outline: "none",
            }}
          />
        </div>

        {status === "loading" && <p style={{ margin: 0, padding: "20px 24px", fontSize: 13.5, color: "#6E685F" }}>Searching…</p>}

        {status === "error" && <p style={{ margin: 0, padding: "20px 24px", fontSize: 13.5, color: "#E23A2E" }}>Search isn&rsquo;t available right now.</p>}

        {tooShort && <p style={{ margin: 0, padding: "20px 24px", fontSize: 13.5, color: "#6E685F" }}>Type at least {MIN_QUERY} characters.</p>}

        {status === "done" && shown.length === 0 && (
          <p style={{ margin: 0, padding: "20px 24px", fontSize: 13.5, color: "#6E685F" }}>No matches for &ldquo;{query.trim()}&rdquo;.</p>
        )}

        {shown.length > 0 && (
          <div style={{ maxHeight: "56vh", overflowY: "auto", padding: 10 }}>
            {shown.map((h) => {
              const ks = KIND_STYLE[h.kind] ?? KIND_STYLE.Startup;
              return (
                <a
                  key={`${h.kind}-${h.id}`}
                  href={`${BP}${h.href}`}
                  style={{ display: "block", padding: "10px 12px", borderRadius: 12, textDecoration: "none" }}
                  className="ib-headersearch-hit"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: ks.color, background: ks.bg, padding: "2px 8px", borderRadius: 9999 }}>
                      {h.kind}
                    </span>
                    {h.subtitle && <span style={{ fontSize: 12, color: "#6E685F" }}>{h.subtitle}</span>}
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>{h.title}</div>
                </a>
              );
            })}
            {hits.length > 0 && (
              <a
                href={`${BP}/search?q=${encodeURIComponent(query.trim())}`}
                style={{ display: "block", marginTop: 4, padding: "12px", textAlign: "center", fontSize: 13, fontWeight: 600, color: ORANGE, textDecoration: "none", borderRadius: 12 }}
                className="ib-headersearch-hit"
              >
                See all {hits.length} result{hits.length === 1 ? "" : "s"} &rarr;
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
