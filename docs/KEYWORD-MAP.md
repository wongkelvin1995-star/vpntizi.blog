# 关键词与唯一主页面对应表

由 `src/data/keywords.ts` 维护，`npm run check:seo` 会校验。新增文章前先查此表：意图相同就更新原页面，不新建。

| 关键词 | 唯一主页面 | 搜索意图 |
|---|---|---|
| VPN梯子指南 | `/` | 站点品牌词：直接搜索站名 |
| VPN 梯子 | `/` | 品牌/总入口：了解 VPN 梯子是什么、去哪里找推荐和教程 |
| VPN | `/` | 大词：由首页总入口承接，再分流到 VPN 推荐与免费 VPN 页 |
| 梯子 | `/` | 大词：由首页总入口承接 |
| 机场推荐 | `/jichang-tuijian/` | 综合挑选机场 |
| 机场推荐 2026 | `/jichang-tuijian/` | 同上，带年份的时效搜索 |
| 2026 机场推荐 | `/jichang-tuijian/` | 同上 |
| 机场排行榜 | `/jichang-paihangbang/` | 查看完整名单 |
| 稳定机场推荐 | `/wending-jichang-tuijian/` | 优先稳定性、少掉线 |
| 便宜机场推荐 | `/pianyi-jichang-tuijian/` | 低预算 |
| 便宜稳定机场 | `/pianyi-jichang-tuijian/` | 低预算但不想常断线 |
| 性价比机场 | `/pianyi-jichang-tuijian/` | 按每GB成本比较 |
| 高性价比机场推荐 | `/pianyi-jichang-tuijian/` | 按每GB成本比较 |
| 专线机场推荐 | `/zhuanxian-jichang-tuijian/` | 寻找专线线路 |
| IEPL 机场推荐 | `/zhuanxian-jichang-tuijian/` | 专线细分 |
| IPLC 机场推荐 | `/zhuanxian-jichang-tuijian/` | 专线细分 |
| 高速机场推荐 | `/gaosu-jichang-tuijian/` | 大带宽、下载/4K |
| 按量计费机场 | `/anliang-jifei-jichang/` | 不限时、用多少买多少 |
| Clash 机场推荐 | `/clash-jichang-tuijian/` | 用 Clash 系客户端的订阅 |
| 机场推荐 Clash | `/clash-jichang-tuijian/` | 同上（词序不同的搜索） |
| Clash Verge 机场推荐 | `/clash-jichang-tuijian/` | 同上 |
| Shadowrocket 机场推荐 | `/shadowrocket-jichang-tuijian/` | iPhone 用户 |
| v2rayN 机场推荐 | `/v2rayn-jichang-tuijian/` | Windows v2rayN 用户 |
| ChatGPT 机场推荐 | `/chatgpt-jichang-tuijian/` | AI 工具访问 |
| Netflix 机场推荐 | `/liumeiti-jiesuo-jichang/` | 看 Netflix |
| 流媒体解锁机场 | `/liumeiti-jiesuo-jichang/` | 多平台流媒体 |
| 梯子推荐 | `/` | 新手泛需求：首页标题即“VPN梯子推荐指南”，由首页承接 |
| 2026 梯子推荐 | `/` | 同上 |
| 梯子怎么选 | `/tizi-tuijian/` | 第一次买梯子的选购步骤与避坑 |
| 新手买梯子 | `/tizi-tuijian/` | 同上 |
| 梯子工具 | `/kexue-shangwang-gongju/` | 了解有哪些梯子 / 翻墙工具 |
| 翻墙工具 | `/kexue-shangwang-gongju/` | 同上 |
| 科学上网工具 | `/kexue-shangwang-gongju/` | 了解工具种类 |
| 魔法上网 | `/kexue-shangwang-gongju/` | 口语化同义词 |
| VPN 推荐 | `/vpn-tuijian/` | 商业 VPN 与机场怎么选 |
| 翻墙 VPN | `/vpn-tuijian/` | 同上 |
| 翻墙 | `/vpn-tuijian/` | 大词：翻墙用 VPN 还是机场 |
| 免费 VPN | `/mianfei-vpn/` | 免费 VPN 能否使用、风险与替代 |
| 免费梯子 | `/mianfei-vpn/` | 同上（口语化） |
| VPN 梯子 免费 | `/mianfei-vpn/` | 同上 |
| 机场节点 | `/jichang-yanchi-wendingxing/` | 节点怎么选：延迟、稳定性、地区 |
| 机场节点怎么选 | `/jichang-yanchi-wendingxing/` | 同上 |
| 灵动云 | `/jichang/lingdongyun/` | 品牌词：灵动云怎么样、价格、注册入口 |
| 暮光加速 | `/jichang/muguang-jiasu/` | 品牌词：暮光加速怎么样、价格、注册入口 |
| 飞猫云 | `/jichang/feimaoyun/` | 品牌词：飞猫云怎么样、价格、注册入口 |
| 大佬云 | `/jichang/dalaoyun/` | 品牌词：大佬云怎么样、价格、注册入口 |
| 微风网络 | `/jichang/breezenet/` | 品牌词：微风网络怎么样、价格、注册入口 |
| 飞V | `/jichang/feiv/` | 品牌词：飞V怎么样、价格、注册入口 |
| 梯子云 | `/jichang/tiziyun/` | 品牌词：梯子云怎么样、价格、注册入口 |
| 浪网 | `/jichang/wavenet/` | 品牌词：浪网怎么样、价格、注册入口 |
| 隐形人 | `/jichang/yinxingren/` | 品牌词：隐形人怎么样、价格、注册入口 |
| 星岛梦 | `/jichang/xingdaomeng/` | 品牌词：星岛梦怎么样、价格、注册入口 |
| 光速云 | `/jichang/guangsuyun/` | 品牌词：光速云怎么样、价格、注册入口 |
| 唯兔云 | `/jichang/weituyun/` | 品牌词：唯兔云怎么样、价格、注册入口 |
| U1S1 | `/jichang/u1s1/` | 品牌词：U1S1怎么样、价格、注册入口 |
| 极连云 | `/jichang/jilianyun/` | 品牌词：极连云怎么样、价格、注册入口 |
| 全球云 | `/jichang/quanqiuyun/` | 品牌词：全球云怎么样、价格、注册入口 |
| 光年梯 | `/jichang/guangnianti/` | 品牌词：光年梯怎么样、价格、注册入口 |
| Sogo云 | `/jichang/sogoyun/` | 品牌词：Sogo云怎么样、价格、注册入口 |
| 宇宙云 | `/jichang/yuzhouyun/` | 品牌词：宇宙云怎么样、价格、注册入口 |
| 二猫云 | `/jichang/ermaoyun/` | 品牌词：二猫云怎么样、价格、注册入口 |
| 一翻云 | `/jichang/yifanyun/` | 品牌词：一翻云怎么样、价格、注册入口 |
| 边缘节点 | `/jichang/edgenova/` | 品牌词：边缘节点怎么样、价格、注册入口 |
| 可信云 | `/jichang/kexinyun/` | 品牌词：可信云怎么样、价格、注册入口 |
| 速界 | `/jichang/sujie/` | 品牌词：速界怎么样、价格、注册入口 |
| 快狸 | `/jichang/kuaili/` | 品牌词：快狸怎么样、价格、注册入口 |
| 无忧 | `/jichang/wuyou/` | 品牌词：无忧怎么样、价格、注册入口 |
| 灵猫 | `/jichang/lingmao/` | 品牌词：灵猫怎么样、价格、注册入口 |
| 闪跃 | `/jichang/flashleap/` | 品牌词：闪跃怎么样、价格、注册入口 |
| 飞为 | `/jichang/feiwei/` | 品牌词：飞为怎么样、价格、注册入口 |
| 跨界云 | `/jichang/kuajie/` | 品牌词：跨界云怎么样、价格、注册入口 |
| 榴莲云 | `/jichang/liulianyun/` | 品牌词：榴莲云怎么样、价格、注册入口 |
| 闪电云 | `/jichang/shandianyun/` | 品牌词：闪电云怎么样、价格、注册入口 |
| 环球云 | `/jichang/huanqiuyun/` | 品牌词：环球云怎么样、价格、注册入口 |
| 神行云 | `/jichang/shenxingyun/` | 品牌词：神行云怎么样、价格、注册入口 |
| 云界云 | `/jichang/yunjieyun/` | 品牌词：云界云怎么样、价格、注册入口 |
| 梯子是什么 | `/vpn-jichang-qubie/` | 概念入门：梯子、VPN、机场的关系 |
| 用梯子安全吗 | `/yinsi-anquan-falv/` | 安全与法律风险 |
| iPhone 梯子 | `/shadowrocket-jiaocheng/` | 苹果手机用什么梯子客户端 |
| 梯子软件 | `/jiaocheng/` | 按设备选梯子客户端 |
| 稳定的梯子 | `/wending-jichang-tuijian/` | 晚高峰不掉线 |

共 81 条：47 条通用词 + 34 条品牌词（每个品牌只由自己的资料页承接）。更新于 2026-10-23。
