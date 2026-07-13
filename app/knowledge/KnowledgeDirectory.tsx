"use client";

import { useEffect, useMemo, useState } from "react";
import { DARK, KNOWLEDGE_CATEGORIES, type KnowledgeCategory, type KnowledgeResource } from "./data";
import { fetchDynamicKnowledgeResources } from "./dynamicData";

function matches(haystacks: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystacks.some((h) => h.toLowerCase().includes(q));
}

export default function KnowledgeDirectory() {
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<KnowledgeCategory | "All">("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchDynamicKnowledgeResources().then((r) => {
      setResources(r);
      setLoaded(true);
    });
  }, []);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (tab !== "All" && r.category !== tab) return false;
      return matches([r.title, r.description, r.source ?? ""], query);
    });
  }, [resources, tab, query]);

  const activeInfo = tab !== "All" ? KNOWLEDGE_CATEGORIES.find((c) => c.id === tab) : null;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#F26522", marginBottom: 12 }}>Resource library</div>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em", color: DARK }}>Browse by category</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }} className="ib-knowledge-cat-grid">
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
                border: `1.5px solid ${active ? c.color : "rgba(20,20,25,0.10)"}`,
                borderRadius: 16,
                padding: "16px 16px 14px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: active ? c.color : DARK }}>{c.id}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: active ? c.color : "#9A958B", background: active ? "#fff" : "rgba(20,20,25,0.06)", padding: "2px 7px", borderRadius: 999, flexShrink: 0 }}>{count}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "#6B6B73" }}>{c.description}</p>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 360 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources..."
            style={{ width: "100%", boxSizing: "border-box", fontSize: 13.5, color: DARK, background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.12)", borderRadius: 9999, padding: "11px 16px 11px 36px", outline: "none" }}
          />
        </div>
        {tab !== "All" && (
          <button onClick={() => setTab("All")} style={{ fontSize: 12.5, fontWeight: 600, color: "#6B6B73", background: "#F5F4F0", border: "none", borderRadius: 999, padding: "9px 16px", cursor: "pointer" }}>
            Clear filter &times;
          </button>
        )}
      </div>

      {activeInfo && (
        <div style={{ fontSize: 12.5, color: "#6B6B73", marginBottom: 16 }}>
          Showing <strong style={{ color: DARK }}>{activeInfo.id}</strong> &mdash; {activeInfo.description}
        </div>
      )}

      {filtered.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }} className="ib-knowledge-grid">
          {filtered.map((r) => {
            const cat = KNOWLEDGE_CATEGORIES.find((c) => c.id === r.category);
            const href = r.fileUrl || r.linkUrl;
            return (
              <div key={r.id} className="ib-card-hover" style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column" }}>
                {cat && (
                  <span style={{ display: "inline-block", alignSelf: "flex-start", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.02em", color: cat.color, background: cat.bg, padding: "4px 10px", borderRadius: 9999, marginBottom: 12 }}>
                    {cat.id}
                  </span>
                )}
                <h3 style={{ margin: "0 0 8px", fontSize: 16.5, fontWeight: 700, color: DARK, lineHeight: 1.3 }}>{r.title}</h3>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.description}</p>
                {r.source && <p style={{ margin: "10px 0 0", fontSize: 12, color: "#9A958B" }}>{r.source}</p>}
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginTop: 16, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#fff", background: "#141417", textDecoration: "none", padding: "10px 18px", borderRadius: 9999 }}
                  >
                    {r.fileUrl ? "Download" : "View resource"}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M7 17 17 7M7 7h10v10" /></svg>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        loaded && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#9A958B", fontSize: 14, background: "#FAFAF7", borderRadius: 18, border: "1px dashed rgba(20,20,25,0.14)" }}>
            No resources {tab !== "All" ? `in ${tab} ` : ""}yet{query ? " matching your search" : ""}.
          </div>
        )
      )}
    </div>
  );
}
