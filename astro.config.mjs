// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// 每个 URL 的真实 lastmod：文章取 frontmatter updated，其余取资料总表日期
const ART = Object.fromEntries(readdirSync('./src/content/articles').map((f) => [f.replace(/\.mdx?$/, ''), (readFileSync('./src/content/articles/' + f, 'utf8').match(/^updated:\s*(\S+)/m) || [])[1]]));
const DATA_DATE = JSON.parse(readFileSync('./src/data/airports.json', 'utf8')).lastReviewed;

const SITE = 'https://vpntizi.blog';
// 不随资料总表更新的独立页面：写明各自的修改日期
/** @type {Record<string, string>} */
const PAGE_DATES = { 'yinsi-shuoming': '2026-10-23' };
// 页面模板与站点文字最近一次修改的日期（资料页简介、推荐顺序等）；与资料总表日期取较新者
const TEMPLATE_DATE = '2026-10-23';
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
        item.lastmod = new Date(slug === '' ? '2026-10-23' : ART[slug] || PAGE_DATES[slug] || newer(DATA_DATE, TEMPLATE_DATE)).toISOString();
        if (item.url === SITE + '/') item.priority = 1.0;
        else if (/\/(jichang-tuijian|jichang-paihangbang)\/$/.test(item.url)) item.priority = 0.9;
        else item.priority = 0.7;
        return item;
      },
    }),
  ],
});
