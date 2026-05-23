/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: API Key 分组 CRUD API 模块，管理用户的 API Key 分组
 * 依赖关系: lib/api.ts, types/index.ts (ApiKeyGroup, CreateGroupRequest)
 * 变更同步:
 *   - API 端点变化时，需检查后端路由是否匹配
 *   - 新增操作方法时，需在 lib/_dir.md 中记录
 * ============================================================================
 */

import apiClient from '@/lib/api';
import type { ApiKeyGroup, CreateGroupRequest, UpdateGroupRequest, PaginatedResponse } from '@/types';

const isDevMode = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

const MOCK_GROUPS: ApiKeyGroup[] = [
  {
    id: 1,
    name: 'Production',
    description: 'Production environment keys',
    key_count: 2,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-14T00:00:00Z',
  },
  {
    id: 2,
    name: 'Development',
    description: 'Development and testing keys',
    key_count: 1,
    created_at: '2026-05-10T00:00:00Z',
    updated_at: '2026-05-14T00:00:00Z',
  },
];

let mockGroups = [...MOCK_GROUPS];

export const groupsApi = {
  list: async (page = 1, pageSize = 10): Promise<PaginatedResponse<ApiKeyGroup>> => {
    if (isDevMode) {
      return { items: mockGroups, total: mockGroups.length, page, page_size: pageSize, total_pages: 1 };
    }
    const { data } = await apiClient.get<PaginatedResponse<ApiKeyGroup>>('/groups', {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  getById: async (id: number): Promise<ApiKeyGroup> => {
    if (isDevMode) return mockGroups.find(g => g.id === id) || MOCK_GROUPS[0];
    const { data } = await apiClient.get<ApiKeyGroup>(`/groups/${id}`);
    return data;
  },

  create: async (payload: CreateGroupRequest): Promise<ApiKeyGroup> => {
    if (isDevMode) {
      const newGroup: ApiKeyGroup = {
        id: mockGroups.length + 1,
        name: payload.name,
        description: payload.description,
        key_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockGroups.push(newGroup);
      return newGroup;
    }
    const { data } = await apiClient.post<ApiKeyGroup>('/groups', payload);
    return data;
  },

  update: async (id: number, updates: UpdateGroupRequest): Promise<ApiKeyGroup> => {
    if (isDevMode) {
      const group = mockGroups.find(g => g.id === id);
      if (group) {
        Object.assign(group, updates, { updated_at: new Date().toISOString() });
        return group;
      }
      return MOCK_GROUPS[0];
    }
    const { data } = await apiClient.put<ApiKeyGroup>(`/groups/${id}`, updates);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    if (isDevMode) {
      mockGroups = mockGroups.filter(g => g.id !== id);
      return;
    }
    await apiClient.delete(`/groups/${id}`);
  },
};