#!/usr/bin/env node
/**
 * 深度审查（站长视角）：在 dist/ 上逐页测量 Bing 关心的信号，输出 reports/deep-audit.json 与摘要。
 * 用法：npm run build && node scripts/deep-audit.mjs
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'dist', SITE = 'https://vpntizi.blog';
const walk = (d, o = []) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, o) : o.push(p); } return o; };
const files = walk(ROOT).filter((f) => f.endsWith('.html'));
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
const mainText = (h) => { const m = h.match(/<main[\s\S]*?<\/main>/); return strip(m ? m[0] : h); };
const han = (t) => (t.match(/[一-鿿]/g) || []).length;
const urlOf = (f) => '/' + relative(ROOT, f).replace(/index\.html$/, '').replace(/\\/g, '/');

const pages = [];
for (const f of files) {
  const h = readFileSync(f, 'utf8');
  const url = urlOf(f);
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const canonical = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  const robots = (h.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
  const h1s = [...h.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1]));
  const headings = [...h.matchAll(/<h([1-6])\b/g)].map((m) => +m[1]);
  let skips = 0; for (let i = 1; i < headings.length; i++) if (headings[i] - headings[i - 1] > 1) skips++;
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch { return { __invalid: true }; } });
  const ldTypes = ld.flatMap((x) => [].concat(x['@type'] || (x['@graph'] || []).map((g) => g['@type']) || []));
  const links = [...h.matchAll(/<a\b([^>]*)>/g)].map((m) => m[1]);
  const hrefs = links.map((a) => (a.match(/href="([^"]*)"/) || [])[1] || '');
  const internal = hrefs.filter((x) => x.startsWith('/') && !x.startsWith('//'));
  const aff = links.filter((a) => /data-aff=/.test(a)).length;
  const external = hrefs.filter((x) => /^https?:/.test(x)).length;
  const imgs = [...h.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const noAlt = imgs.filter((i) => !/\salt="[^"]+"/.test(i)).length;
  const text = mainText(h);
  pages.push({
    url, file: f, bytes: Buffer.byteLength(h), title, titleLen: [...title].length, desc, descLen: [...desc].length,
    canonical, canonicalOk: canonical === SITE + url, robots, noindex: /noindex/.test(robots),
    h1: h1s, h1Count: h1s.length, headingSkips: skips, ldTypes, ldInvalid: ld.filter((x) => x.__invalid).length,
    internalLinks: internal.length, uniqueInternal: new Set(internal.map((x) => x.split('#')[0])).size, aff, external,
    imgs: imgs.length, noAlt, mainHan: han(text), textRatio: +(Buffer.byteLength(text) / Buffer.byteLength(h)).toFixed(3),
    ogImage: /property="og:image"/.test(h), lang: /<html lang="zh-CN"/.test(h), text,
    linksTo: [...new Set(internal.map((x) => x.split('#')[0]))],
  });
}
const indexable = pages.filter((p) => !p.noindex && !p.url.startsWith('/404'));

// 重复标题 / 描述 / H1
const dup = (key) => { const m = new Map(); for (const p of indexable) { const k = typeof key === 'function' ? key(p) : p[key]; m.set(k, (m.get(k) || []).concat(p.url)); } return [...m].filter(([, v]) => v.length > 1); };

// 孤立页面与点击深度
const inbound = new Map(indexable.map((p) => [p.url, 0]));
for (const p of pages) for (const l of p.linksTo) if (inbound.has(l) && l !== p.url) inbound.set(l, inbound.get(l) + 1);
const depth = new Map([['/', 0]]); const q = ['/'];
while (q.length) { const u = q.shift(); const p = pages.find((x) => x.url === u); if (!p) continue; for (const l of p.linksTo) if (!depth.has(l) && pages.some((x) => x.url === l)) { depth.set(l, depth.get(u) + 1); q.push(l); } }

// 站点地图
const sm = readFileSync(join(ROOT, 'sitemap-0.xml'), 'utf8');
const smUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, ''));
const smLastmod = [...sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1].slice(0, 10));

// 相似度：8 字 shingle Jaccard
const sh = (t) => { const s = new Set(); const c = t.replace(/\s+/g, ''); for (let i = 0; i + 8 <= c.length; i += 2) s.add(c.slice(i, i + 8)); return s; };
const jac = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); };
const group = (re) => indexable.filter((p) => re.test(p.url));
const simStats = (list) => {
  const S = list.map((p) => sh(p.text)); const vals = []; let worst = [0, '', ''];
  for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) { const v = jac(S[i], S[j]); vals.push(v); if (v > worst[0]) worst = [v, list[i].url, list[j].url]; }
  vals.sort((a, b) => a - b);
  return { n: list.length, avg: +(vals.reduce((a, b) => a + b, 0) / (vals.length || 1)).toFixed(3), p90: +(vals[Math.floor(vals.length * 0.9)] || 0).toFixed(3), max: +worst[0].toFixed(3), maxPair: worst.slice(1) };
};
const brand = group(/^\/jichang\/[^/]+\/$/);
const articles = indexable.filter((p) => !/^\/(jichang\/|tools\/|search\/)/.test(p.url) && !['/', '/guanyu/', '/mianze-shengming/', '/tuiguang-pilu/', '/wangzhan-ditu/', '/wenzhang/', '/zhishi/', '/jiaocheng/'].includes(p.url));

// 资源体积
const assetBytes = walk(join(ROOT, '_astro')).reduce((m, f) => { const ext = f.split('.').pop(); m[ext] = (m[ext] || 0) + statSync(f).size; return m; }, {});

const report = {
  pages: pages.length, indexable: indexable.length, sitemapUrls: smUrls.length,
  notInSitemap: indexable.map((p) => p.url).filter((u) => !smUrls.includes(u)),
  sitemapNonIndexable: smUrls.filter((u) => !indexable.some((p) => p.url === u)),
  sitemapLastmodDistinct: [...new Set(smLastmod)],
  canonicalBad: indexable.filter((p) => !p.canonicalOk).map((p) => [p.url, p.canonical]),
  titleLen: { over60: indexable.filter((p) => p.titleLen > 60).map((p) => [p.url, p.titleLen]), under15: indexable.filter((p) => p.titleLen < 15).map((p) => [p.url, p.titleLen]) },
  descLen: { over160: indexable.filter((p) => p.descLen > 160).map((p) => [p.url, p.descLen]), under60: indexable.filter((p) => p.descLen < 60).map((p) => [p.url, p.descLen]) },
  dupTitles: dup('title'), dupDescs: dup('desc'), dupH1: dup((p) => p.h1.join('|')),
  h1Problems: indexable.filter((p) => p.h1Count !== 1).map((p) => [p.url, p.h1Count]),
  headingSkips: indexable.filter((p) => p.headingSkips > 0).map((p) => [p.url, p.headingSkips]),
  ldInvalid: indexable.filter((p) => p.ldInvalid).map((p) => p.url),
  ldTypeCounts: indexable.flatMap((p) => p.ldTypes).reduce((m, t) => ((m[t] = (m[t] || 0) + 1), m), {}),
  noOgImage: indexable.filter((p) => !p.ogImage).length,
  imgsNoAlt: indexable.filter((p) => p.noAlt).map((p) => [p.url, p.noAlt]),
  orphans: [...inbound].filter(([u, n]) => n === 0 && u !== '/').map(([u]) => u),
  lowInbound: [...inbound].filter(([u, n]) => n > 0 && n <= 2).map(([u, n]) => [u, n]),
  deepPages: [...depth].filter(([, d]) => d > 3).map(([u, d]) => [u, d]),
  unreachable: indexable.map((p) => p.url).filter((u) => !depth.has(u)),
  thin: indexable.filter((p) => p.mainHan < 600).map((p) => [p.url, p.mainHan]).sort((a, b) => a[1] - b[1]),
  hanStats: { min: Math.min(...indexable.map((p) => p.mainHan)), median: indexable.map((p) => p.mainHan).sort((a, b) => a - b)[Math.floor(indexable.length / 2)], max: Math.max(...indexable.map((p) => p.mainHan)) },
  affHeavy: indexable.filter((p) => p.aff >= 10).map((p) => [p.url, p.aff]).sort((a, b) => b[1] - a[1]),
  internalLinkHeavy: indexable.filter((p) => p.uniqueInternal > 120).map((p) => [p.url, p.uniqueInternal]),
  bigPages: indexable.filter((p) => p.bytes > 100000).map((p) => [p.url, Math.round(p.bytes / 1024) + 'KB']),
  lowTextRatio: indexable.filter((p) => p.textRatio < 0.12).map((p) => [p.url, p.textRatio]),
  similarity: { brandPages: simStats(brand), articles: simStats(articles) },
  assetBytes,
};
mkdirSync('reports', { recursive: true });
writeFileSync('reports/deep-audit.json', JSON.stringify(report, null, 2));
const show = (k, v) => console.log(`${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
for (const [k, v] of Object.entries(report)) show(k, Array.isArray(v) && v.length > 12 ? `${v.length} 项，例如 ${JSON.stringify(v.slice(0, 8))}` : v);
