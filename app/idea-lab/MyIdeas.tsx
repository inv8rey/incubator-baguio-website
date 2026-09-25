'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readSaved, removeSaved, setSavedStatus, type SavedIdea, type SavedStatus } from '../../lib/idea-lab/client';
import IdeaCard from './IdeaCard';
import { ShareModal } from './ShareModals';
import { BORDER, DARK, MUTED, card, primaryBtn, wrap } from './ui';

const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';
const STATUSES: { value: SavedStatus; label: string }[] = [
  { value: 'exploring', label: 'Exploring' },
  { value: 'chosen', label: 'Chosen' },
  { value: 'dropped', label: 'Dropped' },
];

// Saved ideas live on this device (localStorage). There is no account sync yet.
export default function MyIdeas() {
  const router = useRouter();
  const [items, setItems] = useState<SavedIdea[] | null>(null);
  const [share, setShare] = useState<string | null>(null);

  useEffect(() => setItems(readSaved()), []);
  const refresh = () => setItems(readSaved());

  if (items === null) return <div style={wrap}><p style={{ color: MUTED }}>Loading…</p></div>;

  return (
    <div style={wrap}>
      <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(26px, 6vw, 34px)', fontWeight: 700, letterSpacing: '-0.03em', color: DARK }}>My ideas</h1>
      <p style={{ margin: '0 0 20px', fontSize: 14.5, color: MUTED }}>Saved on this device only. Clearing your browser data removes them.</p>

      {items.length === 0 ? (
        <div style={card}>
          <p style={{ margin: '0 0 14px', color: '#3A352E' }}>You have not saved any ideas yet. Generate some and tap Save on the ones you like.</p>
          <a href={`${BP}/idea-lab/`} style={primaryBtn}>Generate ideas</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((s) => (
            <IdeaCard
              key={s.idea.id}
              idea={s.idea}
              projectType={s.project_type}
              priorityArea={s.priority_area}
              onExpand={() => router.push(`/idea-lab/note/${s.idea.id}/`)}
              onShare={() => setShare(s.idea.id)}
              onRemove={() => { removeSaved(s.idea.id); refresh(); }}
              footer={
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, marginRight: 4 }}>Status</span>
                  {STATUSES.map((st) => (
                    <button key={st.value} onClick={() => { setSavedStatus(s.idea.id, st.value); refresh(); }} aria-pressed={s.status === st.value} style={{ padding: '6px 12px', borderRadius: 9999, border: `1.5px solid ${s.status === st.value ? '#F26522' : BORDER}`, background: s.status === st.value ? 'rgba(242,101,34,0.10)' : '#fff', color: s.status === st.value ? '#B84A12' : DARK, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{st.label}</button>
                  ))}
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: MUTED }}>Saved {new Date(s.saved_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                </div>
              }
            />
          ))}
        </div>
      )}
      {share && <ShareModal ideaId={share} onClose={() => setShare(null)} />}
    </div>
  );
}
