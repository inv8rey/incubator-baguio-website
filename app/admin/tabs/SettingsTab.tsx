"use client";

import { useState } from "react";
import { ORANGE } from "../data";
import ProgramsTab from "./ProgramsTab";
import GalleryTab from "./GalleryTab";
import EvaluationsTab from "./EvaluationsTab";

const SECTIONS = [
  { id: "programs", label: "Programs" },
  { id: "gallery", label: "Gallery" },
  { id: "evaluations", label: "Evaluations" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

// Each of Programs/Gallery/Evaluations is a full standalone tab component
// with its own "ib-admin-stack" padded wrapper, same as any top-level page --
// so this switcher bar sits outside that padding rather than wrapping it in
// a second one, and the selected section renders exactly as it always has.
export default function SettingsTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [section, setSection] = useState<SectionId>("programs");

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 28px 0" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(64,50,34,0.12)", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SECTIONS.map((s) => {
            const active = section === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                style={{
                  fontSize: 12.5,
                  fontWeight: active ? 600 : 500,
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "none",
                  color: active ? "#fff" : "#5A544B",
                  background: active ? "#131110" : "#F5F4F0",
                  cursor: "pointer",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {section === "programs" && <ProgramsTab />}
      {section === "gallery" && <GalleryTab />}
      {section === "evaluations" && <EvaluationsTab searchQuery={searchQuery} />}
    </div>
  );
}
