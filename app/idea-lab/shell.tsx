import { navBarHtml, footerHtml } from '../chrome';
import { CREAM, DARK, ORANGE } from './ui';
import { FOOTER_DISCLAIMER } from '../../lib/idea-lab/programs';

const BP = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Shared page frame: site nav and footer, a slim Idea Lab sub-nav, and the
// standing disclaimer.
export default function Shell({ children }: { children: React.ReactNode }) {
  const links: [string, string][] = [['Idea Lab', '/idea-lab/'], ['My ideas', '/idea-lab/mine/'], ['Idea Bank', '/idea-lab/bank/']];
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: navBarHtml() }} />
      <div style={{ background: CREAM, minHeight: '70vh' }}>
        <div style={{ borderBottom: '1px solid #E0D9CD', background: '#fff' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px', display: 'flex', gap: 4, overflowX: 'auto' }}>
            {links.map(([label, href]) => (
              <a key={href} href={`${BP}${href}`} style={{ padding: '14px 12px', fontSize: 14, fontWeight: 600, color: DARK, textDecoration: 'none', whiteSpace: 'nowrap' }}>{label}</a>
            ))}
            <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ORANGE, whiteSpace: 'nowrap' }}>R&amp;I Idea Lab</span>
          </div>
        </div>
        {children}
        <p style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 40px', fontSize: 12.5, lineHeight: 1.6, color: '#6E685F' }}>{FOOTER_DISCLAIMER}</p>
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
