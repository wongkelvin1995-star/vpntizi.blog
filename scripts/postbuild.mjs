#!/usr/bin/env node
/** 构建后：生成 IndexNow 变更清单（每个可索引 URL 的正文哈希），供 indexnow.mjs 对比新增/更新/删除 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://vpntizi.blog';

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

const manifest = {};
for (const file of walk(DIST)) {
  const html = readFileSync(file, 'utf8');
  if (/<meta name="robots" content="noindex/.test(html)) continue;
  const rel = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  if (rel.startsWith('/404')) continue;
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [html])[0];
  const head = [(html.match(/<title>[^<]*<\/title>/) || [''])[0], (html.match(/<meta name="description"[^>]*>/) || [''])[0]].join('');
  manifest[SITE + rel] = createHash('sha1').update(head + main).digest('hex').slice(0, 16);
}
writeFileSync(join(DIST, 'indexnow-manifest.json'), JSON.stringify({ generated: new Date().toISOString(), urls: manifest }, null, 0));

const key = existsSync('.indexnow-key') ? readFileSync('.indexnow-key', 'utf8').trim() : '';
if (!key || !existsSync(join(DIST, `${key}.txt`))) console.warn('⚠ IndexNow 密钥文件缺失：请确认 public/<key>.txt 与 .indexnow-key 一致');
console.log(`postbuild：IndexNow 清单 ${Object.keys(manifest).length} 个 URL`);
