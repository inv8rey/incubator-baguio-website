'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../AuthProvider';
import SampleCard from './SampleCard';
import { DARK, MUTED, ORANGE, ghostBtn, primaryBtn, wrap } from './ui';

const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';

// The Idea Lab is for signed-in members. Signed-out visitors see what it does
// and a way in, then come straight back here after logging in.
export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth();
  const pathname = usePathname() || '/idea-lab/';

  if (loading) return <div style={{ ...wrap, textAlign: 'center' }}><p style={{ color: MUTED }}>Loading…</p></div>;
  if (user) return <>{children}</>;

  const back = encodeURIComponent(`${BP}${pathname.startsWith(BP) ? pathname.slice(BP.length) : pathname}`);
  return (
    <div style={{ ...wrap, maxWidth: 980, paddingTop: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 36, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: ORANGE, marginBottom: 10 }}>R&amp;I Idea Lab</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.1, color: DARK }}>Log in to get project ideas for Baguio</h1>
          <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.6, color: MUTED }}>
            The Idea Lab is free for Incubator Baguio members. Create an account in a minute, then pick capstone, thesis, or startup and generate ideas tied to the City Research and Innovation Agenda.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <a href={`${BP}/signup/?redirect=${back}`} style={primaryBtn}>Sign up free</a>
            <a href={`${BP}/login/?redirect=${back}`} style={{ ...ghostBtn, padding: '13px 24px', fontSize: 15 }}>Log in</a>
          </div>
          {!configured && <p style={{ margin: '14px 0 0', fontSize: 13, color: MUTED }}>Accounts are not available right now. Please try again soon.</p>}
        </div>
        <SampleCard />
      </div>
    </div>
  );
}
