import apiClient from '@/lib/api';
import type { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest, PaginatedResponse } from '@/types';

const isDevMode = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

const baseKey = {
  ip_whitelist: [],
  ip_blacklist: [],
  last_used_at: null,
  quota_used: 0,
  expires_at: null,
  rate_limit_5h: 0,
  rate_limit_1d: 0,
  rate_limit_7d: 0,
  usage_5h: 0,
  usage_1d: 0,
  usage_7d: 0,
  window_5h_start: null,
  window_1d_start: null,
  window_7d_start: null,
  reset_5h_at: null,
  reset_1d_at: null,
  reset_7d_at: null,
};

const MOCK_KEYS: ApiKey[] = [
  {
    ...baseKey,
    id: 1,
    user_id: 1,
    name: 'Production Key',
    key: 'sk-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    status: 'active',
    group_id: 1,
    group_name: 'Claude',
    quota: 50,
    quota_used: 15.5,
    used_quota: 15.5,
    expires_at: '2026-12-31T00:00:00Z',
    ip_whitelist: ['127.0.0.1'],
    rate_limit_5h: 5,
    rate_limit_1d: 15,
    rate_limit_7d: 60,
    usage_5h: 1.2,
    usage_1d: 3.6,
    usage_7d: 12.4,
    reset_5h_at: new Date(Date.now() + 2 * 3600000).toISOString(),
    reset_1d_at: new Date(Date.now() + 8 * 3600000).toISOString(),
    reset_7d_at: new Date(Date.now() + 4 * 86400000).toISOString(),
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-14T00:00:00Z',
  },
  {
    ...baseKey,
    id: 2,
    user_id: 1,
    name: 'Test Key',
    key: 'sk-test-yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    status: 'active',
    group_id: 2,
    group_name: 'OpenAI',
    quota: 0,
    quota_used: 2.3,
    used_quota: 2.3,
    created_at: '2026-05-10T00:00:00Z',
    updated_at: '2026-05-14T00:00:00Z',
  },
  {
    ...baseKey,
    id: 3,
    user_id: 1,
    name: 'Disabled Key',
    key: 'sk-disabled-zzzzzzzzzzzzzzzzzzzzzzzzzzz',
    status: 'inactive',
    group_id: null,
    quota: 0,
    created_at: '2026-05-05T00:00:00Z',
    updated_at: '2026-05-14T00:00:00Z',
  },
];

let mockKeys = [...MOCK_KEYS];

export interface KeyFilters {
  search?: string;
  status?: string;
  group_id?: number | string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const keysApi = {
  list: async (
    page = 1,
    pageSize = 10,
    filters?: KeyFilters,
    options?: { signal?: AbortSignal }
  ): Promise<PaginatedResponse<ApiKey>> => {
    if (isDevMode) {
      let filtered = [...mockKeys];
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter((key) => key.name.toLowerCase().includes(search) || key.key.includes(search));
      }
      if (filters?.status) filtered = filtered.filter((key) => key.status === filters.status);
      if (filters?.group_id !== undefined && filters.group_id !== '') {
        filtered = filtered.filter((key) => {
          if (String(filters.group_id) === '0') return key.group_id === null;
          return key.group_id === Number(filters.group_id);
        });
      }
      const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
      const start = (page - 1) * pageSize;
      return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, page_size: pageSize, pages, total_pages: pages };
    }
    const { data } = await apiClient.get<PaginatedResponse<ApiKey>>('/keys', {
      params: { page, page_size: pageSize, ...filters },
      signal: options?.signal,
    });
    return data;
  },

  getById: async (id: number): Promise<ApiKey> => {
    if (isDevMode) return mockKeys.find((key) => key.id === id) || MOCK_KEYS[0];
    const { data } = await apiClient.get<ApiKey>(`/keys/${id}`);
    return data;
  },

  create: async (payload: CreateApiKeyRequest): Promise<ApiKey> => {
    if (isDevMode) {
      const newKey: ApiKey = {
        ...baseKey,
        id: mockKeys.length + 1,
        user_id: 1,
        name: payload.name,
        key: payload.custom_key || `sk-new-${Math.random().toString(36).substring(2, 34)}`,
        status: 'active',
        group_id: payload.group_id ?? null,
        quota: payload.quota || 0,
        quota_used: 0,
        used_quota: 0,
        ip_whitelist: payload.ip_whitelist || [],
        ip_blacklist: payload.ip_blacklist || [],
        expires_at: payload.expires_in_days ? new Date(Date.now() + payload.expires_in_days * 86400000).toISOString() : null,
        rate_limit_5h: payload.rate_limit_5h || 0,
        rate_limit_1d: payload.rate_limit_1d || 0,
        rate_limit_7d: payload.rate_limit_7d || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockKeys.push(newKey);
      return newKey;
    }
    const { data } = await apiClient.post<ApiKey>('/keys', payload);
    return data;
  },

  update: async (id: number, updates: UpdateApiKeyRequest): Promise<ApiKey> => {
    if (isDevMode) {
      const key = mockKeys.find((item) => item.id === id);
      if (!key) return MOCK_KEYS[0];
      if (updates.reset_quota) key.quota_used = 0;
      if (updates.reset_rate_limit_usage) {
        key.usage_5h = 0;
        key.usage_1d = 0;
        key.usage_7d = 0;
      }
      Object.assign(key, updates, { updated_at: new Date().toISOString() });
      key.used_quota = key.quota_used;
      return key;
    }
    const { data } = await apiClient.put<ApiKey>(`/keys/${id}`, updates);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    if (isDevMode) {
      mockKeys = mockKeys.filter((key) => key.id !== id);
      return;
    }
    await apiClient.delete(`/keys/${id}`);
  },

  toggleStatus: async (id: number, status: 'active' | 'inactive'): Promise<ApiKey> => {
    return keysApi.update(id, { status });
  },
};
