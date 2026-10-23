import { search, type SearchDoc } from './search-core';

/** 站点根目录：本模块位于 /_astro/ 下，所以上一级就是根目录（预览环境同样适用） */
const ROOT = new URL(/* @vite-ignore */ '../', import.meta.url);
const link = (u: string) => new URL(u.replace(/^\//, ''), ROOT).href;

let cache: SearchDoc[] | null = null;
export async function loadIndex(): Promise<SearchDoc[]> {
  if (cache) return cache;
  const res = await fetch(link('/search-index.json'), { cache: 'force-cache' });
  cache = (await res.json()) as SearchDoc[];
  return cache;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function highlight(text: string, q: string) {
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 0).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  let html = esc(text);
  if (!words.length) return html;
  return html.replace(new RegExp(`(${words.join('|')})`, 'gi'), '<mark>$1</mark>');
}

export function renderResults(list: HTMLElement, hint: HTMLElement | null, docs: SearchDoc[], q: string) {
  const results = search(docs, q);
  if (!q.trim()) {
    list.innerHTML = '';
    if (hint) hint.textContent = '支持中文、品牌名、英文别名与常见口语（如“梯子”“翻墙”“小火箭”）。';
    return results;
  }
  if (!results.length) {
    list.innerHTML = '';
    if (hint) hint.innerHTML = `没有找到“${esc(q)}”相关内容。试试更短的词，例如“Clash”“订阅”“专线”，或在 <a href="${link('/wangzhan-ditu/')}">网站地图</a> 中查找。`;
    return results;
  }
  if (hint) hint.textContent = `找到 ${results.length} 条结果`;
  list.innerHTML = results
    .map((r) => `<li><a href="${link(r.u)}"><span class="tag">${esc(r.c)}</span> <span class="t">${highlight(r.t, q)}</span><span class="s">${highlight(r.snippet, q)}</span></a></li>`)
    .join('');
  return results;
}

export function initSearchDialog() {
  const dlg = document.getElementById('search-dialog') as HTMLDialogElement | null;
  const input = document.getElementById('search-input') as HTMLInputElement | null;
  const list = document.getElementById('search-results');
  const hint = document.getElementById('search-hint');
  if (!dlg || !input || !list) return;
  let timer: number | undefined;

  const open = async () => {
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else { location.href = link('/search/'); return; }
    input.focus();
    loadIndex().catch(() => { if (hint) hint.textContent = '搜索索引加载失败，请刷新页面重试。'; });
  };
  document.querySelectorAll('[data-open-search]').forEach((b) => b.addEventListener('click', open));
  document.querySelectorAll('[data-close-search]').forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  // type="search" 的输入框会把第一次 Esc 用来清空文字；这里让 Esc 一次就关闭弹窗（输入的文字保留，下次打开还在）
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); dlg.close(); }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !dlg.open && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      open();
    }
  });
  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(async () => renderResults(list, hint, await loadIndex(), input.value), 120);
  });
}
