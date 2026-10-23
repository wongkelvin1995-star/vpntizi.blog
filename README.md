# vpntizi.blog — VPN梯子指南

Astro 7 + TypeScript + Markdown 静态站点，部署在 Cloudflare Pages，针对 Bing（兼顾 Google）做了技术 SEO。

## 快速开始

```bash
npm ci
npm run dev          # 本地开发 http://localhost:4321
npm test             # 数据校验 + 构建 + SEO 检查 + 搜索测试
npm run prelaunch    # 上线前严格检查（34 家资料与 AFF 必须填齐）
```

## 目录

| 路径 | 内容 |
|---|---|
| `src/data/airports.json` | 34 家机场资料（录入说明见 `docs/DATA-ENTRY.md`） |
| `src/data/changelog.ts` | 资料核验与更新记录 |
| `src/data/keywords.ts` | 关键词 → 唯一主页面映射 |
| `src/data/site.ts` | 站点名称、Telegram、验证码、推广声明 |
| `src/content/articles/` | 24 篇原创文章（Markdown） |
| `src/pages/tools/` | 5 个实用工具 |
| `scripts/` | 数据校验、SEO 审计、搜索测试、浏览器测试、IndexNow、Bing 状态 |
| `docs/` | 部署、Bing、检查清单、90 天计划、关键词表、进度 |

## 脚本

| 命令 | 作用 |
|---|---|
| `npm run check:data` / `check:data:strict` | 34 家、前五顺序、AFF 唯一、套餐字段 |
| `npm run check:seo` | title/description/H1/canonical、noindex、死链、sitemap、robots、IndexNow、关键词竞争、字数、FAQ、入口 |
| `npm run test:search` | 中文搜索 22 个回归用例 |
| `npm run test:browser` | Chromium 移动端与交互测试 |
| `npm run test:full-data` | 用示例数据模拟 34 条 AFF + 已核实套餐，验证后自动还原 |
| `npm run indexnow:diff` / `indexnow:submit` / `indexnow:all` | IndexNow 新增 / 更新 / 删除通知 |
| `npm run bing:status` / `bing:queries` | Bing 收录与搜索词（需 `BING_API_KEY`） |

文档：`docs/DEPLOY-CLOUDFLARE.md` · `docs/BING-WEBMASTER.md` · `docs/SEO-CHECKLIST.md` · `docs/90-DAY-PLAN.md` · `docs/KEYWORD-MAP.md` · `docs/PROGRESS.md`
