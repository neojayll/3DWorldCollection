#!/usr/bin/env node
/**
 * 把 worlds/manifest.json 同步进根目录 index.html 的内联清单块。
 *
 * 为什么需要内联：双击打开时页面处于 file:// 协议，浏览器会拦截对本地 JSON 的
 * fetch（CORS），因此 index.html 里保留一份同源可读的副本作为兜底。
 *
 * 用法：
 *   node tools/sync-manifest.mjs           写入内联清单
 *   node tools/sync-manifest.mjs --check   只检查是否已同步（未同步时退出码 1）
 */
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = join(ROOT, 'worlds', 'manifest.json');
const HUB_PATH = join(ROOT, 'index.html');
const CHECK_ONLY = process.argv.includes('--check');

const BEGIN = '<!-- MANIFEST:BEGIN -->';
const END = '<!-- MANIFEST:END -->';

function fail(message) {
  console.error('✗ ' + message);
  process.exit(1);
}

function warn(message) {
  console.warn('! ' + message);
}

function readManifest() {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (err) {
    fail('无法解析 worlds/manifest.json：' + err.message);
  }
  if (!manifest || !Array.isArray(manifest.worlds)) {
    fail('worlds/manifest.json 必须包含 worlds 数组');
  }

  const seen = new Set();
  manifest.worlds.forEach((world, i) => {
    const where = `worlds[${i}]`;
    if (!world || typeof world !== 'object') fail(`${where} 不是对象`);
    if (typeof world.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(world.id)) {
      fail(`${where}.id 必须是 kebab-case 小写标识，例如 "dusk-isle"`);
    }
    if (seen.has(world.id)) fail(`${where}.id "${world.id}" 重复`);
    seen.add(world.id);

    for (const key of ['name', 'entry', 'cover']) {
      if (typeof world[key] !== 'string' || !world[key].length) {
        fail(`${where}.${key} 必须是非空字符串`);
      }
    }
    if (!world.entry.startsWith('worlds/') || !world.entry.endsWith('.html')) {
      fail(`${where}.entry 必须指向 worlds/<slug>/*.html，当前为 "${world.entry}"`);
    }
    if (!existsSync(join(ROOT, world.entry))) {
      fail(`${where}.entry 指向的文件不存在：${world.entry}`);
    }
    if (!existsSync(join(ROOT, world.cover))) {
      fail(`${where}.cover 指向的文件不存在：${world.cover}`);
    }
    const coverSize = statSync(join(ROOT, world.cover)).size;
    if (coverSize > 500 * 1024) {
      warn(`${where}.cover 有 ${Math.round(coverSize / 1024)} KB，建议压缩到 500 KB 以内`);
    }
  });

  return manifest;
}

function buildBlock(manifest) {
  const json = JSON.stringify(manifest, null, 2)
    .split('\n')
    .map((line) => '  ' + line)
    .join('\n');
  return [
    '  ' + BEGIN,
    '  <script type="application/json" id="manifest-inline">',
    json,
    '  </script>',
    '  ' + END,
  ].join('\n');
}

const manifest = readManifest();
const hub = readFileSync(HUB_PATH, 'utf8');
const pattern = new RegExp(
  '\\s*' + BEGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);
if (!pattern.test(hub)) {
  fail('index.html 中找不到 MANIFEST:BEGIN / MANIFEST:END 标记');
}

const block = buildBlock(manifest);
const next = hub.replace(pattern, '\n' + block);
const inSync = next === hub;

if (CHECK_ONLY) {
  if (!inSync) {
    fail('index.html 的内联清单与 worlds/manifest.json 不一致，请运行 node tools/sync-manifest.mjs');
  }
  console.log(`✓ 内联清单已同步（${manifest.worlds.length} 个世界）`);
  process.exit(0);
}

if (inSync) {
  console.log(`✓ 内联清单已是最新（${manifest.worlds.length} 个世界）`);
  process.exit(0);
}

writeFileSync(HUB_PATH, next);
console.log(`✓ 已写入内联清单（${manifest.worlds.length} 个世界）`);
