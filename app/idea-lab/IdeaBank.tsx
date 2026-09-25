'use client';

import { useEffect, useState } from 'react';
import { PRIORITY_AREAS } from '../../lib/idea-lab/agenda';
import { PROGRAMS } from '../../lib/idea-lab/programs';
import { api, type PublicIdea } from '../../lib/idea-lab/client';
import { useAuth } from '../AuthProvider';
import IdeaCard from './IdeaCard';
import { ClaimModal } from './ShareModals';
import { DARK, MUTED, card, input, wrap } from './ui';

interface BankItem {
  shared_id: string;
  display_name: string | null;
  school: string | null;
  project_type: string;
  program: string | null;
  priority_area: string;
  idea: PublicIdea;
}

const sel = { ...input, width: 'auto', padding: '9px 12px', fontSize: 14 } as const;

const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function IdeaBank() {
  const { user } = useAuth();
  const [items, setItems] = useState<BankItem[] | null>(null);
  const [type, setType] = useState('');
  const [area, setArea] = useState('');
  const [program, setProgram] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [claim, setClaim] = useState<BankItem | null>(null);

  useEffect(() => {
    const q = new URLSearchParams();
    if (type) q.set('type', type);
    if (area) q.set('area', area);
    if (program) q.set('program', program);
    if (difficulty) q.set('difficulty', difficulty);
    let cancelled = false;
    api<{ items: BankItem[] }>(`/api/idea-lab/bank?${q}`).then((r) => { if (!cancelled) setItems(r.ok ? r.data.items : []); });
    return () => { cancelled = true; };
  }, [type, area, program, difficulty]);

  return (
    <div style={wrap}>
      <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(26px, 6vw, 34px)', fontWeight: 700, letterSpacing: '-0.03em', color: DARK }}>Idea Bank</h1>
      <p style={{ margin: '0 0 18px', fontSize: 14.5, color: MUTED, maxWidth: 600 }}>Ideas that students and innovators chose to share, reviewed by Incubator Baguio staff. Interested? Tap Claim this.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} style={sel}><option value="">All types</option><option value="capstone">Capstone</option><option value="thesis">Thesis</option><option value="startup">Startup</option></select>
        <select aria-label="Priority area" value={area} onChange={(e) => setArea(e.target.value)} style={sel}><option value="">All areas</option>{PRIORITY_AREAS.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}</select>
        <select aria-label="Program" value={program} onChange={(e) => setProgram(e.target.value)} style={sel}><option value="">All programs</option>{PROGRAMS.map((p) => <option key={p}>{p}</option>)}</select>
        <select aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={sel}><option value="">Any difficulty</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
      </div>

      {items === null && <p style={{ color: MUTED }}>Loading…</p>}
      {items && items.length === 0 && <div style={card}><p style={{ margin: 0, color: '#3A352E' }}>No shared ideas match yet. Generate an idea and share yours to start the bank.</p></div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items?.map((b) => (
          <IdeaCard
            key={b.shared_id}
            idea={b.idea}
            projectType={b.project_type}
            priorityArea={b.priority_area}
            onClaim={() => (user ? setClaim(b) : (window.location.href = `${BP}/login/?redirect=${encodeURIComponent(`${BP}/idea-lab/bank/`)}`))}
            footer={<div style={{ fontSize: 12.5, color: MUTED }}>Shared by {b.display_name ? `${b.display_name}${b.school ? `, ${b.school}` : ''}` : 'a student or innovator'}{b.program ? ` · ${b.program}` : ''}</div>}
          />
        ))}
      </div>
      {claim && <ClaimModal sharedId={claim.shared_id} title={claim.idea.title} onClose={() => setClaim(null)} />}
    </div>
  );
}
