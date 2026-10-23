#!/usr/bin/env node
/**
 * IndexNow 通知（Bing、Yandex、Seznam 等共享）。
 *
 *   node scripts/indexnow.mjs --diff     部署前：对比线上旧清单与本地 dist 新清单，写入 .indexnow-pending.json
 *   node scripts/indexnow.mjs --submit   部署后：把新增 / 更新 / 删除的 URL 提交给 IndexNow
 *   node scripts/indexnow.mjs --urls https://vpntizi.blog/a/ https://vpntizi.blog/b/   手动提交
 *   node scripts/indexnow.mjs --all      提交全部可索引 URL（首次上线时用）
 *   加 --dry-run 只打印不提交
 *
 * 注意：HTTP 200/202 只代表 IndexNow 已收到通知，不代表 Bing 已抓取、已收录或有排名。
 * 收录与排名请用 scripts/bing-status.mjs 或 Bing Webmaster Tools 单独检查。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SITE = 'https://vpntizi.blog';
const HOST = 'vpntizi.blog';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const PENDING = '.indexnow-pending.json';
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const key = (process.env.INDEXNOW_KEY || readFileSync('.indexnow-key', 'utf8')).trim();

const local = () => JSON.parse(readFileSync('dist/indexnow-manifest.json', 'utf8')).urls;

async function remote() {
  try {
    const r = await fetch(`${SITE}/indexnow-manifest.json`, { headers: { 'cache-control': 'no-cache' } });
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()).urls;
  } catch (e) {
    console.warn(`未取得线上旧清单（${e.message}），视为首次部署：全部 URL 记为新增`);
    return {};
  }
}

async function submit(urls) {
  urls = [...new Set(urls)].filter((u) => u.startsWith(SITE));
  if (!urls.length) return console.log('没有需要通知的 URL');
  console.log(`准备提交 ${urls.length} 个 URL`);
  if (dry) return urls.forEach((u) => console.log('  ' + u));
  for (let i = 0; i < urls.length; i += 10000) {
    const batch = urls.slice(i, i + 10000);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${key}.txt`, urlList: batch }),
    });
    const text = await res.text().catch(() => '');
    const meaning = {
      200: '已接收（OK）',
      202: '已接收，密钥待验证（Accepted）',
      400: '请求格式错误',
      403: '密钥无效或密钥文件无法访问',
      422: 'URL 不属于该 host 或密钥不匹配',
      429: '提交过于频繁',
    }[res.status] ?? '未知状态';
    console.log(`IndexNow 响应：HTTP ${res.status} ${meaning} ${text}`);
    if (res.status >= 400) process.exitCode = 1;
  }
  console.log('提醒：IndexNow 成功 ≠ 已被 Bing 收录 ≠ 获得排名。请用 npm run bing:status 或 Bing Webmaster Tools 检查收录。');
}

if (args.includes('--diff')) {
  const [oldM, newM] = [await remote(), local()];
  const added = Object.keys(newM).filter((u) => !(u in oldM));
  const updated = Object.keys(newM).filter((u) => u in oldM && oldM[u] !== newM[u]);
  const deleted = Object.keys(oldM).filter((u) => !(u in newM));
  writeFileSync(PENDING, JSON.stringify({ added, updated, deleted }, null, 2));
  console.log(`新增 ${added.length}｜更新 ${updated.length}｜删除 ${deleted.length} → 已写入 ${PENDING}`);
} else if (args.includes('--submit')) {
  if (!existsSync(PENDING)) { console.error(`缺少 ${PENDING}，请先在部署前运行 --diff`); process.exit(1); }
  const p = JSON.parse(readFileSync(PENDING, 'utf8'));
  // 删除的 URL 也要通知：搜索引擎抓取后会看到 404/410 并移出索引
  await submit([...p.added, ...p.updated, ...p.deleted]);
} else if (args.includes('--all')) {
  await submit(Object.keys(local()));
} else if (args.includes('--urls')) {
  await submit(args.slice(args.indexOf('--urls') + 1).filter((a) => a.startsWith('http')));
} else {
  console.log('用法：--diff | --submit | --all | --urls <url...> [--dry-run]');
}
