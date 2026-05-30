'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ClockIcon,
  DatabaseIcon,
  DownloadIcon,
  ImageIcon,
  RefreshCwIcon,
  ReceiptTextIcon,
  TimerIcon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Skeleton } from '@/components/ui/skeleton';
import { keysApi } from '@/lib/keys';
import { usageApi } from '@/lib/usage';
import { useAuthStore } from '@/stores/auth';
import type { ApiKey, UsageLog, UsageQueryParams, UsageStatsResponse } from '@/types';

function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function money(value: number | undefined | null, digits = 4): string {
  return `$${(value || 0).toFixed(digits)}`;
}

function compact(value: number | undefined | null): string {
  const number = value || 0;
  if (number >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(2)}B`;
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(2)}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(2)}K`;
  return number.toLocaleString();
}

function duration(ms: number | undefined | null): string {
  const value = ms || 0;
  if (value < 1000) return `${value.toFixed(0)}ms`;
  return `${(value / 1000).toFixed(2)}s`;
}

function requestType(log: UsageLog): string {
  if (log.openai_ws_mode || log.request_type === 'ws_v2') return 'WS';
  if (log.stream || log.request_type === 'stream') return 'Stream';
  if (log.request_type === 'sync') return 'Sync';
  return 'Unknown';
}

function billingMode(log: UsageLog): string {
  if ((log.image_count || 0) > 0) return 'image';
  return log.billing_mode || 'token';
}

function isImage(log: UsageLog): boolean {
  return (log.image_count || 0) > 0;
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  const escaped = text.replace(/"/g, '""');
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${escaped}` : escaped;
  return /[,"\n\r]/.test(safe) ? `"${safe}"` : safe;
}

export default function UsagePage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [stats, setStats] = useState<UsageStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [apiKeyId, setApiKeyId] = useState('');
  const [model, setModel] = useState('');
  const [requestFilter, setRequestFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const defaultStart = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return localDate(date);
  }, []);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(localDate(new Date()));

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;
    keysApi.list(1, 100).then((response) => setApiKeys(response.items)).catch(() => setApiKeys([]));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadUsage();
  }, [isAuthenticated, page, pageSize, apiKeyId, requestFilter, sortBy, sortOrder]);

  async function loadUsage() {
    setLoading(true);
    try {
      const params = buildParams(page, pageSize);
      const [logResponse, statResponse] = await Promise.all([
        usageApi.listLogs(params),
        usageApi.getStatsByDateRange(startDate, endDate, apiKeyId ? Number(apiKeyId) : undefined),
      ]);
      setLogs(logResponse.items);
      setTotalPages(logResponse.pages || logResponse.total_pages || 1);
      setStats(statResponse);
    } finally {
      setLoading(false);
    }
  }

  function buildParams(targetPage: number, targetPageSize: number): UsageQueryParams {
    return {
      page: targetPage,
      page_size: targetPageSize,
      api_key_id: apiKeyId ? Number(apiKeyId) : undefined,
      model: model.trim() || undefined,
      request_type: requestFilter || undefined,
      start_date: startDate,
      end_date: endDate,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
  }

  function applyFilters() {
    setPage(1);
    loadUsage();
  }

  function resetFilters() {
    setApiKeyId('');
    setModel('');
    setRequestFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setStartDate(defaultStart);
    setEndDate(localDate(new Date()));
    setPage(1);
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const all: UsageLog[] = [];
      const first = await usageApi.listLogs(buildParams(1, 100));
      all.push(...first.items);
      const pages = first.pages || first.total_pages || 1;
      for (let index = 2; index <= pages; index += 1) {
        const response = await usageApi.listLogs(buildParams(index, 100));
        all.push(...response.items);
      }
      const headers = [
        'Time',
        'Request ID',
        'API Key',
        'Model',
        'Reasoning Effort',
        'Inbound Endpoint',
        'Upstream Endpoint',
        'Type',
        'Billing Mode',
        'Input Tokens',
        'Output Tokens',
        'Cache Read Tokens',
        'Cache Creation Tokens',
        'Cache Creation 5m Tokens',
        'Cache Creation 1h Tokens',
        'Images',
        'Image Size',
        'Rate Multiplier',
        'Billed Cost',
        'Original Cost',
        'Input Cost',
        'Output Cost',
        'Cache Creation Cost',
        'Cache Read Cost',
        'First Token ms',
        'Duration ms',
        'User Agent',
      ];
      const rows = all.map((log) => [
        log.created_at,
        log.request_id,
        log.api_key?.name || log.api_key_name || log.api_key_id,
        log.model,
        log.reasoning_effort || '',
        log.inbound_endpoint || '',
        log.upstream_endpoint || '',
        requestType(log),
        billingMode(log),
        log.input_tokens,
        log.output_tokens,
        log.cache_read_tokens,
        log.cache_creation_tokens,
        log.cache_creation_5m_tokens,
        log.cache_creation_1h_tokens,
        log.image_count,
        log.image_output_size || log.image_size || '',
        log.rate_multiplier,
        log.actual_cost,
        log.total_cost,
        log.input_cost,
        log.output_cost,
        log.cache_creation_cost,
        log.cache_read_cost,
        log.first_token_ms ?? '',
        log.duration_ms,
        log.user_agent || '',
      ]);
      const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usage_${startDate}_to_${endDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<ReceiptTextIcon className="h-5 w-5 text-[#1F5134]" />} label="Total Requests" value={(stats?.total_requests || 0).toLocaleString()} detail="Selected range" />
          <StatCard icon={<DatabaseIcon className="h-5 w-5 text-[#C91D2B]" />} label="Total Tokens" value={compact(stats?.total_tokens)} detail={`In ${compact(stats?.total_input_tokens)} / Out ${compact(stats?.total_output_tokens)}`} />
          <StatCard icon={<DownloadIcon className="h-5 w-5 text-[#1F5134]" />} label="Billed Cost" value={money(stats?.total_actual_cost)} detail={`Standard ${money(stats?.total_cost)}`} />
          <StatCard icon={<TimerIcon className="h-5 w-5 text-[#C91D2B]" />} label="Avg Duration" value={duration(stats?.average_duration_ms)} detail="Per request" />
        </div>

        <Card className="shadow-none ring-1 ring-[#1D3025]/10 rounded-md">
          <CardHeader className="px-4 gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="text-base font-medium text-[#1D3025]">Usage Records</CardTitle>
                <p className="mt-1 text-sm text-[#5C7064]">Inspect tokens, cache, cost, endpoints, request type, image billing and latency.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadUsage} disabled={loading}><RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
                <Button variant="success" onClick={exportCsv} disabled={exporting || loading}><DownloadIcon className="h-4 w-4" />{exporting ? 'Exporting' : 'CSV'}</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[180px_150px_150px_150px_1fr_130px_110px_auto]">
              <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm" value={apiKeyId} onChange={(event) => { setApiKeyId(event.target.value); setPage(1); }}>
                <option value="">All API keys</option>
                {apiKeys.map((key) => <option key={key.id} value={key.id}>{key.name}</option>)}
              </select>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm" value={requestFilter} onChange={(event) => { setRequestFilter(event.target.value); setPage(1); }}>
                <option value="">All types</option>
                <option value="sync">Sync</option>
                <option value="stream">Stream</option>
                <option value="ws_v2">WS</option>
              </select>
              <Input placeholder="Model contains..." value={model} onChange={(event) => setModel(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applyFilters()} />
              <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="created_at">Time</option>
                <option value="model">Model</option>
                <option value="actual_cost">Cost</option>
                <option value="duration_ms">Duration</option>
              </select>
              <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={applyFilters}>Apply</Button>
                <Button variant="ghost" onClick={resetFilters}>Reset</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <ResponsiveTable
              data={logs}
              emptyMessage="No usage records found."
              isLoading={loading}
              loadingComponent={<div className="flex justify-center p-20"><Skeleton className="h-8 w-8 rounded-full" /></div>}
              cardTitle={(log) => (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {isImage(log) ? <ImageIcon className="h-4 w-4" /> : <DatabaseIcon className="h-4 w-4" />}
                    <span>{log.model}</span>
                  </div>
                  <span className="text-xs text-[#5C7064]">{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm')}</span>
                </div>
              )}
              columns={[
                {
                  key: 'time',
                  label: 'Time',
                  render: (log) => (
                    <div className="flex min-w-[140px] flex-col text-xs">
                      <span>{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}</span>
                      <span className="text-[#5C7064]">{log.request_id}</span>
                    </div>
                  ),
                },
                {
                  key: 'key',
                  label: 'API Key',
                  render: (log) => log.api_key?.name || log.api_key_name || `Key #${log.api_key_id}`,
                },
                {
                  key: 'model',
                  label: 'Model',
                  render: (log) => (
                    <div className="flex min-w-[150px] flex-col gap-1">
                      <Badge variant="active">{log.model}</Badge>
                      {log.reasoning_effort && <span className="text-xs text-[#5C7064]">reasoning: {log.reasoning_effort}</span>}
                    </div>
                  ),
                },
                {
                  key: 'endpoint',
                  label: 'Endpoint',
                  mobilePriority: 'low',
                  render: (log) => (
                    <div className="max-w-[260px] break-all text-xs text-[#5C7064]">
                      <div>{log.inbound_endpoint || '-'}</div>
                      {log.upstream_endpoint && <div>upstream: {log.upstream_endpoint}</div>}
                    </div>
                  ),
                },
                {
                  key: 'type',
                  label: 'Type',
                  render: (log) => (
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline">{requestType(log)}</Badge>
                      <span className="text-xs text-[#5C7064]">{billingMode(log)}</span>
                    </div>
                  ),
                },
                {
                  key: 'tokens',
                  label: 'Tokens / Images',
                  mobileLabel: 'Tokens',
                  render: (log) => isImage(log) ? (
                    <div className="flex min-w-[130px] flex-col gap-1 text-sm">
                      <span>{log.image_count} image(s)</span>
                      <span className="text-xs text-[#5C7064]">{log.image_output_size || log.image_size || '-'}</span>
                      {log.image_size_source && <span className="text-xs text-[#5C7064]">source: {log.image_size_source}</span>}
                    </div>
                  ) : (
                    <div className="flex min-w-[150px] flex-col gap-1 text-xs">
                      <span>In {compact(log.input_tokens)} / Out {compact(log.output_tokens)}</span>
                      <span>Cache read {compact(log.cache_read_tokens)}</span>
                      <span>Cache write {compact(log.cache_creation_tokens)}</span>
                      {(log.cache_creation_5m_tokens > 0 || log.cache_creation_1h_tokens > 0) && <span className="text-[#5C7064]">5m {compact(log.cache_creation_5m_tokens)} / 1h {compact(log.cache_creation_1h_tokens)}</span>}
                      {log.cache_ttl_overridden && <Badge variant="destructive" className="w-fit">TTL override</Badge>}
                    </div>
                  ),
                },
                {
                  key: 'cost',
                  label: 'Cost',
                  render: (log) => (
                    <div className="flex min-w-[130px] flex-col gap-1 text-xs">
                      <span className="font-medium text-[#1F5134]">Billed {money(log.actual_cost, 6)}</span>
                      <span className="text-[#5C7064]">Original {money(log.total_cost, 6)}</span>
                      <span className="text-[#5C7064]">Rate {log.rate_multiplier || 1}x</span>
                      {!isImage(log) && <span className="text-[#5C7064]">I/O {money(log.input_cost, 6)} / {money(log.output_cost, 6)}</span>}
                    </div>
                  ),
                },
                {
                  key: 'latency',
                  label: 'Latency',
                  render: (log) => (
                    <div className="flex min-w-[110px] flex-col gap-1 text-xs">
                      <span><ClockIcon className="mr-1 inline h-3 w-3" />{duration(log.duration_ms)}</span>
                      <span className="text-[#5C7064]">first {log.first_token_ms == null ? '-' : duration(log.first_token_ms)}</span>
                    </div>
                  ),
                },
                {
                  key: 'ua',
                  label: 'User Agent',
                  mobilePriority: 'low',
                  render: (log) => <span className="block max-w-[240px] break-all text-xs text-[#5C7064]">{log.user_agent || '-'}</span>,
                },
              ]}
            />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <div className="text-sm text-[#5C7064]">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <Card className="shadow-none ring-1 ring-[#1D3025]/10 rounded-md">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#F1EEE4]">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-[#5C7064]">{label}</p>
          <p className="truncate text-xl font-semibold text-[#1D3025]">{value}</p>
          <p className="truncate text-xs text-[#5C7064]">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
