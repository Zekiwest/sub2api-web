/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: i18n 翻译工具，提供 useTranslation hook
 * 依赖关系: stores/locale.ts, lib/i18n/*.json
 * 变更同步:
 *   - 翻译键变化时，需同步更新 en.json 和 zh.json
 * ============================================================================
 */

import { useLocaleStore, type Locale } from '@/stores/locale';
import en from './en.json';
import zh from './zh.json';

const translations = {
  en,
  zh,
} as const;

type TranslationKey = keyof typeof en;

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) || path;
}

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const t = translations[locale];

  const translate = (key: string): string => {
    return getNestedValue(t, key) || key;
  };

  return { t, locale, translate };
}

export function getTranslation(locale: Locale) {
  return translations[locale];
}