import type { Metadata } from 'next';
import RequireLogin from '../../RequireLogin';
import Shell from '../../shell';
import NoteEditor from '../../NoteEditor';

export const metadata: Metadata = { title: 'Concept note: R&I Idea Lab', robots: { index: false, follow: false } };

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell>
      <RequireLogin><NoteEditor ideaId={id} /></RequireLogin>
    </Shell>
  );
}
