import apiClient from '@/lib/api';
import type { ApiKeyGroup, CreateGroupRequest, UpdateGroupRequest, PaginatedResponse } from '@/types';

const isDevMode = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

const now = new Date().toISOString();

const MOCK_GROUPS: ApiKeyGroup[] = [
  {
    id: 1,
    name: 'Claude',
    description: 'Anthropic compatible channel',
    platform: 'anthropic',
    rate_multiplier: 1,
    is_exclusive: false,
    status: 'active',
    subscription_type: 'standard',
    daily_limit_usd: null,
    weekly_limit_usd: null,
    monthly_limit_usd: null,
    allow_image_generation: false,
    image_rate_independent: false,
    image_rate_multiplier: 1,
    image_price_1k: null,
    image_price_2k: null,
    image_price_4k: null,
    claude_code_only: false,
    fallback_group_id: null,
    fallback_group_id_on_invalid_request: null,
    require_oauth_only: false,
    require_privacy_set: false,
    key_count: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 2,
    name: 'OpenAI',
    description: 'OpenAI compatible channel',
    platform: 'openai',
    rate_multiplier: 1.2,
    is_exclusive: false,
    status: 'active',
    subscription_type: 'subscription',
    daily_limit_usd: 10,
    weekly_limit_usd: 50,
    monthly_limit_usd: 150,
    allow_image_generation: true,
    image_rate_independent: true,
    image_rate_multiplier: 1,
    image_price_1k: 0.01,
    image_price_2k: 0.02,
    image_price_4k: 0.04,
    claude_code_only: false,
    fallback_group_id: null,
    fallback_group_id_on_invalid_request: null,
    require_oauth_only: false,
    require_privacy_set: false,
    key_count: 1,
    created_at: now,
    updated_at: now,
  },
];

let mockGroups = [...MOCK_GROUPS];

export const groupsApi = {
  list: async (page = 1, pageSize = 10): Promise<PaginatedResponse<ApiKeyGroup>> => {
    if (isDevMode) {
      return { items: mockGroups, total: mockGroups.length, page, page_size: pageSize, pages: 1, total_pages: 1 };
    }
    const { data } = await apiClient.get<PaginatedResponse<ApiKeyGroup>>('/groups', {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  getAvailable: async (): Promise<ApiKeyGroup[]> => {
    if (isDevMode) return mockGroups.filter((group) => group.status === 'active');
    const { data } = await apiClient.get<ApiKeyGroup[]>('/groups/available');
    return data;
  },

  getUserGroupRates: async (): Promise<Record<number, number>> => {
    if (isDevMode) return { 2: 1.1 };
    const { data } = await apiClient.get<Record<number, number> | null>('/groups/rates');
    return data || {};
  },

  getById: async (id: number): Promise<ApiKeyGroup> => {
    if (isDevMode) return mockGroups.find((group) => group.id === id) || MOCK_GROUPS[0];
    const { data } = await apiClient.get<ApiKeyGroup>(`/groups/${id}`);
    return data;
  },

  create: async (payload: CreateGroupRequest): Promise<ApiKeyGroup> => {
    if (isDevMode) {
      const group: ApiKeyGroup = {
        ...MOCK_GROUPS[0],
        id: mockGroups.length + 1,
        name: payload.name,
        description: payload.description || null,
        key_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockGroups.push(group);
      return group;
    }
    const { data } = await apiClient.post<ApiKeyGroup>('/groups', payload);
    return data;
  },

  update: async (id: number, updates: UpdateGroupRequest): Promise<ApiKeyGroup> => {
    if (isDevMode) {
      const group = mockGroups.find((item) => item.id === id);
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
      mockGroups = mockGroups.filter((group) => group.id !== id);
      return;
    }
    await apiClient.delete(`/groups/${id}`);
  },
};
