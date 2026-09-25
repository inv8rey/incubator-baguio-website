'use client';

import { useState } from 'react';
import { PRIORITY_AREAS } from '../../lib/idea-lab/agenda';
import { REFINE_PRESETS } from '../../lib/idea-lab/programs';
import { TYPE_LABEL, type PublicIdea } from '../../lib/idea-lab/client';
import { BORDER, Badge, DARK, MUTED, ORANGE, card, ghostBtn, input, primaryBtn } from './ui';

const areaName = (slug: string) => PRIORITY_AREAS.find((a) => a.slug === slug)?.name ?? slug;

const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginBottom: 6 } as const;
const linkBtn = { background: 'none', border: 'none', padding: '6px 2px', fontSize: 13.5, fontWeight: 600, color: DARK, cursor: 'pointer', fontFamily: 'inherit' } as const;

interface Props {
  idea: PublicIdea;
  projectType: string;
  priorityArea: string;
  refinedFrom?: string;
  saved?: boolean;
  onSave?: () => void;
  onRefine?: (idea: PublicIdea, instruction: { preset?: string; text?: string }) => Promise<string | null>;
  onExpand?: () => void;
  onShare?: () => void;
  onClaim?: () => void;
  onRemove?: () => void;
  footer?: React.ReactNode;
}

// Three things only: a title (or a startup name), a short description, and how
// it lines up with the City R&I Agenda. Everything else lives in the concept note.
export default function IdeaCard({ idea, projectType, priorityArea, refinedFrom, saved, onSave, onRefine, onExpand, onShare, onClaim, onRemove, footer }: Props) {
  const [refining, setRefining] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const startup = projectType === 'startup';

  async function go(preset?: string) {
    if (!onRefine) return;
    setBusy(true);
    setErr('');
    const e = await onRefine(idea, { preset, text: text.trim() || undefined });
    setBusy(false);
    if (e) setErr(e);
    else {
      setRefining(false);
      setText('');
    }
  }

  return (
    <article className="il-card-in" style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16, padding: '22px 22px 16px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <Badge tone="orange">{TYPE_LABEL[projectType] ?? projectType}</Badge>
        {idea.emerging && <Badge tone="gold">Related and emerging</Badge>}
        {refinedFrom && <Badge tone="green">Refined</Badge>}
      </div>

      <div>
        <div style={fieldLabel}>{startup ? 'Startup name' : 'Suggested title'}</div>
        <h3 style={{ margin: 0, fontSize: startup ? 26 : 19, fontWeight: 700, letterSpacing: startup ? '-0.03em' : '-0.015em', color: DARK, lineHeight: 1.25 }}>{idea.title}</h3>
      </div>

      <div>
        <div style={fieldLabel}>Description</div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#3A352E' }}>
          {idea.deliverable} {idea.problem}
        </p>
      </div>

      <div style={{ background: '#FBF7F0', border: `1px solid ${BORDER}`, borderLeft: `4px solid ${ORANGE}`, borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ ...fieldLabel, color: '#B84A12' }}>City R&amp;I Agenda alignment</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: DARK, lineHeight: 1.4 }}>
          {areaName(priorityArea)}
          <span style={{ fontWeight: 500, color: MUTED }}> · {idea.agenda_theme}</span>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.6, color: '#3A352E' }}>{idea.agenda_fit}</p>
        <div style={{ marginTop: 6, fontSize: 12.5, color: MUTED }}>Statutory area: {idea.statutory_area}</div>
      </div>

      {(onSave || onRefine || onExpand || onShare || onClaim || onRemove) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px 14px', paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
          {onSave && <button style={{ ...linkBtn, color: saved ? ORANGE : DARK }} onClick={onSave}>{saved ? '★ Saved' : '☆ Save'}</button>}
          {onRefine && <button style={linkBtn} onClick={() => setRefining((v) => !v)}>Refine</button>}
          {onExpand && <button style={linkBtn} onClick={onExpand}>Concept note</button>}
          {onShare && <button style={linkBtn} onClick={onShare}>Share</button>}
          {onRemove && <button style={{ ...linkBtn, color: '#B3261E' }} onClick={onRemove}>Remove</button>}
          {onClaim && <button style={{ ...primaryBtn, padding: '9px 18px', fontSize: 14, marginLeft: 'auto' }} onClick={onClaim}>Claim this</button>}
        </div>
      )}

      {refining && onRefine && (
        <div style={{ background: '#FBF9F5', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {REFINE_PRESETS.map((p) => (
              <button key={p} disabled={busy} style={{ ...ghostBtn, padding: '7px 13px', fontSize: 13 }} onClick={() => go(p)}>{p}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={text} maxLength={200} onChange={(e) => setText(e.target.value)} placeholder="Or say what to change" style={{ ...input, padding: '9px 12px', fontSize: 14 }} />
            <button disabled={busy || !text.trim()} style={{ ...primaryBtn, padding: '9px 18px', fontSize: 14, opacity: busy || !text.trim() ? 0.6 : 1 }} onClick={() => go()}>{busy ? 'Working…' : 'Go'}</button>
          </div>
          {err && <div role="alert" style={{ color: '#B3261E', fontSize: 13, marginTop: 8 }}>{err}</div>}
        </div>
      )}
      {footer}
    </article>
  );
}
