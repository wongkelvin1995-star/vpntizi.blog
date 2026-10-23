#!/usr/bin/env node
/**
 * 手机与平板全面检查（真实 Chromium，触屏模拟）：
 *  1. 全部页面 × 11 种宽度：横向溢出、顶部栏是否一行放下且按钮互不重叠、
 *     是否有悬浮元素压住正文、图片是否加载成功、脚本报错。
 *  2. 触屏交互：菜单展开与每个导航链接、顶部搜索按钮（输入 → 出结果 → 点进去）、
 *     Telegram / GitHub 图标、推广按钮能点到且链接正确、首页“深入阅读”展开。
 *  3. 慢速网络（模拟 4G）下首页与资料页的加载时间。
 * 用法：npm run build && node scripts/mobile-test.mjs [截图目录]
 */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, readdirSync, mkdirSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const exe = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);
const SHOTS = process.argv[2];
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const ROOT = 'dist';
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = join(ROOT, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); return res.end(readFileSync(join(ROOT, '404.html'))); }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(4391, '127.0.0.1');
const BASE = 'http://127.0.0.1:4391';

const walk = (d, o = []) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, o) : o.push(p); } return o; };
const pages = walk(ROOT).filter((f) => f.endsWith('index.html')).map((f) => '/' + relative(ROOT, f).replace(/index\.html$/, '')).sort();

const VIEWPORTS = [
  { name: '小屏手机 320', width: 320, height: 568, mobile: true },
  { name: '安卓 360', width: 360, height: 780, mobile: true },
  { name: 'iPhone SE 375', width: 375, height: 667, mobile: true },
  { name: 'iPhone 14 390', width: 390, height: 844, mobile: true },
  { name: 'Pixel 412', width: 412, height: 915, mobile: true },
  { name: 'iPhone Pro Max 430', width: 430, height: 932, mobile: true },
  { name: 'iPad mini 768', width: 768, height: 1024, mobile: true },
  { name: 'iPad Air 820', width: 820, height: 1180, mobile: true },
  { name: 'iPad Pro 1024', width: 1024, height: 1366, mobile: true },
  { name: '笔记本 1280', width: 1280, height: 800, mobile: false },
  { name: '桌面 1440', width: 1440, height: 900, mobile: false },
];

const problems = [];
const fail = (m) => problems.push(m);
const stats = { loads: 0, minTap: Infinity, smallFont: new Set() };
const browser = await chromium.launch({ executablePath: exe });

const blockExternal = (ctx) => ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());

// ---------- 1. 全部页面 × 全部宽度 ----------
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile, deviceScaleFactor: vp.mobile ? 2 : 1, locale: 'zh-CN' });
  await blockExternal(ctx);
  const page = await ctx.newPage();
  let errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  for (const path of pages) {
    errs = [];
    const resp = await page.goto(BASE + path, { waitUntil: 'load' });
    stats.loads++;
    if (!resp || resp.status() !== 200) { if (path !== '/404/') fail(`[${vp.name}] ${path} 打开失败 ${resp && resp.status()}`); }
    const r = await page.evaluate(async () => {
      const out = { issues: [], minTap: Infinity, smallFont: [] };
      const W = window.innerWidth;
      if (document.documentElement.scrollWidth > W + 1) out.issues.push(`页面横向溢出 ${document.documentElement.scrollWidth}px > ${W}px`);
      // 顶部栏
      const vis = (el) => { if (!el) return false; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
      const header = document.querySelector('.site-header');
      const hr = header.getBoundingClientRect();
      if (hr.height > 72) out.issues.push(`顶部栏高度 ${Math.round(hr.height)}px，换成了两行`);
      const items = [...document.querySelectorAll('.site-header .logo, .site-header .nav-toggle, .site-header .social-btn')].filter(vis);
      if (!document.querySelector('.site-header .social-btn.search') || !vis(document.querySelector('.site-header .social-btn.search'))) out.issues.push('顶部搜索按钮不可见');
      const gh = document.querySelector('.site-header a.social-btn.gh');
      if (!gh || !vis(gh)) out.issues.push('顶部 GitHub 图标不可点');
      for (const el of items) {
        const r = el.getBoundingClientRect();
        if (r.left < 11.5 || r.right > W - 11.5) out.issues.push(`顶部元素超出屏幕或贴边：${el.className}（${Math.round(r.left)}–${Math.round(r.right)}px / ${W}px）`);
        if (el.matches('.social-btn, .nav-toggle')) out.minTap = Math.min(out.minTap, r.width, r.height);
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        if (!(hit === el || el.contains(hit))) out.issues.push(`顶部元素被遮住：${el.className} ← ${hit && hit.className}`);
      }
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const a = items[i].getBoundingClientRect(), b = items[j].getBoundingClientRect();
        if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) out.issues.push(`顶部元素重叠：${items[i].className} / ${items[j].className}`);
      }
      // 悬浮元素
      const fixed = [...document.querySelectorAll('body *')].filter((el) => getComputedStyle(el).position === 'fixed' && vis(el) && !el.closest('dialog:not([open])') && !el.matches('.skip'));
      const main = document.querySelector('main .container');
      const mr = main.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(main).paddingRight);
      for (const el of fixed) {
        const r = el.getBoundingClientRect();
        if (r.left < mr.right - pad && r.right > mr.left) out.issues.push(`悬浮元素可能压住正文：${el.className}（${Math.round(r.left)}–${Math.round(r.right)}px，正文到 ${Math.round(mr.right - pad)}px）`);
      }
      // 滚动到底加载懒加载图片
      const H = document.documentElement.scrollHeight;
      for (let y = 0; y < H; y += window.innerHeight) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 15)); }
      await new Promise((r) => setTimeout(r, 120));
      for (const img of document.images) {
        if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; setTimeout(r, 1500); });
        if (img.naturalWidth === 0) out.issues.push(`图片加载失败：${img.getAttribute('src')}`);
        const r = img.getBoundingClientRect();
        if (r.width > W + 1) out.issues.push(`图片比屏幕宽：${img.getAttribute('src')}`);
        if (img.naturalWidth && r.width && r.height) {
          const ratio = (r.width / r.height) / (img.naturalWidth / img.naturalHeight);
          if (getComputedStyle(img).objectFit === 'fill' && (ratio < 0.97 || ratio > 1.03)) out.issues.push(`图片变形：${img.getAttribute('src')}`);
        }
      }
      // 正文过小文字
      for (const el of document.querySelectorAll('main p, main li, main td, main a, main span, main dd')) {
        if (!vis(el) || !el.textContent.trim()) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 11.5) out.smallFont.push(`${el.className || el.tagName} ${fs}px`);
      }
      window.scrollTo(0, 0);
      return out;
    });
    for (const i of r.issues) fail(`[${vp.name}] ${path} ${i}`);
    stats.minTap = Math.min(stats.minTap, r.minTap);
    r.smallFont.forEach((s) => stats.smallFont.add(s));
    for (const e of errs) fail(`[${vp.name}] ${path} 脚本错误：${e}`);
  }
  await ctx.close();
  console.log(`✓ ${vp.name}：${pages.length} 页检查完`);
}

// ---------- 2. 触屏交互 ----------
const NAV = ['/', '/jichang-tuijian/', '/jichang-paihangbang/', '/jiaocheng/', '/zhishi/', '/wenzhang/', '/tools/'];
const site = await import('../src/data/site.ts').catch(() => null);
const affs = JSON.parse(readFileSync('src/data/airports.json', 'utf8')).airports;
let interactions = 0;
for (const vp of VIEWPORTS.filter((v) => [360, 390, 768].includes(v.width))) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'zh-CN' });
  await blockExternal(ctx);
  const page = await ctx.newPage();
  const ok = (cond, msg) => { interactions++; if (!cond) fail(`[${vp.name}] 交互：${msg}`); };

  // 菜单与每个导航链接
  for (let i = 0; i < NAV.length; i++) {
    await page.goto(BASE + '/zhishi/');
    const toggle = page.locator('.nav-toggle');
    if (await toggle.isVisible()) {
      await toggle.tap();
      ok(await page.locator('#site-nav').isVisible(), '点“菜单”后导航没有展开');
      ok((await toggle.getAttribute('aria-expanded')) === 'true', '菜单 aria-expanded 未更新');
    }
    const link = page.locator('#site-nav a').nth(i);
    await Promise.all([page.waitForURL((u) => new URL(u).pathname === NAV[i]), link.tap()]).catch(() => {});
    ok(new URL(page.url()).pathname === NAV[i], `导航第 ${i + 1} 项没有打开 ${NAV[i]}（现在在 ${new URL(page.url()).pathname}）`);
  }

  // 顶部搜索按钮
  for (const start of ['/', '/jichang/lingdongyun/', '/clash-verge-jiaocheng/']) {
    await page.goto(BASE + start);
    await page.locator('.site-header .social-btn.search').tap();
    const dlg = page.locator('dialog[open]');
    ok(await dlg.isVisible().catch(() => false), `${start} 点顶部搜索按钮没有弹出搜索框`);
    await page.keyboard.type('clash');
    await page.waitForTimeout(400);
    const first = dlg.locator('a[href]').first();
    ok(await first.isVisible().catch(() => false), `${start} 搜索“clash”没有结果`);
    const href = await first.getAttribute('href').catch(() => null);
    if (href) {
      await Promise.all([page.waitForURL((u) => new URL(u).pathname === new URL(href, BASE).pathname), first.tap()]).catch(() => {});
      ok(new URL(page.url()).pathname === new URL(href, BASE).pathname, `${start} 点搜索结果没有跳转到 ${href}`);
    }
    // 搜索框能关闭
    await page.locator('.site-header .social-btn.search').tap();
    const box = page.locator('dialog[open]');
    const close = box.locator('[data-close-search], .search-close, button[aria-label*="关闭"]').first();
    if (await close.count()) { await close.tap(); ok(!(await page.locator('dialog[open]').count()), `${start} 搜索框关闭按钮无效`); }
    else { await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); }
  }

  // Telegram / GitHub
  await page.goto(BASE + '/');
  const tg = page.locator('.site-header a.social-btn.tg');
  const gh = page.locator('.site-header a.social-btn.gh');
  ok((await tg.getAttribute('href'))?.startsWith('https://t.me/'), 'Telegram 图标链接不对');
  ok((await gh.getAttribute('href')) === 'https://github.com/wongkelvin1995-star/vpntizi.blog/issues/1', 'GitHub 图标链接不对');
  for (const [loc, name] of [[tg, 'Telegram'], [gh, 'GitHub']]) {
    ok((await loc.getAttribute('target')) === '_blank', `${name} 图标没有在新窗口打开`);
    const [popup] = await Promise.all([page.waitForEvent('popup', { timeout: 3000 }).catch(() => null), loc.tap()]);
    ok(!!popup, `点 ${name} 图标没有打开新页面`);
    if (popup) await popup.close();
  }

  // 推广按钮：能点到、链接正确、属性正确
  for (const id of ['lingdongyun', 'muguang-jiasu', 'feiv', 'wuyou']) {
    await page.goto(BASE + `/jichang/${id}/`);
    const a = affs.find((x) => x.id === id);
    const btn = page.locator(`a[data-aff="${id}"]`).first();
    await btn.scrollIntoViewIfNeeded();
    const hit = await btn.evaluate((el) => { const r = el.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === el || el.contains(h); });
    ok(hit, `${id} 推广按钮被遮住`);
    ok((await btn.getAttribute('href')) === a.affUrl, `${id} 推广链接与资料不一致`);
    ok((await btn.getAttribute('rel')) === 'sponsored nofollow noopener', `${id} 推广链接 rel 属性不对`);
    const [popup] = await Promise.all([page.waitForEvent('popup', { timeout: 3000 }).catch(() => null), btn.tap()]);
    ok(!!popup, `${id} 点推广按钮没有打开新页面`);
    if (popup) await popup.close();
  }

  // 首页深入阅读展开
  await page.goto(BASE + '/');
  const items = page.locator('.deeper-item');
  const n = await items.count();
  for (let i = 0; i < n; i++) {
    const sum = items.nth(i).locator('summary');
    await sum.scrollIntoViewIfNeeded();
    await sum.tap();
    ok(await items.nth(i).evaluate((d) => d.open), `首页深入阅读第 ${i + 1} 项点了没展开`);
    const go = items.nth(i).locator('a').last();
    ok(await go.isVisible(), `首页深入阅读第 ${i + 1} 项展开后没有“阅读全文”`);
  }

  if (SHOTS) {
    await page.goto(BASE + '/');
    await page.screenshot({ path: join(SHOTS, `home-${vp.width}.png`) });
    if (await page.locator('.nav-toggle').isVisible()) { await page.locator('.nav-toggle').tap(); await page.screenshot({ path: join(SHOTS, `menu-${vp.width}.png`) }); }
    await page.goto(BASE + '/clash-verge-jiaocheng/');
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.screenshot({ path: join(SHOTS, `article-${vp.width}.png`) });
    await page.goto(BASE + '/jichang/lingdongyun/');
    const sh = page.locator('#shice');
    if (await sh.count()) { await sh.scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, -70)); await page.screenshot({ path: join(SHOTS, `lingdongyun-shice-${vp.width}.png`) }); }
  }
  await ctx.close();
}
console.log(`✓ 触屏交互 ${interactions} 项检查完`);

// ---------- 宽屏右侧悬浮栏 ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  const shown = await page.locator('.rail').isVisible();
  if (!shown) fail('[桌面 1440] 右侧悬浮栏没有显示');
  await page.locator('.rail [data-open-search]').click();
  if (!(await page.locator('dialog[open]').count())) fail('[桌面 1440] 右侧搜索按钮无效');
  if (SHOTS) { await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.screenshot({ path: join(SHOTS, 'desktop-1440.png') }); }
  await ctx.close();
}

// ---------- 3. 模拟 4G 网络 ----------
const net = [];
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await blockExternal(ctx);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (4 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  for (const p of ['/', '/jichang/lingdongyun/', '/jichang/wuyou/', '/clash-verge-jiaocheng/', '/jichang-tuijian/']) {
    await page.goto(BASE + p, { waitUntil: 'load' });
    const m = await page.evaluate(() => new Promise((res) => {
      let lcp = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      const nav = performance.getEntriesByType('navigation')[0];
      setTimeout(() => res({ fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0, lcp, load: nav.loadEventEnd, bytes: performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), nav.transferSize || 0) }), 300);
    }));
    net.push({ p, ...m });
    if (m.lcp > 2500) fail(`[4G] ${p} LCP ${Math.round(m.lcp)}ms 超过 2.5 秒`);
  }
  await ctx.close();
}

await browser.close();
server.close();

console.log(`\n页面加载 ${stats.loads} 次（${pages.length} 页 × ${VIEWPORTS.length} 种宽度）`);
console.log(`顶部按钮最小点击尺寸：${stats.minTap}px`);
console.log(`正文中小于 11.5px 的文字：${stats.smallFont.size ? [...stats.smallFont].slice(0, 8).join('；') : '无'}`);
console.log('模拟 4G（150ms 延迟、4Mbps、CPU 降速 4 倍）：');
for (const n of net) console.log(`  ${n.p.padEnd(26)} FCP ${Math.round(n.fcp)}ms · LCP ${Math.round(n.lcp)}ms · 加载完成 ${Math.round(n.load)}ms · ${Math.round(n.bytes / 1024)}KB`);
if (problems.length) {
  console.log(`\n✗ 发现 ${problems.length} 个问题：`);
  for (const p of [...new Set(problems)].slice(0, 80)) console.log('  - ' + p);
  process.exit(1);
}
console.log('\n✓ 手机与平板检查全部通过');
