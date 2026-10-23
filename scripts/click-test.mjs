#!/usr/bin/env node
/**
 * 真实浏览器点击检查（桌面 + 手机宽度）：
 *  - 打开站点每个页面，逐个检查可见链接：滚动到位后，链接中心点没有被其他元素遮挡（能点到）；
 *  - 浏览器解析出的每个站内地址都能以 200 打开；#锚点在目标页存在；
 *  - 首页“深入阅读”逐个展开，要点可见，“阅读全文”可点；
 *  - 客户端选择助手生成的教程链接、搜索结果链接可打开。
 * 同时检查正式站 dist/（根路径）与预览副本 preview/（挂在子路径 /sub/ 下，模拟预览托管）。
 * 用法：npm run build && node scripts/make-preview.mjs && node scripts/click-test.mjs
 */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const exe = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain' };

function serve(root, prefix, port) {
  return new Promise((ok) => {
    const s = createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (!p.startsWith(prefix)) { res.writeHead(404); return res.end('outside'); }
      p = p.slice(prefix.length - 1);
      let f = join(root, p);
      if (existsSync(f) && statSync(f).isDirectory()) {
        if (!p.endsWith('/')) { res.writeHead(301, { location: prefix.slice(0, -1) + p + '/' }); return res.end(); }
        f = join(f, 'index.html');
      }
      if (!existsSync(f)) { res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
      res.end(readFileSync(f));
    }).listen(port, '127.0.0.1', () => ok(s));
  });
}

const walk = (d, o = []) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, o) : o.push(p); } return o; };
const errors = [];
const fail = (m) => errors.push(m);

async function checkSite(root, prefix, port, label) {
  const server = await serve(root, prefix, port);
  const base = `http://127.0.0.1:${port}${prefix}`;
  const pages = walk(root).filter((f) => f.endsWith('index.html') || f.endsWith('404.html'))
    .map((f) => relative(root, f)).filter((f) => !f.startsWith('assets/'));
  const browser = await chromium.launch({ executablePath: exe });
  const status = new Map();
  const head = async (url) => {
    const u = url.split('#')[0];
    if (!status.has(u)) { const r = await fetch(u); status.set(u, r.status); }
    return status.get(u);
  };
  const idCache = new Map();
  let linkCount = 0, blocked = 0;

  for (const vp of [{ name: '桌面', width: 1366, height: 900 }, { name: '手机', width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    for (const rel of pages) {
      const url = base + (label === '预览' ? rel : rel.replace(/index\.html$/, ''));
      const resp = await page.goto(url, { waitUntil: 'load' });
      if (!resp || resp.status() !== 200) { if (!rel.startsWith('404')) fail(`${label}/${vp.name} 页面打不开：${rel}`); continue; }
      // 逐个链接：滚动到位，检查中心点能否点到
      const res = await page.evaluate(() => {
        const out = [];
        for (const a of document.querySelectorAll('a[href]')) {
          const cs = getComputedStyle(a);
          const r0 = a.getBoundingClientRect();
          if (cs.visibility === 'hidden' || cs.display === 'none' || (r0.width === 0 && r0.height === 0) || a.closest('dialog:not([open]), details:not([open]) > :not(summary), [hidden]')) continue;
          a.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
          const rects = [...a.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
          let hit = false;
          for (const r of rects) {
            const x = r.left + r.width / 2, y = r.top + r.height / 2;
            if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { hit = true; continue; } // 在横向滚动表格中，交给滚动处理
            const el = document.elementFromPoint(x, y);
            if (el && (el === a || a.contains(el))) { hit = true; break; }
          }
          const el0 = rects[0] ? document.elementFromPoint(rects[0].left + rects[0].width / 2, rects[0].top + rects[0].height / 2) : null;
          out.push({ href: a.href, raw: a.getAttribute('href'), text: (a.textContent || '').trim().slice(0, 30), hit, cover: el0 ? (el0.className || el0.tagName) + '' : '' });
        }
        return out;
      });
      for (const l of res) {
        linkCount++;
        if (!l.hit) { blocked++; fail(`${label}/${vp.name} ${rel}：链接被遮挡点不到「${l.text}」（被 ${l.cover} 盖住）`); }
        if (!l.href.startsWith(`http://127.0.0.1:${port}`)) continue;
        const st = await head(l.href);
        if (st !== 200) fail(`${label}/${vp.name} ${rel}：「${l.text}」→ ${l.raw} 打开得到 ${st}`);
        const hash = new URL(l.href).hash.slice(1);
        if (hash) {
          const key = l.href.split('#')[0];
          if (!idCache.has(key)) idCache.set(key, await (await fetch(key)).text());
          if (!idCache.get(key).includes(`id="${decodeURIComponent(hash)}"`)) fail(`${label} ${rel}：锚点 #${hash} 不存在`);
        }
      }
    }

    // 首页“深入阅读”：逐个展开
    await page.goto(base + (label === '预览' ? 'index.html' : ''), { waitUntil: 'load' });
    const items = await page.locator('.deeper-item').count();
    if (items < 10) fail(`${label}/${vp.name} 首页深入阅读条目过少：${items}`);
    for (let i = 0; i < items; i++) {
      const it = page.locator('.deeper-item').nth(i);
      await it.locator('summary').click();
      const open = await it.evaluate((d) => d.open);
      const go = it.locator('.deeper-go');
      const vis = await go.isVisible();
      const li = await it.locator('li').count();
      if (!open || !vis || li < 1) fail(`${label}/${vp.name} 深入阅读第 ${i + 1} 条展开失败`);
      else {
        const href = await go.evaluate((a) => a.href);
        if ((await head(href)) !== 200) fail(`${label} 深入阅读「阅读全文」打不开：${href}`);
        const ok = await go.evaluate((a) => { a.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = a.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return (el === a || a.contains(el)) ? true : String(el && (el.className || el.tagName)); });
        if (ok !== true) fail(`${label}/${vp.name} 深入阅读第 ${i + 1} 条「阅读全文」被 ${ok} 遮挡`);
      }
    }
    // 真实点击一次：确认能跳到文章页且不是 404
    await page.locator('.deeper-item').first().locator('summary').click();
    if (!(await page.locator('.deeper-item').first().evaluate((d) => d.open))) await page.locator('.deeper-item').first().locator('summary').click();
    await Promise.all([page.waitForLoadState('load'), page.locator('.deeper-item').first().locator('.deeper-go').click()]);
    await page.waitForTimeout(300);
    if (!(await page.locator('h1').first().textContent())?.includes('VPN')) fail(`${label}/${vp.name} 点击「阅读全文」后没有到达文章页：${page.url()}`);

    // 客户端选择助手生成的链接
    await page.goto(base + (label === '预览' ? 'tools/kehuduan-xuanze/index.html' : 'tools/kehuduan-xuanze/'), { waitUntil: 'load' });
    const btn = page.locator('form button[type="submit"], #kx-form button, button:has-text("推荐")').first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(200);
      for (const h of await page.$$eval('#result a, .result a, [id*="out"] a', (as) => as.map((a) => a.href))) {
        if ((await head(h)) !== 200) fail(`${label} 客户端选择助手生成的链接打不开：${h}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  server.close();
  console.log(`${label}：${pages.length} 个页面 × 2 种屏幕，检查链接 ${linkCount} 次，不同站内地址 ${status.size} 个，被遮挡 ${blocked} 个`);
}

await checkSite('dist', '/', 4401, '正式站');
await checkSite('preview', '/sub/', 4402, '预览');

if (errors.length) {
  const u = [...new Set(errors)];
  console.log(`\n✗ ${u.length} 个问题：`);
  u.slice(0, 60).forEach((e) => console.log('  ' + e));
  process.exit(1);
}
console.log('✓ 所有可见链接都能点到，并且都能打开');
