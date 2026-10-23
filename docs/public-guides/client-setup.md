# 客户端入门导航：Clash Verge Rev、Shadowrocket、v2rayN 怎么选

> 本文是 [VPN梯子指南](https://vpntizi.blog/) 的 GitHub 导读版。带截图位置说明的完整教程请看官网。

机场只给你一条订阅链接，真正负责连接的是客户端。选客户端只需要回答一个问题：你用什么设备。

## 按设备选

| 设备 | 常用客户端 | 订阅格式 |
|---|---|---|
| Windows / macOS | Clash Verge Rev | Clash 订阅 |
| Windows | v2rayN | 通用订阅 |
| iPhone / iPad | Shadowrocket（小火箭） | 通用订阅或一键导入 |
| 安卓 | v2rayNG | 通用订阅 |
| 全平台 | Hiddify、Karing | 自动识别多种格式 |

同一台设备同时只开一个客户端，两个代理软件一起运行容易互相冲突。

## 下载：只认官方渠道

Clash Verge Rev 从 [官方 GitHub](https://github.com/clash-verge-rev/clash-verge-rev) 下载，v2rayN 与 v2rayNG 从开发者 2dust 的 GitHub 下载。网盘里的“汉化版”“绿色版”最容易被改过，不要用。Shadowrocket 是 App Store 付费应用，中国大陆区商店没有上架，需要外区 Apple ID 购买；搜索时留意名字相近的仿冒应用。

## 导入订阅的共同步骤

不管用哪个客户端，流程都差不多：

1. 在机场用户中心，按你的客户端复制对应格式的订阅链接；
2. 粘贴到客户端的订阅入口，点一次“更新订阅”，让节点出现；
3. 模式选“规则”，选一个节点或“自动选择”；
4. 打开系统代理（手机上允许添加 VPN 配置）。

导入失败，最常见的原因是格式不匹配，比如把 Clash 订阅粘进 v2rayN；其次是链接复制不完整、系统时间不准、套餐到期。订阅链接等于账号凭证，不要发给别人，也不要交给在线转换网站。

## 什么时候需要 TUN 模式

有些软件（游戏、部分命令行工具）不走系统代理。这时在 Clash Verge Rev 里开启 TUN（虚拟网卡）模式，流量才会经过节点。

## 想所有设备用同一个软件

如果家里同时有 Windows 电脑、安卓手机和 iPhone，不想每台设备学一个软件，可以看 Hiddify 或 Karing。它们基于 sing-box 内核，能自动识别多种订阅格式；Hiddify 界面更简单，Karing 设置项更多。

## 深度阅读

- [Clash Verge Rev 使用教程（Windows / macOS）](https://vpntizi.blog/clash-verge-jiaocheng/)
- [Shadowrocket（小火箭）使用教程](https://vpntizi.blog/shadowrocket-jiaocheng/)
- [v2rayN / v2rayNG 使用教程](https://vpntizi.blog/v2rayn-v2rayng-jiaocheng/)
