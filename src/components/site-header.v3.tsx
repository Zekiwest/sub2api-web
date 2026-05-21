/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Header 组件 - 移动端适配版本 (v3)
 * 依赖关系: ui/dropdown-menu, stores/auth, stores/locale, lib/i18n, hooks/use-mobile, language-switcher, lucide-react
 * 变更同步:
 *   - 页面标题变化时，需同步 header 翻译键
 *   - 移动端行为变化时，需更新 use-mobile hook 断点
 * 版本记录:
 *   - 2026-05-20: 添加移动端适配，增加 hamburger 菜单按钮
 * ============================================================================
 */

'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
import { authApi } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/language-switcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BellIcon,
  SettingsIcon,
  LogOutIcon,
  DollarSignIcon,
  MenuIcon,
} from 'lucide-react';

const pageKeyMap: Record<string, string> = {
  '/dashboard': 'header.dashboard',
  '/keys': 'header.apiKeys',
  '/usage': 'header.usage',
  '/settings': 'settings.title',
  '/invite': 'invite.title',
};

interface SiteHeaderV3Props {
  sidebarWidth?: number;
  onMenuClick?: () => void;
}

export function SiteHeaderV3({ sidebarWidth, onMenuClick }: SiteHeaderV3Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { translate } = useTranslation();
  const isMobile = useIsMobile();

  const pageTitle = translate(pageKeyMap[pathname] || 'header.dashboard');

  const handleLogout = async () => {
    await authApi.logout();
    logout();
    router.push('/login');
  };

  // 移动端样式
  if (isMobile) {
    return (
      <header
        className="flex h-14 shrink-0 items-center justify-between px-4"
        style={{
          width: '100%',
          backgroundColor: '#FFFFFFCC',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        {/* 左侧：菜单按钮 + 标题 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="rounded-xs p-2 hover:bg-gray-100 transition-colors"
          >
            <MenuIcon className="h-5 w-5" style={{ color: '#4A5565' }} />
          </button>
          <h1
            className="font-semibold"
            style={{
              fontSize: '16px',
              color: '#101828',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {pageTitle}
          </h1>
        </div>

        {/* 右侧：用户下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-xs p-1 hover:bg-gray-100 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback
                className="rounded-xs font-semibold text-sm"
                style={{
                  backgroundColor: 'oklch(62.3% 0.214 259.8)',
                  color: '#FFFFFF',
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <DollarSignIcon className="h-4 w-4" />
              <span>{translate('dashboard.balance')}: ${user?.balance?.toFixed(2) || '0.00'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => router.push('/settings')}>
              <SettingsIcon className="h-4 w-4" />
              <span>{translate('common.settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-4 w-4" />
              <span>{translate('common.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    );
  }

  // 桌面端样式（保持原有设计）
  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between px-6"
      style={{
        width: '100%',
        backgroundColor: '#FFFFFFCC',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <h1
        className="font-semibold"
        style={{
          fontSize: '18px',
          color: '#101828',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {pageTitle}
      </h1>

      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <button className="rounded-xs p-2 hover:bg-gray-100 transition-colors">
          <BellIcon className="h-5 w-5" style={{ color: '#4A5565' }} />
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-xs p-1 hover:bg-gray-100 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback
                className="rounded-xs font-semibold text-sm"
                style={{
                  backgroundColor: 'oklch(62.3% 0.214 259.8)',
                  color: '#FFFFFF',
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <DollarSignIcon className="h-4 w-4" />
              <span>{translate('dashboard.balance')}: ${user?.balance?.toFixed(2) || '0.00'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => router.push('/settings')}>
              <SettingsIcon className="h-4 w-4" />
              <span>{translate('common.settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-4 w-4" />
              <span>{translate('common.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}