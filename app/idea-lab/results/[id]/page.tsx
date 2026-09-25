import type { Metadata } from 'next';
import RequireLogin from '../../RequireLogin';
import Shell from '../../shell';
import ResultsView from '../../ResultsView';

export const metadata: Metadata = { title: 'Your ideas: R&I Idea Lab', robots: { index: false, follow: false } };

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell>
      <RequireLogin><ResultsView id={id} /></RequireLogin>
    </Shell>
  );
}
