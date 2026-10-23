# Cloudflare Pages 部署指南

网站是纯静态输出（`dist/`），所有页面在构建时预渲染为 HTML，Bingbot 无需执行 JavaScript 即可读取正文。

## 方式 A（推荐）：GitHub Actions 直接上传

这种方式能在部署前后自动计算并提交 IndexNow 变更。

1. 把项目推送到 GitHub 仓库（例如 `vpntizi-blog`），默认分支 `main`。
2. Cloudflare 控制台 → Workers & Pages → 创建 → Pages → **直接上传**，项目名填 `vpntizi-blog`（随便传一个空文件夹完成创建即可）。
3. Cloudflare → 我的个人资料 → API 令牌 → 创建令牌，模板选 **Edit Cloudflare Workers**（或自定义：Account → Cloudflare Pages → Edit）。
4. GitHub 仓库 → Settings → Secrets and variables → Actions，添加：
   - `CLOUDFLARE_API_TOKEN`：上一步的令牌
   - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 控制台右侧栏的账户 ID
5. 推送任意提交到 `main`，`.github/workflows/deploy.yml` 会自动执行：数据校验 → 构建 → SEO 检查 → 搜索测试 → IndexNow 差异 → 部署 → 通知 IndexNow。

## 方式 B：Cloudflare Git 集成

Pages → 连接到 Git → 选择仓库，构建设置：

| 项 | 值 |
|---|---|
| 框架预设 | Astro |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| 环境变量 | `NODE_VERSION` = `22` |

这种方式不会自动提交 IndexNow，需要部署后在本地运行 `npm run indexnow:all` 或 `npm run build && npm run indexnow:diff && npm run indexnow:submit`（diff 需要在新版本上线**之前**运行）。

## 绑定域名

1. Pages 项目 → 自定义域 → 添加 `vpntizi.blog`，再添加 `www.vpntizi.blog`。
2. 域名 DNS 在 Cloudflare 时会自动创建记录。
3. **www 跳转到根域名**：Cloudflare → 规则 → Redirect Rules → 新建规则：
   - 条件：主机名 等于 `www.vpntizi.blog`
   - 动作：动态重定向，表达式 `concat("https://vpntizi.blog", http.request.uri.path)`，状态码 301，保留查询字符串。
4. SSL/TLS → 边缘证书 → 打开“始终使用 HTTPS”。

`*.pages.dev` 预览域名已通过 `public/_headers` 发送 `X-Robots-Tag: noindex`，所有页面的 canonical 也指向正式域名，避免重复收录。

## 上线前检查

```bash
npm ci
npm run prelaunch        # 严格数据校验 + 构建 + SEO 检查 + 搜索测试
npm run test:browser     # 需要本机 Chromium，可选
```

`prelaunch` 在 34 家资料或 AFF 链接未填齐时会**失败**，这是故意的。

## 首次上线后

1. 浏览器打开 `https://vpntizi.blog/<IndexNow密钥>.txt`，确认能看到密钥（密钥在仓库根目录 `.indexnow-key`）。
2. 运行 `npm run build && npm run indexnow:all` 提交全部 URL（Actions 首次部署也会自动视为全部新增）。
3. 按 `docs/BING-WEBMASTER.md` 完成 Bing 验证与 sitemap 提交。

## 常用文件

| 文件 | 作用 |
|---|---|
| `public/_headers` | 安全头、缓存、预览域名 noindex |
| `public/_redirects` | 站内 301 跳转（改网址时在这里加旧→新） |
| `public/robots.txt` | 抓取规则与 sitemap 声明 |
| `public/<key>.txt` | IndexNow 密钥验证文件 |
