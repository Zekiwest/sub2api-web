/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Axios HTTP 客户端配置，是所有 API lib 的基础
 * 依赖关系: axios, types/index.ts (间接)
 * 变更同步:
 *   - baseURL 变化时，需更新 .env.local 配置
 *   - 拦截器逻辑变化时，需检查所有 API 模块
 *   - 新增拦截器时，需在 lib/_dir.md 中记录
 * ============================================================================
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

interface ApiErrorResponse {
  code?: number;
  message?: string;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    const apiResponse = response.data;
    if (apiResponse && typeof apiResponse === 'object' && 'code' in apiResponse) {
      if (apiResponse.code === 0) {
        response.data = apiResponse.data;
      } else {
        return Promise.reject({
          status: response.status,
          code: apiResponse.code,
          message: apiResponse.message || 'Unknown error',
        });
      }
    }
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject({
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'Network error',
    });
  }
);

export default apiClient;