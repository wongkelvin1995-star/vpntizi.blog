import raw from '../data/airports.json';

export type Billing = 'month' | 'quarter' | 'halfyear' | 'year' | 'payg' | 'onetime';

export interface Plan {
  /** 官网套餐名称 */
  name: string;
  billing: Billing;
  /** 实际付款金额（人民币），即一次性要付的钱 */
  priceCNY: number;
  /** 套餐流量 GB；null = 官网写不限量或未写明 */
  trafficGB: number | null;
  /** month = 每月重置；cycle = 整个付费周期共用；total = 不重置/用完为止 */
  trafficPeriod: 'month' | 'cycle' | 'total';
  deviceLimit?: string;
  note?: string;
  /** 订阅详情：4–5 条要点，只写在每个套餐系列的第一行（月付行 / 年付行 / 流量包行） */
  details?: string[];
}

export interface Source {
  label: string;
  url: string;
}

export interface Airport {
  id: string;
  rank: number;
  name: string;
  nameEn: string;
  aliases: string[];
  status: 'verified' | 'pending' | 'placeholder';
  /** official = 官网核实；third-party = 按公开资料整理（未在官网逐项复核）；none = 暂无资料 */
  sourceType?: 'official' | 'third-party' | 'none';
  /** 公开资料的整理日期 */
  collectedAt?: string | null;
  affUrl: string;
  officialSite: string;
  intro: string;
  plans: Plan[];
  regions: string[];
  lineTypes: string[];
  protocols: string[];
  clients: string[];
  aiCompat: string;
  streamingCompat: string;
  suitableFor: string[];
  notSuitableFor: string[];
  limits: string[];
  sources: Source[];
  verifiedAt: string | null;
  /** 合作优惠码（站长提供）；null 或缺省 = 不显示 */
  promoCode?: string | null;
  /** 资料说明里的补充一句（例如套餐数据来自截图） */
  sourceNote?: string;
}

const data = raw as unknown as { lastReviewed: string; airports: Airport[] };

export const LAST_REVIEWED = data.lastReviewed;

export const FIXED_TOP = ['灵动云', '暮光加速', '微风网络 Breezenet', '飞猫云', '大佬云'];

/** 全部 34 家，按 rank 排序 */
export const airports: Airport[] = [...data.airports].sort((a, b) => a.rank - b.rank);

/** 推荐类文章重点介绍的前四家 */
export const topFour = airports.slice(0, 4);
export const topFive = airports.slice(0, 5);
/** 站长指定的精选机场（第五推荐之后展示，按此顺序） */
export const PICK_IDS = ['yinxingren', 'feiv', 'tiziyun', 'wuyou', 'feiwei', 'weituyun', 'lingmao'] as const;
export const featuredPicks = PICK_IDS.map((id) => {
  const a = airports.find((x) => x.id === id);
  if (!a) throw new Error(`精选机场不存在：${id}`);
  return a;
});

/** 有正式名称的品牌（会生成独立资料页） */
export const namedAirports = airports.filter((a) => a.status !== 'placeholder');

export const BILLING_LABEL: Record<Billing, string> = {
  month: '月付',
  quarter: '季付',
  halfyear: '半年付',
  year: '年付',
  payg: '按量计费',
  onetime: '一次性',
};

const MONTHS: Partial<Record<Billing, number>> = { month: 1, quarter: 3, halfyear: 6, year: 12 };

/** 折合月价（只对周期套餐有意义） */
export function monthlyEquivalent(p: Plan): number | null {
  const m = MONTHS[p.billing];
  return m ? p.priceCNY / m : null;
}

/** 本周期可用总流量 */
export function cycleTrafficGB(p: Plan): number | null {
  if (p.trafficGB == null) return null;
  const m = MONTHS[p.billing] ?? 1;
  return p.trafficPeriod === 'month' ? p.trafficGB * m : p.trafficGB;
}

/** 每 GB 价格 */
export function pricePerGB(p: Plan): number | null {
  const t = cycleTrafficGB(p);
  return t ? p.priceCNY / t : null;
}

export const fmtCNY = (n: number | null, digits = 2) => (n == null ? '待核实' : `¥${n.toFixed(digits)}`);

export function hasAff(a: Airport) {
  return /^https?:\/\//.test(a.affUrl);
}

export const PENDING = '待核实';

export function statusLabel(a: Airport) {
  if (a.status === 'verified') return `官网已核实 ${a.verifiedAt}`;
  if (a.status === 'placeholder') return '资料待录入';
  if (a.sourceType === 'third-party') return `资料整理于 ${a.collectedAt}`;
  return '资料核实中';
}

/** 品牌简称（去掉英文名与括号说明），用于标题与 FAQ */
export function shortName(a: Airport) {
  return a.name.split(/[\s（(]/)[0];
}

/** 由套餐计算的要点，供资料页摘要、FAQ 与对比表使用 */
export function summarize(a: Airport) {
  const cycle = a.plans.filter((p) => p.billing !== 'payg' && p.billing !== 'onetime');
  const monthly = cycle.filter((p) => p.billing === 'month').sort((x, y) => x.priceCNY - y.priceCNY)[0] ?? null;
  const yearly = cycle.filter((p) => p.billing === 'year').sort((x, y) => x.priceCNY - y.priceCNY)[0] ?? null;
  const lowestMonthly = [...cycle].sort((x, y) => monthlyEquivalent(x)! - monthlyEquivalent(y)!)[0] ?? null;
  const withGB = a.plans.filter((p) => pricePerGB(p) != null && !/定制|独享|企业|Enterprise/.test(p.name));
  const bestPerGB = [...withGB].sort((x, y) => pricePerGB(x)! - pricePerGB(y)!)[0] ?? null;
  const payg = a.plans.filter((p) => p.billing === 'payg').sort((x, y) => x.priceCNY - y.priceCNY);
  const paygBest = [...payg].filter((p) => pricePerGB(p) != null).sort((x, y) => pricePerGB(x)! - pricePerGB(y)!)[0] ?? null;
  const maxGB = Math.max(0, ...a.plans.filter((p) => !/定制|独享|企业|Enterprise/.test(p.name)).map((p) => p.trafficGB ?? 0));
  const ORDER: Billing[] = ['month', 'quarter', 'halfyear', 'year', 'payg', 'onetime'];
  const billings = ORDER.filter((b) => a.plans.some((p) => p.billing === b)).map((b) => BILLING_LABEL[b]);
  return { monthly, yearly, lowestMonthly, bestPerGB, payg, paygBest, maxGB, billings, hasPlans: a.plans.length > 0 };
}

export function airportUrl(a: Airport) {
  return `/jichang/${a.id}/`;
}

const gbText = (n: number | null) => (n == null ? '不限量' : n >= 1000 ? `${+(n / 1000).toFixed(2)}TB` : `${n}GB`);
/** 价格：整数不带小数，其余最多两位（15.5 → ¥15.5，7.4167 → ¥7.42） */
const yuan = (n: number) => `¥${Number.isInteger(n) ? n : +n.toFixed(2)}`;
const TAILS = [
  { w: 3, t: '列出实付价、折合月价、每GB成本、流量规则与购买限制' },
  { w: 2, t: '列出实付价、折合月价与每GB成本' },
  { w: 1, t: '含折合月价与每GB成本' },
];

/**
 * 机场资料页的 meta description：每页由数据生成，目标 120–140 字（Bing 提示“描述过短”）。
 * 价格与线路放最前面；其余片段按权重取舍，只做整段组合，不在句中截断。
 * 数据（价格、地区、日期）变化后，下次构建会自动重新计算；只写资料里有的内容。
 */
export function metaDescription(a: Airport): string {
  const sn = shortName(a);
  const S = summarize(a);
  if (!S.hasPlans) {
    return `${sn}机场资料页：整理${sn}的官网注册入口、套餐价格与折合月价、节点地区、线路类型、客户端兼容、AI 与流媒体情况和购买限制，暂未取得可靠资料的项目统一标注“待核实”，不虚构数据，取得官网信息后补充并注明日期与来源，注册前请以官网实时信息为准。`;
  }
  const price = [
    S.monthly && `月付 ${yuan(S.monthly.priceCNY)} 起（${gbText(S.monthly.trafficGB)}/月）`,
    S.yearly && `年付 ${yuan(S.yearly.priceCNY)} 起`,
  ].filter(Boolean) as string[];
  const line = (a.lineTypes[0] ?? '').replace(/（.*?）/g, '');
  const lowEq = S.lowestMonthly ? monthlyEquivalent(S.lowestMonthly) : null;
  const cycles = (['month', 'quarter', 'halfyear', 'year'] as Billing[]).filter((b) => a.plans.some((p) => p.billing === b)).map((b) => BILLING_LABEL[b]);
  const regionOpen = a.regions.some((r) => /未列出|未列明|未注明/.test(r));
  const regionOk = a.regions.length > 0 && a.regions.every((r) => r.length <= 6);
  const protocols = a.protocols.filter((x) => x.length <= 14 && !/未公布|未列出/.test(x)).slice(0, 3).map((x) => x.replace(/（.*?）/g, ''));

  // 可选片段：k = 标记，w = 权重（越大越优先保留）
  type Seg = { k: string; w: number; t: string };
  const segs = [
    lowEq != null && (!S.monthly || lowEq < S.monthly.priceCNY - 0.005) ? { k: 'L', w: 4, t: `折合月价最低 ${fmtCNY(lowEq, 2)}` } : null,
    regionOpen
      ? { k: 'N', w: 1, t: '官网未列明具体节点地区' }
      : regionOk
        ? { k: 'R', w: 3, t: a.regions.length > 4 ? `节点覆盖${a.regions.slice(0, 4).join('、')}等 ${a.regions.length} 个地区` : `节点覆盖${a.regions.join('、')}` }
        : null,
    cycles.length ? { k: 'B', w: 2, t: `提供${cycles.join('、')}套餐` } : null,
    S.payg.length ? { k: 'G', w: 3, t: `另有不限时流量包 ${yuan(S.payg[0].priceCNY)} 起` } : null,
    { k: 'C', w: 1, t: `共收录 ${a.plans.length} 条套餐价格` },
    protocols.length ? { k: 'P', w: 1, t: `支持 ${protocols.join('、')} 协议` } : null,
  ].filter((x): x is Seg => x != null);

  const cands: { text: string; len: number; score: number }[] = [];
  for (let mask = 0; mask < 1 << segs.length; mask++) {
    const picked = segs.filter((_, i) => mask & (1 << i));
    const low = picked.filter((s) => s.k === 'L').map((s) => s.t);
    const rest = picked.filter((s) => s.k !== 'L').map((s) => s.t);
    const first = [...price, ...low, line, ...rest].filter(Boolean).join('，');
    for (const tail of TAILS) {
      const text = `${sn}怎么样？${first}。${statusLabel(a)}，${tail.t}。`;
      cands.push({ text, len: text.length, score: picked.reduce((n, s) => n + s.w, 0) + tail.w });
    }
  }
  // 先找 122–138 字，再放宽到 120–140、100–158；都没有时取不超过 158 的最长一条
  const pool =
    [[122, 138], [120, 140], [100, 158]].map(([lo, hi]) => cands.filter((c) => c.len >= lo && c.len <= hi)).find((p) => p.length) ??
    [...cands].filter((c) => c.len <= 158).sort((x, y) => y.len - x.len).slice(0, 1);
  const best = [...(pool.length ? pool : cands)].sort((x, y) => y.score - x.score || Math.abs(x.len - 130) - Math.abs(y.len - 130))[0];
  return best.text;
}
