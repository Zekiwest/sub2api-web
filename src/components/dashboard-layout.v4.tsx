/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Dashboard 布局骨架组件 - Paper Design 版本 (v3)
 * 依赖关系: app-sidebar.v2, site-header.v2, stores/auth
 * 变更同步:
 *   - Sidebar 宽度变化时，需同步 site-header.v2 的 marginLeft
 *   - 布局元素变化时，需在 components/_dir.md 中记录
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { SidebarV2 } from '@/components/app-sidebar.v2';
import { SiteHeaderV2 } from '@/components/site-header.v2';
import { useAuthStore } from '@/stores/auth';

const SIDEBAR_WIDTH_EXPANDED = 200;
const SIDEBAR_WIDTH_COLLAPSED = 52;

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Global keyboard shortcut: ` (backtick) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <SidebarV2 isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div
        className="flex flex-col flex-1 overflow-auto"
        style={{
          marginLeft: sidebarWidth,
          backgroundColor: '#F9FAFB',
        }}
      >
        <SiteHeaderV2 sidebarWidth={sidebarWidth} />

        <main className="flex-1 p-6 pt-14 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}