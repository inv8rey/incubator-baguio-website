"use client";

import { useCallback, useEffect, useState } from "react";
import { DARK } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { uploadGalleryPhoto } from "../../../lib/uploadLogo";

interface Row {
  id: string;
  image_url: string;
  caption: string;
  credit: string;
  sort_order: number;
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Keep local fields in sync when realtime pushes an update from elsewhere.
  useEffect(() => {
    setCaption(row.caption);
    setCredit(row.credit);
  }, [row.caption, row.credit]);

  const dirty = caption !== row.caption || credit !== row.credit;

  async function save() {
    if (!supabase) return;
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("gallery_photos").update({ caption, credit }).eq("id", row.id);
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

  // Swaps sort_order with the neighbour so the pair trades places.
  async function move(dir: -1 | 1) {
    if (!supabase) return;
    const { error: err } = await supabase.from("gallery_photos").update({ sort_order: row.sort_order + dir * 1.5 }).eq("id", row.id);
    if (err) setError(err.message);
    else onChanged();
  }

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${HAIR}`, borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "relative" }}>
        <img src={row.image_url} alt="" style={{ width: "100%", height: 150, borderRadius: 12, objectFit: "cover", border: `1px solid ${HAIR}`, display: "block" }} />
        <span style={{ position: "absolute", top: 8, left: 8, fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(10,8,7,0.7)", padding: "4px 9px", borderRadius: 9999 }}>
          {index + 1} / {total}
        </span>
      </div>

      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption (shown on the photo)"
        style={{ fontSize: 13, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${HAIR}`, outline: "none", color: DARK }}
      />
      <input
        value={credit}
        onChange={(e) => setCredit(e.target.value)}
        placeholder="Credit (optional, shown when enlarged)"
        style={{ fontSize: 13, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${HAIR}`, outline: "none", color: DARK }}
      />

      {error && <p style={{ margin: 0, fontSize: 12, color: "#E23A2E" }}>{error}</p>}

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button
          onClick={() => move(-1)}
          disabled={index === 0}
          aria-label="Move earlier"
          style={{ fontSize: 13, fontWeight: 600, color: index === 0 ? "#C4BEB4" : "#285E7A", background: "none", border: `1.5px solid ${index === 0 ? HAIR : "rgba(40,94,122,0.3)"}`, borderRadius: 9999, width: 32, height: 30, cursor: index === 0 ? "default" : "pointer" }}
        >
          ←
        </button>
        <button
          onClick={() => move(1)}
          disabled={index === total - 1}
          aria-label="Move later"
          style={{ fontSize: 13, fontWeight: 600, color: index === total - 1 ? "#C4BEB4" : "#285E7A", background: "none", border: `1.5px solid ${index === total - 1 ? HAIR : "rgba(40,94,122,0.3)"}`, borderRadius: 9999, width: 32, height: 30, cursor: index === total - 1 ? "default" : "pointer" }}
        >
          →
        </button>

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
  const [error, setError] = useState("");
  const [missingTable, setMissingTable] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("sort_order", { ascending: true })
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
      // New photos land after everything already in the gallery.
      let next = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
      for (const file of files) {
        const url = await uploadGalleryPhoto(file);
        const { error: err } = await supabase.from("gallery_photos").insert({ image_url: url, sort_order: next++ });
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
          Photos shown in the homepage gallery. The first photo displays large, so lead with your strongest shot. Landscape images at least 1200px wide work best; the
          homepage shows up to 8. Under 2MB each.
        </p>
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
          <p style={{ margin: 0, fontSize: 13.5, color: "#8B8479" }}>
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
