/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: SaaS 左侧导航栏组件 - 深色版本 (v2)
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
      className={`fixed left-0 top-0 h-screen bg-gray-950 border-r border-gray-800 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo & Collapse Button */}
      <div className={`border-b border-gray-800 ${isCollapsed ? 'p-3' : 'p-6'}`}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/30">
              S2
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-white">Sub2API</span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
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
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 rounded-lg transition-all ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
                } ${
                  isActive(item.path)
                    ? 'bg-violet-500/20 text-violet-400 font-medium border border-violet-500/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className={`border-t border-gray-800 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <Avatar size="sm">
            <AvatarFallback className="bg-violet-500 text-white text-xs">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500">
                ${user?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Shortcut Hint */}
      {!isCollapsed && (
        <div className="px-4 py-2 text-xs text-gray-600 border-t border-gray-800">
          Press <kbd className="px-1 py-0.5 bg-gray-800 rounded mx-1">`</kbd> to toggle
        </div>
      )}
    </aside>
  );
}