# PROJECT_INDEX.md - GEB L1 项目索引

> **本文件是 GEB L1 索引，任何项目结构或重要文件变更后必须更新我**
> 最后更新: 2026-05-16

## 项目概述

Sub2API Web 是 Sub2API AI Gateway 平台的前端应用，为用户提供 API Key 管理和 Token 使用追踪功能。采用现代 shadcn/ui 组件库构建，支持中英双语切换。

## 架构概述

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React App)                      │
├─────────────────────────────────────────────────────────────┤
│  Pages (App Router)    │  Components       │  Stores        │
│  - /                   │  - Sidebar (v2)   │  - auth.ts      │
│  - /login              │  - Header (v2)    │  - locale.ts    │
│  - /register           │  - LanguageSwitch │                 │
│  - /dashboard          │  - Layout         │                 │
│  - /keys               │                   │                 │
│  - /usage              │                   │                 │
├─────────────────────────────────────────────────────────────┤
│                 Lib Layer (API + i18n)                       │
│  - auth.ts (认证)     │  - keys.ts (Key)  │  - usage.ts     │
│  - i18n/ (翻译系统)   │  - en.json        │  - zh.json      │
├─────────────────────────────────────────────────────────────┤
│                     Types (index.ts)                         │
│  - User, ApiKey, UsageLog, DashboardStats, etc.              │
├─────────────────────────────────────────────────────────────┤
│                   Backend API (Go + Gin)                     │
│  REST API: /api/v1/auth, /api/v1/keys, /api/v1/usage        │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 15.2.4 |
| UI库 | shadcn/ui (Base UI) | 4.7.0 |
| 样式 | Tailwind CSS | 4.0 |
| 状态 | Zustand | 4.5.0 |
| HTTP | Axios | 1.6.0 |
| 图表 | Recharts | 3.8.0 |
| 通知 | react-hot-toast | 2.4.0 |
| 字体 | Montserrat + PingFang SC | - |
| 语言 | TypeScript | 5.4.0 |

## 依赖关系图 (Mermaid)

```mermaid
graph TD
    subgraph Pages
        P1[page.tsx - 首页]
        P2[login/page.tsx]
        P3[register/page.tsx]
        P4[dashboard/page.tsx]
        P5[keys/page.tsx]
        P6[usage/page.tsx]
    end

    subgraph Components
        C1[sidebar.v2.tsx]
        C2[dashboard-layout.tsx]
        C3[site-header.v2.tsx]
        C4[language-switcher.tsx]
        C5[providers.tsx]
    end

    subgraph Stores
        S1[auth.ts]
        S2[locale.ts]
    end

    subgraph Lib
        L1[auth.ts - 认证API]
        L2[keys.ts - Key API]
        L3[usage.ts - 使用API]
        L4[api.ts - Axios配置]
        L5[i18n/index.ts]
        L6[i18n/en.json]
        L7[i18n/zh.json]
    end

    subgraph Types
        T1[index.ts]
    end

    P2 --> S1
    P2 --> L1
    P2 --> L5
    P3 --> S1
    P3 --> L1
    P3 --> L5
    P4 --> C2
    P4 --> S1
    P4 --> L3
    P4 --> L5
    P5 --> C2
    P5 --> S1
    P5 --> L2
    P5 --> L5
    P6 --> C2
    P6 --> S1
    P6 --> L3
    P6 --> L5

    C2 --> C1
    C2 --> C3
    C1 --> S1
    C1 --> S2
    C1 --> L5
    C3 --> S1
    C3 --> S2
    C3 --> L5
    C3 --> C4
    C4 --> S2

    L1 --> L4
    L2 --> L4
    L3 --> L4

    L1 --> T1
    L2 --> T1
    L3 --> T1
    S1 --> T1
```

## 目录结构

```
src/
├── app/              # Next.js App Router 页面
│   ├── page.tsx      # 首页 (登录入口)
│   ├── layout.tsx    # 根布局 (字体配置)
│   ├── globals.css   # 全局样式 (CSS变量)
│   ├── login/        # 登录页
│   ├── register/     # 注册页
│   ├── dashboard/    # Dashboard (统计图表)
│   ├── keys/         # API Key 管理
│   └── usage/        # 使用日志
├── components/       # React 组件
│   ├── sidebar.v2.tsx   # Sidebar (Paper Design)
│   ├── site-header.v2.tsx # Header (Paper Design)
│   ├── language-switcher.tsx # 语言切换按钮
│   ├── dashboard-layout.tsx # 布局容器 (uifork)
│   ├── providers.tsx    # HeroUI Provider
│   └── ui/              # shadcn/ui 组件库
├── stores/           # Zustand 状态
│   ├── auth.ts       # 认证状态
│   └── locale.ts     # 语言状态
├── lib/              # 工具/API
│   ├── api.ts        # Axios 配置
│   ├── auth.ts       # 认证 API
│   ├── keys.ts       # Key CRUD
│   ├── usage.ts      # 使用统计 API
│   ├── i18n/         # 国际化
│   │   ├── index.ts  # useTranslation hook
│   │   ├── en.json   # 英文翻译
│   │   └── zh.json   # 中文翻译
│   └── utils.ts      # 工具函数
├── hooks/            # React Hooks
│   └── use-mobile.ts # 移动端检测
└── types/            # TypeScript 类型
    └── index.ts      # 全局类型定义
```

## 关键文件说明

| 文件 | 作用 | 重要程度 |
|------|------|----------|
| `src/types/index.ts` | 全局类型定义，所有 API/组件依赖 | ⭐⭐⭐ |
| `src/lib/api.ts` | Axios 客户端配置，所有 API 基础 | ⭐⭐⭐ |
| `src/stores/auth.ts` | 认证状态，控制登录态 | ⭐⭐⭐ |
| `src/stores/locale.ts` | 语言状态，控制界面语言 | ⭐⭐⭐ |
| `src/lib/i18n/index.ts` | 翻译系统核心 | ⭐⭐⭐ |
| `src/components/sidebar.v2.tsx` | Sidebar (Paper Design) | ⭐⭐ |
| `src/components/site-header.v2.tsx` | Header (Paper Design) | ⭐⭐ |

## API 端点映射

| 前端页面 | 后端端点 | 功能 |
|----------|----------|------|
| `/login` | `/auth/login` | 用户登录 |
| `/register` | `/auth/register` | 用户注册 |
| `/dashboard` | `/usage/dashboard/*` | 统计数据 |
| `/keys` | `/keys` (CRUD) | Key 管理 |
| `/usage` | `/usage` (logs) | 使用日志 |

## GEB 自指规则

本文件是 GEB 分型系统的 L1 索引节点。遵循以下规则：

1. **结构变更触发更新**: 任何新增/删除目录或重要文件时，必须更新本文档
2. **依赖同步**: 当依赖关系变化（如新增 API、修改 store）时，更新 Mermaid 图
3. **技术栈变更**: 当 package.json 有重大依赖变更时，更新技术栈表
4. **文件关联**: 本文件引用的任何子目录，必须有其对应的 `_dir.md`

---

*生成于 GEB 分型初始化 - 运行 `/geb-check` 验证完整性*