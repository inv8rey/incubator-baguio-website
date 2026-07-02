"use client";

import { useEffect, useState } from "react";
import { fetchDynamicEcosystemPartners, type EcosystemPartnerEntry } from "./ecosystem/dynamicData";

export default function EcosystemPartnersMarquee() {
  const [partners, setPartners] = useState<EcosystemPartnerEntry[] | null>(null);

  useEffect(() => {
    fetchDynamicEcosystemPartners().then(setPartners);
  }, []);

  if (partners && partners.length === 0) return null;

  // Repeat the partner list enough times that two back-to-back copies always
  // span wider than any viewport, so the -50% marquee loop never runs out of
  // logos and shows a gap before it wraps.
  const repeats = partners ? Math.max(4, Math.ceil(16 / partners.length)) : 4;

  return (
    <div style={{ background: "#fff", padding: "56px 0 48px", borderTop: "1px solid rgba(20,20,25,0.06)", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9A958B" }}>Ecosystem partners</div>
      </div>
      {!partners ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ width: 140, height: 88, borderRadius: 16, background: "#F4F2EC" }} />
          ))}
        </div>
      ) : (
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", width: "max-content", animation: "ibmarquee 36s linear infinite" }}>
            {Array.from({ length: repeats }, (_, i) => i).map((copy) => (
              <div key={copy} style={{ display: "flex", gap: 18, paddingRight: 18, alignItems: "center" }}>
                {partners.map((p, i) => (
                  <div
                    key={`${copy}-${p.id ?? i}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F2EC", border: "1px solid rgba(20,20,25,0.09)", borderRadius: 16, padding: "16px 26px", height: 88, minWidth: 140 }}
                  >
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.name} style={{ maxHeight: 56, maxWidth: 170, objectFit: "contain", display: "block" }} />
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#141417", whiteSpace: "nowrap" }}>{p.name}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
