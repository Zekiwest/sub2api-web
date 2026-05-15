/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: SaaS Dashboard 布局骨架组件，Header + Sidebar + 主内容区（支持折叠）
 * 依赖关系: components/sidebar.tsx, components/header.tsx
 * 变更同步:
 *   - 布局宽度变化时，需同步调整 sidebar.tsx 宽度
 *   - 新增布局元素时，需在 components/_dir.md 中记录
 * ============================================================================
 */

'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Area */}
      <div className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}