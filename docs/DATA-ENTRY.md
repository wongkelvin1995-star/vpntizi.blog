# 机场资料录入说明

所有机场数据都在 `src/data/airports.json`，改完运行 `npm run check:data`，再 `npm run build`。

## 规则（脚本会强制检查）

- 必须正好 **34** 条记录，`rank` 为 1–34 且不重复。
- `rank` 1–5 固定：灵动云、暮光加速、微风网络 Breezenet、飞猫云、大佬云（2026-10-23 调整），**未经站长指示不可调整**。
- `rank` 6–34 可以调整顺序，但不能删除、不能重复。
- 每家的 `affUrl` 必须是**该品牌专属**的 AFF 链接；两个品牌出现相同链接会报错。
- `id` 用小写拼音或英文，作为网址：`/jichang/<id>/`。上线后尽量不要改；如果必须改，在 `public/_redirects` 加一条 301。

## 第 6–34 家怎么填

把占位记录 `slot-06` … `slot-34` 改成真实品牌：

```json
{
  "id": "pinpai-pinyin",
  "rank": 6,
  "name": "品牌中文名",
  "nameEn": "BrandName",
  "aliases": ["别名", "英文小写"],
  "status": "pending",
  "affUrl": "https://品牌官网/auth/register?code=你的邀请码",
  "officialSite": "https://品牌官网/",
  ...其余字段保持空值
}
```

`status` 从 `placeholder` 改为 `pending` 后，就会生成独立资料页并出现在 sitemap 中。

## 套餐字段（只录入官网核实过的）

```json
"plans": [
  { "name": "官网套餐名", "billing": "month", "priceCNY": 25, "trafficGB": 200, "trafficPeriod": "month", "deviceLimit": "3 台", "note": "限速 300Mbps" }
]
```

| 字段 | 取值 |
|---|---|
| billing | `month` 月付 / `quarter` 季付 / `halfyear` 半年付 / `year` 年付 / `payg` 按量 / `onetime` 一次性 |
| priceCNY | **实际付款金额**（下单要付的钱，不是折合月价） |
| trafficGB | 官网写的流量数字；不限量填 `null` |
| trafficPeriod | `month` 每月重置 / `cycle` 整个周期共用 / `total` 不重置（按量） |

折合月价、周期总流量、每GB价格由网站自动计算，**不要手填**。

## 标记为“已核实”

```json
"status": "verified",
"verifiedAt": "2026-10-20",
"sources": [{ "label": "官网套餐页（2026-10-20 截图存档）", "url": "https://..." }]
```

已核实必须同时有：至少 1 个套餐、至少 1 个来源、核实日期。

其他文字字段（regions、lineTypes、protocols、clients、aiCompat、streamingCompat、suitableFor、notSuitableFor、limits）留空时页面显示“待核实”。**无法验证的速度、延迟、解锁结果不要写。**

## 每次修改后

1. 在 `src/data/changelog.ts` 顶部追加一条记录；
2. `npm run check:data`（上线前用 `npm run check:data:strict`）；
3. 推送到 GitHub，自动部署并通知 IndexNow。
