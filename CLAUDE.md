# CLAUDE.md - GEB 分型系统永久规则

> 本文件定义 GEB (Gödel-Escher-Bach) 分型文档系统的维护规则
> 任何代码变更必须遵守此规则，确保文档与代码同构

---

## GEB 核心原则

### 奇异循环 (Strange Loop)
代码与文档形成自指、自相似的循环结构：
- 代码变更 → 文档同步更新
- 文档变更 → 代码验证检查

### 分形结构 (Fractal)
文档分为三个层级，每层包含相同的结构模式：

| 层级 | 文件名 | 范围 | 内容 |
|------|--------|------|------|
| L1 | PROJECT_INDEX.md | 项目级 | 整体架构、依赖图、技术栈 |
| L2 | _dir.md | 目录级 | 目录目的、文件清单、输入/输出 |
| L3 | 注释块 | 文件级 | 文件作用、依赖、变更同步规则 |

---

## GEB 维护规则

### 规则 1: 结构变更触发更新
当发生以下变更时，必须更新对应的 GEB 文档：

```
新增文件    → L3 注释块 + L2 _dir.md
删除文件    → L2 _dir.md (移除引用)
新增目录    → L2 _dir.md + L1 PROJECT_INDEX.md
删除目录    → L1 PROJECT_INDEX.md
依赖变化    → L1/L2 Mermaid 图
技术栈变化  → L1 PROJECT_INDEX.md
```

### 规则 2: 自指声明
每个 GEB 文档必须包含自指声明：

**L1 格式:**
```
> **本文件是 GEB L1 索引，任何项目结构或重要文件变更后必须更新我**
```

**L2 格式:**
```
> **本文件夹内容变更时必须同步更新本 _dir.md**
```

**L3 格式:**
```
变更同步:
  - [条件1] → [需同步的内容1]
  - [条件2] → [需同步的内容2]
```

### 规则 3: Mermaid 依赖图
L1 和关键 L2 文档必须包含 Mermaid 依赖图，可视化展示：
- 页面之间的导航关系
- 组件之间的依赖关系
- API 模块的调用关系
- Store 的使用关系

### 规则 4: 类型中枢同步
`src/types/index.ts` 是全项目类型中枢，任何类型变更必须：
1. 检查所有使用该类型的文件
2. 验证与后端 API 响应结构一致
3. 更新 types/_dir.md

---

## GEB 文件清单

本项目已完成 GEB 初始化，以下文件已创建：

### L1 项目级
- `/PROJECT_INDEX.md` - 项目整体索引

### L2 目录级
- `/src/_dir.md`
- `/src/app/_dir.md`
- `/src/app/login/_dir.md`
- `/src/app/register/_dir.md`
- `/src/app/dashboard/_dir.md`
- `/src/app/keys/_dir.md`
- `/src/app/usage/_dir.md`
- `/src/components/_dir.md`
- `/src/stores/_dir.md`
- `/src/lib/_dir.md`
- `/src/types/_dir.md`

### L3 文件级 (已添加注释块)
- `src/types/index.ts`
- `src/lib/api.ts`
- `src/lib/auth.ts`
- `src/lib/keys.ts`
- `src/lib/usage.ts`
- `src/stores/auth.ts`
- `src/components/sidebar.tsx`
- `src/components/dashboard-layout.tsx`
- `src/app/layout.tsx`

---

## GEB 命令

### 检查完整性
```
/geb-check
```
验证所有 GEB 文档是否存在、自指声明是否完整、Mermaid 图是否有效。

### 更新依赖图
```
/geb-update-deps
```
自动分析代码依赖关系，更新所有 Mermaid 图。

### 同步变更
```
/geb-sync [文件路径]
```
当指定文件变更后，自动更新相关的 L2/L1 文档。

---

## Claude 行为要求

当 Claude 在此项目中工作时：

1. **新文件创建时**: 自动添加 L3 注释块，更新 L2 _dir.md
2. **文件删除时**: 更新 L2 _dir.md，移除引用
3. **依赖变化时**: 提示用户运行 `/geb-update-deps`
4. **结构变化时**: 提示用户更新 PROJECT_INDEX.md

Claude 应主动维护 GEB 系统，而非被动等待用户请求。

---

*GEB 分型系统初始化完成 - 2026-05-14*
*下一步: 运行 `/geb-check` 验证完整性*