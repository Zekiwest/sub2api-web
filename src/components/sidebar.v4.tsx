/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: SaaS 左侧导航栏组件 - Paper Design Light 版本 (v4)
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
      className={`fixed left-0 top-0 h-screen bg-white border-r border-[#E5E7EB] flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-[200px]'
      }`}
    >
      {/* Logo & Collapse Button */}
      <div className={`border-b border-[#E5E7EB] ${isCollapsed ? 'p-3' : 'p-6'}`}>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              S2
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-[#101828]">Sub2API</span>
            )}
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-6'}`}>
        <ul className="space-y-0">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 rounded-lg transition-all ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
                } ${
                  isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-[#4A5565] hover:bg-gray-50 hover:text-[#101828]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span className="text-base">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className={`border-t border-[#E5E7EB] ${isCollapsed ? 'p-2' : 'p-6'}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar size="sm">
            <AvatarFallback className="bg-[#EBEBEC] text-[#101828] text-xs font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#101828] truncate">
                {user?.username}
              </p>
              <p className="text-xs text-[#6A7282]">
                ${user?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Button */}
      {!isCollapsed && (
        <div className="px-6 py-3 border-t border-[#E5E7EB]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 text-sm text-[#4A5565] hover:text-[#101828] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span>Collapse</span>
          </button>
        </div>
      )}

      {/* Keyboard Shortcut Hint */}
      {!isCollapsed && (
        <div className="px-6 py-3 text-xs text-[#99A1AF]">
          Press ` to toggle
        </div>
      )}
    </aside>
  );
}