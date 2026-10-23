#!/usr/bin/env node
/**
 * 生成可在任意子路径下浏览的预览副本（preview/）：
 * 站内绝对链接 /x/ 改成相对路径 x/index.html，正式构建 dist/ 不受影响。
 * 用法：npm run build && node scripts/make-preview.mjs
 */
import { cpSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const SRC = 'dist', OUT = 'preview';
const ROUTER = readFileSync('scripts/preview-router.js', 'utf8').replace(/<\/script/gi, '<\\/script');
rmSync(OUT, { recursive: true, force: true });
cpSync(SRC, OUT, { recursive: true });
// 预览托管保留以 _ 开头的路径：把 _astro/ 改名为 assets/
cpSync(join(OUT, '_astro'), join(OUT, 'assets'), { recursive: true });
rmSync(join(OUT, '_astro'), { recursive: true });

const walk = (d, o = []) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, o) : o.push(p); } return o; };
const files = walk(OUT);

const fix = (path) => {
  const [p, rest = ''] = path.split(/(?=[?#])/);
  if (p.endsWith('/')) return p.slice(1) + 'index.html' + rest;
  return p.slice(1) + rest;
};

for (const f of files.filter((f) => f.endsWith('.html'))) {
  const depth = relative(OUT, dirname(f)).split('/').filter(Boolean).length;
  const up = '../'.repeat(depth);
  let html = readFileSync(f, 'utf8').replaceAll('/_astro/', '/assets/');
  html = html.replace(/\b(href|src|action)="(\/(?!\/)[^"]*)"/g, (_, a, p) => `${a}="${up}${fix(p) || 'index.html'}"`);
  // 页面内嵌 JSON 数据里的链接（如客户端选择助手由脚本生成的“查看教程”）
  html = html.replace(/"href":"(\/(?!\/)[^"]*)"/g, (_, p) => `"href":"${up}${fix(p) || 'index.html'}"`);
  // 预览窗口可能拦截页面间跳转：注入只在预览副本中使用的站内跳转脚本
  html = html.replace('</body>', `<script>${ROUTER}</script></body>`);
  writeFileSync(f, html);
}

for (const f of walk(join(OUT, 'assets')).filter((f) => f.endsWith('.js') || f.endsWith('.css'))) {
  // CSS 与 JS 都在 assets/ 下，互相引用改为同目录相对路径
  writeFileSync(f, readFileSync(f, 'utf8').replaceAll('/_astro/', './'));
}

// 搜索结果链接也指向 index.html
const idxFile = join(OUT, 'search-index.json');
const idx = JSON.parse(readFileSync(idxFile, 'utf8')).map((d) => ({ ...d, u: d.u.endsWith('/') ? d.u + 'index.html' : d.u }));
writeFileSync(idxFile, JSON.stringify(idx));

// 预览首页：去掉外层文档标签（发布时会自动包裹）
const home = readFileSync(join(OUT, 'index.html'), 'utf8')
  .replace(/<!doctype html>/i, '')
  .replace(/<html[^>]*>|<\/html>|<head>|<\/head>|<body[^>]*>|<\/body>/gi, '');
writeFileSync(join(OUT, 'home.html'), '<title>VPN梯子指南</title>\n' + home.replace(/<title>[^<]*<\/title>/, ''));

const list = walk(OUT).map((f) => relative(OUT, f)).filter((f) => f !== 'home.html' && f !== 'index.html' && !f.endsWith('.txt') && f !== 'indexnow-manifest.json' && !['_headers', '_redirects'].includes(f));
writeFileSync('preview-files.json', JSON.stringify(Object.fromEntries(list.map((f) => [f, join(OUT, f)])), null, 1));
console.log(`预览副本：${list.length} 个附属文件 + home.html`);
