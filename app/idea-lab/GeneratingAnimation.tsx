'use client';

import { useEffect, useState } from 'react';
import { DARK, MUTED, ORANGE } from './ui';

const STEPS = [
  'Reading the City Research and Innovation Agenda',
  'Looking at real challenges around Baguio',
  'Matching ideas to your project type',
  'Sketching ideas',
  'Checking each idea against the Agenda',
];

// Shown while ideas stream in. `done` of `total` ideas have arrived.
export default function GeneratingAnimation({ done, total }: { done: number; total: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % STEPS.length), 1700);
    return () => clearInterval(t);
  }, []);

  return (
    <div role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '34px 16px 30px', background: '#fff', border: '1px solid #E0D9CD', borderRadius: 22 }}>
      <div className="il-orb" aria-hidden>
        <span className="il-ring" />
        <span className="il-ring il-ring2" />
        <span className="il-dot" style={{ background: '#F2C240' }} />
        <span className="il-dot il-dot2" style={{ background: '#2B63AE' }} />
        <span className="il-dot il-dot3" style={{ background: '#1A6B3C' }} />
        <svg className="il-bulb" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6M10 22h4" />
          <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />
        </svg>
      </div>
      <div key={i} className="il-step" style={{ marginTop: 22, fontSize: 16, fontWeight: 700, color: DARK }}>{STEPS[i]}…</div>
      <div style={{ marginTop: 6, fontSize: 13.5, color: MUTED }}>{done > 0 ? `${done} of ${total} ideas ready` : 'This takes a few seconds'}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        {Array.from({ length: total }).map((_, n) => (
          <span key={n} style={{ width: 26, height: 5, borderRadius: 9999, background: n < done ? ORANGE : '#EDE7DC', transition: 'background .3s' }} />
        ))}
      </div>
      <style>{`
        .il-orb { position: relative; width: 96px; height: 96px; display: flex; align-items: center; justify-content: center; }
        .il-orb::before { content: ''; position: absolute; inset: 18px; border-radius: 9999px; background: radial-gradient(circle at 35% 30%, #FF8A4C, ${ORANGE}); box-shadow: 0 10px 30px -8px rgba(242,101,34,0.6); animation: il-pulse 1.6s ease-in-out infinite; }
        .il-bulb { position: relative; animation: il-flicker 1.6s ease-in-out infinite; }
        .il-ring { position: absolute; inset: 0; border-radius: 9999px; border: 2px solid rgba(242,101,34,0.35); animation: il-ripple 2s ease-out infinite; }
        .il-ring2 { animation-delay: 1s; }
        .il-dot { position: absolute; top: 50%; left: 50%; width: 10px; height: 10px; margin: -5px; border-radius: 9999px; animation: il-orbit 2.4s linear infinite; }
        .il-dot2 { animation-delay: -0.8s; }
        .il-dot3 { animation-delay: -1.6s; }
        .il-step { animation: il-fade .45s ease both; }
        @keyframes il-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes il-flicker { 0%,100% { opacity: 1; } 50% { opacity: .75; } }
        @keyframes il-ripple { 0% { transform: scale(.55); opacity: 1; } 100% { transform: scale(1.25); opacity: 0; } }
        @keyframes il-orbit { from { transform: rotate(0deg) translateX(46px); } to { transform: rotate(360deg) translateX(46px); } }
        @keyframes il-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .il-orb::before, .il-bulb, .il-ring, .il-dot, .il-step { animation: none !important; } }
      `}</style>
    </div>
  );
}
