/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 网站头部组件，包含导航、语言切换、用户菜单
 * 依赖关系: stores/locale.ts, lib/i18n, ui/dropdown-menu, language-switcher
 * 变更同步:
 *   - 页面标题变化时，需更新 header 翻译键
 *   - 新增头部功能时，需检查与 sidebar 的协调
 * ============================================================================
 */

'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/lib/i18n';
import { authApi } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/language-switcher';
import {
  BellIcon,
  SettingsIcon,
  LogOutIcon,
  DollarSignIcon,
} from 'lucide-react';

const pageKeyMap: Record<string, string> = {
  '/dashboard': 'header.dashboard',
  '/keys': 'header.apiKeys',
  '/usage': 'header.usage',
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { translate } = useTranslation();

  const pageTitle = translate(pageKeyMap[pathname] || 'header.dashboard');

  const handleLogout = async () => {
    await authApi.logout();
    logout();
    router.push('/login');
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-lg font-semibold text-sidebar-foreground">
        {pageTitle}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="rounded-md">
          <BellIcon className="h-4 w-4" />
          <span className="sr-only">{translate('common.notifications')}</span>
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="rounded-md">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent
            align="end"
            sideOffset={4}
            className="w-56"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <DollarSignIcon className="h-4 w-4" />
              <span>{translate('dashboard.balance')}: ${user?.balance?.toFixed(2) || '0.00'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span>{translate('common.settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4" />
              <span>{translate('common.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}