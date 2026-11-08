# AGENTS.md

本仓库是「三维世界收藏 / 3D World Collection」：一个纯静态的 3D 世界入口大厅，加上若干个自包含的 3D 世界。目标是在**不安装任何依赖、不运行构建**的前提下，双击 `index.html` 就能浏览；新增一个世界只需要「加目录、登记清单、同步内联副本」三步。

面向后续 AI 与人类贡献者，以下规则按可执行顺序排列。

## 1. 目录与职责

```
.
├── index.html              # 世界入口大厅（唯一入口，单文件、无构建）
├── worlds/
│   ├── manifest.json       # 世界清单，唯一数据源
│   └── <slug>/             # 一个世界一个目录
│       ├── index.html      # 世界本体，单文件自包含
│       ├── preview.jpg     # 大厅卡片封面 16:10
│       └── README.md       # 可选，说明交互与来源
├── tools/
│   └── sync-manifest.mjs   # 把 manifest.json 注入根 index.html 的内联兜底块
├── AGENTS.md
└── README.md
```

不要新增构建工具、包管理器配置或框架。`tools/sync-manifest.mjs` 是零依赖的 Node 脚本（Node ≥ 18），只在登记世界时手动运行，站点本身运行时不依赖它。

## 2. 核心机制：清单与 file://

- `worlds/manifest.json` 是**唯一清单源**。
- 根 `index.html` 内有一段 `<!-- MANIFEST:BEGIN --> … <!-- MANIFEST:END -->` 包裹的内联 JSON 副本。原因：双击打开时页面处于 `file://` 协议，浏览器会以 CORS 拦截对本地 JSON 的 `fetch`。
- 运行时行为：`http(s)` 下 `fetch('worlds/manifest.json')`，失败则回退内联；`file://` 下跳过 `fetch`，直接读内联副本（这样控制台不会出现 CORS 报错）。
- **因此：改完 `worlds/manifest.json` 必须运行 `node tools/sync-manifest.mjs`**，否则双击打开会看到旧列表。`node tools/sync-manifest.mjs --check` 用于提交前确认两边一致（不一致时退出码为 1）。

## 3. 新增一个世界（按顺序执行）

1. **定 slug**：小写 kebab-case，只含 `a-z0-9-`，例如 `endless-dunes`。目录名、`manifest.json` 的 `id`、`entry` 路径中的目录名必须三者一致。
2. **建目录并放本体**：`worlds/<slug>/index.html`。硬性要求：
   - 单文件自包含：three.js 等依赖必须内联（可参考 `worlds/dusk-isle/index.html` 的打包方式），**禁止 CDN、外部字体、远程贴图**。
   - 必须有 `<meta charset="utf-8">` 与 `<meta name="viewport" content="width=device-width, initial-scale=1">`。
   - 必须有返回入口，放在右上角且不遮挡主场景：`<a class="back" href="../../index.html">← 世界入口</a>`（样式可复制 dusk-isle 的 `.back`）。
   - `<canvas>` 要有 `aria-label` 描述场景；触屏需支持拖动/缩放，不能只支持鼠标。
   - 加载失败时显示可读文字，不能白屏或只留下 console 报错。
   - `<title>` 用「中文名 · English Name」格式。
3. **生成封面** `worlds/<slug>/preview.jpg`：
   - 16:10，1600 × 1000，≤ 500 KB，JPEG（渐进式）。
   - 画面为纯场景截图，**不要包含页面 HUD、标题、提示条等 UI 文字**（截图时隐藏或用裁切去掉）。
   - 推荐从 3200 × 2000 截图居中裁切后缩放；示例脚本可写成一行 Python/Pillow 命令。
4. **可选** `worlds/<slug>/README.md`，至少写清交互方式、文件构成、是否离线可运行。
5. **登记清单**：在 `worlds/manifest.json` 的 `worlds` 数组末尾追加一条（字段见第 4 节）。
6. **同步内联副本**：`node tools/sync-manifest.mjs`。
7. **自查并提交**：见第 8 节。

## 4. 清单字段规范

```json
{
  "id": "dusk-isle",
  "name": "暮色浮岛",
  "nameEn": "Dusk Isle",
  "description": "黄昏之下，一座低多边形小岛缓缓浮游，木屋的灯刚刚亮起。",
  "entry": "worlds/dusk-isle/index.html",
  "cover": "worlds/dusk-isle/preview.jpg",
  "tags": ["黄昏", "低多边形", "可交互"],
  "added": "2026-11"
}
```

| 字段 | 必需 | 约束 |
| --- | --- | --- |
| `id` | 是 | 唯一，kebab-case，与目录名一致 |
| `name` | 是 | 中文名，2–8 字 |
| `nameEn` | 建议 | 卡片右上角小字，全大写风格由 CSS 处理 |
| `description` | 是 | 一句话，≤ 44 个汉字，句末带标点 |
| `entry` | 是 | 以 `worlds/` 开头、以 `.html` 结尾，文件必须真实存在 |
| `cover` | 是 | 指向 preview.jpg，文件必须真实存在，≤ 500 KB |
| `tags` | 建议 | 1–3 个短标签，每个 ≤ 5 字 |
| `added` | 建议 | `YYYY-MM` |

`sync-manifest.mjs` 会校验必填字段、`id` 唯一性、路径存在性与封面体积；校验失败时不要绕过脚本手改内联 JSON。

## 5. 命名与文件约定

- 世界目录：`worlds/<slug>/`；固定文件名 `index.html`、`preview.jpg`、`README.md`。
- 世界内部自定义资源（如需）：放同目录，文件名用 kebab-case，例如 `noise.webp`、`palette.js`；不允许跨世界引用另一个世界的资源。
- 不提交 `node_modules/`、`_build/`、原始超大截图、`.DS_Store`、`Thumbs.db`。
- 文本文件 UTF-8；`.gitattributes` 已把 PNG/JPG 标记为 binary，并统一文本为 LF，不要改回去。

## 6. 视觉与交互约定

- 与大厅保持同一气质：黄昏、暖橙 `#ffb37a`、深紫夜空 `#241430`、低多边形、柔光与暗角；不要高饱和撞色或纯白背景。
- 字体只用系统字体栈：标题衬线（`Georgia, Songti SC, STSong, SimSun, serif`），正文无衬线（`PingFang SC, Microsoft YaHei, …`）。不引入 Web Font。
- 动效时长 200–600 ms，缓动优先 `cubic-bezier(.22,.61,.36,1)`；所有动画必须在 `@media (prefers-reduced-motion: reduce)` 下可关闭。
- 世界页至少适配 390 px、768 px、1440 px 三档，窄屏不得出现横向滚动。
- 交互元素需要 `:focus-visible` 样式；不要用 `div` 冒充按钮/链接。

## 7. 性能与体积

- 单个世界 `index.html` ≤ **1.5 MB**（three.js 内联约 670 KB，是当前基线）。超出时先移除未使用的模块/贴图，而不是外链。
- 预览图 ≤ **500 KB**；每个世界目录总体积尽量 ≤ 2 MB。
- WebGL：`renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`；`document.hidden` 时暂停 `requestAnimationFrame`；重复物体（草、石）用 InstancedMesh 或合并几何。
- 纹理尽量程序化生成（Canvas/DataTexture），避免提交大图。
- 不允许任何运行时网络请求；离线打开必须完整可用。

## 8. 提交前检查清单

```bash
node tools/sync-manifest.mjs --check   # 内联清单与 manifest.json 一致
node --check tools/sync-manifest.mjs   # 脚本语法自检（可选）
git status                             # 只包含预期的世界文件与清单改动
```

浏览器（Chrome 即可）逐项确认：

1. 双击根 `index.html`：卡片全部渲染、封面不裂、数量角标准确、无控制台 error。
2. 点击新世界卡片：进入对应 `worlds/<slug>/index.html`，场景可交互，无控制台 error。
3. 点击世界页右上角「← 世界入口」：回到大厅。
4. 窄屏（约 390 px）：无横向滚动，卡片单列，文字不溢出。
5. `http://` 本地起服务（`python -m http.server`）再开一次，确认走 `fetch` 路径时列表同样正确。

## 9. 禁止事项

- 不要为了省事在根 `index.html` 里写死卡片列表；一切世界来自清单。
- 不要在 `file://` 场景下改用 `fetch` 读取本地 JSON 而不保留内联兜底。
- 不要引入框架、打包器、CSS 预处理器或运行时依赖（React/Vue/Tailwind 等）。
- 不要在未同步 `manifest.json` 的情况下提交根 `index.html` 的清单改动。
- 不要提交凭据、个人路径或与站点无关的临时文件。
