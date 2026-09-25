import type { NoteContent } from '../../lib/idea-lab/schema';
import { NOTE_DISCLAIMER_LONG } from '../../lib/idea-lab/programs';

// Builds the .docx in the browser so no file ever touches the server.
export async function downloadNoteDocx(note: NoteContent) {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import('docx');
  const h = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } });
  const p = (text: string) => new Paragraph({ children: [new TextRun(text)], spacing: { after: 120 } });
  const list = (items: string[]) => items.map((t) => new Paragraph({ text: t, bullet: { level: 0 } }));
  const numbered = (items: string[]) => items.map((t, i) => new Paragraph({ children: [new TextRun(`${i + 1}. ${t}`)], spacing: { after: 80 } }));

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: note.working_title, heading: HeadingLevel.TITLE }),
        new Paragraph({ children: [new TextRun({ text: NOTE_DISCLAIMER_LONG, italics: true })], spacing: { after: 200 } }),
        h('Background'), p(note.background),
        h('Problem statement'), p(note.problem_statement),
        h('Objectives'), ...list(note.objectives),
        h('Proposed approach'), p(note.proposed_approach),
        h('Expected output'), p(note.expected_output),
        h('Possible partners'), ...(note.possible_partners.length ? list(note.possible_partners) : [p('To be identified.')]),
        h('Risks'), ...list(note.risks),
        h('Next three steps'), ...numbered(note.next_steps),
        new Paragraph({ children: [new TextRun({ text: 'Generated with the R&I Idea Lab by Incubator Baguio. Verify all data and partners before relying on them.', italics: true, size: 18 })], spacing: { before: 320 } }),
      ],
    }],
  });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.working_title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60) || 'concept-note'}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
