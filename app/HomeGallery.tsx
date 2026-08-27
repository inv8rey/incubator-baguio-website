"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const DARK = "#1A1714";

interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  credit: string;
  eventDate: string | null;
  postUrl: string;
}

function mapRow(r: any): GalleryPhoto {
  return {
    id: r.id,
    imageUrl: r.image_url,
    caption: r.caption || "",
    credit: r.credit || "",
    eventDate: r.event_date || null,
    postUrl: r.post_url || "",
  };
}

// "2026-08-12" -> "Aug 12, 2026", parsed as calendar date (not UTC-shifted).
function formatEventDate(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Homepage activity gallery. Photos are admin-managed in Supabase
 * (gallery_photos), so the section reflects real events rather than stock
 * imagery. Renders nothing at all when empty — an empty gallery frame on a
 * public page looks broken, whereas an absent section just reads as shorter.
 */
export default function HomeGallery({ bp }: { bp: string }) {
  const [photos, setPhotos] = useState<GalleryPhoto[] | null>(null);
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
      .order("created_at", { ascending: false })
      .limit(8);
    setPhotos((data ?? []).map(mapRow));
  }, []);

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("public-home-gallery")
      .on("postgres_changes", { event: "*", schema: "public", table: "gallery_photos" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, [load]);

  // Escape closes the lightbox; arrow keys step through photos. The listener
  // only exists while it's open, and only re-binds when the photo count
  // changes (not on every index change) so it always sees the latest index
  // via the functional setState updates below.
  useEffect(() => {
    if (lightboxIndex === null || !photos) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
      else if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? i : (i + 1) % photos!.length));
      else if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null ? i : (i - 1 + photos!.length) % photos!.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex !== null, photos]);

  // Still loading, or genuinely empty — render nothing either way.
  if (!photos || photos.length === 0) return null;

  const lightbox = lightboxIndex !== null ? photos[lightboxIndex] : null;
  function step(dir: -1 | 1) {
    setLightboxIndex((i) => (i === null ? i : (i + dir + photos!.length) % photos!.length));
  }

  return (
    <div style={{ background: "#131110", padding: "92px 40px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 28, marginBottom: 44, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 560 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              <span style={{ width: 22, height: 1, background: "rgba(242,101,34,0.6)" }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FFB489" }}>Gallery</span>
            </div>
            <h2 style={{ margin: "0 0 14px", fontSize: 40, fontWeight: 500, letterSpacing: "-0.032em", color: "#fff", lineHeight: 1.14 }}>
              Moments from the ecosystem
            </h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.68, color: "rgba(255,255,255,0.6)" }}>
              Workshops, roundtables, demo nights, and the people building Baguio&rsquo;s innovation community.
            </p>
          </div>
          <a
            href={`${bp}/calendar/`}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", paddingBottom: 4, borderBottom: "1.5px solid rgba(242,101,34,0.55)" }}
          >
            See what&rsquo;s next
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </div>

        <div className="ib-gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gridAutoRows: "186px", gap: 14 }}>
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setLightboxIndex(i)}
              aria-label={p.caption || "View photo"}
              className="ib-gallery-tile"
              style={{
                // The lead photo occupies a 2x2 block so the mosaic has a focal
                // point instead of reading as a uniform contact sheet.
                gridColumn: i === 0 ? "span 2" : "span 1",
                gridRow: i === 0 ? "span 2" : "span 1",
                position: "relative",
                padding: 0,
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 16,
                overflow: "hidden",
                cursor: "pointer",
                background: "#1C1917",
                display: "block",
              }}
            >
              <img
                src={p.imageUrl}
                alt={p.caption || ""}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {p.eventDate && (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#fff",
                    background: "rgba(10,8,7,0.65)",
                    padding: "4px 10px",
                    borderRadius: 9999,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {formatEventDate(p.eventDate)}
                </span>
              )}
              {p.caption && (
                <span
                  className="ib-gallery-cap"
                  style={{
                    position: "absolute",
                    inset: "auto 0 0 0",
                    padding: i === 0 ? "26px 20px 16px" : "22px 14px 12px",
                    background: "linear-gradient(to top, rgba(10,8,7,0.82), transparent)",
                    color: "#fff",
                    fontSize: i === 0 ? 14.5 : 12.5,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.35,
                    textAlign: "left",
                  }}
                >
                  {p.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.caption || "Photo"}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(10,8,7,0.9)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 28,
          }}
        >
          <div style={{ position: "relative", maxWidth: 1000, width: "100%" }} onClick={(e) => e.stopPropagation()}>
          <div style={{ position: "relative" }}>
            <img
              src={lightbox.imageUrl}
              alt={lightbox.caption || ""}
              style={{ width: "100%", maxHeight: "78vh", objectFit: "contain", borderRadius: 16, display: "block" }}
            />

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 44,
                    height: 44,
                    borderRadius: 9999,
                    background: "rgba(10,8,7,0.55)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 44,
                    height: 44,
                    borderRadius: 9999,
                    background: "rgba(10,8,7,0.55)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M9 6l6 6-6 6" /></svg>
                </button>

                {/* Thumbnail of the next photo, sitting in the corner of the
                    main image — clicking either it or the arrow above advances. */}
                <button
                  onClick={() => step(1)}
                  aria-label={`Next: ${photos[(lightboxIndex! + 1) % photos.length].caption || "photo"}`}
                  style={{
                    position: "absolute",
                    right: 12,
                    bottom: 12,
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    padding: 0,
                    border: "2px solid rgba(255,255,255,0.6)",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "0 8px 20px -6px rgba(0,0,0,0.6)",
                  }}
                >
                  <img
                    src={photos[(lightboxIndex! + 1) % photos.length].imageUrl}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              </>
            )}
          </div>

            {(lightbox.caption || lightbox.credit || lightbox.eventDate || lightbox.postUrl) && (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                {lightbox.caption && <div style={{ fontSize: 15.5, fontWeight: 600, color: "#fff" }}>{lightbox.caption}</div>}
                {(lightbox.eventDate || lightbox.credit) && (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
                    {[formatEventDate(lightbox.eventDate), lightbox.credit].filter(Boolean).join(" · ")}
                  </div>
                )}
                {lightbox.postUrl && (
                  <a
                    href={lightbox.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      marginTop: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                      textDecoration: "none",
                      background: "#F26522",
                      padding: "9px 18px",
                      borderRadius: 9999,
                    }}
                  >
                    View post
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6}><path d="M7 17 17 7M8 7h9v9" /></svg>
                  </a>
                )}
              </div>
            )}

            <button
              onClick={() => setLightboxIndex(null)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: -14,
                right: -14,
                width: 40,
                height: 40,
                borderRadius: 9999,
                background: "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px -6px rgba(0,0,0,0.5)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2.4} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
