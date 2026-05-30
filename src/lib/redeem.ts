import apiClient from '@/lib/api';
import type { RedeemHistoryItem, RedeemResult } from '@/types';

const isDevMode = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

let mockHistory: RedeemHistoryItem[] = [
  {
    id: 1,
    code: 'WELCOME2026',
    type: 'balance',
    value: 10,
    status: 'used',
    used_at: '2026-05-29T12:00:00Z',
    created_at: '2026-05-29T12:00:00Z',
  },
  {
    id: 2,
    code: 'SUB-CLAUDE-30',
    type: 'subscription',
    value: 30,
    status: 'used',
    used_at: '2026-05-30T08:00:00Z',
    created_at: '2026-05-30T08:00:00Z',
    group_id: 1,
    validity_days: 30,
    group: { id: 1, name: 'Claude' },
  },
];

export const redeemApi = {
  redeem: async (code: string): Promise<RedeemResult> => {
    if (isDevMode) {
      const normalized = code.trim();
      const result: RedeemResult = normalized.toLowerCase().includes('sub')
        ? { message: 'Redeemed subscription successfully', type: 'subscription', value: 30, group_name: 'Claude', validity_days: 30 }
        : { message: 'Redeemed balance successfully', type: 'balance', value: 5, new_balance: 105 };
      mockHistory = [
        {
          id: Date.now(),
          code: normalized,
          type: result.type,
          value: result.value,
          status: 'used',
          used_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          validity_days: result.validity_days,
          group: result.group_name ? { id: 1, name: result.group_name } : undefined,
        },
        ...mockHistory,
      ];
      return result;
    }
    const { data } = await apiClient.post<RedeemResult>('/redeem', { code });
    return data;
  },

  getHistory: async (): Promise<RedeemHistoryItem[]> => {
    if (isDevMode) return mockHistory;
    const { data } = await apiClient.get<RedeemHistoryItem[]>('/redeem/history');
    return data;
  },
};
