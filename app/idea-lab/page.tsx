import type { Metadata } from 'next';
import { pageMeta } from '../seo';
import RequireLogin from './RequireLogin';
import Shell from './shell';
import IdeaLabApp from './IdeaLabApp';

export const metadata: Metadata = pageMeta({
  title: 'R&I Idea Lab: free project ideas for Baguio',
  description:
    'Get capstone, thesis, and startup ideas grounded in the Baguio City Research and Innovation Agenda. Free, no login needed.',
  path: '/idea-lab/',
});

export default function IdeaLabPage() {
  return (
    <Shell>
      <RequireLogin><IdeaLabApp /></RequireLogin>
    </Shell>
  );
}
