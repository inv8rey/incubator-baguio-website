"use client";

import { useEffect, useRef, useState } from "react";
import { DARK, ORANGE } from "./data";

const GRID = "rgba(64,50,34,0.09)";
const AXIS_TEXT = "#6E685F";

/** Live pixel width of an element, so charts can be drawn in real pixel
 *  coordinates instead of a stretched viewBox. */
function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export function compactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1)}k`;
  return String(Math.round(n));
}

/** Axis ticks on "nice" round values (1/2/5 × 10ⁿ) rather than raw max/4
 *  fractions, so the gridline labels read as 0/25/50/75 instead of 0/23/46/69. */
function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0, 1];
  const mag = Math.pow(10, Math.floor(Math.log10(max / count)));
  const norm = max / count / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

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
  showPct = true,
}: {
  data: { label: string; count: number; pct: number; color: string }[];
  labelWidth?: number;
  showPct?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return <div style={{ fontSize: 12.5, color: AXIS_TEXT, padding: "12px 0" }}>No data yet.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {data.map((s, i) => (
        <div
          key={s.label}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          title={`${s.label} — ${s.count} (${s.pct}%)`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 6px",
            margin: "0 -6px",
            borderRadius: 8,
            background: hover === i ? "rgba(64,50,34,0.035)" : "transparent",
            borderBottom: i < data.length - 1 ? "1px solid rgba(64,50,34,0.05)" : "none",
            transition: "background 120ms ease",
          }}
        >
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${s.color}1F`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
          </div>
          {/* flex-shrinkable rather than a fixed width: at 390px the fixed
              220px label used to push the count and percent columns off the
              right edge of the card entirely. */}
          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#44444C", flex: "1 1 auto", minWidth: 0, maxWidth: labelWidth, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
          <div style={{ flex: "2 1 60px", minWidth: 32, height: 7, background: "rgba(64,50,34,0.09)", borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.max(s.pct, s.count > 0 ? 1.5 : 0)}%`,
                height: "100%",
                background: s.color,
                borderRadius: 999,
                opacity: hover === null || hover === i ? 1 : 0.45,
                transition: "opacity 120ms ease",
              }}
            />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: DARK, width: 38, textAlign: "right", flexShrink: 0 }}>{s.count.toLocaleString()}</span>
          {showPct && <span style={{ fontSize: 11, color: AXIS_TEXT, width: 44, textAlign: "right", flexShrink: 0 }}>{s.pct}%</span>}
        </div>
      ))}
    </div>
  );
}

export interface LineSeries {
  name: string;
  color: string;
  values: number[];
}

/**
 * Multi-series line/area chart with a value axis, date ticks, and a hover
 * crosshair + tooltip.
 *
 * Drawn in real pixel coordinates from a measured container width. The
 * previous version used viewBox="0 0 100 H" with preserveAspectRatio="none",
 * which stretched x by ~19x while leaving y at 1x — that is what turned the
 * round point markers into wide horizontal dashes along the line.
 */
export function LineChart({
  labels,
  series,
  height = 190,
  formatValue = compactNumber,
  yTickCount = 4,
}: {
  labels: string[];
  series: LineSeries[];
  height?: number;
  formatValue?: (n: number) => string;
  yTickCount?: number;
}) {
  const [wrapRef, width] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const visible = series.filter((s) => s.values.length > 0);
  if (!labels.length || visible.length === 0) return null;

  const PAD_L = 42;
  const PAD_R = 14;
  const PAD_T = 12;
  const PAD_B = 26;
  // Real measured width, so the viewBox maps 1:1 to pixels. Drawing against a
  // guessed minimum instead would make the viewBox wider than the rendered
  // element, scaling the whole chart — axis text included — down to fit.
  const w = Math.max(width, 1);
  const plotW = Math.max(w - PAD_L - PAD_R, 10);
  const plotH = Math.max(height - PAD_T - PAD_B, 10);

  const rawMax = Math.max(...visible.flatMap((s) => s.values), 0);
  const ticks = niceTicks(rawMax, yTickCount);
  const yMax = ticks[ticks.length - 1] || 1;

  const n = labels.length;
  const stepX = n > 1 ? plotW / (n - 1) : 0;
  const xAt = (i: number) => PAD_L + (n > 1 ? i * stepX : plotW / 2);
  const yAt = (v: number) => PAD_T + (1 - v / yMax) * plotH;

  // Date ticks spaced by available width (~62px each) rather than a fixed
  // count, so a 90-day range on a phone doesn't overprint its own labels.
  // The final day is always labelled; a stepped tick landing too close to it
  // is dropped instead of colliding with it.
  const maxTicks = Math.max(2, Math.floor(plotW / 62));
  const tickEvery = Math.max(1, Math.ceil(n / maxTicks));
  const xTickIdx: number[] = [];
  for (let i = 0; i < n - 1; i += tickEvery) xTickIdx.push(i);
  // The final label is anchored "end", so it grows leftward into its
  // neighbour; it needs ~1.5 label-widths of clearance, not half a step.
  if (xTickIdx.length > 1 && (n - 1 - xTickIdx[xTickIdx.length - 1]) * stepX < 90) xTickIdx.pop();
  if (n > 1) xTickIdx.push(n - 1);
  else xTickIdx.push(0); // a single day still gets its one label

  function pointerIndex(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - PAD_L;
    if (n === 1) return 0;
    return Math.max(0, Math.min(n - 1, Math.round(x / stepX)));
  }

  const tooltipLeft = hover === null ? 0 : Math.max(6, Math.min(xAt(hover) - 70, w - 146));

  // One stable wrapper element for the whole lifetime of the chart: swapping
  // in a different node once measured would leave the ResizeObserver attached
  // to the detached original, and the chart would never resize again.
  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", minHeight: height }}>
      {width === 0 ? null : (
      <>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        style={{ display: "block", touchAction: "none" }}
        onPointerMove={(e) => setHover(pointerIndex(e))}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${visible.map((s) => s.name).join(" and ")} over ${n} days`}
      >
        <defs>
          {visible.map((s) => (
            <linearGradient key={s.name} id={`ib-lg-${s.name.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
            </linearGradient>
          ))}
        </defs>

        {/* value gridlines + labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD_L} y1={yAt(t)} x2={w - PAD_R} y2={yAt(t)} stroke={GRID} strokeWidth={1} />
            <text x={PAD_L - 8} y={yAt(t) + 3.5} textAnchor="end" fontSize={10} fill={AXIS_TEXT}>
              {formatValue(t)}
            </text>
          </g>
        ))}

        {/* date ticks */}
        {xTickIdx.map((i) => (
          <text key={i} x={xAt(i)} y={height - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize={10} fill={AXIS_TEXT}>
            {labels[i]}
          </text>
        ))}

        {visible.map((s) => {
          const pts = s.values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
          const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          const area = `${line} L${pts[pts.length - 1].x},${PAD_T + plotH} L${pts[0].x},${PAD_T + plotH} Z`;
          return (
            <g key={s.name}>
              <path d={area} fill={`url(#ib-lg-${s.name.replace(/\W/g, "")})`} stroke="none" />
              <path d={line} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {/* Individual day markers only when they won't collide into a smear. */}
              {n <= 32 && pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={2} fill="#fff" stroke={s.color} strokeWidth={1.5} />)}
            </g>
          );
        })}

        {/* hover crosshair */}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={xAt(hover)} y1={PAD_T} x2={xAt(hover)} y2={PAD_T + plotH} stroke="rgba(64,50,34,0.28)" strokeWidth={1} strokeDasharray="3 3" />
            {visible.map((s) => (
              <circle key={s.name} cx={xAt(hover)} cy={yAt(s.values[hover] ?? 0)} r={4} fill={s.color} stroke="#fff" strokeWidth={2} />
            ))}
          </g>
        )}
      </svg>

      {hover !== null && (
        <div
          style={{
            position: "absolute",
            top: 4,
            left: tooltipLeft,
            width: 140,
            background: "#fff",
            border: "1px solid rgba(64,50,34,0.14)",
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(26,23,20,0.10)",
            padding: "8px 10px",
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: DARK, marginBottom: 5 }}>{labels[hover]}</div>
          {visible.map((s) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, marginTop: 2 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ color: "#5A544B", flex: 1 }}>{s.name}</span>
              <strong style={{ color: DARK }}>{(s.values[hover] ?? 0).toLocaleString()}</strong>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}

export function StageDonut({ data, total }: { data: { label: string; count: number; color: string }[]; total: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const r = 58;
  const thick = 18;
  const cx = 80;
  const cy = 80;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  const arcs = data.map((d, i) => {
    const f = total > 0 ? d.count / total : 0;
    const len = f * circ;
    const off = -acc * circ;
    acc += f;
    const active = hover === i;
    return (
      <circle
        key={d.label}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={active ? thick + 5 : thick}
        strokeDasharray={`${Math.max(len - 1.5, 0)} ${circ - len + 1.5}`}
        strokeDashoffset={off}
        opacity={hover === null || active ? 1 : 0.4}
        onMouseEnter={() => setHover(i)}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: "pointer", transition: "stroke-width 130ms ease, opacity 130ms ease" }}
      />
    );
  });

  const focus = hover !== null ? data[hover] : null;

  return (
    <div>
      <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
        <svg viewBox="0 0 160 160" width={160} height={160} style={{ transform: "rotate(-90deg)", display: "block", overflow: "visible" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0EDE5" strokeWidth={thick} />
          {arcs}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", padding: "0 22px", textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: focus ? focus.color : DARK, letterSpacing: "-0.02em", lineHeight: 1 }}>{focus ? focus.count : total}</div>
          <div style={{ fontSize: 10, color: AXIS_TEXT, fontWeight: 500, marginTop: 3, lineHeight: 1.25 }}>
            {focus ? `${focus.label} · ${total > 0 ? ((focus.count / total) * 100).toFixed(1) : "0"}%` : "Total"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 16 }}>
        {data.map((d, i) => (
          <div
            key={d.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              padding: "5px 6px",
              margin: "0 -6px",
              borderRadius: 7,
              cursor: "pointer",
              background: hover === i ? "rgba(64,50,34,0.04)" : "transparent",
              opacity: hover === null || hover === i ? 1 : 0.55,
              transition: "background 120ms ease, opacity 120ms ease",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0, display: "inline-block" }} />
            <span style={{ color: "#5A544B", flex: 1 }}>{d.label}</span>
            <span style={{ fontWeight: 600, color: DARK }}>{d.count}</span>
            <span style={{ fontSize: 11, color: AXIS_TEXT, marginLeft: 2 }}>({total > 0 ? ((d.count / total) * 100).toFixed(1) : "0.0"}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
