/**
 * 站长实测记录。每条对应一张站长自己跑出的测试截图，数字只抄录截图上可见的内容。
 * 新增实测：把截图放到 public/images/shice/，在这里加一条即可，品牌资料页会自动显示。
 */
export interface RegionResult {
  region: string;
  /** 平均 TLS 握手延迟（毫秒）：截图页脚有给出时照抄，否则按截图逐节点数值计算；在线检查类记录不填 */
  avgTls?: number;
  tlsRange?: [number, number];
  httpRange?: [number, number];
  /** 在线检查类记录：在线节点数 */
  online?: number;
  /** 在线检查类记录：倍率 */
  rate?: string;
  /** 可选：平均下载速度（MB/s，按截图数值计算，不含失效节点）与范围 */
  avgSpeed?: number;
  speedRange?: [number, number];
  nodes?: number;
  note: string;
}

export interface ShiceRecord {
  airportId: string;
  /** speed = 延迟 / 速度 / 解锁测试；online = 只检查节点是否在线 */
  kind?: 'speed' | 'online';
  /** 暂不展示（例如等待替换为测速工具导出的原始截图） */
  hidden?: boolean;
  /** raw = 测速工具导出的原始截图（默认）；summary = 站长根据测试结果整理的汇总图，页面会明确标注 */
  imageType?: 'raw' | 'summary';
  date: string;
  time: string;
  /** 是否在 20:00–23:00 晚高峰 */
  peak: boolean;
  image: string;
  width: number;
  height: number;
  tool: string;
  items: string[];
  regions: RegionResult[];
  findings: string[];
}

export const SHICE: ShiceRecord[] = [
  {
    airportId: 'lingdongyun',
    hidden: true, // 2026-10-23：改为标注“整理汇总图”展示；等站长确认图中数字与原始测试结果一致后，删除这一行即可上线
    imageType: 'summary',
    date: '2026-10-21',
    time: '18:57（北京时间）',
    peak: false,
    image: '/images/shice/lingdongyun-2026-10-21.webp',
    width: 1491,
    height: 1055,
    tool: '站长自建测试脚本',
    items: ['TLS 握手延迟', 'HTTP 延迟', 'YouTube', 'Netflix', 'Disney+', 'ChatGPT / OpenAI', 'Abema', 'TikTok', 'DAZN', '巴哈姆特动画疯'],
    regions: [
      { region: '香港', avgTls: 25, tlsRange: [20, 29], httpRange: [65, 97], note: '延迟最低；YouTube、Netflix 绝大多数节点为 4K 解锁' },
      { region: '台湾', avgTls: 34, tlsRange: [30, 37], httpRange: [86, 104], note: '延迟低；Disney+ 有 3 个节点为“部分”解锁' },
      { region: '新加坡', avgTls: 48, tlsRange: [44, 51], httpRange: [115, 132], note: 'Disney+ 有 2 个节点为“部分”、1 个失败' },
      { region: '日本', avgTls: 81, tlsRange: [75, 86], httpRange: [168, 201], note: 'YouTube、Netflix、ChatGPT 项基本全部通过' },
      { region: '美国', avgTls: 154, tlsRange: [145, 162], httpRange: [310, 345], note: '延迟明显偏高，流媒体多为“部分”或未检测，OpenAI 项有 3 个节点失败' },
    ],
    findings: [
      '亚洲四个地区（香港、台湾、新加坡、日本）的节点，YouTube 与 Netflix 测试项几乎全部显示可解锁，日常看视频优先选这几个地区。',
      '香港节点延迟最低（平均 25ms），但 ChatGPT 测试项有 2 个香港节点失败；OpenAI 官方不对香港提供服务，用 AI 工具时更稳妥的是日本、台湾或新加坡节点。',
      '美国节点平均延迟 154ms，流媒体多为“部分”或未检测，这次测试中不适合作为主力节点，只在需要美区内容时使用。',
      '这次测试在傍晚 18:57 进行，不在 20:00–23:00 晚高峰；晚高峰表现需要另行测试。',
    ],
  },
  {
    airportId: 'wuyou',
    date: '2026-07-18',
    time: '21:40（北京时间）',
    peak: true,
    image: '/images/shice/wuyou-2026-07-18.webp',
    width: 870,
    height: 1280,
    tool: 'MiaoKo 订阅测速（测试端：珠海联通，32 线程）',
    items: ['TLS 握手延迟', 'HTTPS 延迟', '平均速度', '最高速度', 'UDP 类型'],
    regions: [
      { region: '香港', nodes: 15, avgTls: 108, tlsRange: [100, 130], httpRange: [494, 807], avgSpeed: 524, speedRange: [393, 555], note: '15 个节点全部在 390 MB/s 以上，是这次测试中最快、延迟最低的地区' },
      { region: '新加坡', nodes: 10, avgTls: 129, tlsRange: [102, 172], httpRange: [559, 1631], avgSpeed: 193, speedRange: [95, 353], note: 'SIN-02 基本不可用（平均仅 17.59 KB/s），其余 9 个节点速度中等' },
      { region: '日本', nodes: 10, avgTls: 141, tlsRange: [134, 155], httpRange: [702, 2526], avgSpeed: 106, speedRange: [60, 198], note: '速度中等；TYO-09 的 HTTPS 延迟达 2526ms，明显偏高' },
      { region: '台湾', nodes: 5, avgTls: 190, tlsRange: [143, 269], httpRange: [787, 1168], avgSpeed: 79, speedRange: [66, 95], note: 'TPE-05 的 TLS 延迟 269ms，偏高' },
      { region: '美国', nodes: 10, avgTls: 245, tlsRange: [240, 253], httpRange: [981, 1035], avgSpeed: 14, speedRange: [12, 18], note: '洛杉矶节点，延迟高、平均速度只有约 14 MB/s，这次测试中明显偏慢' },
    ],
    findings: [
      '这次测试在晚上 21:40 晚高峰进行，50 个节点全部有结果，其中 1 个（新加坡 SIN-02）基本不可用。',
      '香港节点是主力：平均 TLS 延迟 108ms，平均速度约 524 MB/s，日常浏览、看 4K 视频都有余量。',
      '新加坡、日本速度中等，可作为香港之外的备用；美国洛杉矶节点平均只有约 14 MB/s，只适合需要美区 IP 的场景。',
      '本次只测延迟与速度，没有测流媒体和 AI 解锁；测试在 2026 年 7 月进行，早于无忧 2026 年 10 月改用专属客户端，之后的表现需要重新测试。',
    ],
  },
  {
    airportId: 'muguang-jiasu',
    date: '2026-07-20',
    time: '20:54（北京时间）',
    peak: true,
    image: '/images/shice/muguang-jiasu-2026-07-20.webp',
    width: 708,
    height: 1280,
    tool: 'MiaoKo 订阅测速（测试端：珠海联通，32 线程）',
    items: ['TLS 握手延迟', 'HTTPS 延迟', '平均速度', '最高速度', 'UDP 类型'],
    regions: [
      { region: '台湾', nodes: 10, avgTls: 177, tlsRange: [157, 189], httpRange: [757, 1459], avgSpeed: 41, speedRange: [33, 46], note: '延迟最低也最稳定，10 个节点 TLS 延迟都在 157–189ms' },
      { region: '香港', nodes: 20, avgTls: 181, tlsRange: [136, 279], httpRange: [1121, 2312], avgSpeed: 50, speedRange: [21, 75], note: '节点最多；香港03、香港09 平均速度只有约 21、25 MB/s' },
      { region: '新加坡', nodes: 10, avgTls: 247, tlsRange: [176, 492], httpRange: [966, 2758], avgSpeed: 30, speedRange: [10, 47], note: '这次速度最低，新加坡10 只有约 9.85 MB/s，新加坡05 延迟 492ms' },
      { region: '日本', nodes: 10, avgTls: 288, tlsRange: [197, 530], httpRange: [820, 2164], avgSpeed: 55, speedRange: [43, 76], note: '速度中等；日本02 延迟 530ms，是全表最高' },
      { region: '美国', nodes: 10, avgTls: 330, tlsRange: [291, 456], httpRange: [1528, 2373], avgSpeed: 66, speedRange: [49, 83], note: '美国01 无法连接；其余 9 个节点平均速度是这次最高的地区，但延迟也最高' },
    ],
    findings: [
      '这次测试在晚上 20:54 晚高峰进行，60 个节点中 59 个有结果，美国01 无法连接。',
      '台湾、香港节点延迟最低（平均约 177ms、181ms），日常浏览和聊天优先选这两个地区，其中台湾节点最稳定。',
      '各地区平均速度大多在 30–66 MB/s，看 1080p、4K 视频够用，但明显低于同一测试端测到的部分其他机场；大文件下载可选美国或日本节点。',
      '个别节点延迟偏高（日本02 530ms、新加坡05 492ms、美国06 456ms），遇到卡顿时换同地区其他节点即可。本次只测延迟与速度，没有测流媒体和 AI 解锁。',
    ],
  },
  {
    airportId: 'yinxingren',
    hidden: true, // 2026-10-22：整理版汇总图，等待站长提供原始截图后再展示
    kind: 'online',
    date: '2026-10-22',
    time: '18:20–18:21（北京时间）',
    peak: false,
    image: '/images/shice/yinxingren-2026-10-22.webp',
    width: 1491,
    height: 1055,
    tool: '客户端节点列表（按截图整理）',
    items: ['节点是否在线', '节点倍率'],
    regions: [
      { region: '香港', nodes: 20, online: 20, rate: '1x', note: '20 个节点全部在线' },
      { region: '台湾', nodes: 10, online: 10, rate: '1x', note: '全部在线' },
      { region: '日本', nodes: 10, online: 10, rate: '1x', note: '全部在线' },
      { region: '新加坡', nodes: 10, online: 10, rate: '1x', note: '全部在线' },
      { region: '美国', nodes: 10, online: 10, rate: '1x', note: '全部在线' },
    ],
    findings: [
      '2026-10-22 18:20 检查时，隐形人 60 个节点全部在线：香港 20 个，台湾、日本、新加坡、美国各 10 个。',
      '全部节点为 1 倍率，用 1GB 就扣 1GB 流量，不会因为选了某个地区而加倍扣量。',
      '这次只检查节点是否在线，没有测延迟、速度和流媒体解锁；“在线”不等于“速度快”，晚高峰的实际表现需要另外测试。',
    ],
  },
];

export const shiceFor = (id: string) => SHICE.filter((s) => s.airportId === id && !s.hidden);
