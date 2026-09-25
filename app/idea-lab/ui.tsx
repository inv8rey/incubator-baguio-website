import type { CSSProperties } from 'react';

export const ORANGE = '#F26522';
export const DARK = '#1C1917';
export const CREAM = '#F6F2EA';
export const BORDER = '#E0D9CD';
export const MUTED = '#6E685F';

export const card: CSSProperties = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 20, padding: 22 };
export const primaryBtn: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: ORANGE, color: '#fff', border: 'none', borderRadius: 9999, padding: '13px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit' };
export const ghostBtn: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', color: DARK, border: `1.5px solid ${BORDER}`, borderRadius: 9999, padding: '9px 16px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit' };
export const input: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${BORDER}`, fontSize: 15, color: DARK, background: '#fff', outline: 'none', fontFamily: 'inherit' };
export const label: CSSProperties = { fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8, display: 'block' };
export const wrap: CSSProperties = { maxWidth: 860, margin: '0 auto', padding: '32px 16px 72px' };

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'orange' | 'green' | 'gold' }) {
  const t = {
    neutral: { bg: '#F1EDE4', fg: '#4A443C' },
    orange: { bg: 'rgba(242,101,34,0.12)', fg: '#B84A12' },
    green: { bg: 'rgba(26,107,60,0.10)', fg: '#1A6B3C' },
    gold: { bg: 'rgba(184,134,11,0.13)', fg: '#7A5A08' },
  }[tone];
  return <span style={{ display: 'inline-block', background: t.bg, color: t.fg, borderRadius: 9999, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>{children}</span>;
}
