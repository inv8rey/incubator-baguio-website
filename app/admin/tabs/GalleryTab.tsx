"use client";

import { useCallback, useEffect, useState } from "react";
import { DARK } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { uploadGalleryPhoto } from "../../../lib/uploadLogo";
import { GALLERY_CATEGORIES, type GalleryCategory } from "../../galleryShared";

interface Row {
  id: string;
  image_url: string;
  caption: string;
  credit: string;
  event_date: string | null;
  post_url: string;
  category: GalleryCategory;
  location: string;
}

const HAIR = "rgba(64,50,34,0.12)";

function PhotoCard({
  row,
  index,
  total,
  onChanged,
}: {
  row: Row;
  index: number;
  total: number;
  onChanged: () => void;
}) {
  const [caption, setCaption] = useState(row.caption);
  const [credit, setCredit] = useState(row.credit);
  const [eventDate, setEventDate] = useState(row.event_date ?? "");
  const [postUrl, setPostUrl] = useState(row.post_url);
  const [category, setCategory] = useState<GalleryCategory>(row.category);
  const [location, setLocation] = useState(row.location);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Keep local fields in sync when realtime pushes an update from elsewhere.
  useEffect(() => {
    setCaption(row.caption);
    setCredit(row.credit);
    setEventDate(row.event_date ?? "");
    setPostUrl(row.post_url);
    setCategory(row.category);
    setLocation(row.location);
  }, [row.caption, row.credit, row.event_date, row.post_url, row.category, row.location]);

  const dirty =
    caption !== row.caption ||
    credit !== row.credit ||
    eventDate !== (row.event_date ?? "") ||
    postUrl !== row.post_url ||
    category !== row.category ||
    location !== row.location;

  async function save() {
    if (!supabase) return;
    setSaving(true);
    setError("");
    const { error: err } = await supabase
      .from("gallery_photos")
      .update({ caption, credit, event_date: eventDate || null, post_url: postUrl, category, location })
      .eq("id", row.id);
    if (err) setError(err.message);
    else onChanged();
    setSaving(false);
  }

  async function remove() {
    if (!supabase) return;
    if (!confirm("Remove this photo from the homepage gallery?")) return;
    const { error: err } = await supabase.from("gallery_photos").delete().eq("id", row.id);
    if (err) setError(err.message);
    else onChanged();
  }

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${HAIR}`, borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "relative" }}>
        <img src={row.image_url} alt="" style={{ width: "100%", height: 150, borderRadius: 12, objectFit: "cover", border: `1px solid ${HAIR}`, display: "block" }} />
        <span style={{ position: "absolute", top: 8, left: 8, fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(10,8,7,0.7)", padding: "4px 9px", borderRadius: 9999 }}>
          {index + 1} of {total} &middot; sorted by date
        </span>
      </div>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as GalleryCategory)}
        aria-label="Category"
        style={{ fontSize: 13, fontWeight: 600, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${HAIR}`, outline: "none", color: DARK, background: "#fff", cursor: "pointer" }}
      >
        {GALLERY_CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption (shown on the photo)"
        style={{ fontSize: 13, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${HAIR}`, outline: "none", color: DARK }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          aria-label="Event date"
          style={{ fontSize: 13, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${HAIR}`, outline: "none", color: eventDate ? DARK : "#6E685F" }}
        />
        <input
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
          placeholder="Credit (optional)"
          style={{ fontSize: 13, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${HAIR}`, outline: "none", color: DARK }}
        />
      </div>
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location, e.g. Incubator Baguio Office"
        style={{ fontSize: 13, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${HAIR}`, outline: "none", color: DARK }}
      />
      <input
        value={postUrl}
        onChange={(e) => setPostUrl(e.target.value)}
        placeholder="Link to the original post (optional)"
        style={{ fontSize: 13, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${HAIR}`, outline: "none", color: DARK }}
      />

      {error && <p style={{ margin: 0, fontSize: 12, color: "#E23A2E" }}>{error}</p>}

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {dirty && (
          <button
            onClick={save}
            disabled={saving}
            style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 600, color: "#fff", background: "#F26522", border: "none", borderRadius: 9999, padding: "8px 16px", cursor: "pointer" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        )}
        <button
          onClick={remove}
          style={{ marginLeft: dirty ? 0 : "auto", fontSize: 12.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 9999, padding: "8px 14px", cursor: "pointer" }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function GalleryTab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<GalleryCategory>("Ecosystem");
  const [error, setError] = useState("");
  const [missingTable, setMissingTable] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    // A missing relation means the schema migration hasn't been run yet — say so
    // plainly rather than showing an empty gallery that looks like it works.
    if (err && /relation .* does not exist|schema cache/i.test(err.message)) {
      setMissingTable(true);
      return;
    }
    setMissingTable(false);
    setRows((data as Row[]) ?? []);
  }, []);

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-gallery-photos")
      .on("postgres_changes", { event: "*", schema: "public", table: "gallery_photos" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length || !supabase) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const url = await uploadGalleryPhoto(file);
        const { error: err } = await supabase.from("gallery_photos").insert({ image_url: url, category: uploadCategory });
        if (err) throw new Error(err.message);
      }
      load();
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    }
    setUploading(false);
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#5A544B", maxWidth: 620 }}>
          Photos shown on the homepage strip and the full <code>/gallery</code> page, sorted by event date &mdash; most recent first. The lead photo (shown large) is whichever
          has the latest date, so set dates to control the order. A category filter only appears on the gallery page once that category has at least one photo. Landscape images
          at least 1200px wide work best; the homepage shows up to 8. Under 2MB each.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <select
          value={uploadCategory}
          onChange={(e) => setUploadCategory(e.target.value as GalleryCategory)}
          aria-label="Category for new photos"
          style={{ fontSize: 13, fontWeight: 600, color: DARK, background: "#fff", border: `1.5px solid ${HAIR}`, borderRadius: 9999, padding: "10px 16px", cursor: "pointer", outline: "none" }}
        >
          {GALLERY_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label
          style={{
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            background: uploading ? "#C4BEB4" : "#F26522",
            borderRadius: 9999,
            padding: "11px 22px",
            cursor: uploading ? "default" : "pointer",
          }}
        >
          {uploading ? "Uploading…" : "Add photos"}
          <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
        </label>
        </div>
      </div>

      {error && <p style={{ margin: 0, fontSize: 13, color: "#E23A2E" }}>{error}</p>}

      {missingTable ? (
        <div style={{ border: `1.5px dashed rgba(226,58,46,0.4)`, background: "rgba(226,58,46,0.04)", borderRadius: 16, padding: "22px 24px" }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "#E23A2E", marginBottom: 6 }}>The gallery table doesn&rsquo;t exist yet</div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#5A544B" }}>
            Run the <code>gallery_photos</code> section at the bottom of <code>supabase/schema.sql</code> in the Supabase SQL editor, then reload this page. Until then the
            homepage gallery section stays hidden.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div style={{ border: `1.5px dashed ${HAIR}`, borderRadius: 16, padding: "40px 24px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 13.5, color: "#6E685F" }}>
            No photos yet. The homepage gallery section stays hidden until you add at least one.
          </p>
        </div>
      ) : (
        <div className="ib-admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {rows.map((r, i) => (
            <PhotoCard key={r.id} row={r} index={i} total={rows.length} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}
