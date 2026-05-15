/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Sidebar 组件 - Paper Design 版本 (v2)
 * 依赖关系: ui/sidebar, stores/auth, Next.js Link
 * 变更同步:
 *   - 导航项变化时，需同步 dashboard-layout 版本
 *   - 样式变化时，需对照 Paper 设计文件
 * ============================================================================
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon,
  KeyIcon,
  TrendingUpIcon,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { path: '/keys', label: 'API Keys', icon: KeyIcon },
  { path: '/usage', label: 'Usage', icon: TrendingUpIcon },
];

interface SidebarV2Props {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function SidebarV2({ isCollapsed, setIsCollapsed }: SidebarV2Props) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`h-screen flex flex-col shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-[52px]' : 'w-[200px]'
      }`}
      style={{
        backgroundColor: '#F7F6F2',
        borderRight: '1px solid #E5E7EB',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 h-14 px-6 border-b"
        style={{ borderColor: '#E5E7EB' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-sm w-8 h-8"
            style={{
              backgroundImage: 'linear-gradient(180deg, #C91D2B 0%, #1F5134 100%)',
            }}
          >
            <span className="text-white font-bold text-sm">S2</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl" style={{ color: '#101828', fontFamily: 'var(--font-sans)' }}>
              Sub2API
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 rounded-xs px-3 py-2.5 transition-colors ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                style={{
                  backgroundColor: isActive(item.path) ? '#1F5134' : 'transparent',
                  color: isActive(item.path) ? '#F2ECD9' : '#1D3025',
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && (
                  <span className="font-medium" style={{ fontFamily: 'var(--font-sans)' }}>
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div
        className="flex items-center gap-3 p-6 border-t"
        style={{ borderColor: '#E5E3DC' }}
      >
        <Avatar className="h-6 w-6">
          <AvatarFallback
            className="rounded-full text-xs font-medium"
            style={{ backgroundColor: '#C91D2B', color: '#FCF7E8' }}
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: '#1D3025', fontFamily: 'var(--font-sans)' }}
            >
              {user?.username}
            </p>
            <p
              className="text-xs"
              style={{ color: '#5C7064', fontFamily: 'var(--font-sans)' }}
            >
              ${user?.balance?.toFixed(2) || '0.00'}
            </p>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <div
        className="flex items-center gap-0 py-2 px-4 border-t"
        style={{ borderColor: '#E5E7EB' }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 rounded-xs p-1.5 hover:bg-gray-200 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4" style={{ color: '#6A7282' }} />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" style={{ color: '#6A7282' }} />
          )}
          {!isCollapsed && (
            <span
              className="text-xs"
              style={{ color: '#1D3025', fontFamily: 'var(--font-sans)' }}
            >
              Collapse
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}