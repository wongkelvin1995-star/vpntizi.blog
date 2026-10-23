---
title: "sing-box教程：SFA、SFI、SFM图形客户端入门"
h1: "sing-box 使用教程：SFA / SFI / SFM 入门"
description: "sing-box 新手教程：了解 sing-box 内核与官方图形客户端 SFA（安卓）、SFI（iOS）、SFM（macOS），添加远程配置、启动服务与切换节点，以及配置格式注意事项。"
summary:
  - "sing-box 官方客户端：安卓 SFA、iOS SFI、Mac SFM，免费开源。"
  - "只能导入 sing-box 格式（JSON）的订阅，不能直接用 Clash 订阅。"
  - "机场没有 sing-box 订阅时，改用基于同一内核的 Hiddify 或 Karing。"
category: tutorial
keywords: []
aliases: ["sing-box", "singbox", "sfa", "sfi", "sfm", "json", "内核", "ios", "android", "mac"]
published: 2026-10-20
updated: 2026-10-20
related: ["hiddify-karing-jiaocheng", "shadowrocket-jiaocheng", "dingyue-daoru-wenti"]
faq:
  - q: "sing-box 可以直接导入 Clash 订阅吗？"
    a: "不能直接导入。sing-box 使用自己的 JSON 配置格式，需要机场提供 sing-box 订阅。没有的话，建议改用 Hiddify 或 Karing，它们基于 sing-box 内核但能识别多种订阅。"
  - q: "sing-box 和 Hiddify 是什么关系？"
    a: "Hiddify、Karing 等客户端在内部使用 sing-box 作为内核，并在外面做了订阅转换和更友好的界面。"
  - q: "配置更新后版本不兼容怎么办？"
    a: "sing-box 不同版本之间的配置字段可能有变化。请保持客户端为最新版本，并使用机场针对新版本提供的配置。"
---
sing-box 是一个开源的通用代理平台，支持 Shadowsocks、VMess、VLESS、Trojan、Hysteria2、TUIC 等大量协议，性能和灵活性都很好。很多客户端（如 Hiddify、Karing）其实在内部用的就是 sing-box。

它的官方图形客户端有：

- **SFA**：sing-box for Android
- **SFI**：sing-box for iOS / iPadOS
- **SFM**：sing-box for macOS

## 适合谁

- 机场提供 **sing-box 订阅（JSON）**；
- 想要一个免费、开源、性能好的 iOS 客户端；
- 愿意花一点时间了解配置结构。

如果机场只提供 Clash 或通用订阅，新手更建议使用 [Hiddify 或 Karing](/hiddify-karing-jiaocheng/)。

## 1. 安装

- **SFA**：从项目官方 GitHub Releases 下载 apk，或在 Google Play 安装；
- **SFI / SFM**：在非中国大陆区 App Store 搜索 sing-box 安装；macOS 也可以从 GitHub 下载独立版本。

## 2. 添加远程配置

1. 打开客户端，进入 **Profiles（配置）**；
2. 选择新建，类型选择 **Remote（远程）**；
3. 名称随意，URL 粘贴机场提供的 sing-box 订阅；
4. 可以开启自动更新并设置间隔；
5. 保存后选中该配置。

## 3. 启动

1. 回到 **Dashboard（仪表盘）**，点击启动；
2. 首次启动时系统会请求添加 VPN 配置，选择允许；
3. 如果配置中包含节点选择分组，可在 **Groups（分组）** 中切换节点。

## 4. 配置格式注意事项

- sing-box 的配置是 JSON，不同版本之间的字段可能变化；
- 客户端版本过旧时，新配置可能报“unknown field”之类的错误，升级客户端即可；
- 不要把订阅链接提交到在线转换网站，以免泄露。

## 配置结构速览

了解大致结构，看日志报错时会更容易定位。一个 sing-box 配置通常包含：

| 字段 | 作用 |
|---|---|
| log | 日志级别 |
| dns | DNS 服务器与分流规则 |
| inbounds | 本地入口，如 tun（虚拟网卡）或 mixed（本地代理端口） |
| outbounds | 出口：各个节点、selector（手动选择）、urltest（自动测速）、direct（直连） |
| route | 路由规则：哪些流量直连、哪些走代理 |

如果日志提示某个 outbound 连接失败，说明是节点问题；提示 dns 相关错误，通常是 DNS 配置或网络问题；提示配置字段错误，则是版本不兼容。

## 5. 常见问题

| 现象 | 处理 |
|---|---|
| 导入后无法启动 | 确认是 sing-box 格式配置，客户端为最新版 |
| 启动后无网络 | 查看日志中的报错，检查节点是否可用 |
| 没有节点切换界面 | 配置中没有 selector 分组，需要机场配置支持 |

更多问题见 [订阅导入失败的原因](/dingyue-daoru-wenti/)。iPhone 用户如果更想要简单的一键体验，可以看 [Shadowrocket 教程](/shadowrocket-jiaocheng/)。
