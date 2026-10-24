# Bing SEO 上线检查清单

自动检查：`npm run prelaunch`（严格）或 `npm test`（日常）。✅ = 脚本自动检查；👤 = 需要人工确认。

## 技术基础

- ✅ 所有页面静态预渲染为 HTML，正文、H1、链接不依赖 JavaScript
- ✅ 每页唯一 title、meta description、H1
- ✅ 每页 canonical 指向 `https://vpntizi.blog/...`，统一结尾斜杠
- ✅ 除 `/search/`、`/404/` 外无 noindex
- ✅ sitemap.xml 直接列出全部可索引页面（不含 noindex 页面、不被跳转）；旧地址 sitemap-index.xml 保留且内容一致
- ✅ robots.txt 允许抓取并声明 sitemap
- ✅ IndexNow 密钥文件存在且内容一致
- ✅ 站内链接无死链，不链接到重定向地址
- ✅ JSON-LD 可解析（WebSite、Organization、BreadcrumbList、BlogPosting、FAQPage、ItemList、CollectionPage、Service）
- ✅ `lang="zh-CN"`、viewport
- 👤 www → 根域名 301（Cloudflare Redirect Rules）
- 👤 HTTP → HTTPS（Cloudflare“始终使用 HTTPS”）
- 👤 访问一个不存在的网址返回 HTTP 404（Pages 会自动使用 404.html）
- 👤 pages.dev 域名返回 `X-Robots-Tag: noindex`（`curl -I https://vpntizi-blog.pages.dev/`）

## 内容与关键词

- ✅ 25 个目标关键词各对应唯一主页面（`src/data/keywords.ts`），目标页 title/H1 含核心词
- ✅ 同一关键词不被两篇文章同时声明
- ✅ 每篇文章正文不超过 2500 汉字
- ✅ FAQ 全部展开（无 `<details>` 折叠）
- 👤 新文章发布前先查关键词表，意图相同就更新旧文章

## 机场推荐系统

- ✅ 34 家完整、无重复，前五顺序固定
- ✅ 推荐类页面前四家重点介绍顺序正确
- ✅ AFF 链接：同一品牌全站一致、不同品牌不混用、`target="_blank" rel="sponsored nofollow noopener"`
- ✅ 已核实套餐在资料页显示价格；未核实显示“待核实”
- 👤 34 条 AFF 链接全部录入（`npm run check:data:strict` 通过）
- 👤 每条 AFF 链接实际点击一次，确认跳到对应品牌

## 功能

- ✅ 中文搜索：22 个回归用例（`npm run test:search`）
- ✅ 浏览器测试：移动端 375px 无横向溢出，搜索弹窗、5 个工具、Telegram 入口（`npm run test:browser`）
- 👤 真机（iPhone Safari、安卓 Chrome）各打开首页和一篇文章

## 性能（Core Web Vitals）

- ✅ 不加载网络字体、无第三方脚本、无大图；CSS 内联或单文件，JS 按页面拆分
- ✅ `_astro/*` 资源一年强缓存
- 👤 上线后用 PageSpeed Insights 测首页和一篇文章，目标 LCP < 2.5s、CLS < 0.1、INP < 200ms

## 上线后（Bing）

- 👤 Bing Webmaster 验证所有权并提交 sitemap
- 👤 `npm run indexnow:all` 返回 200/202
- 👤 URL 检查确认 Bing 能看到正文
- 👤 7 天后查看收录数量；14 天后查看搜索性能
