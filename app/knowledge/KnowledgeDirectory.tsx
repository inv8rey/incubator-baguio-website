"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { DARK, KNOWLEDGE_CATEGORIES, type KnowledgeCategory, type KnowledgeResource } from "./data";
import { fetchDynamicKnowledgeResources } from "./dynamicData";

function matches(haystacks: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystacks.some((h) => h.toLowerCase().includes(q));
}

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

  useEffect(() => {
    function load() {
      fetchDynamicKnowledgeResources().then((r) => {
        setResources(shuffle(r));
        setLoaded(true);
      });
    }
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("public-knowledge-resources")
      .on("postgres_changes", { event: "*", schema: "public", table: "knowledge_resources" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const list = resources.filter((r) => {
      if (tab !== "All" && r.category !== tab) return false;
      return matches([r.title, r.description, r.source ?? ""], query);
    });
    return [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }, [resources, tab, query]);

  const activeInfo = tab !== "All" ? KNOWLEDGE_CATEGORIES.find((c) => c.id === tab) : null;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#F26522", marginBottom: 12 }}>Resource library</div>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 600, letterSpacing: "-0.025em", color: DARK }}>Browse by category</h2>
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
                <span style={{ fontSize: 10.5, fontWeight: 600, color: active ? c.color : "#8B8479", background: active ? "#fff" : "rgba(64,50,34,0.09)", padding: "2px 7px", borderRadius: 999, flexShrink: 0 }}>{count}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "#5A544B" }}>{c.description}</p>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 360 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B8479" strokeWidth={2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources..."
            style={{ width: "100%", boxSizing: "border-box", fontSize: 13.5, color: DARK, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.14)", borderRadius: 9999, padding: "11px 16px 11px 36px", outline: "none" }}
          />
        </div>
        {tab !== "All" ? (
          <button onClick={() => setTab("All")} style={{ fontSize: 12.5, fontWeight: 600, color: "#5A544B", background: "#F5F4F0", border: "none", borderRadius: 999, padding: "9px 16px", cursor: "pointer" }}>
            Clear filter &times;
          </button>
        ) : (
          <span style={{ fontSize: 12.5, color: "#8B8479" }}>
            {filtered.length} resource{filtered.length === 1 ? "" : "s"}
          </span>
        )}
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
            // A funding notice is a call to action, not a document to browse —
            // "Apply Now" says what happens next; "View resource"/"Download"
            // don't fit a grant deadline the way they fit a template PDF.
            const ctaLabel = isFunding ? (r.linkUrl ? "Apply Now" : "View Guidelines") : r.fileUrl ? "Download" : "View resource";
            return (
              <div key={r.id} className="ib-card-hover" style={{ position: "relative", background: "#fff", border: r.featured ? "1.5px solid rgba(242,101,34,0.35)" : "1px solid rgba(64,50,34,0.13)", borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {isFunding && r.coverImageUrl && (
                  <div style={{ height: 140, background: "#F6F2EA", overflow: "hidden" }}>
                    <img src={r.coverImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ position: "relative", padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
                  {r.featured && (
                    <span style={{ position: "absolute", top: 14, right: 14, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: "#F26522", background: "rgba(242,101,34,0.12)", padding: "4px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>★ Featured</span>
                  )}
                  {cat && (
                    <span style={{ display: "inline-block", alignSelf: "flex-start", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: cat.color, background: cat.bg, padding: "4px 10px", borderRadius: 9999, marginBottom: 12, whiteSpace: "nowrap" }}>
                      {cat.id}
                    </span>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 16.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{r.title}</h3>
                    <p className="ib-line-clamp-3" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#5A544B" }}>{r.description}</p>
                  </div>

                  {isFunding && (r.fundingAmount || r.targetParticipants) && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(64,50,34,0.09)" }}>
                      {r.fundingAmount && (
                        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: DARK, fontWeight: 600 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1 3 2.2c0 2.8-6 1.3-6 4.1 0 1.2 1.3 2.2 3 2.2s3-1.1 3-2.5" /></svg>
                          {r.fundingAmount}
                        </div>
                      )}
                      {r.targetParticipants && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12.5, color: "#5A544B" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B8479" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1.5 }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                          <span>{r.targetParticipants}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {r.source && <p style={{ margin: "10px 0 0", fontSize: 12, color: "#8B8479" }}>{r.source}</p>}
                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginTop: 16, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#fff", background: isFunding ? "#1A6B3C" : "#1A1714", textDecoration: "none", padding: "10px 18px", borderRadius: 9999 }}
                    >
                      {ctaLabel}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M7 17 17 7M7 7h10v10" /></svg>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        loaded && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#8B8479", fontSize: 14, background: "#F6F2EA", borderRadius: 18, border: "1px dashed rgba(64,50,34,0.14)" }}>
            No resources {tab !== "All" ? `in ${tab} ` : ""}yet{query ? " matching your search" : ""}.
          </div>
        )
      )}
    </div>
  );
}
