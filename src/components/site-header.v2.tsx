/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Header 组件 - Paper Design 版本 (v2)
 * 依赖关系: ui/dropdown-menu, stores/auth, lucide-react
 * 变更同步:
 *   - 页面标题变化时，需同步 pageTitleMap
 *   - 样式变化时，需对照 Paper 设计文件
 * ============================================================================
 */

'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/lib/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BellIcon, SettingsIcon, LogOutIcon, DollarSignIcon } from 'lucide-react';

const pageTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/keys': 'API Keys',
  '/usage': 'Usage Logs',
};

interface SiteHeaderV2Props {
  sidebarWidth: number;
}

export function SiteHeaderV2({ sidebarWidth }: SiteHeaderV2Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const pageTitle = pageTitleMap[pathname] || 'Dashboard';

  const handleLogout = async () => {
    await authApi.logout();
    logout();
    router.push('/login');
  };

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
              <span>Balance: ${user?.balance?.toFixed(2) || '0.00'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}