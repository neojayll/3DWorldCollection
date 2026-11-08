# 三维世界收藏 · 3D World Collection

一个纯静态的 3D 世界入口大厅，收藏黄昏、星光与小小的岛。
无构建、无依赖、离线可运行，可直接部署到 GitHub Pages。

## 目录结构

```
.
├── index.html              # 世界入口大厅（卡片由清单驱动渲染）
├── worlds/
│   ├── manifest.json       # 世界清单（唯一数据源）
│   └── dusk-isle/          # 第一个世界：暮色浮岛
│       ├── index.html      # 单文件 3D 场景（three.js 已内联）
│       ├── preview.jpg     # 大厅卡片封面
│       └── README.md
├── tools/
│   └── sync-manifest.mjs   # 把清单注入大厅内联兜底块（Node ≥ 18，零依赖）
├── AGENTS.md               # 贡献/AI 协作规则
└── README.md
```

## 本地预览

最简单：直接双击根目录的 `index.html`。

- `file://` 下浏览器会拦截对本地 JSON 的 `fetch`，因此大厅内置了一份由 `tools/sync-manifest.mjs` 同步的内联清单；双击也能看到全部世界，且控制台无报错。
- 想验证 `http://` 下读取 `worlds/manifest.json` 的路径，可在仓库根目录运行：

```bash
python -m http.server 8000
# 打开 http://localhost:8000/
```

## 新增一个世界

1. 新建 `worlds/<slug>/`，放入自包含的 `index.html` 和 16:10 的 `preview.jpg`（不放 CDN、不引外部字体）。
2. 在 `worlds/manifest.json` 的 `worlds` 数组里追加一条（`id`、`name`、`description`、`entry`、`cover` 等）。
3. 运行 `node tools/sync-manifest.mjs`，然后双击大厅检查卡片与跳转。

世界页请保留右上角「← 世界入口」返回链接。字段规范、体积与风格约定、提交前检查清单详见 [AGENTS.md](AGENTS.md)。

## 部署到 GitHub Pages

仓库：<https://github.com/neojayll/3DWorldCollection>

1. 进入仓库 **Settings → Pages**；
2. **Source** 选择 *Deploy from a branch*；
3. 分支选 `main`，目录选 `/ (root)`，保存；
4. 稍等片刻后访问：<https://neojayll.github.io/3DWorldCollection/>

站点全部是相对路径，放在用户/项目子路径下也能正常工作。

## 已收录

| 世界 | 目录 | 交互 |
| --- | --- | --- |
| 暮色浮岛 · Dusk Isle | `worlds/dusk-isle/` | 拖拽旋转 / 滚轮缩放 / 触屏拖动 |
