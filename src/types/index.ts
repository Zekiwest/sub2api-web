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
  pages?: number;
  total_pages?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | string;
  balance: number;
  concurrency?: number;
  rpm_limit?: number;
  status?: 'active' | 'disabled';
  allowed_groups?: number[] | null;
  balance_notify_enabled?: boolean;
  balance_notify_threshold?: number | null;
  invite_code?: string;
  invite_count?: number;
  invite_rewards?: number;
  created_at: string;
  updated_at: string;
}

export interface InviteStats {
  invite_code: string;
  invite_link: string;
  total_invites: number;
  active_invites: number;
  total_rewards: number;
  pending_rewards: number;
  invitees: Invitee[];
}

export interface Invitee {
  id: number;
  username: string;
  email: string;
  registered_at: string;
  status: 'active' | 'inactive';
  rewards_generated: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username?: string;
  email: string;
  password: string;
  verify_code?: string;
  invitation_code?: string;
  promo_code?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
  user: User;
}

export type GroupPlatform = 'anthropic' | 'openai' | 'gemini' | 'antigravity';
export type SubscriptionType = 'standard' | 'subscription';

export interface Group {
  id: number;
  name: string;
  description: string | null;
  platform: GroupPlatform;
  rate_multiplier: number;
  rpm_limit?: number;
  is_exclusive: boolean;
  status: 'active' | 'inactive';
  subscription_type: SubscriptionType;
  daily_limit_usd: number | null;
  weekly_limit_usd: number | null;
  monthly_limit_usd: number | null;
  allow_image_generation: boolean;
  image_rate_independent: boolean;
  image_rate_multiplier: number;
  image_price_1k: number | null;
  image_price_2k: number | null;
  image_price_4k: number | null;
  claude_code_only: boolean;
  fallback_group_id: number | null;
  fallback_group_id_on_invalid_request: number | null;
  allow_messages_dispatch?: boolean;
  require_oauth_only: boolean;
  require_privacy_set: boolean;
  created_at: string;
  updated_at: string;
}

export type ApiKeyGroup = Group & {
  key_count?: number;
};

export interface CreateGroupRequest {
  name: string;
  description?: string | null;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string | null;
}

export interface ApiKey {
  id: number;
  user_id?: number;
  key: string;
  name: string;
  group_id: number | null;
  group_name?: string;
  status: 'active' | 'inactive' | 'quota_exhausted' | 'expired';
  ip_whitelist: string[];
  ip_blacklist: string[];
  last_used_at: string | null;
  quota: number;
  quota_used: number;
  used_quota?: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  group?: Group;
  rate_limit_5h: number;
  rate_limit_1d: number;
  rate_limit_7d: number;
  usage_5h: number;
  usage_1d: number;
  usage_7d: number;
  window_5h_start: string | null;
  window_1d_start: string | null;
  window_7d_start: string | null;
  reset_5h_at: string | null;
  reset_1d_at: string | null;
  reset_7d_at: string | null;
}

export interface CreateApiKeyRequest {
  name: string;
  group_id?: number | null;
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
  group_id?: number | null;
  status?: 'active' | 'inactive';
  ip_whitelist?: string[];
  ip_blacklist?: string[];
  quota?: number;
  expires_at?: string | null;
  reset_quota?: boolean;
  rate_limit_5h?: number;
  rate_limit_1d?: number;
  rate_limit_7d?: number;
  reset_rate_limit_usage?: boolean;
}

export interface PlatformDashboardStats {
  platform: string;
  total_requests: number;
  total_tokens: number;
  total_actual_cost: number;
  today_requests: number;
  today_tokens: number;
  today_actual_cost: number;
}

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
  by_platform?: PlatformDashboardStats[];
}

export interface TrendDataPoint {
  date: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  total_tokens: number;
  cost: number;
  actual_cost: number;
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
  cache_creation_tokens: number;
  cache_read_tokens: number;
  total_tokens: number;
  cost: number;
  actual_cost: number;
  account_cost?: number;
}

export interface ModelStatsResponse {
  models: ModelStat[];
  start_date: string;
  end_date: string;
}

export type UsageRequestType = 'unknown' | 'sync' | 'stream' | 'ws_v2';
export type ImageSizeSource = 'output' | 'input' | 'default' | 'legacy';
export type ImageSizeBreakdown = Record<string, number>;

export interface UsageLog {
  id: number;
  user_id?: number;
  api_key_id: number;
  account_id: number | null;
  request_id: string;
  model: string;
  service_tier?: string | null;
  reasoning_effort?: string | null;
  inbound_endpoint?: string | null;
  upstream_endpoint?: string | null;
  group_id: number | null;
  subscription_id?: number | null;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  cache_creation_5m_tokens: number;
  cache_creation_1h_tokens: number;
  input_cost: number;
  output_cost: number;
  cache_creation_cost: number;
  cache_read_cost: number;
  total_cost: number;
  actual_cost: number;
  cost?: number;
  rate_multiplier: number;
  billing_type: number;
  request_type?: UsageRequestType | string;
  stream: boolean;
  openai_ws_mode?: boolean;
  duration_ms: number;
  first_token_ms: number | null;
  image_count: number;
  image_size: string | null;
  image_input_size: string | null;
  image_output_size: string | null;
  image_size_source: ImageSizeSource | null;
  image_size_breakdown: ImageSizeBreakdown | null;
  user_agent: string | null;
  cache_ttl_overridden: boolean;
  billing_mode?: string | null;
  status?: string;
  created_at: string;
  api_key_name?: string;
  api_key?: ApiKey;
  group?: Group;
}

export interface UsageStatsResponse {
  period?: string;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cache_tokens: number;
  total_tokens: number;
  total_cost: number;
  total_actual_cost: number;
  average_duration_ms: number;
  models?: Record<string, number>;
}

export interface UsageQueryParams {
  page?: number;
  page_size?: number;
  api_key_id?: number;
  user_id?: number;
  account_id?: number;
  group_id?: number;
  model?: string;
  request_type?: UsageRequestType | string;
  stream?: boolean;
  billing_type?: number | null;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ApiKeyDailyUsagePoint {
  date: string;
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  total_tokens: number;
  cost: number;
  actual_cost: number;
}

export interface ApiKeyDailyUsageResponse {
  items: ApiKeyDailyUsagePoint[];
  days: number;
  start_date: string;
  end_date: string;
}

export interface BatchApiKeyUsageStats {
  api_key_id: number;
  today_actual_cost: number;
  total_actual_cost: number;
}

export interface BatchApiKeysUsageResponse {
  stats: Record<string, BatchApiKeyUsageStats>;
}

export type RedeemCodeType =
  | 'balance'
  | 'concurrency'
  | 'subscription'
  | 'invitation'
  | 'admin_balance'
  | 'admin_concurrency';

export interface RedeemCodeRequest {
  code: string;
}

export interface RedeemResult {
  message: string;
  type: RedeemCodeType | string;
  value: number;
  new_balance?: number;
  new_concurrency?: number;
  group_name?: string;
  validity_days?: number;
}

export interface RedeemHistoryItem {
  id: number;
  code: string;
  type: RedeemCodeType | string;
  value: number;
  status: string;
  used_at: string;
  created_at: string;
  notes?: string;
  group_id?: number;
  validity_days?: number;
  group?: {
    id: number;
    name: string;
  };
}

export interface CustomEndpoint {
  name: string;
  endpoint: string;
  description: string;
}

export interface CustomMenuItem {
  id: string;
  label: string;
  icon_svg: string;
  url: string;
  page_slug?: string;
  visibility: 'user' | 'admin';
  sort_order: number;
}

export interface PublicSettings {
  site_name: string;
  registration_enabled: boolean;
  invitation_required?: boolean;
  invitation_code_enabled?: boolean;
  turnstile_enabled: boolean;
  turnstile_site_key?: string;
  api_base_url?: string;
  contact_info?: string;
  doc_url?: string;
  hide_ccs_import_button?: boolean;
  custom_endpoints?: CustomEndpoint[];
  custom_menu_items?: CustomMenuItem[];
  payment_enabled?: boolean;
  wechat_oauth_enabled?: boolean;
  oidc_oauth_enabled?: boolean;
  linuxdo_oauth_enabled?: boolean;
}
