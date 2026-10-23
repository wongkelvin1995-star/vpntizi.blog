---
title: "Shadowrocket机场推荐：小火箭订阅怎么选"
h1: "Shadowrocket 机场推荐：iPhone 用户怎么挑机场"
description: "Shadowrocket（小火箭）机场推荐：iPhone 用户如何确认机场支持小火箭订阅、协议兼容性、按需连接与规则配置，以及外区 Apple ID 下载与耗电问题。"
summary:
  - "小火箭需要非中国大陆区 Apple ID 购买下载。"
  - "选机场看是否提供小火箭订阅或一键导入，以及移动网络下的表现。"
  - "不想买小火箭，可以用免费的 sing-box（SFI）或 Karing。"
category: recommend
showTopFour: true
keywords: ["Shadowrocket 机场推荐"]
aliases: ["shadowrocket", "小火箭", "火箭", "ios", "iphone", "ipad", "苹果", "外区"]
published: 2026-10-20
updated: 2026-10-23
related: ["shadowrocket-jiaocheng", "sing-box-jiaocheng", "dingyue-daoru-wenti"]
faq:
  - q: "Shadowrocket 可以用 Clash 订阅吗？"
    a: "Shadowrocket 能识别多种格式，但兼容性最好的是机场提供的通用订阅或 Shadowrocket 专用订阅。"
  - q: "国区 App Store 能下载小火箭吗？"
    a: "不能，需要使用非中国大陆地区的 Apple ID 购买下载。请使用自己注册的外区账号，不要登录他人共享账号的 iCloud。"
  - q: "小火箭很耗电吗？"
    a: "代理类 App 会持续运行网络扩展，耗电会有所增加。使用规则模式、关闭不必要的全局代理，可以减少耗电。"
---
Shadowrocket（俗称“小火箭”）是 iPhone 和 iPad 上最常用的代理客户端之一。它是一次性付费的 App，需要非中国大陆区 Apple ID 下载，下载与设置方法见 [Shadowrocket 教程](/shadowrocket-jiaocheng/)。

## iPhone 用户选机场看四点

**1. 是否提供小火箭可用的订阅**

用户中心通常有“Shadowrocket 订阅”或“通用订阅”按钮，有的还支持一键导入（点击后自动打开小火箭）。

**2. 协议兼容性**

小火箭支持的协议较全，包括 Shadowsocks、VMess、VLESS、Trojan、Hysteria2 等。机场使用的协议若较新，需要把 App 更新到最新版本。

**3. 设备数**

手机、iPad、电脑同时使用时要看套餐允许的设备数。

**4. 移动网络表现**

手机常在 4G/5G 与 Wi-Fi 之间切换，节点重连是否快速、在移动网络下是否稳定，比电脑端更重要。试用期间请分别在两种网络下测试。

## 一键导入是怎么回事

很多机场的“导入到 Shadowrocket”按钮，本质上是一个以 shadowrocket:// 开头的链接，里面包含了你的订阅地址。点击后系统会唤起小火箭并自动添加。它的好处是避免手动复制出错；需要注意的是：

- 只在机场官方用户中心使用一键导入，不要点击来路不明的同类链接；
- 不要把一键导入链接转发给别人，它和订阅链接一样等于账号凭证。

## 家庭多设备怎么安排

一份订阅可以导入多台设备，但要遵守套餐的设备数限制：

| 场景 | 建议 |
|---|---|
| 自己的 iPhone + iPad | 同一外区 Apple ID 下载一次即可，两台都导入订阅 |
| 家人也要用 | 确认设备数足够；不要把自己的外区账号借给家人登录 iCloud |
| 设备数超限 | 部分机场会限制在线 IP 数，超出时会断线或封禁订阅 |

## 本站重点推荐的四家：iPhone 使用情况

上方四家是本站重点推荐展示的机场。和 iPhone 相关的资料：

- **飞猫云**：通用订阅可直接导入 Shadowrocket 和 Stash，也有自研客户端；
- **灵动云**：有自家客户端（以下载页列出的系统为准），用小火箭需要联系客服获取通用订阅；
- **暮光加速**：通用订阅，VLESS 与 Shadowsocks 协议，小火箭都支持；
- **微风网络**：据公开资料，2026 年 10 月起新订单只能用官方专属客户端，不再提供订阅链接，**新订单不能导入小火箭**，要用官方 App；iPhone 能否安装以官网为准。已有订阅链接的老用户不受影响。

下方表格列出了 34 家中在资料里列出 Shadowrocket 的机场；也有不少机场（如浪网、跨界云、极连云）提供 iOS 官方客户端。

## 小火箭的推荐设置

1. **全局路由选“配置”**：按规则分流，国内直连；
2. **开启“按需连接”**时注意规则，避免频繁断开；
3. **订阅设置“打开时更新”**，节点变化时自动同步；
4. **AI 与流媒体固定节点**：不要依赖自动选择，见 [ChatGPT 机场推荐](/chatgpt-jichang-tuijian/)。

## 备选客户端

不想购买小火箭，或需要更灵活的配置，可以考虑 [sing-box（SFI）](/sing-box-jiaocheng/) 或 [Karing](/hiddify-karing-jiaocheng/)，两者都可在外区 App Store 免费下载。导入出错时先看 [订阅导入失败的原因](/dingyue-daoru-wenti/)。
