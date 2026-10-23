---
title: "ClashParty教程：安装、导入订阅与常用设置"
h1: "ClashParty 使用教程（原 Mihomo Party）"
description: "ClashParty（原 Mihomo Party）新手教程：官方渠道下载安装、添加机场 Clash 订阅、切换规则模式与节点、开启系统代理和虚拟网卡，以及与 Clash Verge Rev 的区别。"
summary:
  - "ClashParty 就是原来的 Mihomo Party，和 Clash Verge Rev 用同一内核。"
  - "导入 Clash 订阅 → 选规则模式 → 打开系统代理，三步即可上网。"
  - "两款软件不要同时运行，系统代理会互相覆盖。"
category: tutorial
keywords: []
aliases: ["clashparty", "clash party", "mihomo party", "mihomo", "clash", "windows", "mac", "虚拟网卡"]
published: 2026-10-20
updated: 2026-10-20
related: ["clash-verge-jiaocheng", "clash-jichang-tuijian", "dingyue-daoru-wenti"]
faq:
  - q: "ClashParty 和 Mihomo Party 有什么关系？"
    a: "ClashParty 是 Mihomo Party 更名后的名称，同一个项目，同样基于 mihomo 内核。"
  - q: "ClashParty 和 Clash Verge Rev 选哪个？"
    a: "两者内核相同，订阅通用。差别主要在界面和设置组织方式，可以都试一下，选自己顺手的，但不要同时运行。"
  - q: "可以同时导入多个机场订阅吗？"
    a: "可以添加多个订阅，但同一时间通常只启用一个配置。需要合并多个机场时，需要自己编写覆写配置，新手不建议。"
---
ClashParty（原名 Mihomo Party）是另一款基于 mihomo 内核的桌面客户端，支持 Windows、macOS 和 Linux。它的设置集中在侧边栏卡片里，新手上手比较快。由于和 [Clash Verge Rev](/clash-verge-jiaocheng/) 使用同一内核，两者都能直接使用机场的 Clash 订阅。界面文字可能随版本变化。

## 1. 下载与安装

1. 进入项目官方 GitHub 仓库的 Releases 页面，或项目官方网站。
2. 根据系统和芯片架构下载对应安装包（Windows x64 / arm64，macOS Apple 芯片 / Intel）。
3. 安装并启动。macOS 首次打开如被拦截，到“系统设置 → 隐私与安全性”中允许。

## 2. 添加订阅

1. 在机场用户中心复制 **Clash 订阅**链接；
2. 打开 ClashParty，进入“订阅管理”（或“配置”）；
3. 粘贴链接并导入；
4. 点击该订阅，使其成为当前配置。

## 3. 选择模式与节点

1. 在侧边栏或首页选择 **规则** 模式；
2. 进入“代理组”，在主策略组中选择节点或“自动选择”；
3. 可点击测速按钮查看各节点延迟。

## 4. 开启代理

- 打开 **系统代理** 卡片：浏览器等软件即可走代理；
- 需要全局接管时打开 **虚拟网卡（TUN）**，首次使用需要授权或安装服务。

访问一个境外网站确认可用。

## 5. 实用功能

- **订阅自动更新**：在订阅设置里设置更新间隔；
- **覆写**：可在不修改机场原配置的前提下追加规则，例如把某个网站固定走某个节点。新手先用默认配置，熟悉后再尝试；
- **连接与日志**：排查问题时可以查看某个网站走了哪个节点。

## 6. 常见问题

- **导入失败**：确认用的是 Clash 订阅，见 [订阅导入失败的原因](/dingyue-daoru-wenti/)；
- **TUN 开启失败**：按提示安装服务或授予管理员权限；
- **与 Clash Verge Rev 冲突**：两个软件不要同时运行，端口和系统代理会互相覆盖。

更多问题使用 [故障排查助手](/tools/guzhang-paicha/)。选机场可参考 [Clash 机场推荐](/clash-jichang-tuijian/)。
