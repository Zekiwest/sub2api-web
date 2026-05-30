import apiClient from '@/lib/api';
import type {
  ApiKeyDailyUsageResponse,
  BatchApiKeysUsageResponse,
  ModelStat,
  ModelStatsResponse,
  PaginatedResponse,
  TrendDataPoint,
  TrendResponse,
  UsageLog,
  UsageQueryParams,
  UsageStatsResponse,
  UserDashboardStats,
} from '@/types';

const isDevMode = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

const MOCK_STATS: UserDashboardStats = {
  total_api_keys: 3,
  active_api_keys: 2,
  total_requests: 1250,
  total_input_tokens: 45000,
  total_output_tokens: 12000,
  total_cache_creation_tokens: 5000,
  total_cache_read_tokens: 3000,
  total_tokens: 65000,
  total_cost: 15.5,
  total_actual_cost: 14.8,
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
  by_platform: [
    { platform: 'anthropic', total_requests: 700, total_tokens: 42000, total_actual_cost: 9.1, today_requests: 30, today_tokens: 1500, today_actual_cost: 0.5 },
    { platform: 'openai', total_requests: 550, total_tokens: 23000, total_actual_cost: 5.7, today_requests: 15, today_tokens: 550, today_actual_cost: 0.22 },
  ],
};

const MOCK_TREND: TrendDataPoint[] = [
  { date: '2026-05-24', requests: 120, input_tokens: 4000, output_tokens: 1000, cache_creation_tokens: 200, cache_read_tokens: 100, total_tokens: 5300, cost: 1.2, actual_cost: 1.1 },
  { date: '2026-05-25', requests: 150, input_tokens: 5000, output_tokens: 1200, cache_creation_tokens: 250, cache_read_tokens: 100, total_tokens: 6550, cost: 1.5, actual_cost: 1.42 },
  { date: '2026-05-26', requests: 180, input_tokens: 6000, output_tokens: 1500, cache_creation_tokens: 300, cache_read_tokens: 120, total_tokens: 7920, cost: 1.8, actual_cost: 1.7 },
  { date: '2026-05-27', requests: 200, input_tokens: 7000, output_tokens: 1800, cache_creation_tokens: 400, cache_read_tokens: 160, total_tokens: 9360, cost: 2.1, actual_cost: 1.96 },
  { date: '2026-05-28', requests: 220, input_tokens: 8000, output_tokens: 2000, cache_creation_tokens: 500, cache_read_tokens: 200, total_tokens: 10700, cost: 2.5, actual_cost: 2.32 },
  { date: '2026-05-29', requests: 250, input_tokens: 9000, output_tokens: 2200, cache_creation_tokens: 600, cache_read_tokens: 240, total_tokens: 12040, cost: 2.8, actual_cost: 2.68 },
  { date: '2026-05-30', requests: 45, input_tokens: 1500, output_tokens: 400, cache_creation_tokens: 100, cache_read_tokens: 50, total_tokens: 2050, cost: 0.75, actual_cost: 0.72 },
];

const MOCK_MODELS: ModelStat[] = [
  { model: 'gpt-4', requests: 500, input_tokens: 20000, output_tokens: 5000, cache_creation_tokens: 1000, cache_read_tokens: 500, total_tokens: 26500, cost: 8, actual_cost: 7.6, account_cost: 6.8 },
  { model: 'gpt-3.5-turbo', requests: 400, input_tokens: 15000, output_tokens: 4000, cache_creation_tokens: 500, cache_read_tokens: 300, total_tokens: 19800, cost: 4, actual_cost: 3.8, account_cost: 3.3 },
  { model: 'claude-3-opus', requests: 200, input_tokens: 8000, output_tokens: 2000, cache_creation_tokens: 400, cache_read_tokens: 100, total_tokens: 10500, cost: 3, actual_cost: 2.9, account_cost: 2.5 },
  { model: 'claude-3-sonnet', requests: 150, input_tokens: 2000, output_tokens: 1000, cache_creation_tokens: 100, cache_read_tokens: 50, total_tokens: 3150, cost: 0.5, actual_cost: 0.5, account_cost: 0.42 },
];

const baseLog = {
  user_id: 1,
  account_id: null,
  request_id: 'req_mock',
  service_tier: null,
  reasoning_effort: null,
  inbound_endpoint: '/v1/messages',
  upstream_endpoint: null,
  group_id: 1,
  subscription_id: null,
  cache_creation_5m_tokens: 0,
  cache_creation_1h_tokens: 0,
  input_cost: 0,
  output_cost: 0,
  cache_creation_cost: 0,
  cache_read_cost: 0,
  total_cost: 0,
  actual_cost: 0,
  rate_multiplier: 1,
  billing_type: 0,
  request_type: 'sync',
  stream: false,
  openai_ws_mode: false,
  first_token_ms: null,
  image_count: 0,
  image_size: null,
  image_input_size: null,
  image_output_size: null,
  image_size_source: null,
  image_size_breakdown: null,
  user_agent: 'Claude-Code/1.0',
  cache_ttl_overridden: false,
  billing_mode: 'token',
};

const MOCK_LOGS: UsageLog[] = [
  {
    ...baseLog,
    id: 1,
    api_key_id: 1,
    api_key_name: 'Production Key',
    request_id: 'req_001',
    model: 'gpt-4',
    reasoning_effort: 'medium',
    input_tokens: 500,
    output_tokens: 150,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    input_cost: 0.12,
    output_cost: 0.08,
    total_cost: 0.2,
    actual_cost: 0.19,
    cost: 0.2,
    duration_ms: 1200,
    first_token_ms: 330,
    status: 'success',
    api_key: { id: 1, name: 'Production Key' } as UsageLog['api_key'],
    created_at: '2026-05-30T10:00:00Z',
  },
  {
    ...baseLog,
    id: 2,
    api_key_id: 1,
    api_key_name: 'Production Key',
    request_id: 'req_002',
    model: 'gpt-3.5-turbo',
    request_type: 'stream',
    stream: true,
    input_tokens: 300,
    output_tokens: 100,
    cache_creation_tokens: 50,
    cache_creation_1h_tokens: 50,
    cache_read_tokens: 0,
    cache_ttl_overridden: true,
    input_cost: 0.02,
    output_cost: 0.02,
    cache_creation_cost: 0.01,
    total_cost: 0.05,
    actual_cost: 0.04,
    cost: 0.05,
    duration_ms: 800,
    first_token_ms: 120,
    status: 'success',
    api_key: { id: 1, name: 'Production Key' } as UsageLog['api_key'],
    created_at: '2026-05-30T09:30:00Z',
  },
  {
    ...baseLog,
    id: 3,
    api_key_id: 2,
    api_key_name: 'Test Key',
    request_id: 'req_003',
    model: 'dall-e-3',
    inbound_endpoint: '/v1/images/generations',
    request_type: 'sync',
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_tokens: 0,
    cache_read_tokens: 0,
    image_count: 2,
    image_size: '1024x1024',
    image_output_size: '1024x1024',
    image_size_source: 'output',
    total_cost: 0.08,
    actual_cost: 0.08,
    cost: 0.08,
    duration_ms: 4200,
    status: 'success',
    billing_mode: 'image',
    api_key: { id: 2, name: 'Test Key' } as UsageLog['api_key'],
    created_at: '2026-05-30T09:00:00Z',
  },
];

export const usageApi = {
  listLogs: async (
    params?: UsageQueryParams,
    config: { signal?: AbortSignal } = {}
  ): Promise<PaginatedResponse<UsageLog>> => {
    if (isDevMode) {
      let items = [...MOCK_LOGS];
      if (params?.api_key_id) items = items.filter((log) => log.api_key_id === Number(params.api_key_id));
      if (params?.request_type) items = items.filter((log) => log.request_type === params.request_type);
      if (params?.model) items = items.filter((log) => log.model.toLowerCase().includes(String(params.model).toLowerCase()));
      const page = params?.page || 1;
      const pageSize = params?.page_size || 20;
      const pages = Math.max(1, Math.ceil(items.length / pageSize));
      return { items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length, page, page_size: pageSize, pages, total_pages: pages };
    }
    const { data } = await apiClient.get<PaginatedResponse<UsageLog>>('/usage', {
      ...config,
      params,
    });
    return data;
  },

  getById: async (id: number): Promise<UsageLog> => {
    if (isDevMode) return MOCK_LOGS.find((log) => log.id === id) || MOCK_LOGS[0];
    const { data } = await apiClient.get<UsageLog>(`/usage/${id}`);
    return data;
  },

  getStats: async (period = 'today', apiKeyId?: number): Promise<UsageStatsResponse> => {
    if (isDevMode) {
      return {
        period,
        total_requests: MOCK_LOGS.length,
        total_input_tokens: 800,
        total_output_tokens: 250,
        total_cache_tokens: 50,
        total_tokens: 1100,
        total_cost: 0.33,
        total_actual_cost: 0.31,
        average_duration_ms: 2066,
        models: { 'gpt-4': 1, 'gpt-3.5-turbo': 1, 'dall-e-3': 1 },
      };
    }
    const { data } = await apiClient.get<UsageStatsResponse>('/usage/stats', {
      params: { period, api_key_id: apiKeyId },
    });
    return data;
  },

  getStatsByDateRange: async (startDate: string, endDate: string, apiKeyId?: number): Promise<UsageStatsResponse> => {
    if (isDevMode) return usageApi.getStats(`${startDate}_${endDate}`, apiKeyId);
    const { data } = await apiClient.get<UsageStatsResponse>('/usage/stats', {
      params: { start_date: startDate, end_date: endDate, api_key_id: apiKeyId },
    });
    return data;
  },

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
    if (isDevMode) return { trend: MOCK_TREND, start_date: '2026-05-24', end_date: '2026-05-30', granularity: params?.granularity || 'day' };
    const { data } = await apiClient.get<TrendResponse>('/usage/dashboard/trend', { params });
    return data;
  },

  getDashboardModels: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ModelStatsResponse> => {
    if (isDevMode) return { models: MOCK_MODELS, start_date: '2026-05-24', end_date: '2026-05-30' };
    const { data } = await apiClient.get<ModelStatsResponse>('/usage/dashboard/models', { params });
    return data;
  },

  getMyApiKeyDailyUsage: async (apiKeyId: number, days = 30): Promise<ApiKeyDailyUsageResponse> => {
    if (isDevMode) {
      return {
        items: MOCK_TREND.slice(-Math.min(days, 7)).map((item) => ({
          date: item.date,
          requests: item.requests,
          input_tokens: item.input_tokens,
          output_tokens: item.output_tokens,
          cache_read_tokens: item.cache_read_tokens,
          cache_write_tokens: item.cache_creation_tokens,
          total_tokens: item.total_tokens,
          cost: item.cost,
          actual_cost: item.actual_cost,
        })),
        days,
        start_date: '2026-05-24',
        end_date: '2026-05-30',
      };
    }
    const { data } = await apiClient.get<ApiKeyDailyUsageResponse>(`/user/api-keys/${apiKeyId}/usage/daily`, {
      params: { days },
    });
    return data;
  },

  getDashboardApiKeysUsage: async (apiKeyIds: number[], options?: { signal?: AbortSignal }): Promise<BatchApiKeysUsageResponse> => {
    if (isDevMode) {
      return {
        stats: Object.fromEntries(apiKeyIds.map((id) => [String(id), { api_key_id: id, today_actual_cost: id * 0.12, total_actual_cost: id * 4.5 }])),
      };
    }
    const { data } = await apiClient.post<BatchApiKeysUsageResponse>(
      '/usage/dashboard/api-keys-usage',
      { api_key_ids: apiKeyIds },
      { signal: options?.signal }
    );
    return data;
  },
};
