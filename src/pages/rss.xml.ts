import type { APIRoute } from 'astro';
import { getArticles, articleUrl } from '../lib/content';
import { SITE } from '../data/site';
const x = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);
export const GET: APIRoute = async () => {
  const items = (await getArticles()).map((a) => `<item><title>${x(a.data.h1)}</title><link>${SITE.url}${articleUrl(a)}</link><guid>${SITE.url}${articleUrl(a)}</guid><pubDate>${a.data.updated.toUTCString()}</pubDate><description>${x(a.data.description)}</description></item>`).join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${x(SITE.name)}</title><link>${SITE.url}/</link><description>${x(SITE.description)}</description><language>zh-cn</language>${items}</channel></rss>`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
