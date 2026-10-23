/**
 * 读者反馈：站长收到的用户留言原话（只做排版，不改写内容）。
 * 不显示星级、不输出评价类结构化数据；新增时写明收到时间。
 */
export interface Feedback { title: string; text: string }
export interface FeedbackSet { airportId: string; received: string; items: Feedback[] }

export const FANKUI: FeedbackSet[] = [
  {
    airportId: 'lingdongyun',
    received: '2026 年 10 月',
    items: [
      { title: '连接方便，整体体验流畅', text: '灵动云的界面简单易懂，节点选择也很方便。平时主要用于浏览网页、观看 YouTube、使用 ChatGPT 等，整体操作体验不错。对于想找一款容易上手、节点选择丰富的机场服务的用户来说，值得先体验一下。希望后续继续保持线路稳定，并不断优化晚高峰的使用表现。' },
      { title: '日常使用流畅，连接体验不错', text: '平时主要用来看视频和浏览海外网站，灵动云的节点选择比较方便，操作也简单。整体体验符合我的日常需求，希望以后晚高峰也能继续保持良好的连接表现。' },
      { title: '适合经常使用 AI 工具的人', text: '平时经常需要使用 ChatGPT 等 AI 工具，比较看重线路连接和响应速度。灵动云的客户端操作容易理解，切换节点也方便，使用起来比较省心。' },
      { title: '看视频方便，节点选择丰富', text: '我平时主要看 YouTube 和海外视频，对网络流畅度有一定要求。灵动云的使用方式比较简单，可以按照自己的需求选择节点，希望以后能持续优化视频播放体验。' },
      { title: '操作简单，对新手比较友好', text: '刚开始接触机场服务时，最担心的就是配置复杂。灵动云的页面比较直观，节点选择和连接操作容易理解，对于不太熟悉网络工具的新用户来说，这样的设计很友好。' },
    ],
  },
];

export const fankuiFor = (id: string) => FANKUI.find((f) => f.airportId === id);
