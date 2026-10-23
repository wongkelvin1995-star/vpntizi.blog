#!/usr/bin/env node
/** 中文站内搜索回归测试：对 dist/search-index.json 运行真实搜索逻辑 */
import { readFileSync } from 'node:fs';
import { search } from '../src/lib/search-core.ts';

const docs = JSON.parse(readFileSync('dist/search-index.json', 'utf8'));
const CASES = [
  ['小火箭', '/shadowrocket-jiaocheng/'],
  ['shadowrocket', '/shadowrocket-'],
  ['Clash Verge', '/clash-verge-jiaocheng/'],
  ['mihomo party', '/clashparty-jiaocheng/'],
  ['订阅导入失败怎么办', '/dingyue-daoru-wenti/'],
  ['IEPL', '/iepl-iplc-qubie/'],
  ['专线', '/zhuanxian-jichang-tuijian/'],
  ['ChatGPT', '/chatgpt-jichang-tuijian/'],
  ['奈飞', '/liumeiti-jiesuo-jichang/'],
  ['便宜', '/pianyi-jichang-tuijian/'],
  ['每GB价格', '/tools/meigb-jiage/'],
  ['流量够用吗', '/'],
  ['灵动云', '/jichang/lingdongyun/'],
  ['breezenet', '/jichang/breezenet/'],
  ['微风', '/jichang/breezenet/'],
  ['翻墙违法吗', '/yinsi-anquan-falv/'],
  ['魔法上网', '/kexue-shangwang-gongju/'],
  ['安卓 v2rayNG', '/v2rayn-v2rayng-jiaocheng/'],
  ['sing-box', '/sing-box-jiaocheng/'],
  ['Karing', '/hiddify-karing-jiaocheng/'],
  ['延迟', '/jichang-yanchi-wendingxing/'],
  ['按量计费', '/anliang-jifei-jichang/'],
  ['免费vpn', '/mianfei-vpn/'],
  ['快连', '/vpn-tuijian/'],
  ['Astrill', '/vpn-tuijian/'],
  ['VPN推荐', '/vpn-tuijian/'],
  ['大佬云怎么样', '/jichang/dalaoyun/'],
  ['机场节点', '/jichang-yanchi-wendingxing/'],
  ['梯子工具', '/kexue-shangwang-gongju/'],
  ['免费梯子', '/mianfei-vpn/'],
  ['性价比机场', '/pianyi-jichang-tuijian/'],
  ['翻墙', '/vpn-tuijian/'],
  ['机场推荐 clash', '/clash-jichang-tuijian/'],
  ['梯子推荐', '/tizi-tuijian/'],
];
let failed = 0;
for (const [q, expect] of CASES) {
  const r = search(docs, q, 5);
  const hit = r.slice(0, 3).some((x) => x.u.startsWith(expect));
  if (!hit) failed++;
  console.log(`${hit ? '✓' : '✗'} “${q}” → ${r.slice(0, 3).map((x) => x.u).join('  ') || '无结果'}`);
}
console.log(`\n搜索测试：${CASES.length - failed}/${CASES.length} 通过`);
process.exit(failed ? 1 : 0);
