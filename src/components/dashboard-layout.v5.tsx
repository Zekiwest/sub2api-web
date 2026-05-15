/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: SaaS Dashboard 布局骨架组件 - shadcn 版本 (v2)
 * 依赖关系: components/app-sidebar.tsx, components/site-header.tsx, ui/sidebar
 * 变更同步:
 *   - 布局宽度变化时，需同步调整 sidebar 相关 CSS 变量
 *   - 新增布局元素时，需在 components/_dir.md 中记录
 * ============================================================================
 */

'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { TooltipProvider } from '@/components/ui/tooltip';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}