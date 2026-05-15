/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: TypeScript 全局类型定义，是全项目的类型中枢
 * 依赖关系: 无外部依赖，被 stores/*, lib/*, app/* 所有模块导入
 * 变更同步:
 *   - 类型字段变化时，需同步更新后端 API 响应结构
 *   - 新增类型时，需在 types/_dir.md 中记录
 *   - 删除类型时，需检查所有使用该类型的文件
 * ============================================================================
 */

// API Types
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  invitation_code?: string;
  promo_code?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

// API Key Types
export interface ApiKey {
  id: number;
  name: string;
  key: string;
  status: 'active' | 'inactive';
  group_id?: number;
  group_name?: string;
  quota: number;
  used_quota: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  ip_whitelist?: string[];
  ip_blacklist?: string[];
  rate_limit_5h?: number;
  rate_limit_1d?: number;
  rate_limit_7d?: number;
}

export interface CreateApiKeyRequest {
  name: string;
  group_id?: number;
  custom_key?: string;
  ip_whitelist?: string[];
  ip_blacklist?: string[];
  quota?: number;
  expires_in_days?: number;
  rate_limit_5h?: number;
  rate_limit_1d?: number;
  rate_limit_7d?: number;
}

export interface UpdateApiKeyRequest {
  name?: string;
  status?: 'active' | 'inactive';
  quota?: number;
  ip_whitelist?: string[];
  ip_blacklist?: string[];
}

// Usage Types
export interface UserDashboardStats {
  total_api_keys: number;
  active_api_keys: number;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cache_creation_tokens: number;
  total_cache_read_tokens: number;
  total_tokens: number;
  total_cost: number;
  total_actual_cost: number;
  today_requests: number;
  today_input_tokens: number;
  today_output_tokens: number;
  today_cache_creation_tokens: number;
  today_cache_read_tokens: number;
  today_tokens: number;
  today_cost: number;
  today_actual_cost: number;
  average_duration_ms: number;
  rpm: number;
  tpm: number;
}

export interface TrendDataPoint {
  date: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cost: number;
}

export interface TrendResponse {
  trend: TrendDataPoint[];
  start_date: string;
  end_date: string;
  granularity: string;
}

export interface ModelStat {
  model: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cost: number;
}

export interface ModelStatsResponse {
  models: ModelStat[];
  start_date: string;
  end_date: string;
}

export interface UsageLog {
  id: number;
  api_key_id: number;
  api_key_name: string;
  model: string;
  request_type: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  cost: number;
  actual_cost: number;
  duration_ms: number;
  status: string;
  created_at: string;
}

export interface PublicSettings {
  site_name: string;
  registration_enabled: boolean;
  invitation_required: boolean;
  turnstile_enabled: boolean;
  turnstile_site_key?: string;
  wechat_oauth_enabled?: boolean;
  oidc_oauth_enabled?: boolean;
  linuxdo_oauth_enabled?: boolean;
}