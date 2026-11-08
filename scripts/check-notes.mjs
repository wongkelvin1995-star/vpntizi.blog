// 检查“怎么选套餐：本站建议”（src/data/airport-notes.ts）与推荐文章四家卡片（topFourNotes）里的数字：
// 每个数字都必须能在该机场的资料里找到，或由资料算出（每GB价格、折合月价、年付相对月付×12 的比例、在 34 家里的排名）。
// 改了 airports.json 的价格后，这里会提示哪段文字需要同步修改。
import { readFileSync, readdirSync } from 'node:fs';

const data = JSON.parse(readFileSync('src/data/airports.json', 'utf8'));
const airports = [...data.airports].sort((a, b) => a.rank - b.rank);
const byId = Object.fromEntries(airports.map((a) => [a.id, a]));
const M = { month: 1, quarter: 3, halfyear: 6, year: 12 };
const EX = (p) => /定制|独享|企业|Enterprise/.test(p.name);
const cyc = (p) => (p.trafficGB == null ? null : p.trafficPeriod === 'month' ? p.trafficGB * (M[p.billing] ?? 1) : p.trafficGB);
const pgb = (p) => { const t = cyc(p); return t ? p.priceCNY / t : null; };
const meq = (p) => (M[p.billing] ? p.priceCNY / M[p.billing] : null);

const fmts = (v) => {
  const out = new Set();
  for (const d of [0, 1, 2, 3]) { const s = v.toFixed(d); out.add(s); out.add(String(+s)); }
  out.add(String(v));
  return out;
};
const numsIn = (s) => (String(s).match(/\d+(?:\.\d+)?/g) ?? []);

// 34 家同口径排名（与资料页“在 34 家中的位置”一致：只算非定制套餐）
const stat = airports.map((a) => {
  const ps = a.plans.filter((p) => !EX(p));
  const mon = ps.filter((p) => p.billing === 'month').map((p) => p.priceCNY);
  const eq = ps.map(meq).filter((x) => x != null);
  const gb = ps.map(pgb).filter((x) => x != null);
  return { id: a.id, minMon: mon.length ? Math.min(...mon) : null, minEq: eq.length ? Math.min(...eq) : null, minGB: gb.length ? Math.min(...gb) : null };
});
const rankOf = (key, id) => {
  const vals = stat.map((s) => s[key]).filter((x) => x != null).sort((x, y) => x - y);
  const v = stat.find((s) => s.id === id)[key];
  if (v == null) return [];
  const r = vals.findIndex((x) => Math.abs(x - v) < 1e-9) + 1;
  return [r, vals.length - r + 1];
};

function allowed(a) {
  const set = new Set(['34', '12', '1', '2', '3', '4', '2024', '2025', '2026', '10']);
  const add = (v) => v != null && fmts(v).forEach((x) => set.add(x));
  for (const p of a.plans) {
    add(p.priceCNY); add(p.trafficGB); add(meq(p)); add(cyc(p)); add(pgb(p));
  }
  const names = {};
  for (const p of a.plans) (names[p.name] ??= {})[p.billing] = p;
  for (const b of Object.values(names)) if (b.month && b.year) add(Math.round((b.year.priceCNY / (b.month.priceCNY * 12)) * 100));
  for (const k of ['minMon', 'minEq', 'minGB']) rankOf(k, a.id).forEach(add);
  [a.regions.length, a.plans.length, a.plans.filter((p) => p.billing === 'payg').length].forEach(add);
  const text = [a.intro, a.limits, a.suitableFor, a.notSuitableFor, a.aiCompat, a.streamingCompat, a.regions, a.lineTypes, a.protocols, a.clients].flat().join(' ');
  numsIn(text).forEach((x) => set.add(x));
  return set;
}

let errors = 0;
function check(where, id, text, extra = []) {
  const a = byId[id];
  if (!a) { console.error(`✗ ${where}：找不到机场 ${id}`); errors++; return; }
  const ok = allowed(a);
  extra.forEach((x) => ok.add(x));
  const bad = numsIn(text).filter((n) => !ok.has(n));
  if (bad.length) { console.error(`✗ ${where}（${a.name}）出现资料里找不到的数字：${bad.join('、')}`); errors++; }
}

// 1) 机场资料页建议段落
const notesSrc = readFileSync('src/data/airport-notes.ts', 'utf8');
const notes = Object.fromEntries([...notesSrc.matchAll(/^\s*'?([\w-]+)'?:\s*\n\s*'([^']*)',$/gm)].map((m) => [m[1], m[2]]));
const missing = airports.filter((a) => a.status !== 'placeholder' && !notes[a.id]).map((a) => a.id);
if (missing.length) { console.error(`✗ 缺少建议段落：${missing.join('、')}`); errors++; }
for (const [id, t] of Object.entries(notes)) {
  check(`airport-notes.ts:${id}`, id, t);
  if (t.length < 120 || t.length > 320) { console.error(`✗ airport-notes.ts:${id} 长度 ${t.length}，应在 120–320 字`); errors++; }
}
// 同一句话不能出现在两家的段落里（防止套模板）
const sentences = new Map();
for (const [id, t] of Object.entries(notes)) for (const s of t.split(/[。；]/).map((x) => x.trim()).filter((x) => x.length >= 18)) {
  if (sentences.has(s) && sentences.get(s) !== id) { console.error(`✗ ${id} 与 ${sentences.get(s)} 有完全相同的句子：${s}`); errors++; }
  sentences.set(s, id);
}

// 2) 推荐文章四家卡片（frontmatter: topFourNotes）
let cardCount = 0;
for (const f of readdirSync('src/content/articles')) {
  const src = readFileSync('src/content/articles/' + f, 'utf8');
  const fm = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const block = fm.match(/^topFourNotes:\n((?:\s{2}.+\n?)+)/m)?.[1];
  if (!block) continue;
  for (const m of block.matchAll(/^\s{2}([\w-]+):\s*"(.*)"\s*$/gm)) {
    cardCount++;
    check(`${f}:topFourNotes.${m[1]}`, m[1], m[2]);
  }
}

console.log(`建议段落 ${Object.keys(notes).length} 段，四家卡片说明 ${cardCount} 条`);
if (errors) { console.error(`check:notes 失败：${errors} 处`); process.exit(1); }
console.log('✓ 建议段落与四家卡片里的数字都能在资料中找到或由资料算出');
