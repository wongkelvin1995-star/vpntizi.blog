// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// 每个 URL 的真实 lastmod：文章取 frontmatter updated，其余取资料总表日期
const ART = Object.fromEntries(readdirSync('./src/content/articles').map((f) => [f.replace(/\.mdx?$/, ''), (readFileSync('./src/content/articles/' + f, 'utf8').match(/^updated:\s*(\S+)/m) || [])[1]]));
const DATA_DATE = '2026-10-22'; // 资料总表日期不再整体推高所有页面：只有内容真的变了的页面才写进 PAGE_DATES

const SITE = 'https://vpntizi.blog';
// 不随资料总表更新的独立页面：写明各自的修改日期
/** @type {Record<string, string>} */
const PAGE_DATES = {"yinsi-shuoming": "2026-10-31", "guanyu": "2026-10-31", "jichang-paihangbang": "2026-10-31", "jichang-tuijian": "2026-10-31", "jichang/breezenet": "2026-10-31", "jichang/dalaoyun": "2026-10-31", "jichang/edgenova": "2026-10-31", "jichang/ermaoyun": "2026-10-31", "jichang/feimaoyun": "2026-10-31", "jichang/feiv": "2026-10-31", "jichang/feiwei": "2026-10-31", "jichang/flashleap": "2026-10-31", "jichang/guangnianti": "2026-10-31", "jichang/guangsuyun": "2026-10-31", "jichang/huanqiuyun": "2026-10-31", "jichang/jilianyun": "2026-10-31", "jichang/kexinyun": "2026-10-31", "jichang/kuaili": "2026-10-31", "jichang/kuajie": "2026-10-31", "jichang/lingdongyun": "2026-10-31", "jichang/lingmao": "2026-10-31", "jichang/liulianyun": "2026-10-31", "jichang/muguang-jiasu": "2026-10-31", "jichang/quanqiuyun": "2026-10-31", "jichang/shandianyun": "2026-10-31", "jichang/shenxingyun": "2026-10-31", "jichang/sogoyun": "2026-10-31", "jichang/sujie": "2026-10-31", "jichang/tiziyun": "2026-10-31", "jichang/u1s1": "2026-10-31", "jichang/wavenet": "2026-10-31", "jichang/weituyun": "2026-10-31", "jichang/wuyou": "2026-10-31", "jichang/xingdaomeng": "2026-10-31", "jichang/yifanyun": "2026-10-31", "jichang/yinxingren": "2026-10-31", "jichang/yunjieyun": "2026-10-31", "jichang/yuzhouyun": "2026-10-31", "tools/meigb-jiage": "2026-10-31", "tools/ziliao-hezhe": "2026-10-31", "tuiguang-pilu": "2026-10-31", "wangzhan-ditu": "2026-10-31", "wenzhang": "2026-10-31", "zhishi": "2026-10-31"};
// 页面模板与站点文字最近一次修改的日期（资料页简介、推荐顺序等）；与资料总表日期取较新者
const TEMPLATE_DATE = '2026-10-23';
// 全站 meta description 重写的日期（Bing 提示描述过短）：所有页面的 HTML 都因此改变，lastmod 取各页自己的日期与此日期中较新者。上线当天改成实际上线日期。
const META_DATE = '2026-11-08';
/** @param {string} a @param {string} b */
const newer = (a, b) => (a > b ? a : b);

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/search/'),
      changefreq: 'weekly',
      serialize(item) {
        const slug = item.url.replace(SITE, '').replace(/^\/|\/$/g, '');
        const base = slug === '' ? '2026-10-31' : ART[slug] || PAGE_DATES[slug] || newer(DATA_DATE, TEMPLATE_DATE);
        item.lastmod = new Date(newer(base, META_DATE)).toISOString();
        if (item.url === SITE + '/') item.priority = 1.0;
        else if (/\/(jichang-tuijian|jichang-paihangbang)\/$/.test(item.url)) item.priority = 0.9;
        else item.priority = 0.7;
        return item;
      },
    }),
  ],
});
