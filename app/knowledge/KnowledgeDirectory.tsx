"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { DARK, KNOWLEDGE_CATEGORIES, fundingDeadlineInfo, type KnowledgeCategory, type KnowledgeResource } from "./data";
import { fetchDynamicKnowledgeResources } from "./dynamicData";

function matches(haystacks: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystacks.some((h) => h.toLowerCase().includes(q));
}

// Matches the toolbar treatment in app/ecosystem/EcosystemDirectory.tsx so the
// two directories' filter rows read as the same control set. appearance:none
// plus a background chevron rather than the native arrow, which sits flush
// against a pill's curved edge.
const CHEVRON_SVG =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236E685F' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E";

const filterSelectStyle: React.CSSProperties = {
  height: 44,
  fontSize: 13.5,
  fontWeight: 600,
  color: DARK,
  background: `#fff url("${CHEVRON_SVG}") no-repeat right 14px center`,
  backgroundSize: "12px",
  border: "1px solid rgba(64,50,34,0.16)",
  borderRadius: 9999,
  padding: "0 36px 0 15px",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
  cursor: "pointer",
  minWidth: 0,
  maxWidth: "100%",
};

type SortKey = "featured" | "newest" | "az" | "deadline";
type TypeKey = "all" | "file" | "link";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Sort: Featured first" },
  { value: "newest", label: "Sort: Newest" },
  { value: "az", label: "Sort: A – Z" },
  { value: "deadline", label: "Sort: Closing soonest" },
];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function KnowledgeDirectory() {
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<KnowledgeCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeKey>("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");

  // Deep-link support for "/knowledge?category=<id>" (from the nav's hover
  // mega-menu) — mirrors the same "?tab=" pattern already used by
  // app/ecosystem/EcosystemDirectory.tsx. Matched case-insensitively.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      const match = KNOWLEDGE_CATEGORIES.map((c) => c.id).find((id) => id.toLowerCase() === categoryParam.toLowerCase());
      if (match) setTab(match);
    }
  }, []);

  useEffect(() => {
    function load() {
      fetchDynamicKnowledgeResources().then((r) => {
        setResources(shuffle(r));
        setLoaded(true);
      });
    }
    load();
    // Mobile browsers freely suspend an in-flight fetch (and the realtime
    // websocket) when the tab is backgrounded -- locking the phone or
    // switching apps mid-load, then coming back, previously left the grid
    // stuck on whatever it had (often nothing) with no further trigger to
    // retry. Refetch whenever the tab becomes visible again.
    function onVisible() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", onVisible);
    if (!supabase) return () => document.removeEventListener("visibilitychange", onVisible);
    const channel = supabase
      .channel("public-knowledge-resources")
      .on("postgres_changes", { event: "*", schema: "public", table: "knowledge_resources" }, load)
      .subscribe();
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      supabase!.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const list = resources.filter((r) => {
      if (tab !== "All" && r.category !== tab) return false;
      if (type === "file" && !r.fileUrl) return false;
      if (type === "link" && !r.linkUrl) return false;
      if (openOnly && fundingDeadlineInfo(r.deadlineDate)?.closed) return false;
      return matches([r.title, r.description, r.source ?? ""], query);
    });

    // Closed funding calls sink to the bottom regardless of the chosen sort --
    // a "Featured" grant nobody can apply to anymore is worse than useless at
    // the top of the grid, since it's the first thing a founder would click.
    const closed = (r: KnowledgeResource) => Number(!!fundingDeadlineInfo(r.deadlineDate)?.closed);

    return [...list].sort((a, b) => {
      if (closed(a) !== closed(b)) return closed(a) - closed(b);
      switch (sort) {
        case "newest":
          return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
        case "az":
          return a.title.localeCompare(b.title);
        case "deadline": {
          // Undated resources have no deadline to be "soonest", so they trail
          // the dated ones rather than sorting as the year 0.
          const ad = a.deadlineDate || "9999-12-31";
          const bd = b.deadlineDate || "9999-12-31";
          return ad.localeCompare(bd);
        }
        default:
          return Number(!!b.featured) - Number(!!a.featured);
      }
    });
  }, [resources, tab, query, type, openOnly, sort]);

  const activeInfo = tab !== "All" ? KNOWLEDGE_CATEGORIES.find((c) => c.id === tab) : null;
  const filtersActive = tab !== "All" || type !== "all" || openOnly || !!query.trim();

  function clearAll() {
    setTab("All");
    setType("all");
    setOpenOnly(false);
    setQuery("");
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      {/* Docked search panel. Pulled up over the hero's lower edge so the
          first thing on the page after the headline is the thing most people
          came to do -- searching -- rather than four category cards with the
          search tucked in a 360px field underneath them. */}
      <div className="ib-knowledge-searchdock">
        <label htmlFor="ib-knowledge-search" className="ib-knowledge-searchlabel">
          Search the library
        </label>
        <div className="ib-knowledge-searchfield">
          <svg viewBox="0 0 24 24" fill="none" stroke="#6E685F" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="ib-knowledge-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, research, grants, and reports…"
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="ib-knowledge-filters">
          <select value={type} onChange={(e) => setType(e.target.value as TypeKey)} style={filterSelectStyle} aria-label="Filter by resource type">
            <option value="all">All formats</option>
            <option value="file">Downloadable file</option>
            <option value="link">External link</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} style={filterSelectStyle} aria-label="Sort resources">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setOpenOnly((v) => !v)}
            aria-pressed={openOnly}
            className={`ib-knowledge-toggle${openOnly ? " is-on" : ""}`}
          >
            Open opportunities only
          </button>

          <div className="ib-knowledge-filtermeta">
            <span>
              <strong>{filtered.length}</strong> resource{filtered.length === 1 ? "" : "s"}
            </span>
            {filtersActive && (
              <button type="button" onClick={clearAll} className="ib-knowledge-clear">
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A8400F", marginBottom: 8 }}>Resource library</div>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: DARK }}>Browse by category</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }} className="ib-knowledge-cat-grid">
        {KNOWLEDGE_CATEGORIES.map((c) => {
          const active = tab === c.id;
          const count = resources.filter((r) => r.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setTab(active ? "All" : c.id)}
              style={{
                textAlign: "left",
                background: active ? c.bg : "#fff",
                border: `1.5px solid ${active ? c.color : "rgba(64,50,34,0.13)"}`,
                borderRadius: 16,
                padding: "16px 16px 14px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: active ? c.color : DARK }}>{c.id}</span>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: active ? c.color : "#6E685F", background: active ? "#fff" : "rgba(64,50,34,0.09)", padding: "2px 7px", borderRadius: 999, flexShrink: 0 }}>{count}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "#5A544B" }}>{c.description}</p>
            </button>
          );
        })}
      </div>

      {activeInfo && (
        <div style={{ fontSize: 12.5, color: "#5A544B", marginBottom: 16 }}>
          Showing <strong style={{ color: DARK }}>{activeInfo.id}</strong> &mdash; {activeInfo.description}
        </div>
      )}

      {filtered.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24 }} className="ib-knowledge-grid">
          {filtered.map((r) => {
            const cat = KNOWLEDGE_CATEGORIES.find((c) => c.id === r.category);
            const href = r.fileUrl || r.linkUrl;
            const isFunding = r.category === "Funding & Opportunities";
            const deadline = isFunding ? fundingDeadlineInfo(r.deadlineDate) : null;
            const isClosed = !!deadline?.closed;
            // A funding notice is a call to action, not a document to browse —
            // "Apply Now" says what happens next; "View resource"/"Download"
            // don't fit a grant deadline the way they fit a template PDF.
            const ctaLabel = isFunding ? (r.linkUrl ? "Apply Now" : "View Guidelines") : r.fileUrl ? "Download" : "View resource";
            return (
              <div
                key={r.id}
                className="ib-card-hover"
                style={{
                  position: "relative",
                  background: isClosed ? "#F9F8F5" : "#fff",
                  border: r.featured && !isClosed ? "1.5px solid rgba(242,101,34,0.35)" : "1px solid rgba(64,50,34,0.13)",
                  borderRadius: 18,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  // Closed calls stay fully legible (never opacity on the whole
                  // card) but read as inactive at a glance -- the image loses
                  // color and the accent border/featured ribbon disappear.
                  filter: isClosed ? "grayscale(0.5)" : undefined,
                }}
              >
                {isFunding && r.coverImageUrl && (
                  <div style={{ height: 140, background: "#F6F2EA", overflow: "hidden", position: "relative" }}>
                    <img src={r.coverImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: isClosed ? "grayscale(1)" : undefined }} />
                    {isClosed && <div style={{ position: "absolute", inset: 0, background: "rgba(249,248,245,0.35)" }} />}
                  </div>
                )}
                <div style={{ position: "relative", padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
                  {r.featured && !isClosed && (
                    <span style={{ position: "absolute", top: 14, right: 14, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: "#F26522", background: "rgba(242,101,34,0.12)", padding: "4px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>★ Featured</span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {cat && (
                      <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: isClosed ? "#6E685F" : cat.color, background: isClosed ? "rgba(64,50,34,0.08)" : cat.bg, padding: "4px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>
                        {cat.id}
                      </span>
                    )}
                    {deadline && (
                      <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: deadline.color, background: `${deadline.color}1A`, padding: "4px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>
                        {deadline.label}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 16.5, fontWeight: 600, color: isClosed ? "#5A544B" : DARK, lineHeight: 1.3 }}>{r.title}</h3>
                    <p className="ib-line-clamp-3" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#5A544B" }}>{r.description}</p>
                  </div>

                  {isFunding && (r.fundingAmount || r.targetParticipants) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(64,50,34,0.09)" }}>
                      {r.fundingAmount && (
                        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: isClosed ? "#6E685F" : DARK, fontWeight: 600 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isClosed ? "#6E685F" : "#1A6B3C"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1 3 2.2c0 2.8-6 1.3-6 4.1 0 1.2 1.3 2.2 3 2.2s3-1.1 3-2.5" /></svg>
                          {r.fundingAmount}
                        </div>
                      )}
                      {r.targetParticipants && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12.5, color: "#5A544B" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6E685F" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1.5 }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                          <span>{r.targetParticipants}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {r.source && <p style={{ margin: "10px 0 0", fontSize: 12, color: "#6E685F" }}>{r.source}</p>}
                  {isClosed ? (
                    // No link at all once a call is closed -- an "Apply Now"
                    // button that still works just leads a founder to submit
                    // into a form that no longer accepts entries.
                    <span style={{ marginTop: 16, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#6E685F", background: "rgba(64,50,34,0.08)", padding: "10px 18px", borderRadius: 9999 }}>
                      Applications closed
                    </span>
                  ) : (
                    href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => supabase?.rpc("increment_resource_views", { p_resource_id: r.id })}
                        style={{ marginTop: 16, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#fff", background: isFunding ? "#1A6B3C" : "#1A1714", textDecoration: "none", padding: "10px 18px", minHeight: 44, boxSizing: "border-box", borderRadius: 9999 }}
                      >
                        {ctaLabel}
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M7 17 17 7M7 7h10v10" /></svg>
                      </a>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        loaded && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#6E685F", fontSize: 14, background: "#fff", borderRadius: 18, border: "1px dashed rgba(64,50,34,0.16)" }}>
            <p style={{ margin: 0 }}>
              No resources {tab !== "All" ? `in ${tab} ` : ""}match{filtersActive ? " these filters" : " yet"}.
            </p>
            {filtersActive && (
              <button type="button" onClick={clearAll} className="ib-knowledge-clear" style={{ marginTop: 12 }}>
                Clear all filters
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}
