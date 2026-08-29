"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CalendarIcon,
  GALLERY_CATEGORIES,
  GalleryLightbox,
  PinIcon,
  formatEventDate,
  mapGalleryRow,
  type GalleryCategory,
  type GalleryPhoto,
} from "../galleryShared";

const ORANGE = "#F26522";
const PER_PAGE = 9;

type Tab = "All" | GalleryCategory;
type Sort = "Latest" | "Oldest";

export default function GalleryClient() {
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null);
  const [tab, setTab] = useState<Tab>("All");
  const [sort, setSort] = useState<Sort>("Latest");
  const [page, setPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setPhotos([]);
      return;
    }
    const { data } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    setPhotos((data ?? []).map(mapGalleryRow));
  }, []);

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("public-gallery-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "gallery_photos" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, [load]);

  // Only categories that actually have photos get a pill — an empty filter
  // that always returns nothing reads as a broken page, not an empty one.
  const availableTabs = useMemo<Tab[]>(() => {
    if (!photos) return ["All"];
    const present = GALLERY_CATEGORIES.filter((c) => photos.some((p) => p.category === c));
    return ["All", ...present];
  }, [photos]);

  // A tab can disappear underneath the user if the last photo in it is
  // removed (realtime, or an admin edit in another window).
  useEffect(() => {
    if (!availableTabs.includes(tab)) setTab("All");
  }, [availableTabs, tab]);

  const filtered = useMemo(() => {
    if (!photos) return [];
    const list = tab === "All" ? photos : photos.filter((p) => p.category === tab);
    // The query already returns newest-first; "Oldest" just reverses it, so
    // photos without a date stay grouped together either way.
    return sort === "Latest" ? list : [...list].reverse();
  }, [photos, tab, sort]);

  useEffect(() => {
    setPage(1);
  }, [tab, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // Lightbox indexes into the current page's slice, so stepping stays inside
  // what the visitor can actually see.
  function step(dir: -1 | 1) {
    setLightboxIndex((i) => (i === null ? i : (i + dir + pageItems.length) % pageItems.length));
  }

  if (!photos) {
    return (
      <div style={{ background: "#131110", padding: "0 40px 96px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridAutoRows: 186, gap: 14 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ borderRadius: 16, background: "#1C1917", gridColumn: i === 0 ? "span 2" : "span 1", gridRow: i === 0 ? "span 2" : "span 1" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#131110", padding: "0 40px 96px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        {/* FILTER BAR */}
        {photos.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 26 }}>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {availableTabs.map((t) => {
                const active = tab === t;
                const icon = t === "All" ? "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" : CATEGORY_ICONS[t];
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    aria-pressed={active}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "10px 18px",
                      borderRadius: 9999,
                      cursor: "pointer",
                      color: active ? "#fff" : "rgba(255,255,255,0.72)",
                      background: active ? ORANGE : "rgba(255,255,255,0.06)",
                      border: `1px solid ${active ? ORANGE : "rgba(255,255,255,0.12)"}`,
                    }}
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                    {t}
                  </button>
                );
              })}
            </div>

            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                style={{
                  appearance: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 9999,
                  padding: "10px 34px 10px 16px",
                  cursor: "pointer",
                  outline: "none",
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.6'><path d='M6 9l6 6 6-6'/></svg>\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                }}
              >
                <option value="Latest" style={{ color: "#1A1714" }}>Latest</option>
                <option value="Oldest" style={{ color: "#1A1714" }}>Oldest</option>
              </select>
            </label>
          </div>
        )}

        {/* GRID */}
        {photos.length === 0 ? (
          <div style={{ border: "1px dashed rgba(255,255,255,0.16)", borderRadius: 20, padding: "72px 32px", textAlign: "center" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 600, color: "#fff" }}>No photos yet</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: "rgba(255,255,255,0.55)" }}>
              Photos from workshops, trainings, and ecosystem gatherings will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="ib-gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridAutoRows: 186, gap: 14 }}>
              {pageItems.map((p, i) => {
                const lead = i === 0;
                const catColor = CATEGORY_COLORS[p.category];
                return (
                  <button
                    key={p.id}
                    onClick={() => setLightboxIndex(i)}
                    aria-label={p.caption || "View photo"}
                    className="ib-gallery-tile"
                    style={{
                      // Lead photo takes a 2x2 block so each page has a focal
                      // point rather than reading as a uniform contact sheet.
                      gridColumn: lead ? "span 2" : "span 1",
                      gridRow: lead ? "span 2" : "span 1",
                      position: "relative",
                      padding: 0,
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16,
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "#1C1917",
                      display: "block",
                      textAlign: "left",
                    }}
                  >
                    <img src={p.imageUrl} alt={p.caption || ""} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

                    {p.eventDate && (
                      <span style={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", background: "rgba(10,8,7,0.7)", padding: "5px 10px", borderRadius: 8 }}>
                        <CalendarIcon size={11} />
                        {formatEventDate(p.eventDate)}
                      </span>
                    )}

                    <span
                      className="ib-gallery-cap"
                      style={{
                        position: "absolute",
                        inset: "auto 0 0 0",
                        padding: lead ? "60px 20px 16px" : "48px 14px 12px",
                        background: "linear-gradient(to top, rgba(10,8,7,0.9) 20%, rgba(10,8,7,0.55) 60%, transparent)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 7,
                      }}
                    >
                      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", background: catColor, padding: "3px 8px", borderRadius: 5 }}>
                        {p.category}
                      </span>
                      {p.caption && (
                        <span style={{ color: "#fff", fontSize: lead ? 16 : 13, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.32 }}>{p.caption}</span>
                      )}
                      {p.location && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: lead ? 12.5 : 11.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.35 }}>
                          <PinIcon size={11} />
                          {p.location}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p style={{ margin: "40px 0 0", textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>No photos in this category yet.</p>
            )}

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 40 }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Previous page" className="ib-gallery-page-arrow">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                </button>
                {pageNumbers(safePage, totalPages).map((n, i) =>
                  n === "…" ? (
                    <span key={`gap-${i}`} style={{ color: "rgba(255,255,255,0.4)", padding: "0 4px" }}>…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      aria-current={n === safePage ? "page" : undefined}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 9999,
                        fontSize: 13.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        color: n === safePage ? "#fff" : "rgba(255,255,255,0.7)",
                        background: n === safePage ? ORANGE : "rgba(255,255,255,0.06)",
                        border: `1px solid ${n === safePage ? ORANGE : "rgba(255,255,255,0.12)"}`,
                      }}
                    >
                      {n}
                    </button>
                  )
                )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} aria-label="Next page" className="ib-gallery-page-arrow">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox photos={pageItems} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onStep={step} />
      )}
    </div>
  );
}

/** 1 … 4 5 6 … 20 — always shows first, last, and a window around current. */
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) out.push("…");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < total - 1) out.push("…");
  out.push(total);
  return out;
}
