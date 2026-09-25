import { BORDER, Badge, DARK, MUTED, ORANGE } from './ui';

const fieldLabel = { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED, marginBottom: 6 } as const;

// A fixed example of what one generated idea looks like. Used on the homepage,
// the Programs page, and the login gate, so visitors can see the output before
// they sign up. It is static: nothing here comes from the tool.
export default function SampleCard() {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '22px 22px 20px', boxShadow: '0 24px 48px -28px rgba(28,25,23,0.35)', display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Badge tone="orange">Capstone</Badge>
        <Badge tone="gold">Sample idea</Badge>
      </div>
      <div>
        <div style={fieldLabel}>Suggested title</div>
        <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.015em', color: DARK, lineHeight: 1.25 }}>
          UlanAlert: A Hyperlocal Rainfall Alert System for Residents in Landslide-Prone Barangays of Baguio City
        </h3>
      </div>
      <div>
        <div style={fieldLabel}>Description</div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: '#3A352E' }}>
          UlanAlert is a mobile app that sends rainfall and slope-risk alerts based on a resident&rsquo;s own barangay, not the whole city. It gives barangay disaster officers a simple view of which streets need attention first. City-wide heavy rain warnings leave households on the steepest slopes unsure when to act.
        </p>
      </div>
      <div style={{ background: '#FBF7F0', border: `1px solid ${BORDER}`, borderLeft: `4px solid ${ORANGE}`, borderRadius: 14, padding: '13px 15px' }}>
        <div style={{ ...fieldLabel, color: '#B84A12' }}>City R&amp;I Agenda alignment</div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: DARK }}>
          Resilience and Disaster Risk Reduction <span style={{ fontWeight: 500, color: MUTED }}>· climate risk</span>
        </div>
        <p style={{ margin: '5px 0 0', fontSize: 13.5, lineHeight: 1.55, color: '#3A352E' }}>It gives residents on high-risk slopes warnings that fit their area, which strengthens preparedness for climate risk.</p>
      </div>
    </div>
  );
}
