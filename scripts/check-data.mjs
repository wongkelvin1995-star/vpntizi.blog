#!/usr/bin/env node
/**
 * 机场数据校验：34 家完整、前五顺序、AFF 链接唯一不混用、价格字段合法。
 * 用法：node scripts/check-data.mjs            # 缺 AFF 链接只警告
 *       node scripts/check-data.mjs --strict   # 缺 AFF 链接 / 名称未录入视为失败（上线前使用）
 */
import { readFileSync } from 'node:fs';

const strict = process.argv.includes('--strict');
const data = JSON.parse(readFileSync(new URL('../src/data/airports.json', import.meta.url), 'utf8'));
const list = [...data.airports].sort((a, b) => a.rank - b.rank);
const FIXED_TOP = ['灵动云', '暮光加速', '微风网络 Breezenet', '飞猫云', '大佬云'];
const BILLING = ['month', 'quarter', 'halfyear', 'year', 'payg', 'onetime'];

const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => (strict ? errors : warns).push(m);

if (list.length !== 34) err(`机场数量应为 34，实际 ${list.length}`);
const dup = (key) => {
  const seen = new Map();
  for (const a of list) {
    const v = typeof key === 'function' ? key(a) : a[key];
    if (v === '' || v == null) continue;
    if (seen.has(v)) err(`重复的 ${typeof key === 'string' ? key : '值'}：“${v}”（#${seen.get(v)} 与 #${a.rank}）`);
    else seen.set(v, a.rank);
  }
};
dup('id');
dup('name');
dup('rank');
dup((a) => a.affUrl.trim().toLowerCase());

list.forEach((a, i) => {
  if (a.rank !== i + 1) err(`rank 不连续：位置 ${i + 1} 的 rank 为 ${a.rank}`);
  if (!/^[a-z0-9-]+$/.test(a.id)) err(`#${a.rank} id 只能包含小写字母、数字和连字符：${a.id}`);
});

FIXED_TOP.forEach((name, i) => {
  if (list[i]?.name !== name) err(`前五顺序错误：第 ${i + 1} 位应为“${name}”，实际为“${list[i]?.name}”`);
});

for (const a of list) {
  const tag = `#${a.rank} ${a.name}`;
  if (a.status === 'placeholder') warn(`${tag}：品牌名称与资料尚未录入`);
  if (!a.affUrl) warn(`${tag}：缺少专属 AFF 注册链接`);
  else {
    try {
      const u = new URL(a.affUrl);
      if (u.protocol !== 'https:') warn(`${tag}：AFF 链接不是 https`);
    } catch {
      err(`${tag}：AFF 链接格式无效：${a.affUrl}`);
    }
  }
  for (const p of a.plans) {
    if (!p.name) err(`${tag}：存在未命名套餐`);
    if (!BILLING.includes(p.billing)) err(`${tag} ${p.name}：billing 无效 ${p.billing}`);
    if (!(typeof p.priceCNY === 'number' && p.priceCNY > 0)) err(`${tag} ${p.name}：priceCNY 必须为正数（实际付款金额）`);
    if (p.trafficGB != null && !(p.trafficGB > 0)) err(`${tag} ${p.name}：trafficGB 必须为正数或 null`);
    if (!['month', 'cycle', 'total'].includes(p.trafficPeriod)) err(`${tag} ${p.name}：trafficPeriod 无效`);
  }
  if (a.status === 'verified') {
    if (!a.verifiedAt || !/^\d{4}-\d{2}-\d{2}$/.test(a.verifiedAt)) err(`${tag}：已核实状态必须填写 verifiedAt（YYYY-MM-DD）`);
    if (!a.sources.length) err(`${tag}：已核实状态必须至少有 1 个资料来源`);
    if (!a.plans.length) err(`${tag}：已核实状态必须至少有 1 个套餐`);
  }
  if (a.plans.length && a.status !== 'verified' && !a.collectedAt) err(`${tag}：已填写套餐但没有整理日期（collectedAt）`);
  if (!a.plans.length && a.status !== 'placeholder') warns.push(`${tag}：暂无套餐资料，页面显示“待核实”`);
}

const aff = list.filter((a) => a.affUrl).length;
console.log(`机场总数：${list.length}｜前五：${list.slice(0, 5).map((a) => a.name).join(' > ')}`);
console.log(`AFF 链接已配置：${aff}/34｜已核实：${list.filter((a) => a.status === 'verified').length}｜待录入：${list.filter((a) => a.status === 'placeholder').length}`);
warns.forEach((w) => console.warn('  ⚠ ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('  ✗ ' + e));
  console.error(`\n数据校验失败：${errors.length} 个问题${strict ? '（严格模式）' : ''}`);
  process.exit(1);
}
console.log(`\n✓ 数据结构校验通过${warns.length ? `（${warns.length} 条提醒，上线前请用 --strict 复查）` : ''}`);
