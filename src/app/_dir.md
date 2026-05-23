# _dir.md - src/app 目录索引

> **本文件夹内容变更时必须同步更新本 _dir.md**
> 最后更新: 2026-05-23

## 目录目的

`src/app/` 是 Next.js App Router 路由目录，定义应用的所有页面路由。每个子目录对应一个 URL 路径。

## 子目录结构 (路由映射)

| 子目录 | URL 路径 | 页面功能 | 认证要求 |
|--------|----------|----------|----------|
| `(root)` | `/` | 首页入口，展示登录/注册按钮 | 无 |
| `login/` | `/login` | 用户登录表单 | 无 |
| `register/` | `/register` | 用户注册表单 | 无 |
| `dashboard/` | `/dashboard` | 使用统计仪表板 | 需登录 |
| `keys/` | `/keys` | API Key 管理页面 | 需登录 |
| `groups/` | `/groups` | API Key 分组管理 | 需登录 |
| `usage/` | `/usage` | 使用日志列表 | 需登录 |
| `settings/` | `/settings` | 用户设置 (Profile, Password, Language) | 需登录 |
| `invite/` | `/invite` | 邀请功能 (链接, 统计, 列表) | 需登录 |

## 主要文件

| 文件 | 作用 | 依赖 |
|------|------|------|
| `layout.tsx` | 根布局，挂载 HeroUI Provider | `components/providers.tsx` |
| `page.tsx` | 首页组件 | HeroUI Card, Link |
| `globals.css` | 全局 CSS 样式 | Tailwind CSS |

## 路由保护逻辑

需认证页面 (`dashboard`, `keys`, `groups`, `usage`, `settings`, `invite`) 通过 `useAuthStore` 检查登录态：
- 未登录 → 重定向至 `/login` (或返回 null)
- 已登录 → 渲染页面内容

## GEB 自指规则

当发生以下变更时，必须更新本文件：
- 新增/删除路由子目录
- 路由认证要求发生变化
- layout.tsx 配置变更