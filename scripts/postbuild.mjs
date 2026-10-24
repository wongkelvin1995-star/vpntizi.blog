#!/usr/bin/env node
/**
 * 构建后做两件事：
 * 1. 生成 IndexNow 变更清单（每个可索引 URL 的正文哈希），供 indexnow.mjs 对比新增/更新/删除；
 * 2. 生成根目录 sitemap.xml：一个文件直接列出全部页面（提交给 Bing 用这个地址）。
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://vpntizi.blog';

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

const manifest = {};
for (const file of walk(DIST)) {
  const html = readFileSync(file, 'utf8');
  if (/<meta name="robots" content="noindex/.test(html)) continue;
  const rel = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  if (rel.startsWith('/404')) continue;
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [html])[0];
  const head = [(html.match(/<title>[^<]*<\/title>/) || [''])[0], (html.match(/<meta name="description"[^>]*>/) || [''])[0]].join('');
  manifest[SITE + rel] = createHash('sha1').update(head + main).digest('hex').slice(0, 16);
}
writeFileSync(join(DIST, 'indexnow-manifest.json'), JSON.stringify({ generated: new Date().toISOString(), urls: manifest }, null, 0));

const key = existsSync('.indexnow-key') ? readFileSync('.indexnow-key', 'utf8').trim() : '';
if (!key || !existsSync(join(DIST, `${key}.txt`))) console.warn('⚠ IndexNow 密钥文件缺失：请确认 public/<key>.txt 与 .indexnow-key 一致');
console.log(`postbuild：IndexNow 清单 ${Object.keys(manifest).length} 个 URL`);

// ---------- 根目录 sitemap.xml：一个文件直接列出全部页面 ----------
// Astro 自带的是 sitemap-index.xml（索引）→ sitemap-0.xml（页面）。这里再生成一份无需二次跳转的 /sitemap.xml，
// 逐条取自同一批子文件，所以收录范围和 lastmod 始终与它们一致；旧地址继续保留，之前提交过的也不会失效。
const SITEMAP_MAX = 50000; // sitemap 协议：单个文件最多 50,000 个 URL
if (!existsSync(join(DIST, 'sitemap-index.xml'))) throw new Error('缺少 dist/sitemap-index.xml：@astrojs/sitemap 没有运行');
const smChildren = [...readFileSync(join(DIST, 'sitemap-index.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE + '/', ''));
const smXml = smChildren.map((f) => readFileSync(join(DIST, f), 'utf8'));
const smEntries = smXml.flatMap((x) => x.match(/<url>[\s\S]*?<\/url>/g) || []);
if (!smEntries.length) throw new Error('sitemap 子文件里没有任何 <url>');
if (smEntries.length > SITEMAP_MAX) throw new Error(`sitemap.xml 将有 ${smEntries.length} 个 URL，超过 ${SITEMAP_MAX}，需要拆分成索引`);
const prettyUrl = (u) => '  <url>\n    ' + u.slice(5, -6).replace(/></g, '>\n    <') + '\n  </url>';
// 根元素：条目里没有图片/新闻/视频/多语言扩展标签时只保留标准命名空间，文件更干净；有扩展标签则沿用 Astro 生成的完整声明
const smRoot = /<(news|xhtml|image|video):/.test(smEntries.join('')) ? smXml[0].match(/<urlset[^>]*>/)[0] : '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n${smRoot}\n${smEntries.map(prettyUrl).join('\n')}\n</urlset>\n`);
console.log(`postbuild：sitemap.xml 直接列出 ${smEntries.length} 个页面（来自 ${smChildren.length} 个子文件）`);
