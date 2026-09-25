import type { Metadata } from 'next';
import { pageMeta } from '../../seo';
import Shell from '../shell';
import IdeaBank from '../IdeaBank';

export const metadata: Metadata = pageMeta({
  title: 'Idea Bank: R&I Idea Lab',
  description: 'Browse project ideas shared by Baguio students and innovators, tied to the City Research and Innovation Agenda.',
  path: '/idea-lab/bank/',
});

export default function BankPage() {
  return (
    <Shell>
      <IdeaBank />
    </Shell>
  );
}
