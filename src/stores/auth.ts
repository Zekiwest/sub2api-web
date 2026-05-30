/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Zustand 认证状态管理，控制全局登录态
 * 依赖关系: types/index.ts (User), lib/auth.ts, localStorage
 * 变更同步:
 *   - 状态字段变化时，需检查所有使用 useAuthStore 的页面
 *   - 存储方式变化时，需同步更新 login/logout 页面逻辑
 *   - 新增方法时，需在 stores/_dir.md 中记录
 * ============================================================================
 */

import { create } from 'zustand';
import type { User } from '@/types';
import { authApi, getStoredUser, isAuthenticated } from '@/lib/auth';

// Mock user for development mode (no backend)
const MOCK_USER: User = {
  id: 1,
  username: 'DemoUser',
  email: 'demo@example.com',
  role: 'user',
  balance: 100.00,
  created_at: '2026-05-14T00:00:00Z',
  updated_at: '2026-05-14T00:00:00Z',
};

// Check if running in dev mode without backend
const isDevMode = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: isDevMode ? MOCK_USER : null,
  isAuthenticated: isDevMode ? true : false,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    if (isDevMode) {
      // In dev mode, just reset to mock user
      set({ user: MOCK_USER, isAuthenticated: true });
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      set({ user: null, isAuthenticated: false });
    }
  },
  checkAuth: () => {
    if (isDevMode) {
      set({ user: MOCK_USER, isAuthenticated: true, isLoading: false });
    } else {
      const user = getStoredUser();
      const auth = isAuthenticated();
      set({ user: auth ? user : null, isAuthenticated: auth, isLoading: false });
    }
  },
  refreshUser: async () => {
    if (isDevMode) {
      set({ user: MOCK_USER, isAuthenticated: true, isLoading: false });
      return;
    }
    const user = await authApi.getCurrentUser();
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },
}));
