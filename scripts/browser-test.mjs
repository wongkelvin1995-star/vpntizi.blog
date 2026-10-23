#!/usr/bin/env node
/**
 * 真实浏览器测试（Chromium）：移动端无横向溢出、搜索弹窗可用、工具可计算、FAQ 全部展开、右侧入口可见。
 * 先 npm run build，然后 node scripts/browser-test.mjs
 * 需要 playwright-core 与本机 Chromium（CHROMIUM_PATH 环境变量可指定路径）。
 */
import { chromium } from 'playwright-core';
import { spawn, execSync } from 'node:child_process';
try { execSync('npx astro preview stop', { stdio: 'ignore' }); } catch {}
import { existsSync, mkdirSync } from 'node:fs';

const PORT = 4329;
const BASE = `http://127.0.0.1:${PORT}`;
const exe = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], { stdio: 'ignore' });
for (let i = 0; i < 40; i++) { try { await fetch(BASE + '/'); break; } catch { await new Promise((r) => setTimeout(r, 1000)); } }
const browser = await chromium.launch({ executablePath: exe });
const errors = [];
const out = (ok, m) => { console.log(`${ok ? '✓' : '✗'} ${m}`); if (!ok) errors.push(m); };
mkdirSync('reports/screens', { recursive: true });

try {
  const PAGES = ['/', '/jichang-tuijian/', '/jichang-paihangbang/', '/jichang/lingdongyun/', '/clash-verge-jiaocheng/', '/pianyi-jichang-tuijian/', '/tools/', '/tools/liuliang-gusuan/', '/tools/meigb-jiage/', '/tools/kehuduan-xuanze/', '/tools/guzhang-paicha/', '/tools/ziliao-hezhe/', '/search/?q=小火箭', '/wangzhan-ditu/', '/404/'];
  // 1. 移动端横向溢出
  const m = await browser.newContext({ viewport: { width: 375, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await m.newPage();
  for (const p of PAGES) {
    const res = await mp.goto(BASE + p, { waitUntil: 'networkidle' });
    const status = res?.status();
    const over = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    out((status === 200 || p === '/404/') && over <= 1, `移动端 375px ${p}（HTTP ${status}，横向溢出 ${over}px）`);
    const rail = await mp.evaluate(() => { const r = document.querySelector('.rail')?.getBoundingClientRect(); return r && r.right <= innerWidth && r.width > 0; });
    if (!rail) out(false, `右侧搜索 / Telegram 入口不可见：${p}`);
  }
  await mp.goto(BASE + '/', { waitUntil: 'networkidle' });
  await mp.screenshot({ path: 'reports/screens/mobile-home.png', fullPage: false });
  await mp.goto(BASE + '/jichang-paihangbang/', { waitUntil: 'networkidle' });
  await mp.screenshot({ path: 'reports/screens/mobile-ranking.png' });

  // 2. 桌面：搜索弹窗
  const d = await browser.newContext({ viewport: { width: 1366, height: 860 } });
  const dp = await d.newPage();
  await dp.goto(BASE + '/', { waitUntil: 'networkidle' });
  await dp.screenshot({ path: 'reports/screens/desktop-home.png' });
  await dp.click('.rail [data-open-search]');
  await dp.fill('#search-input', '订阅导入失败');
  await dp.waitForSelector('#search-results li a', { timeout: 5000 });
  const first = await dp.getAttribute('#search-results li a', 'href');
  out(new URL(first, BASE).pathname === '/dingyue-daoru-wenti/', `右侧搜索图标 → 搜索“订阅导入失败”首条：${first}`);
  await dp.screenshot({ path: 'reports/screens/desktop-search.png' });
  const tg = await dp.getAttribute('.rail a.tg', 'href');
  out(tg === 'https://t.me/+cKCtour4mqM1NTA9', `Telegram 入口：${tg}`);

  // 3. 工具
  await dp.goto(BASE + '/tools/liuliang-gusuan/', { waitUntil: 'networkidle' });
  await dp.fill('#h-v1080', '2');
  const t1 = await dp.textContent('#r-base');
  out(/GB/.test(t1) && parseFloat(t1) > 150, `流量估算器（1080p 2 小时/天）：${t1}`);
  await dp.goto(BASE + '/tools/meigb-jiage/', { waitUntil: 'networkidle' });
  const best = await dp.textContent('#best');
  out(/示例 C/.test(best), `每GB计算器示例结果：${best.trim()}`);
  await dp.goto(BASE + '/tools/kehuduan-xuanze/', { waitUntil: 'networkidle' });
  await dp.check('input[name="os"][value="ios"]');
  const pick = await dp.textContent('#cf-out h3');
  out(/Shadowrocket|Karing|Hiddify/.test(pick), `客户端选择助手（iOS）首选：${pick}`);
  await dp.goto(BASE + '/tools/guzhang-paicha/', { waitUntil: 'networkidle' });
  await dp.click('.flow:not([hidden]) .step:not([hidden]) [data-next]');
  const visibleSteps = await dp.$$eval('.flow:not([hidden]) .step:not([hidden])', (e) => e.length);
  out(visibleSteps === 2, `故障排查助手“下一步”推进：可见步骤 ${visibleSteps}`);
  await dp.goto(BASE + '/tools/ziliao-hezhe/', { waitUntil: 'networkidle' });
  await dp.check('input[name="st"][value="third"]');
  const shown = await dp.$$eval('#status-table tbody tr', (rs) => rs.filter((r) => !r.hidden).length);
  const expectThird = JSON.parse((await import('node:fs')).readFileSync('src/data/airports.json', 'utf8')).airports.filter((a) => a.status === 'pending' && a.sourceType === 'third-party').length;
  out(shown === expectThird, `资料核验筛选“公开资料整理”：${shown}/${expectThird} 行`);

  // 4. FAQ 全部展开（答案可见）
  await dp.goto(BASE + '/jichang-tuijian/', { waitUntil: 'networkidle' });
  const faq = await dp.$$eval('.faq-item p', (ps) => ps.map((p) => p.getBoundingClientRect().height > 0));
  out(faq.length > 0 && faq.every(Boolean), `FAQ 答案全部可见：${faq.length} 条`);

  // 5. 推广按钮属性（运行时 DOM）
  const affs = await dp.$$eval('a[data-aff]', (as) => as.map((a) => a.target === '_blank' && a.rel === 'sponsored nofollow noopener'));
  out(affs.every(Boolean), `推广按钮属性正确：${affs.length} 个（未配置链接的品牌显示“注册链接待配置”）`);
} catch (e) {
  out(false, '测试异常：' + e.message);
} finally {
  await browser.close();
  server.kill();
  try { execSync('npx astro preview stop', { stdio: 'ignore' }); } catch {}
}
console.log(`\n浏览器测试：${errors.length ? errors.length + ' 项失败' : '全部通过'}`);
process.exit(errors.length ? 1 : 0);
