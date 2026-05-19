/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 迷你图表组件，基于 Tremor SparkChart 设计风格
 * 依赖关系: recharts, lib/utils (cn)
 * 变更同步:
 *   - 新增图表类型时，需添加对应颜色主题
 * ============================================================================
 */

import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';

interface BaseSparkChartProps {
  data: { value: number }[];
  className?: string;
  color?: string;
}

interface SparkAreaChartProps extends BaseSparkChartProps {
  variant?: 'solid' | 'gradient';
}

interface SparkLineChartProps extends BaseSparkChartProps {
  variant?: 'solid' | 'gradient';
}

interface SparkBarChartProps extends BaseSparkChartProps {
  variant?: 'solid' | 'gradient';
}

const defaultColor = '#c91d2b';

// Spark Area Chart
function SparkAreaChart({ data, className, color = defaultColor, variant = 'gradient' }: SparkAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={40} className={cn('h-10', className)}>
      <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <YAxis domain={['auto', 'auto']} hide />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={variant === 'gradient' ? color : 'transparent'}
          fillOpacity={variant === 'gradient' ? 0.3 : 0}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Spark Line Chart
function SparkLineChart({ data, className, color = defaultColor }: SparkLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={40} className={cn('h-10', className)}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <YAxis domain={['auto', 'auto']} hide />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Spark Bar Chart
function SparkBarChart({ data, className, color = defaultColor }: SparkBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={40} className={cn('h-10', className)}>
      <BarChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <YAxis domain={['auto', 'auto']} hide />
        <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export { SparkAreaChart, SparkLineChart, SparkBarChart };
export type { SparkAreaChartProps, SparkLineChartProps, SparkBarChartProps };