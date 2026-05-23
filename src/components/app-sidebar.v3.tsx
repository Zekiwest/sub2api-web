/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Sidebar 组件 - 移动端适配版本 (v3)
 * 依赖关系: ui/sheet, stores/auth, stores/locale, lib/i18n, hooks/use-mobile, Next.js Link
 * 变更同步:
 *   - 导航项变化时，需同步 dashboard-layout 版本和 header 翻译键
 *   - 移动端行为变化时，需更新 use-mobile hook 断点
 * 版本记录:
 *   - 2026-05-20: 添加移动端适配，使用 Sheet 组件实现抽屉式 sidebar
 * ============================================================================
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  MenuIcon,
  ChartBarIcon,
  KeyIcon,
  TrendingUpIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
} from 'lucide-react';

interface SidebarV3Props {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export function SidebarV3({ isCollapsed, setIsCollapsed, isOpen, setIsOpen }: SidebarV3Props) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { translate } = useTranslation();
  const isMobile = useIsMobile();

  const navItems = [
    { path: '/dashboard', label: translate('header.dashboard'), icon: ChartBarIcon },
    { path: '/keys', label: translate('header.apiKeys'), icon: KeyIcon },
    { path: '/groups', label: translate('header.groups'), icon: FolderIcon },
    { path: '/usage', label: translate('header.usage'), icon: TrendingUpIcon },
    { path: '/invite', label: translate('header.invite'), icon: UsersIcon },
  ];

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  // 移动端：使用 Sheet 抽屉
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0"
          showCloseButton={false}
        >
          {/* Logo */}
          <SheetHeader className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
            <SheetTitle className="flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-sm w-8 h-8"
                style={{
                  backgroundImage: 'linear-gradient(180deg, #C91D2B 0%, #1F5134 100%)',
                }}
              >
                <span
                  className="text-white font-bold"
                  style={{ fontSize: '14px', fontFamily: 'var(--font-sans)' }}
                >
                  S2
                </span>
              </div>
              <span
                className="font-bold text-xl"
                style={{ color: '#101828', fontFamily: 'var(--font-sans)' }}
              >
                Sub2API
              </span>
            </SheetTitle>
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setIsOpen?.(false)}
                    className="flex items-center gap-3 transition-colors"
                    style={{
                      borderRadius: '2px',
                      padding: '10px 12px',
                      backgroundColor: isActive(item.path) ? '#1F5134' : 'transparent',
                      color: isActive(item.path) ? '#F2ECD9' : '#1D3025',
                      width: '100%',
                    }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span
                      className="font-medium"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info */}
          <div
            className="flex items-center gap-3 border-t"
            style={{
              borderColor: '#E5E3DC',
              padding: '24px',
            }}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback
                className="rounded-full text-xs font-medium"
                style={{
                  backgroundColor: '#C91D2B',
                  color: '#FCF7E8',
                  fontSize: '12px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
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
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // 桌面端：保持原有固定左侧栏样式
  return (
    <aside
      className="h-screen flex flex-col shrink-0 transition-all duration-300"
      style={{
        width: isCollapsed ? '52px' : '200px',
        backgroundColor: '#F7F6F2',
        borderRight: '1px solid #E5E7EB',
      }}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-2 h-[56px] border-b shrink-0 ${isCollapsed ? 'justify-center px-6' : 'px-6'}`}
        style={{ borderColor: '#E5E7EB' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-sm w-8 h-8"
            style={{
              backgroundImage: 'linear-gradient(180deg, #C91D2B 0%, #1F5134 100%)',
            }}
          >
            <span
              className="text-white font-bold"
              style={{ fontSize: '14px', fontFamily: 'var(--font-sans)' }}
            >
              S2
            </span>
          </div>
          {!isCollapsed && (
            <span
              className="font-bold text-xl"
              style={{ color: '#101828', fontFamily: 'var(--font-sans)' }}
            >
              Sub2API
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 flex flex-col"
        style={{
          padding: isCollapsed ? '16px' : '16px',
          alignItems: isCollapsed ? 'center' : 'stretch',
        }}
      >
        <ul className={`space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                style={{
                  borderRadius: '2px',
                  padding: isCollapsed ? '10px 8px' : '10px 12px',
                  backgroundColor: isActive(item.path) ? '#1F5134' : 'transparent',
                  color: isActive(item.path) ? '#F2ECD9' : '#1D3025',
                  width: isCollapsed ? 'fit-content' : '100%',
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <span
                    className="font-medium"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
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
        className={`flex items-center gap-3 border-t shrink-0 ${isCollapsed ? 'justify-center' : ''}`}
        style={{
          borderColor: '#E5E3DC',
          padding: isCollapsed ? '24px' : '24px',
        }}
      >
        <Avatar className="h-6 w-6 shrink-0">
          <AvatarFallback
            className="rounded-full text-xs font-medium"
            style={{
              backgroundColor: '#C91D2B',
              color: '#FCF7E8',
              fontSize: '12px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
            }}
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
        className={`flex items-center border-t shrink-0 ${isCollapsed ? 'justify-center' : ''}`}
        style={{
          borderColor: '#E5E7EB',
          padding: isCollapsed ? '8px 16px' : '8px 16px',
        }}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 transition-colors hover:bg-gray-200"
          style={{
            borderRadius: '2px',
            padding: '6px',
          }}
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
              {translate('sidebar.collapse')}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}