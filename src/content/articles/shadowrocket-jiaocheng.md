---
title: "Shadowrocket教程：小火箭下载与订阅导入"
h1: "Shadowrocket（小火箭）使用教程：iPhone 梯子设置步骤"
description: "Shadowrocket 小火箭新手教程：用外区 Apple ID 下载、导入机场订阅、选择节点与全局路由、添加 VPN 配置、设置订阅自动更新，以及连接失败的处理方法。"
summary:
  - "在 App Store 切换外区账号下载，不要在系统设置里退出 iCloud。"
  - "用机场的一键导入，或右上角“+”选 Subscribe 粘贴订阅。"
  - "全局路由选“配置”，首次连接时允许添加 VPN 配置。"
category: tutorial
keywords: []
aliases: ["shadowrocket", "小火箭", "火箭", "ios", "iphone", "ipad", "apple id", "外区", "苹果"]
published: 2026-10-20
updated: 2026-10-23
related: ["shadowrocket-jichang-tuijian", "sing-box-jiaocheng", "dingyue-daoru-wenti"]
faq:
  - q: "没有外区 Apple ID 怎么办？"
    a: "可以自行注册一个非中国大陆地区的 Apple ID，只在 App Store 中切换登录用于下载，不要在系统设置里替换 iCloud 账号。不建议使用网上共享的账号。"
  - q: "小火箭右上角开关打开又自动关闭？"
    a: "通常是没有选中可用节点、配置有误或 VPN 权限未授予。先选择一个延迟正常的节点，再检查“设置 → 通用 → VPN 与设备管理”中的配置。"
  - q: "Mac 能用小火箭吗？"
    a: "使用 Apple 芯片的 Mac 可以在 App Store 中安装 iPad 版 Shadowrocket，用法基本相同。"
---
Shadowrocket 是 iOS 和 iPadOS 上的付费代理客户端，俗称“小火箭”，是苹果手机上最常用的梯子客户端之一。下面是从下载到连上的完整步骤，界面文字以实际版本为准。

## 1. 下载

1. 准备一个**非中国大陆地区**的 Apple ID（如美区、港区）。
2. 打开 App Store，点击右上角头像，退出当前账号，登录外区账号。**只在 App Store 中切换，不要在系统设置里退出 iCloud。**
3. 搜索 Shadowrocket，确认开发者信息正确后购买下载。
4. 下载完成后可以切回原来的账号，已安装的 App 不受影响。

## 2. 导入订阅

**方式一：一键导入**

在机场用户中心找到“导入到 Shadowrocket”之类的按钮，点击后会自动打开小火箭并添加订阅。

**方式二：手动添加**

1. 在用户中心复制通用订阅或 Shadowrocket 订阅；
2. 打开小火箭，点击右上角“+”；
3. 类型选择 **Subscribe**；
4. 在 URL 中粘贴链接，备注可填机场名，点击完成。

## 3. 选择节点并连接

1. 首页下方会列出所有节点，可点击“连通性测试”查看延迟；
2. 点选一个节点；
3. **全局路由**选择“配置”（按规则分流）；
4. 打开顶部开关，首次使用时系统会提示“添加 VPN 配置”，点允许并验证密码或面容。

状态栏出现 VPN 图标即为已连接。

## 4. 推荐设置

- **订阅自动更新**：在“设置 → 订阅”中开启“打开时更新”；
- **按需连接**：熟悉后再开启，规则写错可能导致频繁断开；
- **AI 与流媒体**：固定一个地区节点，不要频繁切换。

## 5. 常见问题

| 现象 | 处理 |
|---|---|
| 添加订阅后没有节点 | 套餐到期、链接复制不全或格式不对 |
| 开关自动关闭 | 先选中可用节点，检查 VPN 配置是否被删除 |
| 能连但网页打不开 | 全局路由改为“配置”或临时改为“代理”测试 |
| 耗电偏高 | 使用规则模式，不需要时关闭 |

更多问题见 [订阅导入失败的原因](/dingyue-daoru-wenti/) 和 [故障排查助手](/tools/guzhang-paicha/)。选机场可参考 [Shadowrocket 机场推荐](/shadowrocket-jichang-tuijian/)；想用免费客户端可看 [sing-box 教程](/sing-box-jiaocheng/)。
