/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: KPI 统计卡片组件，基于 Tremor Blocks 设计风格
 * 依赖关系: @radix-ui/react-slot, lucide-react (图标), ui/card
 * 变更同步:
 *   - 新增样式变体时，需更新 kpi-card 翻译键
 * ============================================================================
 */

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps extends React.ComponentPropsWithoutRef<'div'> {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  sparkChart?: React.ReactNode;
  asChild?: boolean;
}

const KPICard = React.forwardRef<HTMLDivElement, KPICardProps>(
  ({ className, title, value, trend, trendLabel, subtitle, icon, sparkChart, asChild, ...props }, forwardedRef) => {
    const Component = asChild ? Slot : 'div';

    const getTrendColor = () => {
      if (trend === undefined || trend === 0) return 'text-muted-foreground';
      return trend > 0 ? 'text-emerald-600' : 'text-red-500';
    };

    const getTrendIcon = () => {
      if (trend === undefined || trend === 0) return <Minus className="h-4 w-4" />;
      return trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
    };

    return (
      <Component
        ref={forwardedRef}
        className={cn(
          'relative w-full rounded-lg border p-4 text-left shadow-sm',
          'bg-white dark:bg-[#090E1A]',
          'border-gray-200 dark:border-gray-900',
          'flex flex-col gap-2',
          className,
        )}
        {...props}
      >
        {/* Header: Title + Icon */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>

        {/* Main Value */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
        </div>

        {/* Trend Indicator */}
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1.5 text-sm', getTrendColor())}>
            {getTrendIcon()}
            <span className="font-medium">
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
            {trendLabel && <span className="text-muted-foreground">{trendLabel}</span>}
          </div>
        )}

        {/* Spark Chart */}
        {sparkChart && <div className="mt-2 h-10 w-full">{sparkChart}</div>}
      </Component>
    );
  },
);

KPICard.displayName = 'KPICard';

export { KPICard, type KPICardProps };