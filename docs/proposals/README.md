# docs/proposals — 将来考虑项

本目录存放**已讨论但尚未实施**的提案 / 将来要考虑做的事情。它们不是现行约定：实施前请以根 `AGENTS.md` 为准；本目录内容不改变现有目录结构、清单流程或世界规范。

## 状态约定

- `proposed`：已提出，待讨论。
- `deferred`：已讨论、决定暂缓（记录决策日期与原因）。
- `accepted`：已决定实施，待落地。
- `implemented`：已落地（落地后应更新 AGENTS.md 并把本文件标记为 implemented 或归档）。

每份提案请在开头标明状态、类型、关联提案，并在结尾保留「决策记录」。

## 当前清单

| 文件 | 主题 | 状态 |
| --- | --- | --- |
| [world-groups.md](world-groups.md) | 世界组：按 agent / 主题切分目录与清单，总大厅只加载组 | deferred（2026-11-17） |
| [build-time-manifest.md](build-time-manifest.md) | 构建期清单生成：per-world 元数据 + CI 单写者，根治共享清单冲突 | deferred（2026-11-17） |

## 如何新增

1. 新建 `<kebab-case>.md`，开头写状态 / 类型 / 关联提案。
2. 写清动机、方案、冲突 / 成本 / 离线约束分析、开放问题。
3. 结尾加「决策记录」，并在上表登记。