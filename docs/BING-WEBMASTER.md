# Bing Webmaster Tools 验证与提交指南

> 四个状态要分开看：**IndexNow 已通知** → **Bing 已抓取** → **Bing 已收录** → **有搜索展示/排名**。前一步成功不代表后一步成功。

## 1. 添加网站并验证所有权

打开 https://www.bing.com/webmasters ，用微软账号登录，任选一种方式：

**方式 A：从 Google Search Console 导入（最快）**
如果已在 GSC 验证过 `vpntizi.blog`，选择“从 GSC 导入”，授权后网站与 sitemap 一并导入。

**方式 B：Meta 标签**
1. 手动添加网站 `https://vpntizi.blog/`，选择 “HTML Meta 标签”。
2. 复制 `content="..."` 中的值，填到 `src/data/site.ts` 的 `bingVerification`。
3. 推送部署，回到 Bing 点击“验证”。

**方式 C：XML 文件**
下载 `BingSiteAuth.xml`，放入 `public/` 目录后部署，再点击验证。

**方式 D：DNS（域名在 Cloudflare 时很方便）**
按 Bing 提示在 Cloudflare DNS 添加一条 CNAME 记录。

## 2. 提交 Sitemap

Bing Webmaster → Sitemaps → 提交 `https://vpntizi.blog/sitemap-index.xml`。
（robots.txt 已声明 sitemap，提交后可以更快被发现。）

状态显示“成功”后，记录“已发现 URL 数”，应接近 `npm run check:seo` 输出的 sitemap 数量。

## 3. 确认 IndexNow

1. 浏览器访问 `https://vpntizi.blog/<密钥>.txt`（密钥见 `.indexnow-key`），确认内容就是密钥本身。
2. 运行 `npm run indexnow:all`，期望看到 `HTTP 200` 或 `HTTP 202`。
3. 一到两天后，Bing Webmaster → IndexNow 页面可以看到提交记录。

`HTTP 403/422` 通常是密钥文件不可访问或域名不匹配；`429` 是提交过于频繁。

## 4. 检查抓取与收录

- **URL 检查**：输入任意页面网址，查看“已发现 / 已抓取 / 已编入索引”以及 Bing 看到的 HTML。重点确认能看到正文与 H1。
- **网站资源管理器**：查看各目录收录数量，比较与 sitemap 的差距。
- **站点扫描（Site Scan）**：每月跑一次，检查标题、描述、死链、重复内容。
- **API 自动化**：BWT → 设置 → API 访问 → 生成 Key 后：
  ```bash
  npm run build
  BING_API_KEY=你的key npm run bing:status    # 每个 URL 的抓取/收录信息
  BING_API_KEY=你的key npm run bing:queries   # 搜索词展示、点击、平均排名
  ```

## 5. 排名与流量

Bing Webmaster → 搜索性能：按“关键词”与“页面”查看展示、点击、CTR、平均位置。对照 `src/data/keywords.ts`：

- 某关键词的展示落在了**非目标页面** → 说明存在内部竞争，强化目标页、弱化其他页面相关表述，并从其他页面内链到目标页。
- 展示高但 CTR 低 → 优化该页 title 与 description。
- 平均位置 8–20 → 最值得优化的“临门一脚”关键词。

## 6. 常见问题

| 现象 | 可能原因 | 处理 |
|---|---|---|
| 已提交但长期未收录 | 新站信任度低、内容相似度高 | 持续更新原创内容，争取外部链接，耐心等待 |
| 被抓取但未编入索引 | 内容质量或重复 | 检查是否与其他页面高度相似 |
| 收录了 pages.dev 域名 | 预览域名被发现 | `_headers` 已设 noindex，在 BWT 中使用“阻止 URL”加速移除 |
| 推荐页排名下降 | 资料过期 | 按 90 天计划复核并更新 `updated` 日期 |

## 7. Cloudflare 设置（避免误拦 Bingbot）

- 安全性 → 自动程序：**不要开启“Bot Fight Mode”**，或确认“已验证的自动程序”（Verified Bots）为允许。Bingbot 属于已验证自动程序。
- 安全性 → WAF：不要对整站开“质询（Challenge）”；如需防护，排除 `cf.client.bot`。
- “AI 爬虫控制 / 托管 robots.txt”只影响 AI 爬虫，但开启后会改写 robots.txt，上线后访问 `https://vpntizi.blog/robots.txt` 确认 Sitemap 行仍在。
- 上线后在 BWT 的“URL 检查 → 实时测试”中确认 Bingbot 拿到的是 HTTP 200 和完整 HTML。

## 8. 关于国内版必应（cn.bing.com）

- 国内版必应与国际版共用 Bing 的抓取和索引，**在 Bing Webmaster Tools 提交一次即可**，不需要单独提交。
- 国内版必应在中国境内运营，会按当地法律对搜索结果做合规过滤。翻墙、VPN、机场相关页面在国内版中**可能被过滤、排名受限或完全不显示**，这不是技术优化能解决的问题。
- 本站不会、也不建议用“针对国内版显示不同内容”（伪装 / cloaking）之类的方式绕过：这违反 Bing 网站管理员准则，被发现会导致整站降权或除名。
- 可以做的：让所有页面在中国大陆能快速打开（本站已去掉 Google Fonts 等被墙资源）；保持客户端教程、名词解释、流量估算等知识类内容的中立、准确；用 BWT 的“搜索性能”按国家/地区查看实际展示，以数据为准调整。
