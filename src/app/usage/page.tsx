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
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { DashboardLayout } from '@/components/dashboard-layout';
import { usageApi } from '@/lib/usage';
import { keysApi } from '@/lib/keys';
import { useAuthStore } from '@/stores/auth';
import type { UsageLog, ApiKey, PaginatedResponse } from '@/types';
import { format } from 'date-fns';

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
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Usage Logs</CardTitle>
          <CardDescription>View your API usage logs</CardDescription>
        </CardHeader>

        {/* Filters */}
        <Separator />
        <CardContent className="flex flex-row gap-4 items-center p-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">API Key</label>
            <select
              className="border rounded-sm px-3 py-2 bg-background text-sm"
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
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedKeyId(null);
              setPage(1);
            }}
          >
            Clear Filter
          </Button>
        </CardContent>

        <Separator />

        {isLoading ? (
          <CardContent className="flex justify-center p-20">
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardContent>
        ) : !logs || logs.items.length === 0 ? (
          <CardContent className="text-center text-muted-foreground p-10">
            No usage logs found.
          </CardContent>
        ) : (
          <>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Input</TableHead>
                    <TableHead>Output</TableHead>
                    <TableHead>Cache</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.items.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                      <TableCell className="text-sm">{log.api_key_name || `Key #${log.api_key_id}`}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.model}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.request_type}</TableCell>
                      <TableCell className="text-sm">{log.input_tokens?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="text-sm">{log.output_tokens?.toLocaleString() || '0'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <span>Create: {log.cache_creation_tokens || 0}</span>
                          <span>Read: {log.cache_read_tokens || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{`$${log.actual_cost?.toFixed(4) || '0.0000'}`}</TableCell>
                      <TableCell className="text-sm">{`${log.duration_ms || 0}ms`}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>

            <CardContent className="flex justify-center gap-4 p-4">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {logs?.total_pages || 1}
              </span>
              <Button
                variant="outline"
                disabled={page >= (logs?.total_pages || 1)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}