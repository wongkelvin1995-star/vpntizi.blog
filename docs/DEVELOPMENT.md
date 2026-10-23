# 开发与部署说明

返回 [README](../README.md)。

Astro 7 + TypeScript + Markdown 纯静态站点，部署在 Cloudflare Pages。技术 SEO：每页独立 title / description / canonical、JSON-LD、sitemap、robots、IndexNow。

## 快速开始

```bash
npm ci
npm run dev          # 本地开发 http://localhost:4321
npm test             # 数据校验 + 构建 + SEO 检查 + 搜索测试 + 链接检查
npm run prelaunch    # 上线前严格检查
```

## 目录

| 路径 | 内容 |
|---|---|
| `src/data/airports.json` | 34 家机场资料（录入说明见 `docs/DATA-ENTRY.md`） |
| `src/data/changelog.ts` | 资料核验与更新记录 |
| `src/data/keywords.ts` | 关键词 → 唯一主页面映射 |
| `src/data/site.ts` | 站点名称、联系方式、验证码、推广声明 |
| `src/content/articles/` | 26 篇原创文章（Markdown） |
| `src/pages/tools/` | 5 个实用工具 |
| `scripts/` | 数据校验、SEO 审计、搜索测试、链接与点击检查、手机检查、IndexNow、Bing 状态 |
| `docs/` | 部署、Bing、检查清单、90 天计划、关键词表 |
| `docs/public-guides/` | 面向读者的 GitHub 导读与网站目录 |

## 脚本

| 命令 | 作用 |
|---|---|
| `npm run check:data` / `check:data:strict` | 34 家、前五顺序、AFF 唯一、套餐字段 |
| `npm run check:seo` | title / description / H1 / canonical、noindex、sitemap、robots、IndexNow、关键词竞争、FAQ |
| `npm run test:search` | 中文搜索 34 个回归用例 |
| `npm run links` | 全站链接与锚点检查 |
| `node scripts/mobile-test.mjs` | 11 种屏幕宽度手机 / 平板检查 |
| `npm run indexnow:diff` / `indexnow:submit` / `indexnow:all` | IndexNow 新增 / 更新 / 删除通知 |
| `npm run bing:status` / `bing:queries` | Bing 收录与搜索词（需 `BING_API_KEY`） |

## 部署

- **当前方式：Cloudflare Pages 的 GitHub 集成。** 推送到 `main` 后 Cloudflare 自动构建（构建命令 `npm run build`，输出目录 `dist`，环境变量 `NODE_VERSION=22`）。
- **GitHub Actions（`.github/workflows/deploy.yml`）**：每次推送都运行数据校验、构建、SEO、搜索和链接检查。仓库没有设置 `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID` 时，跳过重复的 wrangler 部署与 IndexNow 推送；设置后由工作流部署并推送 IndexNow（此时建议关闭 Cloudflare 的 Git 自动部署，避免重复）。
- 详细步骤见 `docs/DEPLOY-CLOUDFLARE.md`、`docs/BING-WEBMASTER.md`。
