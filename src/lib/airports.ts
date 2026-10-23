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
export const PICK_IDS = ['tiziyun', 'feiv', 'yinxingren', 'wuyou', 'feiwei', 'weituyun', 'lingmao'] as const;
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
