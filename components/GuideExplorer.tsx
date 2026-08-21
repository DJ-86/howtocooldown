'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ArticleType } from '@/lib/articles';

type Guide = { title: string; slug: string; description: string; articleType: ArticleType; concepts: string[] };
const groups: { title: string; subtitle: string; types: ArticleType[] }[] = [
  { title: 'Cool a room', subtitle: 'Practical changes you can make now.', types: ['action'] },
  { title: 'Compare equipment', subtitle: 'Choose what fits your conditions and constraints.', types: ['decision'] },
  { title: 'Homes & bedrooms', subtitle: 'Advice shaped around the space you are in.', types: ['situation'] },
  { title: 'Understand the science', subtitle: 'Clear explanations, after the answer.', types: ['science'] },
  { title: 'Heat safety', subtitle: 'Recognise risk and know what to do.', types: ['safety'] },
];

export function GuideExplorer({ guides }: { guides: Guide[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ArticleType | 'all'>('all');
  const results = useMemo(() => {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return guides.filter(guide => {
      if (filter !== 'all' && guide.articleType !== filter) return false;
      const text = `${guide.title} ${guide.description} ${guide.concepts.join(' ')}`.toLowerCase();
      return words.every(word => text.includes(word));
    });
  }, [guides, query, filter]);

  return <>
    <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8">
      <div className="rounded-3xl border border-[#cfe2de] bg-white p-5 shadow-[0_16px_45px_rgba(28,92,83,.08)] sm:p-7">
        <label className="text-sm font-bold" htmlFor="guide-search">What do you need help with?</label>
        <div className="mt-3 flex items-center rounded-2xl border-2 border-[#b9d9d2] bg-[#f8fcfb] px-4 focus-within:border-[#267969]"><span className="mr-3 text-xl" aria-hidden>⌕</span><input id="guide-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try “bedroom”, “humidity” or “which fan”" className="min-w-0 flex-1 bg-transparent py-4 text-lg outline-none" /></div>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filter guides">{([['all','All guides'],['action','Cool a room'],['decision','Compare'],['situation','Your situation'],['science','Science'],['safety','Heat safety']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === value ? 'bg-[#173c3a] text-white' : 'bg-[#eef7f5] text-[#426864]'}`}>{label}</button>)}</div>
        <p className="mt-4 text-sm text-[#68918a]" aria-live="polite">{results.length} {results.length === 1 ? 'guide' : 'guides'} found</p>
      </div>
    </section>
    <div className="mx-auto max-w-6xl space-y-14 px-5 pb-24 sm:px-8">
      {groups.map(group => { const items = results.filter(a => group.types.includes(a.articleType)); if (!items.length) return null; return <section key={group.title}><div className="border-b border-[#cfe2de] pb-4"><h2 className="text-3xl font-extrabold tracking-[-.04em]">{group.title}</h2><p className="mt-1 text-[#52716e]">{group.subtitle}</p></div><div className="mt-5 grid gap-4 md:grid-cols-2">{items.map(article => <Link key={article.slug} href={`/guides/${article.slug}`} className="group rounded-2xl border border-[#d5e8e3] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#68918a]">{article.articleType === 'science' ? 'Why it works' : article.articleType === 'safety' ? 'Heat safety' : article.articleType === 'decision' ? 'Compare options' : 'What to do'}</p><h3 className="mt-3 text-xl font-bold group-hover:text-[#267969]">{article.title}</h3><p className="mt-2 leading-6 text-[#52716e]">{article.description}</p><span className="mt-5 inline-block font-bold text-[#267969]">Read guide →</span></Link>)}</div></section>; })}
      {!results.length && <section className="rounded-2xl border border-[#cfe2de] bg-white p-8 text-center"><h2 className="text-2xl font-extrabold">No exact match</h2><p className="mt-2 text-[#52716e]">Try a shorter phrase, or clear the category filter.</p><button type="button" onClick={() => { setQuery(''); setFilter('all'); }} className="mt-5 rounded-xl bg-[#267969] px-5 py-3 font-bold text-white">Show all guides</button></section>}
    </div>
  </>;
}
