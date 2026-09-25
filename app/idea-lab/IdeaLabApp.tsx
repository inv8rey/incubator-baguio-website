'use client';

import { useEffect, useState } from 'react';
import { checkFormGuard, honeypotProps } from '../../lib/formGuard';
import { api, track } from '../../lib/idea-lab/client';
import ResultsView from './ResultsView';
import { BORDER, DARK, MUTED, ORANGE, primaryBtn, wrap } from './ui';

type Kind = 'capstone' | 'thesis' | 'startup';
const TYPES: { value: Kind; label: string; hint: string; icon: string }[] = [
  { value: 'capstone', label: 'Capstone', hint: 'A working prototype or system', icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' },
  { value: 'thesis', label: 'Thesis', hint: 'A research question worth answering', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z' },
  { value: 'startup', label: 'Startup', hint: 'A business that solves a local problem', icon: 'M5 13.5L3 21l7.5-2M14.5 5.5C17 3 21 3 21 3s0 4-2.5 6.5L11 17l-4-4z' },
];
const LAST_KEY = 'ib_idealab_type_v1';

export default function IdeaLabApp() {
  const [kind, setKind] = useState<Kind | ''>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hp, setHp] = useState('');

  useEffect(() => {
    try {
      const last = localStorage.getItem(LAST_KEY) as Kind | null;
      if (last && TYPES.some((t) => t.value === last)) setKind(last);
    } catch {
      // Storage blocked: start with nothing picked.
    }
    track('setup_view');
  }, []);

  async function generate() {
    if (!kind) return;
    setBusy(true);
    setError('');
    const guard = await checkFormGuard(hp, 'idea-lab', 15);
    if (!guard.ok) {
      setBusy(false);
      if (guard.error) setError(guard.error);
      return;
    }
    // Only the project type is asked for. The server picks the priority area
    // that has the fewest ideas so far, so ideas spread across the Agenda.
    const res = await api<{ id: string }>('/api/idea-lab/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hp, input: { project_type: kind, priority_area: 'surprise' } }),
    });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    try {
      localStorage.setItem(LAST_KEY, kind);
    } catch {
      // Not remembered, that is fine.
    }
    track('setup_submit', { project_type: kind });
    // Keep a shareable, refresh-safe address for these results.
    window.history.replaceState(null, '', `/idea-lab/results/${res.data.id}/`);
    setSessionId(res.data.id);
  }

  function restart() {
    window.history.replaceState(null, '', '/idea-lab/');
    setSessionId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (sessionId) return <ResultsView id={sessionId} onRestart={restart} />;

  return (
    <div style={{ ...wrap, maxWidth: 760, paddingTop: 36 }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ORANGE, marginBottom: 10 }}>R&amp;I Idea Lab · Free</div>
        <h1 style={{ margin: 0, fontSize: 'clamp(30px, 7vw, 46px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.08, color: DARK }}>Get a project idea that helps Baguio</h1>
        <p style={{ margin: '14px auto 0', fontSize: 16, lineHeight: 1.6, color: MUTED, maxWidth: 520 }}>Pick what you are working on and tap Generate. Every idea is tied to the City Research and Innovation Agenda.</p>
      </div>

      <input {...honeypotProps} value={hp} onChange={(e) => setHp(e.target.value)} />
      <div role="radiogroup" aria-label="What are you working on?" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        {TYPES.map((t) => {
          const on = kind === t.value;
          return (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setKind(t.value)}
              className="il-type"
              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, border: `2px solid ${on ? ORANGE : BORDER}`, background: on ? 'rgba(242,101,34,0.07)' : '#fff', cursor: 'pointer', fontFamily: 'inherit', boxShadow: on ? '0 14px 30px -18px rgba(242,101,34,0.7)' : 'none' }}
            >
              <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, background: on ? ORANGE : '#F4EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={on ? '#fff' : DARK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 17, fontWeight: 700, color: DARK }}>{t.label}</span>
                <span style={{ display: 'block', fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>{t.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {error && <div role="alert" style={{ marginTop: 16, color: '#B3261E', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</div>}

      <button
        type="button"
        onClick={generate}
        disabled={!kind || busy}
        className="il-generate"
        style={{ ...primaryBtn, width: '100%', marginTop: 20, padding: '17px 24px', fontSize: 17, opacity: !kind || busy ? 0.5 : 1, cursor: !kind || busy ? 'default' : 'pointer' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
        {busy ? 'Starting…' : kind ? `Generate ${kind} ideas` : 'Pick one to start'}
      </button>
      <p style={{ margin: '14px 0 0', fontSize: 13, lineHeight: 1.55, color: MUTED, textAlign: 'center' }}>No login needed. Idea Lab suggests ideas only. It will not write your paper for you.</p>
    </div>
  );
}
