import type { Metadata } from 'next';
import { GuideExplorer } from '@/components/GuideExplorer';
import { SiteHeader } from '@/components/SiteHeader';
import { articles } from '@/lib/articles';

export const metadata: Metadata = { title: 'Cooling guides', description: 'Search practical, evidence-backed guides for cooling rooms, homes and people safely.', alternates: { canonical: '/guides' } };

export default function GuidesPage() {
  const guides = articles.map(({ title, slug, description, articleType, concepts }) => ({ title, slug, description, articleType, concepts }));
  return <main className="min-h-screen bg-[#f4fbf9] text-[#173c3a]">
    <SiteHeader />
    <section className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
      <p className="text-sm font-bold uppercase tracking-[.15em] text-[#267969]">Practical knowledge</p>
      <h1 className="mt-3 max-w-3xl text-5xl font-extrabold tracking-[-.055em] sm:text-7xl">Find the answer.<br />Then the reason.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[#52716e]">Search concise, connected guides for cooling rooms and people safely. Start with what to do, then explore why it works.</p>
    </section>
    <GuideExplorer guides={guides} />
  </main>;
}
