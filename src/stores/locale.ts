/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 语言状态管理，支持中英双语切换
 * 依赖关系: zustand, lib/i18n/translations
 * 变更同步:
 *   - 新增语言时，需更新 translations 目录
 *   - 语言配置变化时，需检查所有使用 useLocaleStore 的组件
 * ============================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'zh';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'locale-storage',
    }
  )
);