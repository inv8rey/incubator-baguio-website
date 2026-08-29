"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { GalleryLightbox, formatEventDate, mapGalleryRow, type GalleryPhoto } from "./galleryShared";

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
    setPhotos((data ?? []).map(mapGalleryRow));
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

  // Still loading, or genuinely empty — render nothing either way.
  if (!photos || photos.length === 0) return null;

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
            href={`${bp}/gallery/`}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", paddingBottom: 4, borderBottom: "1.5px solid rgba(242,101,34,0.55)" }}
          >
            View Ecosystem Gallery
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

      {lightboxIndex !== null && (
        <GalleryLightbox photos={photos} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onStep={step} />
      )}
    </div>
  );
}
