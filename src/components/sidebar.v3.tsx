/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: SaaS 左侧导航栏组件 - Paper Design 版本 (v3)
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
      className={`fixed left-0 top-0 h-screen bg-[#0D0D0D] border-r border-[#1A1A1A] flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo & Collapse Button */}
      <div className={`border-b border-[#1A1A1A] ${isCollapsed ? 'p-3' : 'p-5'}`}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
              S2
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-lg text-white tracking-tight">Sub2API</span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-[#1F1F1F] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-4 h-4 text-[#71717A] transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 rounded-lg transition-all ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
                } ${
                  isActive(item.path)
                    ? 'bg-[#6366F1]/15 text-[#6366F1] font-medium'
                    : 'text-[#A1A1AA] hover:bg-[#1F1F1F] hover:text-white'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className={`border-t border-[#1A1A1A] ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar size="sm">
            <AvatarFallback className="bg-[#6366F1] text-white text-xs font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username}
              </p>
              <p className="text-xs text-[#71717A]">
                ${user?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      {!isCollapsed && (
        <div className="px-4 py-3 text-xs text-[#52525B] border-t border-[#1A1A1A]">
          Press <kbd className="px-1.5 py-0.5 bg-[#1F1F1F] rounded text-[#71717A] mx-1">`</kbd> to toggle
        </div>
      )}
    </aside>
  );
}