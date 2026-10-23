/** 中文站内搜索核心：同义词扩展 + 子串/二元组打分，无第三方依赖 */
export interface SearchDoc {
  u: string; // url
  t: string; // title
  d: string; // description
  k: string; // keywords + aliases (space separated)
  b: string; // plain body text
  c: string; // category label
}

/** 口语、别名、英文名的关联词表（双向使用） */
export const SYNONYMS: string[][] = [
  ['梯子', 'vpn', '翻墙', '科学上网', '魔法上网', '代理', '机场', '加速器'],
  ['机场', '订阅', '节点', '梯子', 'airport'],
  ['小火箭', 'shadowrocket', '火箭', 'ios', 'iphone'],
  ['clash', 'clash verge', 'verge', 'mihomo', 'clash meta', 'clashx', '小猫咪'],
  ['clashparty', 'clash party', 'mihomo party'],
  ['v2rayn', 'v2ray', 'xray', 'v2rayng', 'vmess', 'vless'],
  ['sing-box', 'singbox', 'sfa', 'sfi', 'sfm'],
  ['hiddify', 'karing'],
  ['iepl', 'iplc', '专线', '内网专线', '中转'],
  ['chatgpt', 'openai', 'gpt', 'claude', 'gemini', 'ai', '人工智能'],
  ['netflix', '奈飞', '网飞', '流媒体', '解锁', 'disney', 'youtube', '油管'],
  ['便宜', '低价', '性价比', '省钱', '实惠'],
  ['稳定', '不掉线', '断流', '掉线'],
  ['延迟', 'ping', '测速', '速度', '丢包', '高速'],
  ['流量', 'gb', '用量', '够用'],
  ['按量', '不限时', '按流量', '一次性'],
  ['订阅', '导入', '订阅链接', '更新订阅', '导入失败'],
  ['安卓', 'android', 'v2rayng', '手机'],
  ['苹果', 'ios', 'mac', 'macos', 'iphone', 'ipad'],
  ['电脑', 'windows', 'win', 'pc'],
  ['安全', '隐私', '法律', '风险', '合法'],
  ['灵动云', 'lingdongyun', '灵动'],
  ['暮光加速', 'muguang', '暮光'],
  ['飞猫云', 'feimaoyun', '飞猫'],
  ['大佬云', 'dalaoyun', '大佬'],
  ['微风网络', 'breezenet', 'breeze', '微风'],
];

export function normalize(s: string) {
  return s.toLowerCase().replace(/[\s　，。、！？：；“”‘’（）()【】\[\],.!?:;"'|/\\-]+/g, ' ').trim();
}

export function expandQuery(q: string): { terms: string[]; expanded: string[] } {
  const nq = normalize(q);
  const raw = nq.split(' ').filter(Boolean);
  // 去掉常见疑问后缀，额外生成核心词：“大佬云怎么样” → “大佬云”
  const STRIP = /(怎么样|好用吗|好不好|靠谱吗|官网|多少钱|价格|测评|评测|推荐|教程|怎么用)$/;
  const terms = [...new Set(raw.flatMap((t) => { const c = t.replace(STRIP, ''); return c && c !== t && c.length >= 2 ? [t, c] : [t]; }))];
  const expanded = new Set<string>();
  for (const group of SYNONYMS) {
    if (group.some((g) => nq.includes(g) || terms.some((t) => t.length >= 2 && g.includes(t)))) {
      group.forEach((g) => expanded.add(g));
    }
  }
  terms.forEach((t) => expanded.delete(t));
  return { terms, expanded: [...expanded] };
}

function bigrams(s: string) {
  const out: string[] = [];
  const clean = s.replace(/\s+/g, '');
  for (let i = 0; i < clean.length - 1; i++) out.push(clean.slice(i, i + 2));
  return out;
}

export function score(doc: SearchDoc, terms: string[], expanded: string[]) {
  const t = doc.t.toLowerCase();
  const d = doc.d.toLowerCase();
  const k = doc.k.toLowerCase();
  const b = doc.b.toLowerCase();
  let s = 0;
  let matchedPrimary = 0;
  for (const term of terms) {
    let hit = false;
    if (t.includes(term)) { s += 30; hit = true; }
    if (k.includes(term)) { s += 18; hit = true; }
    if (d.includes(term)) { s += 10; hit = true; }
    if (b.includes(term)) {
      hit = true;
      let n = 0, i = -1;
      while ((i = b.indexOf(term, i + 1)) !== -1 && n < 8) n++;
      s += 3 + n;
    }
    // 中文长词拆成二元组模糊匹配（如“订阅导入失败怎么办”）
    if (!hit && /[一-龥]{3,}/.test(term)) {
      const grams = bigrams(term);
      const found = grams.filter((g) => t.includes(g) || k.includes(g) || b.includes(g)).length;
      if (found) { s += (found / grams.length) * 12; if (found / grams.length >= 0.5) hit = true; }
    }
    if (hit) matchedPrimary++;
  }
  for (const e of expanded) {
    if (t.includes(e)) s += 6;
    else if (k.includes(e)) s += 4;
    else if (b.includes(e)) s += 1;
  }
  if (terms.length && matchedPrimary === 0) s *= 0.35; // 只靠关联词命中的结果降权
  return s;
}

export function search(docs: SearchDoc[], q: string, limit = 12) {
  const { terms, expanded } = expandQuery(q);
  if (!terms.length) return [];
  return docs
    .map((doc) => ({ doc, s: score(doc, terms, expanded) }))
    .filter((r) => r.s > 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((r) => ({ ...r.doc, score: r.s, snippet: makeSnippet(r.doc, [...terms, ...expanded]) }));
}

export function makeSnippet(doc: SearchDoc, words: string[]) {
  const b = doc.b;
  const lower = b.toLowerCase();
  let pos = -1;
  for (const w of words) {
    pos = lower.indexOf(w);
    if (pos >= 0) break;
  }
  if (pos < 0) return doc.d;
  const start = Math.max(0, pos - 30);
  return (start > 0 ? '…' : '') + b.slice(start, start + 110) + '…';
}
