import type { Metadata } from 'next';
import RequireLogin from '../RequireLogin';
import Shell from '../shell';
import MyIdeas from '../MyIdeas';

export const metadata: Metadata = { title: 'My ideas: R&I Idea Lab', robots: { index: false, follow: false } };

export default function MinePage() {
  return (
    <Shell>
      <RequireLogin><MyIdeas /></RequireLogin>
    </Shell>
  );
}
