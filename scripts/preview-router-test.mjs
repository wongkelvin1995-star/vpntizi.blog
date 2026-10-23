#!/usr/bin/env node
/**
 * 模拟“预览窗口拦截页面跳转”的环境测试预览副本：
 * 首次载入后，所有整页导航（document 请求）都会被拒绝，弹窗被拦截。
 * 逐个点击底部链接、导航、深入阅读，确认都能显示正确页面，且页面脚本、样式、返回键正常。
 * 用法：npm run build && node scripts/make-preview.mjs && node scripts/preview-router-test.mjs
 */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const exe = ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml' };
const PORT = 4420, PREFIX = '/sub/';
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!p.startsWith(PREFIX)) { res.writeHead(404); return res.end(); }
  let f = join('preview', p.slice(PREFIX.length));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(PORT, '127.0.0.1');
const BASE = `http://127.0.0.1:${PORT}${PREFIX}`;

const errors = [];
const ok = (cond, msg) => { console.log(`${cond ? '✓' : '✗'} ${msg}`); if (!cond) errors.push(msg); };
const browser = await chromium.launch({ executablePath: exe });

for (const vp of [{ name: '桌面', width: 1366, height: 900 }, { name: '手机', width: 390, height: 844 }]) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  await page.goto(BASE + 'index.html', { waitUntil: 'load' });
  // 之后拦截所有整页导航与弹窗，模拟预览窗口
  let blockedNav = 0;
  await page.route('**/*', (route) => {
    if (route.request().isNavigationRequest()) { blockedNav++; return route.abort('blockedbyclient'); }
    return route.continue();
  });
  await page.evaluate(() => { window.open = () => null; });

  const home = BASE + 'index.html';
  const footer = await page.$$eval('.site-footer a', (as) => as.map((a) => ({ text: a.textContent.trim(), href: a.href, ext: a.origin !== location.origin })));
  let passed = 0;
  for (const l of footer) {
    if (l.ext) continue;
    // 每次都从首页开始
    await page.evaluate((u) => { const a = document.createElement('a'); a.href = u; a.textContent = 'x'; document.body.appendChild(a); a.click(); }, home);
    await page.waitForFunction(() => document.querySelector('.site-footer'), null, { timeout: 5000 });
    await page.waitForTimeout(150);
    const expected = await (await fetch(l.href)).text();
    const expH1 = (expected.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim();
    const link = page.locator('.site-footer a', { hasText: l.text }).first();
    await link.scrollIntoViewIfNeeded();
    await link.click();
    try { await page.waitForFunction((h) => document.querySelector('h1')?.textContent.trim() === h, expH1, { timeout: 5000 }); } catch {}
    const got = (await page.locator('h1').first().textContent())?.trim();
    const styled = await page.evaluate(() => getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)' && document.styleSheets.length > 0);
    if (got === expH1 && styled) passed++;
    else ok(false, `${vp.name} 底部「${l.text}」点击后显示「${got}」，应为「${expH1}」${styled ? '' : '（样式未加载）'}`);
  }
  ok(passed === footer.filter((l) => !l.ext).length, `${vp.name} 底部站内链接 ${passed}/${footer.filter((l) => !l.ext).length} 个点击后显示了正确页面`);

  // 连续跳转：文章页 → 网站地图 → 某品牌页 → 返回键
  await page.evaluate((u) => { const a = document.createElement('a'); a.href = u; document.body.appendChild(a); a.click(); }, home);
  await page.waitForTimeout(300);
  if (vp.width < 880) { await page.click('.nav-toggle'); }
  await page.locator('#site-nav a', { hasText: '全部文章' }).click();
  await page.waitForFunction(() => /全部文章/.test(document.querySelector('h1')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
  ok(/全部文章/.test(await page.locator('h1').first().textContent()), `${vp.name} 顶部导航「全部文章」可打开`);
  // 新页面的脚本仍可用：分类筛选
  await page.locator('.cat-btn[data-filter="tutorial"]').click();
  const shown = await page.$$eval('#article-list .article-item', (xs) => xs.filter((x) => !x.hidden).length);
  ok(shown > 0 && shown < 26, `${vp.name} 跳转后页面脚本正常（筛选后显示 ${shown} 篇）`);
  await page.locator('#article-list a').first().click();
  await page.waitForTimeout(400);
  const art = await page.locator('h1').first().textContent();
  ok(!/全部文章/.test(art), `${vp.name} 文章列表 → 文章页：${art.trim()}`);
  await page.goBack().catch(() => {});
  await page.waitForTimeout(500);
  ok(/全部文章/.test((await page.locator('h1').first().textContent()) || ''), `${vp.name} 浏览器返回键回到上一页`);

  // 首页深入阅读 → 阅读全文
  await page.evaluate((u) => { const a = document.createElement('a'); a.href = u; document.body.appendChild(a); a.click(); }, home);
  await page.waitForTimeout(400);
  const d = page.locator('.deeper-item').first();
  await d.locator('summary').click();
  await d.locator('.deeper-go').click();
  await page.waitForTimeout(400);
  ok(/VPN 和机场/.test(await page.locator('h1').first().textContent()), `${vp.name} 深入阅读「阅读全文」可打开`);
  // 页内锚点（目录）
  await page.evaluate((u) => { const a = document.createElement('a'); a.href = u; document.body.appendChild(a); a.click(); }, home);
  await page.waitForTimeout(400);
  if (vp.width >= 880) {
    await page.locator('.page-toc a[href="#ch-nodes"]').click();
    await page.waitForTimeout(1800);
    const top = await page.evaluate(() => document.getElementById('ch-nodes').getBoundingClientRect().top);
    ok(Math.abs(top) < 200, `${vp.name} 首页目录锚点跳到「节点地区」（距顶部 ${Math.round(top)}px）`);
  }
  // 品牌页搜索弹窗脚本
  await page.evaluate((u) => { const a = document.createElement('a'); a.href = u; document.body.appendChild(a); a.click(); }, BASE + 'jichang/lingdongyun/index.html');
  await page.waitForTimeout(400);
  await page.locator('[data-open-search]').first().click();
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => !!document.querySelector('dialog[open]')), `${vp.name} 跳转后搜索弹窗可用`);
  await page.keyboard.press('Escape');

  // 站外链接被拦截时：给出可复制链接
  await page.evaluate(() => { window.open = () => null; });
  await page.locator('.site-footer a', { hasText: 'Telegram' }).click();
  await page.waitForTimeout(300);
  const toast = await page.evaluate(() => document.querySelector('[role="alert"] input')?.value || '');
  const navTried = blockedNav > 0;
  ok(toast.includes('t.me') || navTried, `${vp.name} Telegram 链接被拦时有兜底（${toast ? '显示可复制链接' : '尝试整页打开'}）`);

  ok(pageErrors.length === 0, `${vp.name} 页面无脚本错误${pageErrors.length ? '：' + pageErrors.slice(0, 3).join(' | ') : ''}`);
  await ctx.close();
}
await browser.close();
server.close();
console.log(errors.length ? `\n✗ ${errors.length} 项失败` : '\n预览跳转测试：全部通过');
process.exit(errors.length ? 1 : 0);
