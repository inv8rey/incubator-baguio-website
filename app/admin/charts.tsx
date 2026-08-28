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

export function BreakdownBars({
  data,
  labelWidth = 190,
}: {
  data: { label: string; count: number; pct: number; color: string }[];
  labelWidth?: number;
}) {
  if (data.length === 0) {
    return <div style={{ fontSize: 12.5, color: "#8B8479", padding: "12px 0" }}>No data yet.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {data.map((s, i) => (
        <div
          key={s.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 0",
            borderBottom: i < data.length - 1 ? "1px solid rgba(64,50,34,0.05)" : "none",
          }}
        >
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${s.color}1F`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#44444C", width: labelWidth, flexShrink: 0, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
          <div style={{ flex: 1, height: 7, background: "rgba(64,50,34,0.09)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${s.pct}%`, height: "100%", background: s.color, borderRadius: 999 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: DARK, width: 34, textAlign: "right", flexShrink: 0 }}>{s.count}</span>
          <span style={{ fontSize: 11, color: "#8B8479", width: 44, textAlign: "right", flexShrink: 0 }}>{s.pct}%</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({
  data,
  color = ORANGE,
  height = 120,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  if (!data.length) return null;
  const w = 100;
  const max = Math.max(...data.map((d) => d.value), 1);
  const axisH = height - 18;
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = axisH - (d.value / max) * (axisH - 6);
    return { x, y };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${axisH} L${points[0].x},${axisH} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
        <line x1={0} y1={axisH} x2={w} y2={axisH} stroke="rgba(64,50,34,0.09)" strokeWidth={0.5} />
        <path d={areaPath} fill={color} opacity={0.08} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={1.4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.3} fill={color} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#8B8479", marginTop: 6 }}>
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
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
          <div style={{ fontSize: 26, fontWeight: 600, color: DARK, letterSpacing: "-0.02em", lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 10, color: "#8B8479", fontWeight: 500, marginTop: 2 }}>Total</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 16 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0, display: "inline-block" }} />
            <span style={{ color: "#5A544B", flex: 1 }}>{d.label}</span>
            <span style={{ fontWeight: 600, color: DARK }}>{d.count}</span>
            <span style={{ fontSize: 11, color: "#8B8479", marginLeft: 2 }}>({((d.count / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

