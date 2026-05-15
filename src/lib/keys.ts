/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: API Key CRUD API 模块，管理用户的 API Keys
 * 依赖关系: lib/api.ts, types/index.ts (ApiKey, CreateApiKeyRequest)
 * 变更同步:
 *   - API 端点变化时，需检查后端路由是否匹配
 *   - 新增操作方法时，需在 lib/_dir.md 中记录
 * ============================================================================
 */

import apiClient from '@/lib/api';
import type { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest, PaginatedResponse } from '@/types';

// Check if running in dev mode without backend
const isDevMode = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

// Mock data for development
const MOCK_KEYS: ApiKey[] = [
  {
    id: 1,
    name: 'Production Key',
    key: 'sk-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    status: 'active',
    quota: 50.00,
    used_quota: 15.50,
    expires_at: '2026-12-31T00:00:00Z',
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-14T00:00:00Z',
  },
  {
    id: 2,
    name: 'Test Key',
    key: 'sk-test-yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    status: 'active',
    quota: 10.00,
    used_quota: 2.30,
    expires_at: undefined,
    created_at: '2026-05-10T00:00:00Z',
    updated_at: '2026-05-14T00:00:00Z',
  },
  {
    id: 3,
    name: 'Disabled Key',
    key: 'sk-disabled-zzzzzzzzzzzzzzzzzzzzzzzzzzz',
    status: 'inactive',
    quota: 0,
    used_quota: 0,
    expires_at: undefined,
    created_at: '2026-05-05T00:00:00Z',
    updated_at: '2026-05-14T00:00:00Z',
  },
];

let mockKeys = [...MOCK_KEYS];

export const keysApi = {
  list: async (page = 1, pageSize = 10, filters?: {
    search?: string;
    status?: string;
    group_id?: number;
  }): Promise<PaginatedResponse<ApiKey>> => {
    if (isDevMode) {
      let filtered = mockKeys;
      if (filters?.status) filtered = filtered.filter(k => k.status === filters.status);
      if (filters?.search) filtered = filtered.filter(k => k.name.includes(filters.search!));
      return { items: filtered, total: filtered.length, page, page_size: pageSize, total_pages: 1 };
    }
    const { data } = await apiClient.get<PaginatedResponse<ApiKey>>('/keys', {
      params: { page, page_size: pageSize, ...filters },
    });
    return data;
  },

  getById: async (id: number): Promise<ApiKey> => {
    if (isDevMode) return mockKeys.find(k => k.id === id) || MOCK_KEYS[0];
    const { data } = await apiClient.get<ApiKey>(`/keys/${id}`);
    return data;
  },

  create: async (payload: CreateApiKeyRequest): Promise<ApiKey> => {
    if (isDevMode) {
      const newKey: ApiKey = {
        id: mockKeys.length + 1,
        name: payload.name,
        key: `sk-new-${Math.random().toString(36).substring(2, 34)}`,
        status: 'active',
        quota: payload.quota || 0,
        used_quota: 0,
        expires_at: payload.expires_in_days ? new Date(Date.now() + payload.expires_in_days * 86400000).toISOString() : undefined,
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
      const key = mockKeys.find(k => k.id === id);
      if (key) {
        Object.assign(key, updates, { updated_at: new Date().toISOString() });
        return key;
      }
      return MOCK_KEYS[0];
    }
    const { data } = await apiClient.put<ApiKey>(`/keys/${id}`, updates);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    if (isDevMode) {
      mockKeys = mockKeys.filter(k => k.id !== id);
      return;
    }
    await apiClient.delete(`/keys/${id}`);
  },

  toggleStatus: async (id: number, status: 'active' | 'inactive'): Promise<ApiKey> => {
    return keysApi.update(id, { status });
  },
};