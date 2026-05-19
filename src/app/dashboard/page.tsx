'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { DashboardLayout } from '@/components/dashboard-layout';
import { usageApi } from '@/lib/usage';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/lib/i18n';
import { KPICard } from '@/components/ui/kpi-card';
import { SparkAreaChart, SparkBarChart } from '@/components/ui/spark-chart';
import { Key, Activity, Coins, DollarSign, Clock, Zap } from 'lucide-react';
import type { UserDashboardStats, TrendDataPoint, ModelStat } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const COLORS = ['#c91d2b', '#1f5134', '#f5b800', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function DashboardPage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { translate } = useTranslation();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [models, setModels] = useState<ModelStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [statsData, trendData, modelsData] = await Promise.all([
        usageApi.getDashboardStats(),
        usageApi.getDashboardTrend(),
        usageApi.getDashboardModels(),
      ]);
      setStats(statsData);
      setTrend(trendData.trend);
      setModels(modelsData.models);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Generate spark chart data from trend
  const requestSparkData = trend.map((d) => ({ value: d.requests }));
  const tokenSparkData = trend.map((d) => ({ value: d.input_tokens + d.output_tokens }));
  const costSparkData = trend.map((d) => ({ value: d.cost * 100 }));

  // Calculate trend percentage (mock: compare last two days)
  const calcTrend = (arr: number[]) => {
    if (arr.length < 2) return 0;
    const last = arr[arr.length - 1];
    const prev = arr[arr.length - 2];
    if (prev === 0) return last > 0 ? 100 : 0;
    return ((last - prev) / prev) * 100;
  };

  const requestTrendValue = calcTrend(trend.map((d) => d.requests));
  const tokenTrendValue = calcTrend(trend.map((d) => d.input_tokens + d.output_tokens));
  const costTrendValue = calcTrend(trend.map((d) => d.cost));

  // Token distribution data
  const tokenDistribution = stats
    ? [
        { name: translate('dashboard.inputTokens'), value: stats.total_input_tokens, color: '#c91d2b' },
        { name: translate('dashboard.outputTokens'), value: stats.total_output_tokens, color: '#1f5134' },
        { name: translate('dashboard.cacheCreation'), value: stats.total_cache_creation_tokens, color: '#f5b800' },
        { name: translate('dashboard.cacheRead'), value: stats.total_cache_read_tokens, color: '#3b82f6' },
      ]
    : [];

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex justify-center p-20">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Welcome Message */}
          <p className="text-muted-foreground">{translate('dashboard.welcome')}, {user?.username}</p>

          {/* Tremor-style KPI Cards with Spark Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard
              title={translate('dashboard.totalApiKeys')}
              value={stats?.total_api_keys || 0}
              subtitle={`${stats?.active_api_keys || 0} ${translate('dashboard.active')}`}
              icon={<Key className="h-4 w-4" />}
            />
            <KPICard
              title={translate('dashboard.totalRequests')}
              value={stats?.total_requests?.toLocaleString() || 0}
              trend={requestTrendValue}
              trendLabel={translate('dashboard.vsLastWeek')}
              subtitle={`${stats?.rpm || 0} ${translate('dashboard.rpm')}`}
              icon={<Activity className="h-4 w-4" />}
              sparkChart={<SparkAreaChart data={requestSparkData} color="#c91d2b" />}
            />
            <KPICard
              title={translate('dashboard.totalTokens')}
              value={stats?.total_tokens?.toLocaleString() || 0}
              trend={tokenTrendValue}
              trendLabel={translate('dashboard.vsLastWeek')}
              subtitle={`${stats?.tpm || 0} ${translate('dashboard.tpm')}`}
              icon={<Coins className="h-4 w-4" />}
              sparkChart={<SparkAreaChart data={tokenSparkData} color="#1f5134" />}
            />
            <KPICard
              title={translate('dashboard.totalCost')}
              value={`$${stats?.total_cost?.toFixed(2) || '0.00'}`}
              trend={costTrendValue}
              trendLabel={translate('dashboard.vsLastWeek')}
              subtitle={`${translate('dashboard.today')}: $${stats?.today_cost?.toFixed(2) || '0.00'}`}
              icon={<DollarSign className="h-4 w-4" />}
              sparkChart={<SparkBarChart data={costSparkData} color="#f5b800" />}
            />
            <KPICard
              title={translate('dashboard.averageDuration')}
              value={`${stats?.average_duration_ms || 0}`}
              subtitle={translate('dashboard.milliseconds')}
              icon={<Clock className="h-4 w-4" />}
            />
            <KPICard
              title={translate('dashboard.todayUsage')}
              value={stats?.today_requests?.toLocaleString() || 0}
              subtitle={translate('dashboard.requests')}
              icon={<Zap className="h-4 w-4" />}
            />
          </div>

          {/* Usage Trend Chart */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle>{translate('dashboard.usageTrend')}</CardTitle>
              <CardDescription>{translate('dashboard.last7Days')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e5e5' }} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e5e5' }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="requests" name={translate('dashboard.requests')} stroke="#c91d2b" strokeWidth={2} dot={{ fill: '#c91d2b', r: 4 }} />
                  <Line type="monotone" dataKey="input_tokens" name={translate('dashboard.inputTokens')} stroke="#1f5134" strokeWidth={2} dot={{ fill: '#1f5134', r: 4 }} />
                  <Line type="monotone" dataKey="output_tokens" name={translate('dashboard.outputTokens')} stroke="#f5b800" strokeWidth={2} dot={{ fill: '#f5b800', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Requests by Model Pie Chart */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle>{translate('dashboard.requestsByModel')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={models} dataKey="requests" nameKey="model" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {models.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Token Distribution */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle>{translate('dashboard.tokenDistribution')}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={tokenDistribution.filter((d) => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {tokenDistribution.filter((d) => d.value > 0).map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cost by Model Bar Chart */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle>{translate('dashboard.costByModel')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={models} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e5e5' }} />
                  <YAxis type="category" dataKey="model" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e5e5' }} width={120} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }} formatter={(value: number) => [`$${value.toFixed(2)}`, translate('dashboard.cost')]} />
                  <Bar dataKey="cost" fill="#c91d2b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}