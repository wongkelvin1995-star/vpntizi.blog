import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

export const CATEGORY: Record<Article['data']['category'], { label: string; hub: string; hubName: string }> = {
  recommend: { label: '机场推荐', hub: '/jichang-tuijian/', hubName: '机场推荐' },
  knowledge: { label: '新手知识', hub: '/zhishi/', hubName: '新手知识' },
  tutorial: { label: '客户端教程', hub: '/jiaocheng/', hubName: '客户端教程' },
  safety: { label: '安全与法律', hub: '/zhishi/', hubName: '新手知识' },
};

export const articleUrl = (a: Article | string) => `/${typeof a === 'string' ? a : a.id}/`;

export async function getArticles() {
  const all = await getCollection('articles', (e) => !e.data.noindex || import.meta.env.DEV);
  return all.sort((a, b) => b.data.updated.getTime() - a.data.updated.getTime());
}

/** Markdown → 纯文本，供搜索索引与字数检查 */
export function toPlain(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/[*_`>|#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
