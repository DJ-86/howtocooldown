import Link from 'next/link';

export function SiteHeader({ active = 'guides' }: { active?: 'tool' | 'guides' }) {
  return <header className="sticky top-0 z-30 border-b border-[#dcece8]/80 bg-[#f4fbf9]/92 backdrop-blur-xl">
    <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4" aria-label="Main navigation">
      <Link className="min-w-0 shrink text-base font-extrabold tracking-[-.04em] sm:text-lg" href="/">
        <span className="sm:hidden">Cool down</span><span className="hidden sm:inline">How to cool down</span><span className="text-[#ef6b4a]">.</span>
      </Link>
      <div className="flex shrink-0 items-center rounded-full bg-white p-1 text-sm font-bold shadow-sm" aria-label="Choose a section">
        <Link className={`rounded-full px-3 py-2 ${active === 'tool' ? 'bg-[#173c3a] text-white' : 'text-[#426864] hover:bg-[#eef7f5]'}`} href="/" aria-current={active === 'tool' ? 'page' : undefined}>Tool</Link>
        <Link className={`rounded-full px-3 py-2 ${active === 'guides' ? 'bg-[#173c3a] text-white' : 'text-[#426864] hover:bg-[#eef7f5]'}`} href="/guides" aria-current={active === 'guides' ? 'page' : undefined}>Guides</Link>
      </div>
      <Link className="hidden shrink-0 rounded-full border border-[#b9d9d2] px-3 py-2 text-sm font-bold lg:inline-flex" href="/guides/heat-exhaustion-vs-heatstroke">Heat safety</Link>
    </nav>
  </header>;
}
