import type { APIRoute } from 'astro';
import { getArticles, articleUrl, CATEGORY, toPlain } from '../lib/content';
import { airports, airportUrl } from '../lib/airports';
import { TOOLS } from '../data/tools';
import type { SearchDoc } from '../lib/search-core';

export const GET: APIRoute = async () => {
  const docs: SearchDoc[] = [];
  for (const a of await getArticles()) {
    docs.push({ u: articleUrl(a), t: a.data.h1, d: a.data.description, k: [...a.data.keywords, ...a.data.aliases, a.data.title].join(' '), b: toPlain(a.body ?? '') + ' ' + a.data.faq.map((f) => f.q + ' ' + f.a).join(' '), c: CATEGORY[a.data.category].label });
  }
  for (const a of airports.filter((x) => x.status !== 'placeholder')) {
    const sn = a.name.split(/[\s（(]/)[0];
    docs.push({ u: airportUrl(a), t: `${a.name}怎么样？套餐价格与注册入口`, d: `${a.name}套餐价格、节点、线路与注册入口（推荐位 #${a.rank}）`, k: [a.name, a.nameEn, ...a.aliases, `${sn}怎么样`, `${sn}官网`, `${sn}机场`, `${sn}价格`, '机场', '套餐'].join(' '), b: [a.intro, ...a.regions, ...a.lineTypes, ...a.protocols, ...a.clients, a.aiCompat, a.streamingCompat].join(' '), c: '机场资料' });
  }
  for (const t of TOOLS) docs.push({ u: t.href, t: t.name, d: t.desc, k: t.aliases, b: t.desc, c: '工具' });
  docs.push(
    { u: '/jichang-tuijian/', t: '2026 机场推荐总览', d: '按稳定、便宜、专线、AI、流媒体等需求挑选机场', k: '机场推荐 2026 机场 推荐 梯子 选购', b: '本站重点推荐灵动云 暮光加速 微风网络 Breezenet 飞猫云 大佬云 新手选机场五个步骤', c: '机场推荐' },
    { u: '/jichang-paihangbang/', t: '机场排行榜完整名单', d: '34 家机场完整名单与资料状态', k: '机场排行榜 排名 榜单 名单 全部机场', b: '完整榜单 推荐展示顺序 前五固定', c: '机场推荐' },
    { u: '/jiaocheng/', t: '客户端教程合集', d: '按设备找到合适的客户端', k: '教程 客户端 软件 下载 windows mac android ios', b: 'Clash Verge Rev ClashParty Shadowrocket v2rayN v2rayNG sing-box Hiddify Karing', c: '教程' },
  );
  return new Response(JSON.stringify(docs), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
