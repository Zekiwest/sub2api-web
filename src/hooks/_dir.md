# _dir.md - src/hooks 目录索引

> **本文件夹内容变更时必须同步更新本 _dir.md**
> 最后更新: 2026-05-18

## 目录目的

`src/hooks/` 存放自定义 React Hooks，提供可复用的状态逻辑和副作用处理。

## 文件清单

| 文件 | 作用 | 输入 | 输出 | 使用者 |
|------|------|------|------|--------|
| `use-mobile.ts` | 移动端检测 Hook | - | `boolean` (isMobile) | sidebar 组件 |

## Hook 详情

### use-mobile.ts
- 检测窗口宽度是否小于 768px
- 返回 `true` 表示移动端
- 使用 `window.matchMedia` 监听变化
- 用于 Sidebar 收拢/展开逻辑

## 依赖关系

```mermaid
graph LR
    H[use-mobile.ts] --> W[window.matchMedia]
    S[sidebar组件] --> H
```

## GEB 自指规则

当发生以下变更时，必须更新本文件：
- 新增/删除 Hook 文件
- Hook 功能用途发生变化
- Hook 依赖关系变化