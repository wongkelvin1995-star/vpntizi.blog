#!/usr/bin/env node
/**
 * Bing SEO 上线检查（对 dist/ 静态产物运行）。
 * 检查项：title/description/H1/canonical 唯一与完整、意外 noindex、站内死链、重定向目标、
 * JSON-LD 语法、推广链接属性、sitemap 覆盖、robots、IndexNow 密钥、关键词唯一主页面、
 * 文章字数上限、FAQ 全展开、右侧搜索与 Telegram 入口、前五顺序与 34 家完整、套餐表显示。
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const SITE = 'https://vpntizi.blog';
const TELEGRAM = 'https://t.me/+cKCtour4mqM1NTA9';
const NOINDEX_ALLOWED = ['/search/', '/404/'];
const FIXED_TOP = ['灵动云', '暮光加速', '微风网络 Breezenet', '飞猫云', '大佬云'];

const errors = [], warns = [], passes = [];
const fail = (m) => errors.push(m), warn = (m) => warns.push(m), ok = (m) => passes.push(m);

if (!existsSync(DIST)) { console.error('请先运行 npm run build'); process.exit(1); }

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const routeOf = (f) => '/' + relative(DIST, f).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/^404\.html$/, '404/');
const pages = htmlFiles.map((f) => ({ file: f, route: routeOf(f), html: readFileSync(f, 'utf8') }));
const exists = new Set(files.map((f) => '/' + relative(DIST, f).replace(/\\/g, '/')));
const redirects = existsSync('public/_redirects')
  ? Object.fromEntries(readFileSync('public/_redirects', 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.trim().split(/\s+/)))
  : {};

const attr = (tag, name) => (tag.match(new RegExp(`${name}="([^"]*)"`)) || [])[1];
const textOf = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();

// ---------- 逐页检查 ----------
const titles = new Map(), descs = new Map();
const indexable = [];
for (const p of pages) {
  const { route, html } = p;
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
  const isNoindex = /noindex/.test(robots);
  if (isNoindex && !NOINDEX_ALLOWED.includes(route)) fail(`${route} 存在意外的 noindex`);
  if (!isNoindex) indexable.push(route);
  if (!/<meta name="viewport"/.test(html)) fail(`${route} 缺少 viewport`);
  if (!/<html lang="zh-CN"/.test(html)) fail(`${route} 缺少 lang="zh-CN"`);

  const title = textOf((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  if (!title) fail(`${route} 缺少 title`);
  else {
    if (titles.has(title)) fail(`title 重复：“${title}” ${titles.get(title)} 与 ${route}`); else titles.set(title, route);
    if (title.length > 60) warn(`${route} title 偏长（${title.length} 字符），Bing 可能截断`);
  }
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (!desc) fail(`${route} 缺少 meta description`);
  else {
    if (descs.has(desc)) fail(`description 重复：${descs.get(desc)} 与 ${route}`); else descs.set(desc, route);
    if (desc.length < 50 || desc.length > 160) warn(`${route} description 长度 ${desc.length}，建议 50–160`);
  }
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1) fail(`${route} H1 数量为 ${h1s.length}（应为 1）`);

  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  if (!canonical) fail(`${route} 缺少 canonical`);
  else if (!isNoindex && canonical !== SITE + route) fail(`${route} canonical 不一致：${canonical}`);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { fail(`${route} JSON-LD 解析失败`); }
  }
  // FAQ 必须全部展开：FAQ 区块内不允许折叠；其他位置的 <details> 只允许“深入阅读”展开组件
  for (const m of html.matchAll(/<section[^>]*id="faq"[\s\S]*?<\/section>/g)) if (/<details[\s>]/.test(m[0])) fail(`${route} FAQ 使用了 <details> 折叠（FAQ 必须全部展开）`);
  for (const m of html.matchAll(/<details\b([^>]*)>/g)) if (!/class="deeper-item"/.test(m[1])) fail(`${route} 使用了 <details> 折叠（只有“深入阅读”允许展开）`);
  if (!html.includes(`href="${TELEGRAM}"`)) fail(`${route} 缺少 Telegram 入口`);
  if (!/data-open-search/.test(html)) fail(`${route} 缺少站内搜索入口`);

  // 链接
  for (const m of html.matchAll(/<a\b[^>]*>/g)) {
    const tag = m[0];
    const href = attr(tag, 'href');
    if (!href) continue;
    if (tag.includes('data-aff=')) {
      if (attr(tag, 'target') !== '_blank') fail(`${route} 推广链接缺少 target="_blank"：${href}`);
      if (attr(tag, 'rel') !== 'sponsored nofollow noopener') fail(`${route} 推广链接 rel 不正确：${href}`);
    }
    if (href.startsWith('/') && !href.startsWith('//')) {
      const path = href.split('#')[0].split('?')[0];
      const candidates = [path, path + 'index.html', path.replace(/\/$/, '') + '/index.html'];
      if (redirects[path]) warn(`${route} 链接到重定向地址 ${path} → ${redirects[path]}，建议直接链接目标`);
      else if (!candidates.some((c) => exists.has(c))) fail(`${route} 站内死链：${href}`);
      else if (!path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path)) warn(`${route} 链接缺少结尾斜杠：${href}`);
    }
  }
}
ok(`检查 HTML 页面 ${pages.length} 个，可索引 ${indexable.length} 个`);

// ---------- robots / sitemap / IndexNow ----------
const robots = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf8') : '';
if (!robots) fail('缺少 robots.txt');
else {
  if (!/Sitemap:\s*https:\/\/vpntizi\.blog\/sitemap-index\.xml/.test(robots)) fail('robots.txt 未声明 sitemap');
  if (/^Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt 禁止了整站抓取');
  ok('robots.txt 正常');
}
const smIndex = existsSync(join(DIST, 'sitemap-index.xml')) ? readFileSync(join(DIST, 'sitemap-index.xml'), 'utf8') : '';
if (!smIndex) fail('缺少 sitemap-index.xml');
const smUrls = new Set();
for (const f of files.filter((f) => /sitemap-\d+\.xml$/.test(f))) for (const m of readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) smUrls.add(m[1]);
for (const r of indexable) if (!r.startsWith('/404') && !smUrls.has(SITE + r)) fail(`sitemap 缺少可索引页面 ${r}`);
for (const u of smUrls) {
  const r = u.replace(SITE, '');
  if (NOINDEX_ALLOWED.includes(r)) fail(`sitemap 包含 noindex 页面 ${r}`);
  if (!pages.some((p) => p.route === r)) fail(`sitemap 包含不存在的页面 ${r}`);
}
ok(`sitemap 收录 ${smUrls.size} 个 URL`);
const key = existsSync('.indexnow-key') ? readFileSync('.indexnow-key', 'utf8').trim() : '';
if (!key || !existsSync(join(DIST, `${key}.txt`)) || readFileSync(join(DIST, `${key}.txt`), 'utf8').trim() !== key) fail('IndexNow 密钥文件缺失或内容不一致');
else ok('IndexNow 密钥文件正常');
if (!existsSync(join(DIST, 'indexnow-manifest.json'))) fail('缺少 indexnow-manifest.json（postbuild 未运行）');

// ---------- 机场榜单与推荐顺序 ----------
const home = pages.find((p) => p.route === '/');
const rankPage = pages.find((p) => p.route === '/jichang-paihangbang/');
const order = (html) => [...html.matchAll(/<article class="ap-card[^"]*" id="ap-[^"]+">[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => textOf(m[1]));
const homeOrder = order(home.html).slice(0, 5);
if (JSON.stringify(homeOrder) !== JSON.stringify(FIXED_TOP)) fail(`首页前五顺序错误：${homeOrder.join(' > ')}`); else ok(`首页前五：${homeOrder.join(' > ')}`);
const rows = [...rankPage.html.matchAll(/<tr id="rank-(\d+)">/g)].map((m) => +m[1]);
if (rows.length !== 34 || rows.some((r, i) => r !== i + 1)) fail(`完整榜单行数/顺序错误：${rows.length} 行`); else ok('完整榜单 34 行，顺序 1–34');
const rankNames = [...rankPage.html.matchAll(/<tr id="rank-\d+">\s*<td[^>]*>\d+<\/td>\s*<td>([\s\S]*?)<\/td>/g)].map((m) => textOf(m[1]).replace('重点推荐', '').trim());
FIXED_TOP.forEach((n, i) => { if (rankNames[i] !== n) fail(`完整榜单第 ${i + 1} 位应为 ${n}，实际 ${rankNames[i]}`); });
if (new Set(rankNames).size !== rankNames.length) fail('完整榜单存在重复品牌');

// 推荐类文章：前四家重点介绍 + 注册按钮
for (const p of pages.filter((p) => /id="top4"/.test(p.html))) {
  const names = order(p.html.slice(p.html.indexOf('id="top4"'))).slice(0, 4);
  if (JSON.stringify(names) !== JSON.stringify(FIXED_TOP.slice(0, 4))) fail(`${p.route} 前四家顺序错误：${names.join(' > ')}`);
}
ok(`含前四家重点介绍的页面：${pages.filter((p) => /id="top4"/.test(p.html)).length} 个`);

// AFF 链接一致性：同一品牌在全站只能出现一个链接，不同品牌不能共用
const affMap = new Map();
for (const p of pages) for (const m of p.html.matchAll(/<a\b[^>]*data-aff="([^"]+)"[^>]*>/g)) {
  const id = m[1], href = attr(m[0], 'href');
  if (!affMap.has(id)) affMap.set(id, new Set());
  affMap.get(id).add(href);
}
const hrefOwner = new Map();
for (const [id, set] of affMap) {
  if (set.size > 1) fail(`品牌 ${id} 在不同页面使用了不同 AFF 链接`);
  for (const h of set) { if (hrefOwner.has(h) && hrefOwner.get(h) !== id) fail(`AFF 链接被 ${hrefOwner.get(h)} 与 ${id} 混用`); hrefOwner.set(h, id); }
}
const airportsJson = JSON.parse(readFileSync('src/data/airports.json', 'utf8')).airports;
const configured = airportsJson.filter((a) => a.affUrl).length;
if (configured < 34) warn(`AFF 链接已配置 ${configured}/34，其余显示“注册链接待配置”`);
else ok('34 条 AFF 链接均已配置');
for (const a of airportsJson.filter((a) => a.affUrl)) {
  const seen = affMap.get(a.id);
  if (!seen) warn(`${a.name} 的 AFF 链接未在任何页面出现`);
  else if (![...seen].every((h) => h === a.affUrl.replace(/&/g, '&amp;') || h === a.affUrl)) fail(`${a.name} 页面中的 AFF 链接与数据不一致`);
}

// 套餐表：已核实套餐必须显示价格，未核实显示待核实
for (const a of airportsJson.filter((a) => a.status !== 'placeholder')) {
  const pg = pages.find((p) => p.route === `/jichang/${a.id}/`);
  if (!pg) { fail(`缺少机场资料页 /jichang/${a.id}/`); continue; }
  for (const plan of a.plans) if (!pg.html.includes(`¥${plan.priceCNY.toFixed(2)}`)) fail(`${a.name} 资料页未显示套餐 ${plan.name} 的价格`);
  if (!a.plans.length && !pg.html.includes('待核实')) fail(`${a.name} 未核实却未显示“待核实”`);
}
ok('机场资料页与套餐表检查完成');

// ---------- 关键词唯一主页面 ----------
const kwSrc = readFileSync('src/data/keywords.ts', 'utf8');
const kws = [...kwSrc.matchAll(/keyword: '([^']+)', core: '([^']+)', url: '([^']+)'/g)].map((m) => ({ keyword: m[1], core: m[2], url: m[3] }));
const seenKw = new Map();
for (const k of kws) {
  if (seenKw.has(k.keyword)) fail(`关键词重复映射：${k.keyword}`); seenKw.set(k.keyword, k.url);
  const pg = pages.find((p) => p.route === k.url);
  if (!pg) { fail(`关键词“${k.keyword}”的目标页 ${k.url} 不存在`); continue; }
  const t = textOf((pg.html.match(/<title>([^<]*)<\/title>/) || [])[1] || '') + textOf((pg.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '');
  if (!t.replace(/\s/g, '').toLowerCase().includes(k.core.replace(/\s/g, '').toLowerCase())) fail(`关键词“${k.keyword}”目标页 ${k.url} 的 title/H1 未包含“${k.core}”`);
}
// 文章 frontmatter 的 keywords 必须与映射表一致，且同一关键词不能出现在两篇文章
const artDir = 'src/content/articles';
const fmKw = new Map();
let maxLen = 0;
for (const f of readdirSync(artDir)) {
  const src = readFileSync(join(artDir, f), 'utf8');
  const slug = f.replace(/\.mdx?$/, '');
  const fm = src.split('---')[1];
  const list = JSON.parse((fm.match(/^keywords:\s*(\[.*\])/m) || [, '[]'])[1]);
  for (const k of list) {
    if (fmKw.has(k)) fail(`关键词“${k}”同时被 ${fmKw.get(k)} 和 ${slug} 声明，存在内部竞争`);
    fmKw.set(k, slug);
    const target = seenKw.get(k);
    if (!target) fail(`${slug} 声明的关键词“${k}”未登记在 keywords.ts`);
    else if (target !== `/${slug}/`) fail(`${slug} 声明的关键词“${k}”应归属 ${target}`);
  }
  const body = src.split('---').slice(2).join('---');
  const han = (body.match(/[一-鿿]/g) || []).length;
  maxLen = Math.max(maxLen, han);
  if (han > 2500) fail(`${slug} 正文汉字 ${han}，超过 2500`);
  if (han < 400) warn(`${slug} 正文汉字仅 ${han}，内容可能偏薄`);
}
ok(`关键词映射 ${kws.length} 条，文章 ${readdirSync(artDir).length} 篇，最长正文 ${maxLen} 汉字`);

// ---------- 搜索索引 ----------
const idx = existsSync(join(DIST, 'search-index.json')) ? JSON.parse(readFileSync(join(DIST, 'search-index.json'), 'utf8')) : [];
if (idx.length < 30) fail(`搜索索引条目过少：${idx.length}`); else ok(`搜索索引 ${idx.length} 条`);

// ---------- 输出 ----------
passes.forEach((m) => console.log('  ✓ ' + m));
warns.forEach((m) => console.warn('  ⚠ ' + m));
errors.forEach((m) => console.error('  ✗ ' + m));
console.log(`\nSEO 检查：${errors.length} 个错误，${warns.length} 条提醒`);
process.exit(errors.length ? 1 : 0);
