#!/usr/bin/env node
/**
 * Bing 收录与排名状态检查（与 IndexNow 提交结果分开统计）。
 *
 * 需要 Bing Webmaster Tools API Key：BWT → 右上角设置 → API 访问 → 生成 API Key
 *   BING_API_KEY=xxxx node scripts/bing-status.mjs            检查 sitemap 中每个 URL 的抓取/收录信息
 *   BING_API_KEY=xxxx node scripts/bing-status.mjs --queries  拉取搜索词表现（展示、点击、平均排名）
 *
 * 输出 reports/bing-urls-YYYY-MM-DD.csv 与 reports/bing-queries-YYYY-MM-DD.csv。
 * Bing API 字段可能调整；若返回结构变化，脚本会把原始 JSON 写入 reports/ 供人工查看。
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const SITE = 'https://vpntizi.blog/';
const API = 'https://ssl.bing.com/webmaster/api.svc/json';
const KEY = process.env.BING_API_KEY;
if (!KEY) {
  console.error('缺少环境变量 BING_API_KEY。没有 API Key 时，请在 Bing Webmaster Tools 的“URL 检查”“搜索性能”中手动查看。');
  process.exit(1);
}
const today = new Date().toISOString().slice(0, 10);
mkdirSync('reports', { recursive: true });
const csv = (rows) => rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

async function call(method, params) {
  const qs = new URLSearchParams({ ...params, apikey: KEY });
  const r = await fetch(`${API}/${method}?${qs}`);
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`${method} HTTP ${r.status} ${JSON.stringify(body)}`);
  return body?.d ?? body;
}

if (process.argv.includes('--queries')) {
  const d = await call('GetQueryStats', { siteUrl: SITE });
  writeFileSync(`reports/bing-queries-raw-${today}.json`, JSON.stringify(d, null, 2));
  const { KEYWORD_MAP } = await import('../src/data/keywords.ts');
  const KEYWORD_LIST = KEYWORD_MAP.map((k) => k.keyword);
  const rows = [['关键词', '展示', '点击', '平均展示排名', '平均点击排名', '是否目标词']];
  for (const q of d || []) rows.push([q.Query, q.Impressions, q.Clicks, q.AvgImpressionPosition, q.AvgClickPosition, KEYWORD_LIST.includes(q.Query) ? '是' : '']);
  writeFileSync(`reports/bing-queries-${today}.csv`, '﻿' + csv(rows));
  const missing = KEYWORD_LIST.filter((k) => !(d || []).some((q) => q.Query === k));
  console.log(`搜索词 ${rows.length - 1} 条 → reports/bing-queries-${today}.csv`);
  console.log(`目标关键词尚无展示：${missing.length} 个${missing.length ? '：' + missing.join('、') : ''}`);
} else {
  const manifest = JSON.parse(readFileSync('dist/indexnow-manifest.json', 'utf8')).urls;
  const rows = [['URL', '是否已发现', '最后抓取', 'HTTP 状态', '是否收录（原始字段）', '原始返回']];
  let i = 0;
  for (const url of Object.keys(manifest)) {
    try {
      const d = await call('GetUrlInfo', { siteUrl: SITE, url });
      rows.push([url, d ? '是' : '否', d?.LastCrawledDate ?? '', d?.HttpStatus ?? '', d?.IsPage ?? d?.DocumentSize ?? '', JSON.stringify(d)]);
    } catch (e) {
      rows.push([url, '查询失败', '', '', '', e.message]);
    }
    if (++i % 10 === 0) console.log(`  已查询 ${i}/${Object.keys(manifest).length}`);
    await new Promise((r) => setTimeout(r, 400));
  }
  writeFileSync(`reports/bing-urls-${today}.csv`, '﻿' + csv(rows));
  console.log(`→ reports/bing-urls-${today}.csv。请区分：IndexNow 已通知 / Bing 已抓取 / Bing 已收录 / 有搜索展示，四者不是一回事。`);
}
