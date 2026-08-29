"use client";

import { useEffect } from "react";

// Shared by the homepage gallery strip and the full /gallery page so the two
// can't drift apart on shape, date handling, or lightbox behaviour.

const DARK = "#1A1714";

/** Stored categories. "All" is the unfiltered view, never a stored value. */
export const GALLERY_CATEGORIES = ["Workshops", "Trainings", "Mentoring", "Networking", "Ecosystem"] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

/** Small glyph per category for the filter pills. */
export const CATEGORY_ICONS: Record<GalleryCategory, string> = {
  Workshops: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  Trainings: "M22 10 12 5 2 10l10 5 10-5ZM6 12v5c3 2 9 2 12 0v-5",
  Mentoring: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87",
  Networking: "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z",
  Ecosystem: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20",
};

export const CATEGORY_COLORS: Record<GalleryCategory, string> = {
  Workshops: "#D9531E",
  Trainings: "#3A5FA0",
  Mentoring: "#9E2A52",
  Networking: "#1A6B3C",
  Ecosystem: "#6B5BD6",
};

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  credit: string;
  eventDate: string | null;
  postUrl: string;
  category: GalleryCategory;
  location: string;
}

export function mapGalleryRow(r: any): GalleryPhoto {
  return {
    id: r.id,
    imageUrl: r.image_url,
    caption: r.caption || "",
    credit: r.credit || "",
    eventDate: r.event_date || null,
    postUrl: r.post_url || "",
    // Rows predating the category column read back as undefined; treat those
    // as Ecosystem rather than letting an invalid key reach the colour maps.
    category: (GALLERY_CATEGORIES as readonly string[]).includes(r.category) ? r.category : "Ecosystem",
    location: r.location || "",
  };
}

/** "2026-08-12" -> "Aug 12, 2026", parsed as a calendar date, not UTC-shifted. */
export function formatEventDate(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PinIcon({ size = 12, color = "rgba(255,255,255,0.72)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
      <circle cx={12} cy={10} r={3} />
    </svg>
  );
}

export function CalendarIcon({ size = 12, color = "rgba(255,255,255,0.85)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" style={{ flexShrink: 0 }}>
      <rect x={3} y={4} width={18} height={17} rx={2} />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  );
}

/**
 * Full-screen photo viewer. Escape closes, arrow keys step. The key listener
 * only exists while open and re-binds on photo-count changes (not on every
 * index change), reading the latest index through functional setState.
 */
export function GalleryLightbox({
  photos,
  index,
  onClose,
  onStep,
}: {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onStep: (dir: -1 | 1) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onStep]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption || "Photo"}
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
          <img src={photo.imageUrl} alt={photo.caption || ""} style={{ width: "100%", maxHeight: "78vh", objectFit: "contain", borderRadius: 16, display: "block" }} />

          {photos.length > 1 && (
            <>
              <button
                onClick={() => onStep(-1)}
                aria-label="Previous photo"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: 9999, background: "rgba(10,8,7,0.55)", border: "1px solid rgba(255,255,255,0.22)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                onClick={() => onStep(1)}
                aria-label="Next photo"
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: 9999, background: "rgba(10,8,7,0.55)", border: "1px solid rgba(255,255,255,0.22)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M9 6l6 6-6 6" /></svg>
              </button>

              {/* Next photo's thumbnail in the corner — clicking it advances too. */}
              <button
                onClick={() => onStep(1)}
                aria-label={`Next: ${photos[(index + 1) % photos.length].caption || "photo"}`}
                style={{ position: "absolute", right: 12, bottom: 12, width: 56, height: 56, borderRadius: 12, padding: 0, border: "2px solid rgba(255,255,255,0.6)", overflow: "hidden", cursor: "pointer", boxShadow: "0 8px 20px -6px rgba(0,0,0,0.6)" }}
              >
                <img src={photos[(index + 1) % photos.length].imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            </>
          )}
        </div>

        {(photo.caption || photo.credit || photo.eventDate || photo.postUrl || photo.location) && (
          <div style={{ marginTop: 16, textAlign: "center" }}>
            {photo.caption && <div style={{ fontSize: 15.5, fontWeight: 600, color: "#fff" }}>{photo.caption}</div>}
            {(photo.eventDate || photo.credit || photo.location) && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
                {[formatEventDate(photo.eventDate), photo.location, photo.credit].filter(Boolean).join(" · ")}
              </div>
            )}
            {photo.postUrl && (
              <a
                href={photo.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none", background: "#F26522", padding: "9px 18px", borderRadius: 9999 }}
              >
                View post
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6}><path d="M7 17 17 7M8 7h9v9" /></svg>
              </a>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: "absolute", top: -14, right: -14, width: 40, height: 40, borderRadius: 9999, background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px -6px rgba(0,0,0,0.5)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2.4} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </div>
  );
}
