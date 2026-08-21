import type { MetadataRoute } from 'next';
import { articles } from '@/lib/articles';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap { const base = 'https://howtocooldown.com'; return [{ url: base, lastModified: new Date('2026-08-21'), changeFrequency: 'weekly', priority: 1 }, { url: `${base}/guides`, lastModified: new Date('2026-08-21'), changeFrequency: 'weekly', priority: .8 }, ...articles.map(article => ({ url: `${base}/guides/${article.slug}`, lastModified: new Date(article.dateReviewed), changeFrequency: 'monthly' as const, priority: article.articleType === 'safety' ? .8 : .7 }))]; }
