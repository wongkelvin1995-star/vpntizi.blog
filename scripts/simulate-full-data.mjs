#!/usr/bin/env node
/**
 * 用示例数据模拟“34 条 AFF 链接 + 已核实套餐”的完整状态，构建并跑全部检查，结束后恢复原数据。
 * 仅用于验证功能，示例链接为 example.com，不会写入正式数据。
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const F = 'src/data/airports.json';
copyFileSync(F, F + '.bak');
let code = 0;
try {
  const d = JSON.parse(readFileSync(F, 'utf8'));
  d.airports.forEach((a) => {
    a.affUrl = `https://example.com/aff/${a.id}?code=TEST${a.rank}`;
    if (a.status === 'placeholder') { a.name = `示例品牌${a.rank}`; a.status = 'pending'; }
  });
  Object.assign(d.airports[0], {
    status: 'verified', verifiedAt: '2026-10-20', lineTypes: ['示例线路'],
    sources: [{ label: '示例来源', url: 'https://example.com/pricing' }],
    plans: [
      { name: '示例月付', billing: 'month', priceCNY: 25, trafficGB: 200, trafficPeriod: 'month' },
      { name: '示例年付', billing: 'year', priceCNY: 199, trafficGB: 150, trafficPeriod: 'month' },
    ],
  });
  writeFileSync(F, JSON.stringify(d, null, 2));
  execSync('node scripts/check-data.mjs --strict && npm run build && node scripts/seo-audit.mjs', { stdio: 'inherit' });
  const html = readFileSync('dist/jichang/lingdongyun/index.html', 'utf8');
  const need = ['¥25.00', '¥199.00', '¥16.58', '¥0.125', '¥0.111', '1800 GB'];
  const miss = need.filter((n) => !html.includes(n));
  console.log(miss.length ? `✗ 套餐表缺少：${miss.join(' ')}` : '✓ 套餐表正确显示实际付款、折合月价、周期流量与每GB价格');
  if (miss.length) code = 1;
} catch { code = 1; }
finally {
  copyFileSync(F + '.bak', F);
  execSync(`rm -f ${F}.bak`);
  execSync('npm run build', { stdio: 'ignore' });
  console.log('已恢复正式数据并重新构建');
}
process.exit(code);
