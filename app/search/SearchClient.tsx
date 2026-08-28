"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const DARK = "#1A1714";
const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Matches the `kind` values returned by the search_site() RPC.
const KINDS = ["Startup", "Mentor", "Organization", "Challenge", "Resource", "Event"] as const;
type Kind = (typeof KINDS)[number];

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

const MIN_QUERY = 2;

export default function SearchClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [hits, setHits] = useState<Hit[]>([]);
  const [kind, setKind] = useState<Kind | "All">("All");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  // Guards against a slow early request overwriting a newer one's results.
  const requestId = useRef(0);

  const run = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < MIN_QUERY) {
      setHits([]);
      setStatus("idle");
      return;
    }
    if (!supabase) {
      setError("Search isn't configured yet.");
      setStatus("error");
      return;
    }
    const mine = ++requestId.current;
    setStatus("loading");
    setError("");

    const { data, error: err } = await supabase.rpc("search_site", { q: trimmed, max_results: 60 });
    if (mine !== requestId.current) return; // a newer query already landed

    if (err) {
      setError(
        err.message.includes("search_site")
          ? "Search isn't available yet — the database function still needs to be installed."
          : err.message
      );
      setStatus("error");
      return;
    }
    setHits((data as Hit[]) ?? []);
    setStatus("done");
  }, []);

  // Debounced as you type, so a fast typist makes one request, not eight.
  useEffect(() => {
    const t = setTimeout(() => run(query), 250);
    return () => clearTimeout(t);
  }, [query, run]);

  // Keep the URL in step so a result list can be linked or reloaded.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  }, [query]);

  const counts = KINDS.reduce<Record<string, number>>((acc, k) => {
    acc[k] = hits.filter((h) => h.kind === k).length;
    return acc;
  }, {});
  const shown = kind === "All" ? hits : hits.filter((h) => h.kind === kind);
  const tooShort = query.trim().length > 0 && query.trim().length < MIN_QUERY;

  return (
    <div style={{ background: "#F6F2EA", padding: "48px 40px 72px", minHeight: "60vh" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <label htmlFor="ib-search-input" style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>
          Search the ecosystem
        </label>
        <div style={{ position: "relative", marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B8479" strokeWidth={2} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="ib-search-input"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Startups, mentors, organizations, challenges, resources, events…"
            style={{
              width: "100%",
              fontSize: 16,
              padding: "16px 20px 16px 50px",
              borderRadius: 9999,
              border: "1px solid rgba(64,50,34,0.16)",
              background: "#fff",
              color: DARK,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {hits.length > 0 && (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 22 }}>
            {(["All", ...KINDS] as const).map((k) => {
              const n = k === "All" ? hits.length : counts[k];
              if (k !== "All" && n === 0) return null;
              const active = kind === k;
              return (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    padding: "7px 15px",
                    borderRadius: 9999,
                    border: "none",
                    cursor: "pointer",
                    color: active ? "#fff" : "#5A544B",
                    background: active ? DARK : "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {k === "All" ? "All results" : `${k}s`}
                  <span style={{ fontSize: 10.5, opacity: 0.7 }}>{n}</span>
                </button>
              );
            })}
          </div>
        )}

        {status === "loading" && (
          <p style={{ fontSize: 14, color: "#8B8479", padding: "20px 0" }}>Searching…</p>
        )}

        {status === "error" && (
          <div style={{ background: "#fff", border: "1px solid rgba(226,58,46,0.24)", borderRadius: 16, padding: "20px 24px" }}>
            <p style={{ margin: 0, fontSize: 14, color: "#E23A2E", fontWeight: 600 }}>Couldn&rsquo;t run the search</p>
            <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#5A544B", lineHeight: 1.6 }}>{error}</p>
          </div>
        )}

        {tooShort && (
          <p style={{ fontSize: 14, color: "#8B8479", padding: "20px 0" }}>Type at least {MIN_QUERY} characters.</p>
        )}

        {status === "idle" && !tooShort && (
          <div style={{ background: "#fff", border: "1px dashed rgba(64,50,34,0.16)", borderRadius: 18, padding: "40px 32px", textAlign: "center" }}>
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: DARK }}>Search across the whole ecosystem</p>
            <p style={{ margin: 0, fontSize: 13.5, color: "#8B8479", lineHeight: 1.6 }}>
              One box for startups, mentors, organizations, innovation challenges, Knowledge Hub resources, and events.
            </p>
          </div>
        )}

        {status === "done" && shown.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 18, padding: "36px 32px", textAlign: "center" }}>
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: DARK }}>No matches for &ldquo;{query.trim()}&rdquo;</p>
            <p style={{ margin: 0, fontSize: 13.5, color: "#8B8479" }}>Try a shorter word, or a sector or organization name.</p>
          </div>
        )}

        {shown.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shown.map((h) => {
              const ks = KIND_STYLE[h.kind] ?? KIND_STYLE.Startup;
              return (
                <a
                  key={`${h.kind}-${h.id}`}
                  href={`${BP}${h.href}`}
                  className="ib-card-hover"
                  style={{
                    display: "block",
                    background: "#fff",
                    border: "1px solid rgba(64,50,34,0.06)",
                    borderRadius: 16,
                    padding: "18px 22px",
                    textDecoration: "none",
                    boxShadow: "0 1px 2px rgba(17,17,20,0.02)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: ks.color, background: ks.bg, padding: "3px 9px", borderRadius: 9999 }}>
                      {h.kind}
                    </span>
                    {h.subtitle && <span style={{ fontSize: 12.5, color: "#8B8479" }}>{h.subtitle}</span>}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: DARK, letterSpacing: "-0.012em", marginBottom: h.description ? 5 : 0 }}>
                    {h.title}
                  </div>
                  {h.description && (
                    <p className="ib-line-clamp-2" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#5A544B" }}>
                      {h.description}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
