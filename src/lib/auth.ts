/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 认证 API 模块，处理登录/注册/登出/token 管理
 * 依赖关系: lib/api.ts, types/index.ts, localStorage
 * 变更同步:
 *   - API 端点变化时，需检查后端路由是否匹配
 *   - Token 存储方式变化时，需同步更新 stores/auth.ts
 * ============================================================================
 */

import apiClient from '@/lib/api';
import type { LoginRequest, RegisterRequest, AuthResponse, User, PublicSettings } from '@/types';

const isDevMode = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', userData);
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      } catch {
        // Ignore errors
      }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  getPublicSettings: async (): Promise<PublicSettings> => {
    if (isDevMode) {
      return {
        site_name: 'Sub2API',
        registration_enabled: true,
        invitation_required: false,
        invitation_code_enabled: false,
        turnstile_enabled: false,
        api_base_url: 'http://localhost:3000',
        contact_info: '',
        doc_url: '',
        hide_ccs_import_button: false,
        custom_endpoints: [],
        custom_menu_items: [],
        payment_enabled: false,
      };
    }
    const { data } = await apiClient.get<PublicSettings>('/settings/public');
    return data;
  },
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('auth_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};
