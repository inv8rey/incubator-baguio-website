"use client";

import { DARK, ORANGE } from "./data";

export function Sparkline({
  data,
  color,
  w = 72,
  h = 26,
}: {
  data: number[];
  color: string;
  w?: number;
  h?: number;
}) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data);
  const mx = Math.max(...data, mn + 1);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - mn) / (mx - mn)) * (h - 5)}`)
    .join(" ");
  const lx = w;
  const ly = h - 2 - ((data[data.length - 1] - mn) / (mx - mn)) * (h - 5);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2.5} fill={color} />
    </svg>
  );
}

export function StageDonut({ data, total }: { data: { label: string; count: number; color: string }[]; total: number }) {
  const r = 58;
  const thick = 18;
  const cx = 80;
  const cy = 80;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  const arcs = data.map((d) => {
    const f = d.count / total;
    const len = f * circ;
    const off = -acc * circ;
    acc += f;
    return (
      <circle
        key={d.label}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={thick}
        strokeDasharray={`${len - 1.5} ${circ - len + 1.5}`}
        strokeDashoffset={off}
      />
    );
  });
  return (
    <div>
      <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
        <svg viewBox="0 0 160 160" width={160} height={160} style={{ transform: "rotate(-90deg)", display: "block" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0EDE5" strokeWidth={thick} />
          {arcs}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: DARK, letterSpacing: "-0.02em", lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 10, color: "#9A958B", fontWeight: 500, marginTop: 2 }}>Total</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 16 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0, display: "inline-block" }} />
            <span style={{ color: "#6B6B73", flex: 1 }}>{d.label}</span>
            <span style={{ fontWeight: 600, color: DARK }}>{d.count}</span>
            <span style={{ fontSize: 11, color: "#9A958B", marginLeft: 2 }}>({((d.count / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RadarChart({ axes }: { axes: { label: string; val: number }[] }) {
  const rmax = 5;
  const size = 164;
  const cx = 82;
  const cy = 82;
  const R = 58;
  const n = axes.length;
  const ang = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;
  const pt = (i: number, rv: number): [number, number] => [cx + rv * Math.cos(ang(i)), cy + rv * Math.sin(ang(i))];
  const polyPts = axes.map((a, i) => pt(i, (a.val / rmax) * R).join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[1, 2, 3, 4, 5].map((lv) => (
        <polygon
          key={lv}
          points={axes.map((_, i) => pt(i, (lv / rmax) * R).join(",")).join(" ")}
          fill="none"
          stroke="#EDEBE3"
          strokeWidth={1}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={`a${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="#EDEBE3" strokeWidth={1} />;
      })}
      <polygon points={polyPts} fill="rgba(242,101,34,0.14)" stroke={ORANGE} strokeWidth={1.5} />
      {axes.map((a, i) => {
        const [x, y] = pt(i, (a.val / rmax) * R);
        return <circle key={`d${i}`} cx={x} cy={y} r={3} fill={ORANGE} />;
      })}
      {axes.map((a, i) => {
        const [x, y] = pt(i, R + 15);
        return (
          <text key={`l${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#9A958B" fontWeight={500}>
            {a.label}
          </text>
        );
      })}
      {axes.map((a, i) => {
        const [x, y] = pt(i, R + 26);
        return (
          <text key={`v${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill={ORANGE} fontWeight={700}>
            {a.val}
          </text>
        );
      })}
    </svg>
  );
}

export function FundingPie({ slices }: { slices: { pct: number; color: string }[] }) {
  const sz = 130;
  const c = 65;
  const r = 50;
  const ci = 2 * Math.PI * r;
  let acc = 0;
  const arcs = slices.map((d, i) => {
    const len = (d.pct / 100) * ci;
    const off = -acc * ci;
    acc += d.pct / 100;
    return (
      <circle
        key={i}
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={24}
        strokeDasharray={`${len - 1} ${ci - len + 1}`}
        strokeDashoffset={off}
      />
    );
  });
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ transform: "rotate(-90deg)", display: "block", flexShrink: 0 }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="#F0EDE5" strokeWidth={24} />
      {arcs}
    </svg>
  );
}
