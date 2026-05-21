/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Dashboard 布局骨架组件 - 移动端适配版本 (v4)
 * 依赖关系: app-sidebar.v3, site-header.v3, stores/auth, hooks/use-mobile
 * 变更同步:
 *   - Sidebar 宽度变化时，需同步 site-header.v3 的 marginLeft（桌面端）
 *   - 布局元素变化时，需在 components/_dir.md 中记录
 * 版本记录:
 *   - 2026-05-20: 添加移动端适配，使用 Sheet 组件实现抽屉式 sidebar
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { SidebarV3 } from '@/components/app-sidebar.v3';
import { SiteHeaderV3 } from '@/components/site-header.v3';
import { useAuthStore } from '@/stores/auth';
import { useIsMobile } from '@/hooks/use-mobile';

const SIDEBAR_WIDTH_EXPANDED = 200;
const SIDEBAR_WIDTH_COLLAPSED = 52;

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global keyboard shortcut: ` (backtick) to toggle sidebar (桌面端)
  useEffect(() => {
    if (isMobile) return; // 移动端不启用键盘快捷键

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, isMobile]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* 移动端：Sheet 式 Sidebar */}
      {isMobile && (
        <SidebarV3
          isCollapsed={false}
          setIsCollapsed={() => {}}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      )}

      {/* 桌面端：固定左侧 Sidebar */}
      {!isMobile && (
        <SidebarV3
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      )}

      {/* Main Content Area */}
      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{
          flex: 1,
          backgroundColor: '#F9FAFB',
          marginLeft: isMobile ? 0 : 0, // 移动端无 margin，桌面端 sidebar 已固定定位
        }}
      >
        <SiteHeaderV3
          sidebarWidth={isMobile ? 0 : sidebarWidth}
          onMenuClick={isMobile ? () => setIsSidebarOpen(true) : undefined}
        />

        <main
          className="flex flex-col gap-6 flex-1 overflow-auto"
          style={{
            padding: isMobile ? '16px' : '24px',
            backgroundColor: '#F9FAFB',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}