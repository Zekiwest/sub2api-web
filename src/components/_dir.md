# _dir.md - src/components 目录索引

> **本文件夹内容变更时必须同步更新本 _dir.md**
> 最后更新: 2026-05-18

## 目录目的

`src/components/` 存放可复用 React 组件，包括布局骨架、导航、Provider 等基础设施组件。

## 文件清单

| 文件 | 作用 | 输入 | 输出 | 使用者 |
|------|------|------|------|--------|
| `app-sidebar.v2.tsx` | Sidebar (Paper Design) | `isCollapsed`, `setIsCollapsed` | 收拢导航 | `dashboard-layout.tsx` |
| `site-header.v2.tsx` | Header (Paper Design) | `user` state | Header + 语言切换 | `dashboard-layout.tsx` |
| `language-switcher.tsx` | 语言切换下拉 | `locale` state | 🇺🇸/🇨🇳 切换 | `site-header.v2.tsx` |
| `dashboard-layout.tsx` | Dashboard 布局容器 | children | Sidebar + Header + Main | 所有认证页面 |
| `providers.tsx` | Provider 包装 (toast + uifork) | children | Toast 上下文 | `app/layout.tsx` |
| `ui/` | shadcn/ui + 自定义组件 | - | Button, Card, KPI 等 | 多处引用 |

## 子目录索引

- **[ui/_dir.md](ui/_dir.md)** - shadcn/ui 基础组件 + Tremor 风格自定义组件

## 组件依赖图

```mermaid
graph TD
    P[providers.tsx] --> L[layout.tsx]
    DL[dashboard-layout.tsx] --> S[app-sidebar.v2.tsx]
    DL --> H[site-header.v2.tsx]
    H --> LS[language-switcher.tsx]
    
    S --> AS[stores/auth.ts]
    S --> LC[stores/locale.ts]
    S --> I18N[lib/i18n]
    
    H --> AS
    H --> LC
    H --> I18N
    
    LS --> LC
    
    DL --> PAGES[dashboard/keys/usage pages]
    
    UI[ui/*] --> DL
    KPI[ui/kpi-card.tsx] --> DASH[dashboard/page.tsx]
    SPARK[ui/spark-chart.tsx] --> KPI
```

## 关键设计

### dashboard-layout.tsx
- 固定左侧 Sidebar (可收拢: 52px / 展开: 200px)
- 顶部 Header (56px)
- 主内容区自适应

### app-sidebar.v2.tsx (Paper Design)
- Logo 区域 (56px)
- 收拢宽度: 52px (居中对齐图标)
- 导航菜单: Dashboard, API Keys, Usage
- 用户头像 + 名称 + 余额
- 收起/展开按钮
- 使用 `useTranslation` 获取翻译

### site-header.v2.tsx (Paper Design)
- Logo + 标题
- 语言切换下拉 (🇺🇸/🇨🇳)
- 用户下拉菜单 (设置/退出)

### language-switcher.tsx
- DropdownMenu 组件
- 语言选项: English (🇺🇸), 中文 (🇨🇳)
- 使用 `useLocaleStore` 切换语言

### ui/kpi-card.tsx (Tremor Blocks 风格)
- 大数字 + 趋势百分比指示 (↑绿/↓红)
- Lucide React 图标支持
- 嵌入 SparkChart 迷你趋势图

### ui/spark-chart.tsx
- SparkAreaChart / SparkLineChart / SparkBarChart
- 嵌入 KPI 卡片展示趋势

## GEB 自指规则

当发生以下变更时，必须更新本文件：
- 新增/删除组件文件
- 组件功能用途发生变化
- 组件依赖关系变化
- Paper 设计样式变化需同步组件样式
- ui/ 目录新增组件需同步 ui/_dir.md