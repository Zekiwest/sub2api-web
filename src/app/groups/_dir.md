# src/app/groups/_dir.md - GEB L2 目录索引

> **本文件夹内容变更时必须同步更新本 _dir.md**

## 目录目的

API Key 分组管理页面，提供分组的 CRUD 操作界面。

## 文件清单

| 文件 | 作用 | 依赖 |
|------|------|------|
| `page.tsx` | 分组管理页面 | `lib/groups.ts`, `stores/auth.ts`, `lib/i18n` |

## 输入/输出

```
输入:
  - 用户认证状态 (auth store)
  - 分组列表 (groups API)

输出:
  - 分组 CRUD 操作
  - 分组列表展示
```

## 关联组件

- `components/dashboard-layout.v4.tsx` - 布局容器
- `components/ui/dialog.tsx` - Dialog 弹窗
- `components/ui/responsive-table.tsx` - 响应式表格

## GEB 自指规则

本目录遵循 GEB 分型规则：

1. 新增文件时，需在本文件清单中添加记录
2. 删除文件时，需从清单中移除并检查依赖
3. 修改文件依赖时，需更新依赖列

---

*生成于 GEB 分型更新 - 2026-05-23*