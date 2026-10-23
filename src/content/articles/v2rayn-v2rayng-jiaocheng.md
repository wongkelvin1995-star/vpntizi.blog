---
title: "v2rayN与v2rayNG教程：订阅导入与设置"
h1: "v2rayN / v2rayNG 使用教程（Windows 与安卓）"
description: "v2rayN 与 v2rayNG 新手教程：从官方 GitHub 下载、添加机场通用订阅、更新订阅与测试真连接延迟、设置路由与系统代理、切换 Xray 和 sing-box 内核。"
summary:
  - "v2rayN 用于 Windows，v2rayNG 用于安卓，都从 2dust 的 GitHub 下载。"
  - "订阅分组设置里添加通用订阅 → 更新订阅 → 测试真连接延迟 → 选节点。"
  - "电脑端路由选“绕过大陆”，系统代理选“自动配置”。"
category: tutorial
keywords: []
aliases: ["v2rayn", "v2rayng", "v2ray", "xray", "安卓", "android", "windows", "通用订阅", "vmess", "vless"]
published: 2026-10-20
updated: 2026-10-23
related: ["v2rayn-jichang-tuijian", "hiddify-karing-jiaocheng", "dingyue-daoru-wenti"]
faq:
  - q: "v2rayN 下载哪个压缩包？"
    a: "Releases 页面通常有多个版本，Windows 用户选带有 windows 和 64 字样、并已包含内核（core）的版本，解压即可使用。具体文件名以发布页说明为准。"
  - q: "v2rayNG 在哪里下载？"
    a: "可以从项目官方 GitHub Releases 下载 apk，或在 Google Play 安装。选择与手机架构对应的版本，不确定时选 universal 版本。"
  - q: "为什么系统代理开了，部分软件还是不走代理？"
    a: "部分程序不读取系统代理设置，需要开启 TUN 模式（v2rayN）或使用 VPN 模式（v2rayNG）。"
---
v2rayN（Windows，也有 Linux、macOS 版本）和 v2rayNG（安卓）都由开发者 2dust 维护，适合导入机场的**通用订阅**；在安卓手机梯子客户端里，v2rayNG 是最常用的之一。两者用法类似，下面分别说明。界面文字以实际版本为准。

## 一、v2rayN（Windows）

### 1. 下载

1. 打开 GitHub 上 2dust/v2rayN 仓库的 Releases 页面；
2. 下载适合 Windows 64 位、包含内核的压缩包；
3. 解压到一个固定的文件夹（不要放在临时目录），运行 v2rayN.exe。

如果提示缺少 .NET 运行库，按提示安装微软官方的运行库。

### 2. 添加订阅

1. 在机场用户中心复制 **通用订阅**；
2. v2rayN 菜单选择“订阅分组 → 订阅分组设置”，点击添加；
3. 填写备注，在地址栏粘贴链接，确定；
4. 回到主界面，选择“订阅分组 → 更新全部订阅（不通过代理）”。

### 3. 测试并选择节点

1. 全选节点，右键选择“测试真连接延迟”；
2. 选中一个延迟正常的节点，按回车或右键“设为活动服务器”。

### 4. 开启代理

- 底部“系统代理”选择 **自动配置系统代理**；
- 底部“路由”选择 **绕过大陆**；
- 需要全局接管时开启 **TUN**（可能需要以管理员身份运行）。

如果节点使用 Hysteria2 等协议，v2rayN 会调用 sing-box 内核；无法连接时检查内核文件是否齐全。

## 二、v2rayNG（安卓）

### 1. 安装

从 GitHub Releases 下载 apk 或从 Google Play 安装。

### 2. 添加订阅

1. 打开左侧菜单 → **订阅分组设置**；
2. 点击右上角“+”，填入备注与订阅地址，保存；
3. 返回首页，点击右上角菜单 → **更新订阅**。

### 3. 连接

1. 菜单中选择“测试全部配置真连接”，挑一个延迟正常的节点；
2. 点击右下角的连接按钮，首次会请求 VPN 权限，选择允许；
3. 在设置中把路由设为“绕过局域网及大陆地址”。

## 三、常见问题

| 现象 | 处理 |
|---|---|
| 更新订阅失败 | 选择“不通过代理”更新；检查链接与系统时间 |
| 测试全部超时 | 先更新订阅，再升级软件与内核 |
| 只有浏览器能用 | 开启 TUN（电脑）或确认 VPN 模式（安卓） |

更多问题见 [订阅导入失败的原因](/dingyue-daoru-wenti/)。选机场可参考 [v2rayN 机场推荐](/v2rayn-jichang-tuijian/)；想要全平台统一的客户端，可以看 [Hiddify 与 Karing 教程](/hiddify-karing-jiaocheng/)。
