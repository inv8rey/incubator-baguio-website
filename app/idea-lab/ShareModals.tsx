'use client';

import { useState } from 'react';
import { checkFormGuard, honeypotProps } from '../../lib/formGuard';
import { api, track } from '../../lib/idea-lab/client';
import { BORDER, DARK, MUTED, card, ghostBtn, input, label, primaryBtn } from './ui';

function Overlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(28,25,23,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 12, overflowY: 'auto' }}>
      <div role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()} style={{ ...card, width: '100%', maxWidth: 480, margin: 'auto', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', color: DARK }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function ShareModal({ ideaId, onClose }: { ideaId: string; onClose: () => void }) {
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const guard = await checkFormGuard(hp, 'idea-lab-share', 10);
    if (!guard.ok) {
      setBusy(false);
      if (guard.error) setErr(guard.error);
      return;
    }
    const res = await api('/api/idea-lab/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ideaId, showName, displayName: name, school, email, consent, hp }) });
    setBusy(false);
    if (!res.ok) return setErr(res.error);
    track('share');
    setDone(true);
  }

  if (done) {
    return (
      <Overlay title="Thank you" onClose={onClose}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#3A352E' }}>Your idea was sent to Incubator Baguio. Staff review shared ideas before they appear in the Idea Bank.</p>
        <button style={primaryBtn} onClick={onClose}>Close</button>
      </Overlay>
    );
  }
  return (
    <Overlay title="Share with Incubator Baguio" onClose={onClose}>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: MUTED }}>Shared ideas help other students and city partners. Yours is anonymous unless you choose to show a name. Staff review it before it is public.</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input {...honeypotProps} value={hp} onChange={(e) => setHp(e.target.value)} />
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: DARK, cursor: 'pointer' }}>
          <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} style={{ marginTop: 3 }} />
          <span>Show my name and school next to the idea</span>
        </label>
        {showName && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={input} />
            <input value={school} maxLength={120} onChange={(e) => setSchool(e.target.value)} placeholder="School (optional)" style={input} />
          </div>
        )}
        <div>
          <label htmlFor="sh-email" style={label}>Email (optional)</label>
          <input id="sh-email" type="email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} placeholder="Only if you want us to reach you" style={input} />
        </div>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.5, color: '#3A352E', cursor: 'pointer' }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
          <span>I agree to share this idea. Incubator Baguio staff may contact me at the email above about mentoring, partner matching, or the challenge repository.</span>
        </label>
        {err && <div role="alert" style={{ color: '#B3261E', fontSize: 13.5, fontWeight: 600 }}>{err}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" style={ghostBtn} onClick={onClose}>Cancel</button>
          <button type="submit" disabled={busy || !consent} style={{ ...primaryBtn, padding: '11px 22px', opacity: busy || !consent ? 0.6 : 1 }}>{busy ? 'Sending…' : 'Share idea'}</button>
        </div>
      </form>
    </Overlay>
  );
}

export function ClaimModal({ sharedId, title, onClose }: { sharedId: string; title: string; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    const guard = await checkFormGuard(hp, 'idea-lab-claim', 8);
    if (!guard.ok) {
      setBusy(false);
      if (guard.error) setErr(guard.error);
      return;
    }
    const res = await api('/api/idea-lab/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sharedId, email, message, hp }) });
    setBusy(false);
    if (!res.ok) return setErr(res.error);
    track('claim');
    setDone(true);
  }

  if (done) {
    return (
      <Overlay title="Interest noted" onClose={onClose}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#3A352E' }}>Thanks. We told Incubator Baguio staff you are interested and will follow up if you left an email.</p>
        <button style={primaryBtn} onClick={onClose}>Close</button>
      </Overlay>
    );
  }
  return (
    <Overlay title="Claim this idea" onClose={onClose}>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: MUTED }}>Interested in taking on &ldquo;{title}&rdquo;? Students, schools, barangays, and small businesses can all express interest.</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input {...honeypotProps} value={hp} onChange={(e) => setHp(e.target.value)} />
        <input type="email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" style={input} />
        <textarea value={message} maxLength={400} rows={3} onChange={(e) => setMessage(e.target.value)} placeholder="A short note: who you are and how you would use the idea" style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} />
        {err && <div role="alert" style={{ color: '#B3261E', fontSize: 13.5, fontWeight: 600 }}>{err}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
          <button type="button" style={ghostBtn} onClick={onClose}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...primaryBtn, padding: '11px 22px', opacity: busy ? 0.6 : 1 }}>{busy ? 'Sending…' : 'Send interest'}</button>
        </div>
      </form>
    </Overlay>
  );
}
