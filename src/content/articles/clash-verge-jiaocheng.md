---
title: "Clash Verge Rev教程：下载、导入订阅与设置"
h1: "Clash Verge Rev 使用教程（Windows / macOS）"
description: "Clash Verge Rev 新手教程：从官方 GitHub 下载安装、导入机场 Clash 订阅、选择策略组与节点、开启系统代理和 TUN 模式，以及常见报错处理方法。"
summary:
  - "从官方 GitHub 下载 Clash Verge Rev，不要用网盘里的“汉化版”。"
  - "订阅页粘贴 Clash 订阅 → 代理页选规则模式和节点 → 设置页打开系统代理。"
  - "部分软件不走系统代理时，再打开 TUN 模式。"
category: tutorial
keywords: []
aliases: ["clash verge", "clash verge rev", "verge", "clash", "mihomo", "windows", "mac", "tun", "系统代理"]
published: 2026-10-20
updated: 2026-10-23
related: ["clash-jichang-tuijian", "clashparty-jiaocheng", "dingyue-daoru-wenti"]
faq:
  - q: "Clash Verge 和 Clash Verge Rev 是一个软件吗？"
    a: "原版 Clash Verge 已停止维护，Clash Verge Rev 是社区延续维护的版本，使用 mihomo 内核。新用户请安装 Rev 版本。"
  - q: "开启 TUN 模式提示需要权限怎么办？"
    a: "TUN 模式需要创建虚拟网卡，Windows 上一般需要安装服务模式或以管理员身份运行，macOS 上需要输入系统密码授权。按软件提示操作即可。"
  - q: "打开系统代理后国内网站变慢了？"
    a: "检查是否误选了全局模式。规则模式下国内网站应当直连，速度不受影响。"
  - q: "Mac 能用这个梯子软件吗？"
    a: "可以。Clash Verge Rev 有 macOS 版本，Apple 芯片（M 系列）和 Intel 芯片的安装包分开提供，下载时按自己的电脑选择。用法和 Windows 版相同：导入 Clash 订阅、选节点、打开系统代理。"
---
Clash Verge Rev 是基于 mihomo（Clash Meta）内核的跨平台图形客户端，支持 Windows、macOS 和 Linux，是目前电脑端最常用的 Clash 系客户端之一，Windows 和 Mac 用户找电脑梯子软件，都可以从它开始。下面按顺序操作。界面文字可能因版本略有差异，以实际为准。

## 先弄懂：Clash 是什么

Clash 是一类“按规则分流”的代理客户端。三个概念弄懂了，用起来就不会迷糊：

| 名词 | 意思 |
|---|---|
| 订阅 | 机场给你的一条链接，里面有全部节点和分流规则 |
| 策略组 | 节点的分组，例如“自动选择”“香港”“AI”，规则把流量交给某个组 |
| 模式 | 规则模式（国内直连、境外代理）、全局模式（全部走代理）、直连模式（全部不走代理） |

原版 Clash 已经停止维护。Clash Verge Rev 使用仍在更新的 mihomo（Clash Meta）内核，能使用 VLESS、Hysteria2 等新协议，是现在电脑上最常用的 Clash 客户端之一。

## 1. 下载与安装

1. 打开项目的官方 GitHub 发布页（仓库名 clash-verge-rev），进入 Releases。
2. 按系统选择安装包：
   - Windows：一般选 x64 的 setup.exe；
   - macOS：Apple 芯片选 aarch64，Intel 芯片选 x64 的 dmg。
3. 安装后首次运行。macOS 如提示“无法验证开发者”，在“系统设置 → 隐私与安全性”中允许打开。

请不要从网盘或第三方站点下载“汉化版”，软件本身已支持中文界面。

## 2. 导入订阅

1. 在机场用户中心复制 **Clash 订阅**链接。
2. 打开 Clash Verge Rev，进入“订阅”页面。
3. 把链接粘贴到输入框，点击“导入”。
4. 导入成功后，点击这条订阅使其处于选中（启用）状态。

报错的话，先看 [订阅导入失败的原因](/dingyue-daoru-wenti/)。

## 3. 选择节点

1. 进入“代理”页面。
2. 顶部选择 **规则** 模式。
3. 在主策略组（名称因机场而异，如“节点选择”）中选择“自动选择”或某个具体节点。
4. 点击闪电图标可以测试延迟，看不懂数字的含义可读 [延迟与稳定性怎么判断](/jichang-yanchi-wendingxing/)。

## 4. 开启代理

进入“设置”页面：

- 打开 **系统代理**：浏览器等大多数软件即可走代理；
- 需要时打开 **TUN 模式**：让不支持系统代理的程序（部分游戏、命令行工具）也走代理。首次开启需要授权。

打开浏览器访问一个境外网站，能正常打开即成功。

## 5. 推荐设置

- **开机自启**：在设置中打开，避免每次手动启动；
- **订阅自动更新**：在订阅设置中设置更新间隔；
- **AI 与流媒体**：如果配置中有对应分组，固定到一个地区节点。

## 6. 常见问题

| 现象 | 处理 |
|---|---|
| 导入报错 | 确认用的是 Clash 订阅、链接完整 |
| 节点全部超时 | 更新订阅、校准系统时间、升级软件 |
| 已连接但打不开网页 | 检查是否开了系统代理、浏览器是否有其他代理插件 |
| 与其他代理冲突 | 同一时间只运行一个代理软件 |

更多问题可以使用 [故障排查助手](/tools/guzhang-paicha/)。还没有机场的话，参考 [Clash 机场推荐](/clash-jichang-tuijian/)；想找类似软件可以试试 [ClashParty](/clashparty-jiaocheng/)。
