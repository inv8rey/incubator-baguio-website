'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, authHeaders, isSaved, toggleSaved, track, type PublicIdea, type SessionInfo } from '../../lib/idea-lab/client';
import IdeaCard from './IdeaCard';
import GeneratingAnimation from './GeneratingAnimation';
import { ShareModal } from './ShareModals';
import { DARK, MUTED, card, ghostBtn, primaryBtn, wrap } from './ui';
import { TYPE_LABEL } from '../../lib/idea-lab/client';

const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';
const COUNT = 5;

interface SessionPayload {
  session: SessionInfo;
  ideas: PublicIdea[];
  notes: Record<string, boolean>;
}

export default function ResultsView({ id, onRestart }: { id: string; onRestart?: () => void }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [ideas, setIdeas] = useState<PublicIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [share, setShare] = useState<string | null>(null);
  const started = useRef(false);

  const generate = useCallback(async () => {
    setGenerating(true);
    setPending(COUNT);
    setError('');
    track('generate');
    let res: Response;
    try {
      res = await fetch('/api/idea-lab/generate', { method: 'POST', headers: await authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ sessionId: id }) });
    } catch {
      setGenerating(false);
      setPending(0);
      setError('You seem to be offline. Please try again.');
      return;
    }
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => ({}));
      setGenerating(false);
      setPending(0);
      setError(data.error || 'We could not generate ideas right now. Please try again.');
      if (data.code === 'limit' || data.code === 'budget') setBlocked(true);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        try {
          const ev = JSON.parse(line) as { type: string; idea?: PublicIdea; message?: string };
          if (ev.type === 'idea' && ev.idea) {
            setIdeas((prev) => (prev.some((p) => p.id === ev.idea!.id) ? prev : [...prev, ev.idea!]));
            setPending((p) => Math.max(0, p - 1));
          } else if (ev.type === 'error') {
            setError(ev.message || 'Something went wrong.');
          }
        } catch {
          // Ignore a partial line.
        }
      }
    }
    setGenerating(false);
    setPending(0);
  }, [id]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const r = await api<SessionPayload>(`/api/idea-lab/session/${id}`);
      if (!r.ok) {
        setError(r.error);
        setLoading(false);
        return;
      }
      setSession(r.data.session);
      setIdeas(r.data.ideas);
      setSaved(Object.fromEntries(r.data.ideas.map((i) => [i.id, isSaved(i.id)])));
      setLoading(false);
      if (r.data.ideas.length === 0) generate();
    })();
  }, [id, generate]);

  async function refine(idea: PublicIdea, instruction: { preset?: string; text?: string }): Promise<string | null> {
    const r = await api<{ idea: PublicIdea }>('/api/idea-lab/refine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ideaId: idea.id, ...instruction }) });
    if (!r.ok) return r.error;
    track('refine');
    setIdeas((prev) => {
      const at = prev.findIndex((p) => p.id === idea.id);
      const next = [...prev];
      next.splice(at + 1, 0, r.data.idea);
      return next;
    });
    return null;
  }

  function save(idea: PublicIdea) {
    if (!session) return;
    const on = toggleSaved(idea, session);
    setSaved((p) => ({ ...p, [idea.id]: on }));
    if (on) track('save');
  }

  const titleById = new Map(ideas.map((i) => [i.id, i.title]));

  if (loading) return <div style={wrap}><GeneratingAnimation done={0} total={COUNT} /></div>;
  if (!session) {
    return (
      <div style={wrap}>
        <div style={card}>
          <h1 style={{ margin: '0 0 8px', fontSize: 22, color: DARK }}>We could not open that page</h1>
          <p style={{ margin: '0 0 16px', color: MUTED }}>{error || 'That session was not found.'}</p>
          <a href={`${BP}/idea-lab/`} style={primaryBtn}>Start again</a>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(26px, 6vw, 34px)', fontWeight: 700, letterSpacing: '-0.03em', color: DARK }}>Your {TYPE_LABEL[session.project_type]?.toLowerCase() ?? ''} ideas</h1>
      <p style={{ margin: '0 0 20px', fontSize: 14.5, color: MUTED }}>Starting points to talk over with your adviser or team.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            projectType={session.project_type}
            priorityArea={session.priority_area}
            refinedFrom={idea.parent_idea_id ? titleById.get(idea.parent_idea_id) ?? 'an earlier idea' : undefined}
            saved={!!saved[idea.id]}
            onSave={() => save(idea)}
            onRefine={refine}
            onExpand={() => router.push(`/idea-lab/note/${idea.id}/`)}
            onShare={() => setShare(idea.id)}
          />
        ))}
        {generating && <GeneratingAnimation done={COUNT - pending} total={COUNT} />}
      </div>

      {error && <div role="alert" style={{ marginTop: 18, background: 'rgba(179,38,30,0.08)', border: '1px solid rgba(179,38,30,0.25)', color: '#8C1D18', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>
        {error}{blocked && <> <a href={`${BP}/idea-lab/bank/`} style={{ color: '#8C1D18' }}>Browse the Idea Bank</a>.</>}
      </div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
        <button style={{ ...primaryBtn, opacity: generating || blocked ? 0.6 : 1 }} disabled={generating || blocked} onClick={generate}>{generating ? 'Generating…' : 'Generate 5 more'}</button>
        {onRestart ? <button style={ghostBtn} onClick={onRestart}>Start over</button> : <a style={ghostBtn} href={`${BP}/idea-lab/`}>Start over</a>}
        <a style={ghostBtn} href={`${BP}/idea-lab/mine/`}>My ideas</a>
      </div>

      <p style={{ margin: '28px 0 0', fontSize: 14.5, color: '#3A352E' }}>
        Want mentoring on the idea you pick? <a href={`${BP}/calendar/`} style={{ color: '#B84A12', fontWeight: 600 }}>Tell us</a>.
      </p>

      {share && <ShareModal ideaId={share} onClose={() => setShare(null)} />}
    </div>
  );
}
