"use client";

import { useEffect, useState } from "react";
import { fetchDynamicEcosystemPartners, type EcosystemPartnerEntry } from "./ecosystem/dynamicData";

export default function EcosystemPartnersMarquee() {
  const [partners, setPartners] = useState<EcosystemPartnerEntry[] | null>(null);

  useEffect(() => {
    fetchDynamicEcosystemPartners().then(setPartners);
  }, []);

  if (partners && partners.length === 0) return null;

  return (
    <div style={{ background: "#fff", padding: "56px 0 48px", borderTop: "1px solid rgba(20,20,25,0.06)", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9A958B" }}>Ecosystem partners</div>
      </div>
      {!partners ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ width: 88, height: 56, borderRadius: 12, background: "#F4F2EC" }} />
          ))}
        </div>
      ) : (
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", width: "max-content", animation: "ibmarquee 36s linear infinite" }}>
            {[0, 1].map((copy) => (
              <div key={copy} style={{ display: "flex", gap: 14, paddingRight: 14, alignItems: "center" }}>
                {partners.map((p, i) => (
                  <div
                    key={`${copy}-${p.id ?? i}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F2EC", border: "1px solid rgba(20,20,25,0.09)", borderRadius: 14, padding: "11px 22px", height: 56, minWidth: 88 }}
                  >
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.name} style={{ maxHeight: 34, maxWidth: 120, objectFit: "contain", display: "block" }} />
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#141417", whiteSpace: "nowrap" }}>{p.name}</span>
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
