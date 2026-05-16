/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 语言切换组件，使用 DropdownMenu 实现，带国旗图标
 * 依赖关系: stores/locale.ts, ui/dropdown-menu, ui/button, lucide-react
 * 变更同步:
 *   - 新增语言时，需更新 locale.ts 和此组件
 * 版本记录:
 *   - 2026-05-16: 添加国旗 emoji 图标 (参考 laper.ai 设计)
 * ============================================================================
 */

'use client';

import { useLocaleStore, type Locale } from '@/stores/locale';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguagesIcon } from 'lucide-react';

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleStore();

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-1.5 px-2">
            <LanguagesIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={4}>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`gap-2 ${locale === lang.code ? 'bg-muted font-medium' : ''}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}