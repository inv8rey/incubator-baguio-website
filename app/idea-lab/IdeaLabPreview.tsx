import SampleCard from './SampleCard';
import { DARK, MUTED, ORANGE } from './ui';

const STEPS = ['Pick capstone, thesis, or startup', 'Tap Generate', 'Get ideas tied to the City Research and Innovation Agenda'];

// Teaser for the homepage and the Programs page. The tool itself needs a free
// account; this shows what it produces and sends people in.
export default function IdeaLabPreview({ bp, background = '#FCFAF6' }: { bp: string; background?: string }) {
  return (
    <section style={{ background, padding: '72px 24px' }} aria-labelledby="idea-lab-preview-title">
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 44, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: ORANGE, marginBottom: 8 }}>R&amp;I Idea Lab</div>
          <h2 id="idea-lab-preview-title" style={{ margin: 0, fontSize: 'clamp(28px, 4.4vw, 40px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, color: DARK }}>
            Stuck on a capstone, thesis, or startup idea?
          </h2>
          <p style={{ margin: '16px 0 0', fontSize: 16.5, lineHeight: 1.65, color: MUTED, maxWidth: 480 }}>
            Get project ideas built around real Baguio problems and the City Research and Innovation Agenda. Each one comes with a suggested title, a short description, and how it lines up with the Agenda.
          </p>
          <ol style={{ margin: '22px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map((s, i) => (
              <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: DARK, fontWeight: 500 }}>
                <span style={{ width: 26, height: 26, borderRadius: 9999, background: 'rgba(242,101,34,0.12)', color: '#B84A12', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 28 }}>
            <a href={`${bp}/idea-lab/`} className="ib-cta-orange" style={{ display: 'inline-flex', alignItems: 'center', background: ORANGE, color: '#fff', fontWeight: 600, fontSize: 15, padding: '14px 28px', borderRadius: 9999, textDecoration: 'none' }}>Try the Idea Lab</a>
            <span style={{ fontSize: 13.5, color: MUTED }}>Free with an Incubator Baguio account</span>
          </div>
        </div>
        <SampleCard />
      </div>
    </section>
  );
}
