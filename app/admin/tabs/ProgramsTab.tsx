"use client";

import { useEffect, useState } from "react";
import { DARK, ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { uploadProgramImage } from "../../../lib/uploadLogo";

const STEPS = [
  { step: "enable", title: "Enable", theme: "Help founders build.", color: ORANGE },
  { step: "engage", title: "Engage", theme: "Bring the ecosystem together.", color: "#285E7A" },
  { step: "expand", title: "Expand", theme: "Create opportunities for growth.", color: "#9E2A52" },
  { step: "evolve", title: "Evolve", theme: "Strengthen the ecosystem.", color: "#1A6B3C" },
] as const;

interface Row {
  step: string;
  image_url: string;
}

function StepCard({ step, title, theme, color, imageUrl, onSaved }: { step: string; title: string; theme: string; color: string; imageUrl: string; onSaved: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !supabase) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadProgramImage(file);
      const { error: err } = await supabase.from("program_step_images").upsert({ step, image_url: url, updated_at: new Date().toISOString() });
      if (err) throw new Error(err.message);
      onSaved();
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    }
    setUploading(false);
  }

  async function remove() {
    if (!supabase) return;
    const { error: err } = await supabase.from("program_step_images").upsert({ step, image_url: "", updated_at: new Date().toISOString() });
    if (err) return setError(err.message);
    onSaved();
  }

  return (
    <div style={{ background: "#fff", border: "1.5px solid rgba(64,50,34,0.12)", borderRadius: 18, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 9999, background: color, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: DARK }}>{title}</div>
          <div style={{ fontSize: 12, color: "#8B8479", marginTop: 1 }}>{theme}</div>
        </div>
      </div>

      {imageUrl ? (
        <img src={imageUrl} alt="" style={{ width: "100%", height: 160, borderRadius: 12, objectFit: "cover", border: "1px solid rgba(64,50,34,0.13)" }} />
      ) : (
        <div style={{ width: "100%", height: 160, borderRadius: 12, background: "#F5F4F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, color: "#8B8479" }}>
          No photo uploaded — the scroll section falls back to the default illustration
        </div>
      )}

      {error && <p style={{ margin: 0, fontSize: 12, color: "#E23A2E" }}>{error}</p>}

      <div style={{ display: "flex", gap: 8 }}>
        <label style={{ flex: 1, textAlign: "center", fontSize: 12.5, fontWeight: 600, color: "#285E7A", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}>
          {uploading ? "Uploading…" : imageUrl ? "Replace photo" : "Upload photo"}
          <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} style={{ display: "none" }} />
        </label>
        {imageUrl && (
          <button onClick={remove} style={{ fontSize: 12.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}>Remove</button>
        )}
      </div>
    </div>
  );
}

export default function ProgramsTab() {
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from("program_step_images").select("step,image_url");
    setRows((data as Row[]) ?? []);
  }

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-program-step-images")
      .on("postgres_changes", { event: "*", schema: "public", table: "program_step_images" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);

  const imageByStep = Object.fromEntries(rows.map((r) => [r.step, r.image_url]));

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ margin: 0, fontSize: 13.5, color: "#5A544B", maxWidth: 640 }}>
        Upload one photo per step. It replaces the illustration on the left side of the &ldquo;Our Programs&rdquo; scrolling section on the homepage and /programs page. Recommended: a landscape photo, at least 900px wide.
      </p>
      <div className="ib-admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {STEPS.map((s) => (
          <StepCard key={s.step} step={s.step} title={s.title} theme={s.theme} color={s.color} imageUrl={imageByStep[s.step] || ""} onSaved={load} />
        ))}
      </div>
    </div>
  );
}
