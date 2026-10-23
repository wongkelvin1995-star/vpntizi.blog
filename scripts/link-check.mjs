#!/usr/bin/env node
/**
 * 全站链接检查：
 *  1. dist/（正式站）：每个页面的每个站内链接都指向存在的文件，#锚点在目标页存在；
 *  2. preview/（预览副本）：相对链接按所在目录解析后同样存在；
 *  3. 站外链接：格式合法；AFF 链接与 airports.json 完全一致且带 sponsored nofollow；
 *  4. 不允许空 href、javascript:、指向 localhost 或 pages.dev 的链接。
 * 用法：npm run build && node scripts/make-preview.mjs && node scripts/link-check.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, normalize } from 'node:path';

const raw = JSON.parse(readFileSync('src/data/airports.json', 'utf8'));
const airports = Array.isArray(raw) ? raw : raw.airports;
const affSet = new Set(airports.map((a) => a.affUrl));
const walk = (d, o = []) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, o) : o.push(p); } return o; };
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

const idCache = new Map();
const idsOf = (file) => {
  if (!idCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
};

const errors = [];
let internal = 0, anchors = 0, external = 0, aff = 0;

function resolveTarget(root, fromFile, href, mode) {
  const [pathPart, hash = ''] = href.split('#');
  const clean = decodeURIComponent(pathPart.split('?')[0]);
  let target;
  if (clean === '') target = fromFile;
  else if (mode === 'dist') {
    if (!clean.startsWith('/')) return { err: `正式站应使用站内绝对路径：${href}` };
    target = join(root, clean.endsWith('/') ? clean + 'index.html' : clean);
    if (!existsSync(target) && !clean.endsWith('/') && !/\.[a-z0-9]+$/i.test(clean)) return { err: `缺少结尾斜杠：${href}` };
  } else {
    if (clean.startsWith('/')) return { err: `预览副本里仍是绝对路径：${href}` };
    target = normalize(join(dirname(fromFile), clean));
    if (relative(root, target).startsWith('..')) return { err: `相对路径越出站点根目录：${href}` };
  }
  if (!existsSync(target) || statSync(target).isDirectory()) return { err: `目标不存在：${href}` };
  return { target, hash };
}

function checkSite(root, mode) {
  const pages = walk(root).filter((f) => f.endsWith('.html'));
  for (const file of pages) {
    const full = readFileSync(file, 'utf8');
    const rel = relative(root, file);
    // 脚本里的模板字符串不是真实链接；脚本数据里的 "href" 单独检查
    const html = full.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    for (const m of full.matchAll(/"href":"([^"]+)"/g)) {
      internal++;
      const r = resolveTarget(root, file, m[1], mode);
      if (r.err) errors.push(`${mode} ${rel}：脚本数据链接 ${r.err}`);
    }
    for (const m of html.matchAll(/<a\b([^>]*)>/g)) {
      const attrs = m[1];
      const hm = attrs.match(/\shref="([^"]*)"/);
      if (!hm) continue;
      const href = decode(hm[1]);
      if (href.trim() === '' || /^javascript:/i.test(href)) { errors.push(`${mode} ${rel}：空链接或 javascript: 链接`); continue; }
      if (/localhost|127\.0\.0\.1|pages\.dev/.test(href)) { errors.push(`${mode} ${rel}：链接指向测试地址 ${href}`); continue; }
      if (/^(mailto:|tel:)/.test(href)) continue;
      if (/^https?:\/\//.test(href)) {
        external++;
        try { new URL(href); } catch { errors.push(`${mode} ${rel}：站外链接格式错误 ${href}`); continue; }
        if (href.startsWith('https://vpntizi.blog') && mode === 'dist') errors.push(`${mode} ${rel}：站内链接写成了完整域名 ${href}`);
        if (/data-aff=/.test(attrs)) {
          aff++;
          if (!affSet.has(href)) errors.push(`${mode} ${rel}：AFF 链接与资料不一致 ${href}`);
          if (!/rel="sponsored nofollow noopener"/.test(attrs) || !/target="_blank"/.test(attrs)) errors.push(`${mode} ${rel}：AFF 链接缺少 target/rel ${href}`);
        }
        continue;
      }
      internal++;
      const r = resolveTarget(root, file, href, mode);
      if (r.err) { errors.push(`${mode} ${rel}：${r.err}`); continue; }
      if (r.hash) {
        anchors++;
        if (!idsOf(r.target).has(decodeURIComponent(r.hash))) errors.push(`${mode} ${rel}：锚点 #${r.hash} 在 ${relative(root, r.target)} 中不存在`);
      }
    }
    // 资源引用（CSS/JS/图片）
    for (const m of full.matchAll(/<(?:link|script|img)\b[^>]*\s(?:href|src)="([^"]+)"/g)) {
      const src = decode(m[1]);
      if (/^(https?:|data:)/.test(src)) continue;
      const r = resolveTarget(root, file, src, mode);
      if (r.err) errors.push(`${mode} ${rel}：资源 ${r.err}`);
    }
  }
  return pages.length;
}

const nDist = checkSite('dist', 'dist');
const nPrev = existsSync('preview') ? checkSite('preview', 'preview') : 0;

// 预览首页 home.html 发布在站点根目录，和 index.html 同级
if (existsSync('preview/home.html')) {
  const home = readFileSync('preview/home.html', 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  for (const m of home.matchAll(/\shref="([^"#][^"]*)"/g)) {
    const h = decode(m[1]);
    if (/^(https?:|mailto:)/.test(h)) continue;
    if (!existsSync(join('preview', h.split('#')[0]))) errors.push(`preview home.html：目标不存在 ${h}`);
  }
}

console.log(`页面：正式站 ${nDist} 个，预览 ${nPrev} 个`);
console.log(`检查：站内链接 ${internal} 处（含锚点 ${anchors} 处），站外链接 ${external} 处（AFF ${aff} 处）`);
if (errors.length) {
  const uniq = [...new Set(errors)];
  console.log(`\n✗ ${uniq.length} 个问题：`);
  uniq.slice(0, 80).forEach((e) => console.log('  ' + e));
  process.exit(1);
}
console.log('✓ 全部链接可打开，锚点全部存在');
