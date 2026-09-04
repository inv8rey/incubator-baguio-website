"use client";

import { useEffect, useRef, useState } from "react";

const SLAT_COUNT = 9;
const BG = "#100D0B";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

function Blinds({ visible, delayBase = 0 }: { visible: boolean; delayBase?: number }) {
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", pointerEvents: "none" }}
    >
      {Array.from({ length: SLAT_COUNT }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: BG,
            transform: visible ? "scaleY(0)" : "scaleY(1)",
            transformOrigin: i % 2 === 0 ? "top" : "bottom",
            transition: `transform 0.62s cubic-bezier(.65,0,.35,1) ${delayBase + i * 55}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function WhoWeAre() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ background: BG, padding: "88px 40px 100px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#F26522",
            marginBottom: 22,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          Who We Are
        </div>

        <div style={{ position: "relative" }}>
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: 32,
              fontWeight: 400,
              letterSpacing: "-0.01em",
              lineHeight: 1.35,
              color: "#fff",
            }}
          >
            The City Government of Baguio&rsquo;s platform for innovation ecosystem development.
          </h2>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 17,
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.62)",
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            We bring government, academia, industry, and communities together to move Baguio&rsquo;s best ideas forward.
          </p>
          <a
            href={`${BP}/about`}
            style={{ fontSize: 14, fontWeight: 600, color: "#F26522", textDecoration: "none", borderBottom: "2px solid rgba(242,101,34,0.4)", paddingBottom: 2 }}
          >
            Learn about our mandate &rarr;
          </a>
          <Blinds visible={visible} />
        </div>
      </div>
    </div>
  );
}
