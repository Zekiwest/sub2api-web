'use client';

/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 使用日志页面，展示 API 调用记录
 * 依赖关系: components/dashboard-layout.tsx, lib/usage.ts, lib/keys.ts, stores/auth.ts
 * 变更同步:
 *   - 日志字段变化时，需更新表格列
 *   - 篮选功能变化时，需更新本文件
 *   - 设计系统颜色变化时，需更新样式配置
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { usageApi } from '@/lib/usage';
import { keysApi } from '@/lib/keys';
import { useAuthStore } from '@/stores/auth';
import type { UsageLog, ApiKey, PaginatedResponse } from '@/types';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';

// Design system colors matching Paper design
const colors = {
  primary: '#1D3025',
  secondary: '#5C7064',
  border: '#D3DED8',
  background: '#FFFFFF',
  backgroundAlt: '#FAFAFA',
  modelBadgeBg: '#1F5134',
  modelBadgeText: '#F2ECD9',
  successBadgeBg: '#C91D2B', // Note: Design shows red for success badge, might need adjustment
  successBadgeText: '#FCF7E8',
};

export default function UsagePage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [logs, setLogs] = useState<PaginatedResponse<UsageLog> | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [page, setPage] = useState(1);
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      keysApi.list(1, 100).then((res) => setApiKeys(res.items)).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadLogs();
    }
  }, [isAuthenticated, page, selectedKeyId]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (selectedKeyId) {
        params.api_key_id = selectedKeyId;
      }
      const response = await usageApi.listLogs(params);
      setLogs(response);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full py-4 gap-4 bg-white" style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}>
        {/* Header */}
        <div className="flex flex-col gap-1 px-4">
          <div className="text-[16px] leading-[137.5%] font-medium text-[#1D3025]">
            Usage Logs
          </div>
          <div className="text-[14px] leading-[142.857%] text-[#5C7064]">
            View your API usage logs
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-[#D3DED8]" />

        {/* Filters */}
        <div className="flex items-center gap-4 px-4">
          <div className="flex flex-col gap-2">
            <div className="text-[14px] leading-[142.857%] text-[#5C7064]">
              API Key
            </div>
            <div className="flex items-start gap-2">
              {/* Select Dropdown */}
              <div className="flex items-center py-2 px-3 h-8 gap-2 bg-[#FAFAFA] border border-solid border-[#D3DED8] rounded-sm">
                <select
                  className="text-[14px] leading-[142.857%] font-medium text-[#1D3025] bg-transparent border-none outline-none cursor-pointer appearance-none"
                  value={selectedKeyId || ''}
                  onChange={(e) => setSelectedKeyId(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">All keys</option>
                  {apiKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-[#6A7282]" />
              </div>

              {/* Clear Filter Button */}
              <button
                onClick={() => {
                  setSelectedKeyId(null);
                  setPage(1);
                }}
                className="flex items-center justify-center h-8 px-3 gap-1.5 bg-[#FAFAFA] border border-solid border-[#D3DED8] rounded-xs text-[14px] leading-[142.857%] font-medium text-[#1D3025] hover:bg-[#EFEFEF] transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-[#D3DED8]" />

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="animate-pulse flex flex-col gap-4 w-full px-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[#EFEFEF] rounded" />
              ))}
            </div>
          </div>
        ) : !logs || logs.items.length === 0 ? (
          <div className="text-center text-[14px] text-[#5C7064] p-10">
            No usage logs found.
          </div>
        ) : (
          <div className="px-4">
            <div className="border-collapse w-full">
              {/* Table Header */}
              <div className="flex border-b border-solid border-[#D3DED8]">
                <div className="flex items-center h-10 px-2 text-[14px] leading-[142.857%] font-medium text-[#1D3025]" style={{ minWidth: '182px' }}>
                  Time
                </div>
                <div className="flex items-center h-10 px-2 text-[14px] leading-[142.857%] font-medium text-[#1D3025]" style={{ minWidth: '148px' }}>
                  API Key
                </div>
                <div className="flex items-center h-10 px-2 text-[14px] leading-[142.857%] font-medium text-[#1D3025]" style={{ minWidth: '145px' }}>
                  Model
                </div>
                <div className="flex items-center h-10 px-2 text-[14px] leading-[142.857%] font-medium text-[#1D3025]" style={{ minWidth: '60px' }}>
                  Type
                </div>
                <div className="flex items-center h-10 px-2 text-[14px] leading-[142.857%] font-medium text-[#1D3025]" style={{ minWidth: '65px' }}>
                  Input
                </div>
                <div className="flex items-center h-10 px-2 text-[14px] leading-[142.857%] font-medium text-[#1D3025]" style={{ minWidth: '81px' }}>
                  Output
                </div>
                <div className="flex items-center h-10 px-2 text-[14px] leading-[142.857%] font-medium text-[#1D3025]" style={{ minWidth: '91px' }}>
                  Cache
                </div>
                <div className="flex items-center h-10 px-2 text-[14px] leading-[142.857%] font-medium text-[#1D3025]" style={{ minWidth: '88px' }}>
                  Cost
                </div>
                <div className="flex items-center h-10 px-2 text-[14px] leading-[142.857%] font-medium text-[#1D3025]" style={{ minWidth: '94px' }}>
                  Duration
                </div>
                <div className="flex items-center h-10 px-2 text-[14px] leading-[142.857%] font-medium text-[#1D3025]" style={{ minWidth: '98px' }}>
                  Status
                </div>
              </div>

              {/* Table Body */}
              {logs.items.map((log) => (
                <div key={log.id} className="flex border-b border-solid border-[#D3DED8]">
                  <div className="flex items-center p-2 text-[14px] leading-[142.857%] text-[#1D3025]" style={{ minWidth: '182px' }}>
                    {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </div>
                  <div className="flex items-center p-2 text-[14px] leading-[142.857%] text-[#1D3025]" style={{ minWidth: '148px' }}>
                    {log.api_key_name || `Key #${log.api_key_id}`}
                  </div>
                  <div className="flex items-center p-2" style={{ minWidth: '145px' }}>
                    <div className="flex items-center justify-center h-5 px-2 rounded-[5px] bg-[#1F5134] border border-solid border-transparent">
                      <div className="text-[12px] leading-[133.333%] font-medium text-[#F2ECD9]">
                        {log.model}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center p-2 text-[14px] leading-[142.857%] text-[#1D3025]" style={{ minWidth: '60px' }}>
                    {log.request_type}
                  </div>
                  <div className="flex items-center p-2 text-[14px] leading-[142.857%] text-[#1D3025]" style={{ minWidth: '65px' }}>
                    {log.input_tokens?.toLocaleString() || '0'}
                  </div>
                  <div className="flex items-center p-2 text-[14px] leading-[142.857%] text-[#1D3025]" style={{ minWidth: '81px' }}>
                    {log.output_tokens?.toLocaleString() || '0'}
                  </div>
                  <div className="flex items-center p-2" style={{ minWidth: '91px' }}>
                    <div className="flex flex-col gap-1">
                      <div className="text-[12px] leading-[133.333%] text-[#5C7064]">
                        Create: {log.cache_creation_tokens || 0}
                      </div>
                      <div className="text-[12px] leading-[133.333%] text-[#5C7064]">
                        Read: {log.cache_read_tokens || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center p-2 text-[14px] leading-[142.857%] text-[#1D3025]" style={{ minWidth: '88px' }}>
                    ${log.actual_cost?.toFixed(4) || '0.0000'}
                  </div>
                  <div className="flex items-center p-2 text-[14px] leading-[142.857%] text-[#1D3025]" style={{ minWidth: '94px' }}>
                    {log.duration_ms || 0}ms
                  </div>
                  <div className="flex items-center p-2" style={{ minWidth: '98px' }}>
                    <div className="flex items-center justify-center h-5 px-2 rounded-[5px] border border-solid border-transparent"
                         style={{
                           backgroundColor: log.status === 'success' ? '#C91D2B' : '#C91D2B',
                           color: '#FCF7E8'
                         }}>
                      <div className="text-[12px] leading-[133.333%] font-medium text-[#FCF7E8]">
                        {log.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {logs && (
          <div className="flex p-4 gap-4 justify-end items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center justify-center h-8 px-3 gap-1.5 bg-[#FAFAFA] border border-solid border-[#D3DED8] rounded-xs text-[14px] leading-[142.857%] font-medium text-[#1D3025] disabled:opacity-[0.5] disabled:cursor-not-allowed hover:bg-[#EFEFEF] transition-colors"
            >
              Previous
            </button>
            <div className="text-[14px] leading-[142.857%] text-[#5C7064]">
              Page {page} of {logs.total_pages || 1}
            </div>
            <button
              disabled={page >= (logs.total_pages || 1)}
              onClick={() => setPage(page + 1)}
              className="flex items-center justify-center h-8 px-3 gap-1.5 bg-[#FAFAFA] border border-solid border-[#D3DED8] rounded-xs text-[14px] leading-[142.857%] font-medium text-[#1D3025] disabled:opacity-[0.5] disabled:cursor-not-allowed hover:bg-[#EFEFEF] transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}