/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 使用统计 API 模块，获取 Dashboard 数据和使用日志
 * 依赖关系: lib/api.ts, types/index.ts (DashboardStats, UsageLog)
 * 变更同步:
 *   - API 端点变化时，需检查后端路由是否匹配
 *   - 新增统计方法时，需在 lib/_dir.md 中记录
 * ============================================================================
 */

import apiClient from '@/lib/api';
import type { UserDashboardStats, TrendResponse, ModelStatsResponse, UsageLog, PaginatedResponse } from '@/types';

// Check if running in dev mode without backend
const isDevMode = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

// Mock data for development
const MOCK_STATS: UserDashboardStats = {
  total_api_keys: 3,
  active_api_keys: 2,
  total_requests: 1250,
  total_input_tokens: 45000,
  total_output_tokens: 12000,
  total_cache_creation_tokens: 5000,
  total_cache_read_tokens: 3000,
  total_tokens: 65000,
  total_cost: 15.50,
  total_actual_cost: 14.80,
  today_requests: 45,
  today_input_tokens: 1500,
  today_output_tokens: 400,
  today_cache_creation_tokens: 100,
  today_cache_read_tokens: 50,
  today_tokens: 2050,
  today_cost: 0.75,
  today_actual_cost: 0.72,
  average_duration_ms: 850,
  rpm: 12,
  tpm: 550,
};

const MOCK_TREND: TrendDataPoint[] = [
  { date: '2026-05-08', requests: 120, input_tokens: 4000, output_tokens: 1000, cost: 1.2 },
  { date: '2026-05-09', requests: 150, input_tokens: 5000, output_tokens: 1200, cost: 1.5 },
  { date: '2026-05-10', requests: 180, input_tokens: 6000, output_tokens: 1500, cost: 1.8 },
  { date: '2026-05-11', requests: 200, input_tokens: 7000, output_tokens: 1800, cost: 2.1 },
  { date: '2026-05-12', requests: 220, input_tokens: 8000, output_tokens: 2000, cost: 2.5 },
  { date: '2026-05-13', requests: 250, input_tokens: 9000, output_tokens: 2200, cost: 2.8 },
  { date: '2026-05-14', requests: 45, input_tokens: 1500, output_tokens: 400, cost: 0.75 },
];

const MOCK_MODELS: ModelStat[] = [
  { model: 'gpt-4', requests: 500, input_tokens: 20000, output_tokens: 5000, cost: 8.0 },
  { model: 'gpt-3.5-turbo', requests: 400, input_tokens: 15000, output_tokens: 4000, cost: 4.0 },
  { model: 'claude-3-opus', requests: 200, input_tokens: 8000, output_tokens: 2000, cost: 3.0 },
  { model: 'claude-3-sonnet', requests: 150, input_tokens: 2000, output_tokens: 1000, cost: 0.5 },
];

const MOCK_LOGS: UsageLog[] = [
  { id: 1, api_key_id: 1, api_key_name: 'Production Key', model: 'gpt-4', request_type: 'chat', input_tokens: 500, output_tokens: 150, cache_creation_tokens: 0, cache_read_tokens: 0, cost: 0.2, actual_cost: 0.19, duration_ms: 1200, status: 'success', created_at: '2026-05-14T10:00:00Z' },
  { id: 2, api_key_id: 1, api_key_name: 'Production Key', model: 'gpt-3.5-turbo', request_type: 'chat', input_tokens: 300, output_tokens: 100, cache_creation_tokens: 50, cache_read_tokens: 0, cost: 0.05, actual_cost: 0.04, duration_ms: 800, status: 'success', created_at: '2026-05-14T09:30:00Z' },
  { id: 3, api_key_id: 2, api_key_name: 'Test Key', model: 'claude-3-opus', request_type: 'chat', input_tokens: 1000, output_tokens: 300, cache_creation_tokens: 0, cache_read_tokens: 100, cost: 0.5, actual_cost: 0.48, duration_ms: 1500, status: 'success', created_at: '2026-05-14T09:00:00Z' },
];

import type { TrendDataPoint, ModelStat } from '@/types';

export const usageApi = {
  getDashboardStats: async (): Promise<UserDashboardStats> => {
    if (isDevMode) return MOCK_STATS;
    const { data } = await apiClient.get<UserDashboardStats>('/usage/dashboard/stats');
    return data;
  },

  getDashboardTrend: async (params?: {
    start_date?: string;
    end_date?: string;
    granularity?: 'day' | 'hour';
  }): Promise<TrendResponse> => {
    if (isDevMode) return { trend: MOCK_TREND, start_date: '2026-05-08', end_date: '2026-05-14', granularity: 'day' };
    const { data } = await apiClient.get<TrendResponse>('/usage/dashboard/trend', { params });
    return data;
  },

  getDashboardModels: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ModelStatsResponse> => {
    if (isDevMode) return { models: MOCK_MODELS, start_date: '2026-05-08', end_date: '2026-05-14' };
    const { data } = await apiClient.get<ModelStatsResponse>('/usage/dashboard/models', { params });
    return data;
  },

  listLogs: async (params?: {
    page?: number;
    page_size?: number;
    api_key_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<UsageLog>> => {
    if (isDevMode) return { items: MOCK_LOGS, total: 3, page: 1, page_size: 20, total_pages: 1 };
    const { data } = await apiClient.get<PaginatedResponse<UsageLog>>('/usage', { params });
    return data;
  },
};