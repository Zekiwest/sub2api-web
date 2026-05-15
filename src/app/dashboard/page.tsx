'use client';

/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Dashboard 主页面，展示 API 使用统计、趋势图表
 * 依赖关系: components/dashboard-layout.tsx, lib/usage.ts, stores/auth.ts, shadcn chart
 * 变更同步:
 *   - 统计字段变化时，需更新 KPI 卡片
 *   - 图表类型变化时，需检查 shadcn chart 组件
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { DashboardLayout } from '@/components/dashboard-layout';
import { usageApi } from '@/lib/usage';
import { useAuthStore } from '@/stores/auth';
import type { UserDashboardStats, TrendDataPoint, ModelStat } from '@/types';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  requests: {
    label: 'Requests',
    color: '#c91d2b',
  },
  input_tokens: {
    label: 'Input Tokens',
    color: '#1f5134',
  },
  output_tokens: {
    label: 'Output Tokens',
    color: '#f5b800',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const statsData = await usageApi.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex justify-center p-20">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Welcome Message */}
          <p className="text-muted-foreground">Welcome back, {user?.username}</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-sm text-muted-foreground">Total API Keys</span>
                <span className="text-2xl font-bold">{stats?.total_api_keys || 0}</span>
                <Badge variant="secondary">{stats?.active_api_keys || 0} active</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-sm text-muted-foreground">Total Requests</span>
                <span className="text-2xl font-bold">{stats?.total_requests || 0}</span>
                <span className="text-sm text-primary">{stats?.rpm || 0} RPM</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-sm text-muted-foreground">Total Tokens</span>
                <span className="text-2xl font-bold">{stats?.total_tokens?.toLocaleString() || 0}</span>
                <span className="text-sm text-primary">{stats?.tpm || 0} TPM</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-sm text-muted-foreground">Total Cost</span>
                <span className="text-2xl font-bold text-primary">${stats?.total_cost?.toFixed(2) || '0.00'}</span>
                <span className="text-sm text-muted-foreground">Today: ${stats?.today_cost?.toFixed(2) || '0.00'}</span>
              </CardContent>
            </Card>
          </div>

          {/* Today Stats */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Today&apos;s Usage</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Requests</span>
                  <p className="text-xl font-bold">{stats?.today_requests || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Input Tokens</span>
                  <p className="text-xl font-bold">{stats?.today_input_tokens?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Output Tokens</span>
                  <p className="text-xl font-bold">{stats?.today_output_tokens?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Cost</span>
                  <p className="text-xl font-bold">${stats?.today_cost?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for charts - will be added after testing layout */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Usage Trend</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-muted-foreground">Chart will be implemented with shadcn chart</p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}