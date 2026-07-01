"use client";

import { useRef, useState } from "react";
import { DARK, ORANGE, PARTNERS, PARTNER_CATEGORIES, type Partner } from "../data";

const CATEGORY_COLOR: Record<string, { color: string; bg: string }> = {
  Academe: { color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  Government: { color: "#F26522", bg: "rgba(242,101,34,0.12)" },
  Corporate: { color: "#285E7A", bg: "rgba(40,94,122,0.12)" },
  Community: { color: "#9E2A52", bg: "rgba(158,42,82,0.12)" },
};

export default function PartnersTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [partners, setPartners] = useState<Partner[]>(PARTNERS);
  const [category, setCategory] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [newCategory, setNewCategory] = useState(PARTNER_CATEGORIES[0]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const q = searchQuery.toLowerCase();
  const filtered = partners.filter((p) => (!category || p.category === category) && (!q || p.name.toLowerCase().includes(q)));

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setName("");
    setNewCategory(PARTNER_CATEGORIES[0]);
    setLogoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addPartner(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();
    const colors = ["#F26522", "#285E7A", "#1A6B3C", "#9E2A52", "#D88A0A", "#7C5CD6"];
    const color = colors[partners.length % colors.length];
    setPartners((p) => [{ name: name.trim(), category: newCategory, logo: logoPreview, initials, color }, ...p]);
    resetForm();
    setModalOpen(false);
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          <button
            onClick={() => setCategory(null)}
            style={{
              fontSize: 12.5,
              fontWeight: category === null ? 600 : 500,
              padding: "6px 14px",
              borderRadius: 999,
              border: "none",
              color: category === null ? "#fff" : "#6B6B73",
              background: category === null ? "#0E0E10" : "#F5F4F0",
              cursor: "pointer",
            }}
          >
            All <span style={{ fontSize: 10, opacity: 0.7 }}>{partners.length}</span>
          </button>
          {PARTNER_CATEGORIES.map((c) => {
            const active = category === c;
            const cc = CATEGORY_COLOR[c];
            return (
              <button
                key={c}
                onClick={() => setCategory(active ? null : c)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "5px 11px",
                  borderRadius: 999,
                  border: active ? `1.5px solid ${cc.color}4D` : "1.5px solid rgba(20,20,25,0.09)",
                  color: active ? cc.color : "#6B6B73",
                  background: active ? cc.bg : "#fff",
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600, border: "none", color: "#fff", background: ORANGE, cursor: "pointer" }}
        >
          + Add Partner
        </button>
      </div>

      <div className="ib-admin-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {filtered.map((p) => {
          const cc = CATEGORY_COLOR[p.category] ?? { color: "#6B6B73", bg: "#F5F4F0" };
          return (
            <div key={p.name} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
              {p.logo ? (
                <img src={p.logo} alt={p.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(20,20,25,0.08)" }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 10, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {p.initials}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{p.name}</div>
                <span style={{ display: "inline-block", marginTop: 4, fontSize: 10.5, fontWeight: 600, color: cc.color, background: cc.bg, padding: "2px 8px", borderRadius: 999 }}>{p.category}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "28px 20px", textAlign: "center", color: "#9A958B", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)" }}>
            No partners in this category yet.
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={addPartner}
            style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: DARK }}>Add ecosystem partner</div>
              <button type="button" onClick={() => setModalOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#9A958B", lineHeight: 1 }}>
                ×
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Partner name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cordillera Bank Foundation"
                required
                style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ width: "100%", fontSize: 14, padding: "10px 12px", borderRadius: 9, border: "1.5px solid rgba(20,20,25,0.12)", outline: "none", boxSizing: "border-box" }}
              >
                {PARTNER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#44444C", marginBottom: 6 }}>Logo</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "#F5F4F0", border: "1.5px dashed rgba(20,20,25,0.15)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={1.8}><path d="M4 16l4.5-4.5a2 2 0 0 1 2.8 0L16 16M14 14l1.5-1.5a2 2 0 0 1 2.8 0L20 14M4 6h16v12H4z" /></svg>
                  )}
                </div>
                <div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ fontSize: 12.5 }} />
                  <div style={{ fontSize: 11, color: "#9A958B", marginTop: 4 }}>PNG, JPG, or SVG. Falls back to initials if skipped.</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              style={{ marginTop: 4, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "11px 22px", cursor: "pointer" }}
            >
              Add partner
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
