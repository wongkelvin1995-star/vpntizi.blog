import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    /** <title>，不含站点名后缀 */
    title: z.string().max(40),
    /** 页面唯一 H1 */
    h1: z.string(),
    description: z.string().min(50).max(160),
    /** 文章顶部“快速答案”，2–4 条短句，供读者和搜索引擎快速抓取 */
    summary: z.array(z.string()).default([]),
    category: z.enum(['recommend', 'knowledge', 'tutorial', 'safety']),
    /** 本页负责的主关键词，必须与 src/data/keywords.ts 一致 */
    keywords: z.array(z.string()).default([]),
    /** 站内搜索用的关联词、英文别名 */
    aliases: z.array(z.string()).default([]),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    related: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    /** 推荐类文章：在正文前插入前四家重点介绍卡片 */
    showTopFour: z.boolean().default(false),
    noindex: z.boolean().default(false),
  }),
});

export const collections = { articles };
