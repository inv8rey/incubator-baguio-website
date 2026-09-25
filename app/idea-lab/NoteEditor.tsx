'use client';

import { useEffect, useState } from 'react';
import { api, track, type NoteContent, type PublicIdea } from '../../lib/idea-lab/client';
import { NOTE_DISCLAIMER_LONG } from '../../lib/idea-lab/programs';
import { downloadNoteDocx } from './docxExport';
import { ShareModal } from './ShareModals';
import { BORDER, DARK, MUTED, card, ghostBtn, input, label, primaryBtn, wrap } from './ui';

const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';

const lines = (v: string) => v.split('\n').map((s) => s.trim()).filter(Boolean);

function toText(n: NoteContent): string {
  const list = (a: string[]) => a.map((x) => `- ${x}`).join('\n');
  return [
    n.working_title,
    NOTE_DISCLAIMER_LONG,
    `\nBACKGROUND\n${n.background}`,
    `\nPROBLEM STATEMENT\n${n.problem_statement}`,
    `\nOBJECTIVES\n${list(n.objectives)}`,
    `\nPROPOSED APPROACH\n${n.proposed_approach}`,
    `\nEXPECTED OUTPUT\n${n.expected_output}`,
    `\nPOSSIBLE PARTNERS\n${n.possible_partners.length ? list(n.possible_partners) : 'To be identified.'}`,
    `\nRISKS\n${list(n.risks)}`,
    `\nNEXT THREE STEPS\n${n.next_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
  ].join('\n');
}

export default function NoteEditor({ ideaId }: { ideaId: string }) {
  const [idea, setIdea] = useState<PublicIdea | null>(null);
  const [note, setNote] = useState<NoteContent | null>(null);
  const [status, setStatus] = useState<'loading' | 'writing' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [share, setShare] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await api<{ idea: PublicIdea; note: NoteContent | null }>(`/api/idea-lab/note?ideaId=${ideaId}`);
      if (cancelled) return;
      if (!r.ok) {
        setError(r.error);
        setStatus('error');
        return;
      }
      setIdea(r.data.idea);
      if (r.data.note) {
        setNote(r.data.note);
        setStatus('ready');
        return;
      }
      setStatus('writing');
      const w = await api<{ note: NoteContent }>('/api/idea-lab/note', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ideaId }) });
      if (cancelled) return;
      if (!w.ok) {
        setError(w.error);
        setStatus('error');
        return;
      }
      track('note');
      setNote(w.data.note);
      setStatus('ready');
    })();
    return () => { cancelled = true; };
  }, [ideaId]);

  const edit = (patch: Partial<NoteContent>) => {
    setNote((n) => (n ? { ...n, ...patch } : n));
    setDirty(true);
  };

  async function save() {
    if (!note) return;
    setSaving(true);
    const r = await api<{ note: NoteContent }>('/api/idea-lab/note', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ideaId, note }) });
    setSaving(false);
    if (!r.ok) return setError(r.error);
    setError('');
    setNote(r.data.note);
    setDirty(false);
  }

  async function copy() {
    if (!note) return;
    try {
      await navigator.clipboard.writeText(toText(note));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Copy is blocked in this browser. Try Download instead.');
    }
  }

  if (status === 'loading' || status === 'writing') {
    return <div style={wrap}><p style={{ color: MUTED }}>{status === 'writing' ? 'Writing your outline… this takes a few seconds.' : 'Loading…'}</p></div>;
  }
  if (status === 'error' || !note) {
    return (
      <div style={wrap}>
        <div style={card}>
          <h1 style={{ margin: '0 0 8px', fontSize: 22, color: DARK }}>We could not open the outline</h1>
          <p style={{ margin: '0 0 16px', color: MUTED }}>{error || 'Please try again.'}</p>
          <a href={`${BP}/idea-lab/`} style={primaryBtn}>Back to Idea Lab</a>
        </div>
      </div>
    );
  }

  const ta = (value: string, onChange: (v: string) => void, rows = 4) => (
    <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} style={{ ...input, resize: 'vertical', lineHeight: 1.55 }} />
  );

  return (
    <div style={wrap}>
      <div style={{ background: 'rgba(242,101,34,0.10)', border: '1px solid rgba(242,101,34,0.35)', color: '#8C3A0C', borderRadius: 12, padding: '10px 14px', fontSize: 13.5, fontWeight: 600, marginBottom: 16 }}>
        {NOTE_DISCLAIMER_LONG}
      </div>

      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label htmlFor="n-title" style={label}>Working title</label>
          <input id="n-title" value={note.working_title} maxLength={200} onChange={(e) => edit({ working_title: e.target.value })} style={{ ...input, fontSize: 18, fontWeight: 700 }} />
        </div>
        <div><span style={label}>Background</span>{ta(note.background, (v) => edit({ background: v }), 5)}</div>
        <div><span style={label}>Problem statement</span>{ta(note.problem_statement, (v) => edit({ problem_statement: v }), 4)}</div>
        <div><span style={label}>Objectives (one per line)</span>{ta(note.objectives.join('\n'), (v) => edit({ objectives: lines(v) }), 4)}</div>
        <div><span style={label}>Proposed approach</span>{ta(note.proposed_approach, (v) => edit({ proposed_approach: v }), 5)}</div>
        <div><span style={label}>Expected output</span>{ta(note.expected_output, (v) => edit({ expected_output: v }), 3)}</div>
        <div><span style={label}>Possible partners (one per line)</span>{ta(note.possible_partners.join('\n'), (v) => edit({ possible_partners: lines(v) }), 3)}</div>
        <div><span style={label}>Risks (one per line)</span>{ta(note.risks.join('\n'), (v) => edit({ risks: lines(v) }), 3)}</div>
        <div><span style={label}>Next three steps (one per line)</span>{ta(note.next_steps.join('\n'), (v) => edit({ next_steps: lines(v).slice(0, 3) }), 3)}</div>
      </div>

      {error && <div role="alert" style={{ marginTop: 14, color: '#B3261E', fontSize: 14, fontWeight: 600 }}>{error}</div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
        <button style={{ ...primaryBtn, opacity: dirty ? 1 : 0.6 }} disabled={!dirty || saving} onClick={save}>{saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</button>
        <button style={ghostBtn} onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
        <button style={ghostBtn} onClick={() => { downloadNoteDocx(note); track('docx'); }}>Download .docx</button>
        <button style={ghostBtn} onClick={() => setShare(true)}>Share with Incubator Baguio</button>
        {idea && <a style={ghostBtn} href={`${BP}/idea-lab/results/${idea.session_id}/`}>Back to my ideas</a>}
      </div>
      {share && <ShareModal ideaId={ideaId} onClose={() => setShare(false)} />}
    </div>
  );
}
