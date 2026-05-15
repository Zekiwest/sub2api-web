/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: SaaS 左侧导航栏组件 - 古典优雅版本 (v5)
 * 依赖关系: stores/auth.ts, Next.js Link, HeroUI Avatar
 * 变更同步:
 *   - 导航项变化时，需检查所有路由页面是否存在
 *   - 键盘快捷键变化时，需更新提示文本
 * ============================================================================
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/keys', label: 'API Keys', icon: '🔑' },
  { path: '/usage', label: 'Usage', icon: '📈' },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

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
  }, [isCollapsed, setIsCollapsed]);

  const isActive = (path: string) => pathname === path;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-[200px]'
      }`}
    >
      {/* Logo & Collapse Button */}
      <div className={`border-b border-sidebar-border ${isCollapsed ? 'p-3' : 'p-6'}`}>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-sidebar-accent rounded flex items-center justify-center text-primary-foreground font-bold text-sm">
              S2
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-sidebar-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                Sub2API
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-6'}`}>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 rounded-sm transition-all ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
                } ${
                  isActive(item.path)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-muted hover:text-muted-foreground'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && (
                  <span className="text-base" style={{ fontFamily: 'var(--font-sans)', letterSpacing: 'var(--tracking-normal)' }}>
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className={`border-t border-sidebar-border ${isCollapsed ? 'p-2' : 'p-6'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar size="sm">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate" style={{ fontFamily: 'var(--font-sans)' }}>
                {user?.username}
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                ${user?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      {!isCollapsed && (
        <div className="px-6 py-3 text-xs text-muted-foreground border-t border-sidebar-border" style={{ fontFamily: 'var(--font-sans)' }}>
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs mx-1">`</kbd> to toggle
        </div>
      )}
    </aside>
  );
}