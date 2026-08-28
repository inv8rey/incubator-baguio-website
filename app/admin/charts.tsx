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

export function TrendChart({
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
  const barGap = w / data.length;
  const axisH = height - 18;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
        <line x1={0} y1={axisH} x2={w} y2={axisH} stroke="rgba(64,50,34,0.09)" strokeWidth={0.5} />
        {data.map((d, i) => {
          const barH = (d.value / max) * (axisH - 6);
          const x = i * barGap;
          const barW = Math.max(barGap * 0.62, 0.4);
          return (
            <rect
              key={i}
              x={x + (barGap - barW) / 2}
              y={axisH - barH}
              width={barW}
              height={Math.max(barH, d.value > 0 ? 1 : 0)}
              rx={0.6}
              fill={color}
              opacity={0.85}
            />
          );
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#8B8479", marginTop: 6 }}>
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
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
          <text key={`l${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#8B8479" fontWeight={500}>
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
