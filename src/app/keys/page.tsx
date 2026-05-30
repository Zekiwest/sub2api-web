'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  BanIcon,
  CheckCircleIcon,
  CopyIcon,
  EditIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldIcon,
  TrashIcon,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { groupsApi } from '@/lib/groups';
import { keysApi, type KeyFilters } from '@/lib/keys';
import { usageApi } from '@/lib/usage';
import { useAuthStore } from '@/stores/auth';
import type { ApiKey, ApiKeyGroup, BatchApiKeyUsageStats, CreateApiKeyRequest, UpdateApiKeyRequest } from '@/types';

type KeyFormState = {
  name: string;
  group_id: string;
  status: 'active' | 'inactive';
  use_custom_key: boolean;
  custom_key: string;
  enable_ip_restriction: boolean;
  ip_whitelist: string;
  ip_blacklist: string;
  enable_quota: boolean;
  quota: string;
  enable_rate_limit: boolean;
  rate_limit_5h: string;
  rate_limit_1d: string;
  rate_limit_7d: string;
  enable_expiration: boolean;
  expires_at: string;
};

const emptyForm: KeyFormState = {
  name: '',
  group_id: '',
  status: 'active',
  use_custom_key: false,
  custom_key: '',
  enable_ip_restriction: false,
  ip_whitelist: '',
  ip_blacklist: '',
  enable_quota: false,
  quota: '',
  enable_rate_limit: false,
  rate_limit_5h: '',
  rate_limit_1d: '',
  rate_limit_7d: '',
  enable_expiration: false,
  expires_at: '',
};

function parseList(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

function money(value: number | null | undefined, digits = 2): string {
  return `$${(value || 0).toFixed(digits)}`;
}

function statusVariant(status: ApiKey['status']) {
  return status === 'active' ? 'active' : status === 'inactive' ? 'inactive' : 'destructive';
}

function progressPercent(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.max(0, (used / limit) * 100));
}

export default function KeysPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [groups, setGroups] = useState<ApiKeyGroup[]>([]);
  const [usageStats, setUsageStats] = useState<Record<string, BatchApiKeyUsageStats>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [groupId, setGroupId] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<KeyFormState>(emptyForm);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadGroups();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadKeys();
  }, [isAuthenticated, page, pageSize, status, groupId, sortBy, sortOrder]);

  const filters: KeyFilters = {
    search: search.trim() || undefined,
    status: status || undefined,
    group_id: groupId || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  async function loadGroups() {
    try {
      const items = await groupsApi.getAvailable();
      setGroups(items);
    } catch {
      try {
        const response = await groupsApi.list(1, 100);
        setGroups(response.items);
      } catch {
        setGroups([]);
      }
    }
  }

  async function loadKeys() {
    setLoading(true);
    try {
      const response = await keysApi.list(page, pageSize, filters);
      setKeys(response.items);
      setTotalPages(response.pages || response.total_pages || 1);
      if (response.items.length > 0) {
        const stats = await usageApi.getDashboardApiKeysUsage(response.items.map((key) => key.id));
        setUsageStats(stats.stats);
      } else {
        setUsageStats({});
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    setPage(1);
    loadKeys();
  }

  function resetFilters() {
    setSearch('');
    setStatus('');
    setGroupId('');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  }

  function openCreate() {
    setSelectedKey(null);
    setForm(emptyForm);
    setDialogMode('create');
  }

  function openEdit(key: ApiKey) {
    setSelectedKey(key);
    setForm({
      name: key.name,
      group_id: key.group_id ? String(key.group_id) : '',
      status: key.status === 'active' ? 'active' : 'inactive',
      use_custom_key: false,
      custom_key: '',
      enable_ip_restriction: (key.ip_whitelist?.length || 0) > 0 || (key.ip_blacklist?.length || 0) > 0,
      ip_whitelist: (key.ip_whitelist || []).join('\n'),
      ip_blacklist: (key.ip_blacklist || []).join('\n'),
      enable_quota: key.quota > 0,
      quota: key.quota > 0 ? String(key.quota) : '',
      enable_rate_limit: key.rate_limit_5h > 0 || key.rate_limit_1d > 0 || key.rate_limit_7d > 0,
      rate_limit_5h: key.rate_limit_5h > 0 ? String(key.rate_limit_5h) : '',
      rate_limit_1d: key.rate_limit_1d > 0 ? String(key.rate_limit_1d) : '',
      rate_limit_7d: key.rate_limit_7d > 0 ? String(key.rate_limit_7d) : '',
      enable_expiration: !!key.expires_at,
      expires_at: toDateInput(key.expires_at),
    });
    setDialogMode('edit');
  }

  async function submitForm() {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (dialogMode === 'create' && form.use_custom_key) {
      if (form.custom_key.length < 16) {
        toast.error('Custom key must be at least 16 characters');
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(form.custom_key)) {
        toast.error('Custom key can only contain letters, numbers, underscores and hyphens');
        return;
      }
    }

    setSubmitting(true);
    try {
      const ipWhitelist = form.enable_ip_restriction ? parseList(form.ip_whitelist) : [];
      const ipBlacklist = form.enable_ip_restriction ? parseList(form.ip_blacklist) : [];
      const rateLimit = form.enable_rate_limit
        ? {
            rate_limit_5h: Number(form.rate_limit_5h) || 0,
            rate_limit_1d: Number(form.rate_limit_1d) || 0,
            rate_limit_7d: Number(form.rate_limit_7d) || 0,
          }
        : { rate_limit_5h: 0, rate_limit_1d: 0, rate_limit_7d: 0 };

      if (dialogMode === 'edit' && selectedKey) {
        const payload: UpdateApiKeyRequest = {
          name: form.name.trim(),
          group_id: form.group_id ? Number(form.group_id) : null,
          status: form.status,
          ip_whitelist: ipWhitelist,
          ip_blacklist: ipBlacklist,
          quota: form.enable_quota ? Number(form.quota) || 0 : 0,
          expires_at: form.enable_expiration && form.expires_at ? new Date(form.expires_at).toISOString() : null,
          ...rateLimit,
        };
        await keysApi.update(selectedKey.id, payload);
        toast.success('API key updated');
      } else {
        let expiresInDays: number | undefined;
        if (form.enable_expiration && form.expires_at) {
          expiresInDays = Math.max(1, Math.ceil((new Date(form.expires_at).getTime() - Date.now()) / 86400000));
        }
        const payload: CreateApiKeyRequest = {
          name: form.name.trim(),
          group_id: form.group_id ? Number(form.group_id) : null,
          custom_key: form.use_custom_key ? form.custom_key : undefined,
          ip_whitelist: ipWhitelist,
          ip_blacklist: ipBlacklist,
          quota: form.enable_quota ? Number(form.quota) || 0 : 0,
          expires_in_days: expiresInDays,
          ...rateLimit,
        };
        await keysApi.create(payload);
        toast.success('API key created');
      }
      setDialogMode(null);
      await loadKeys();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save API key');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(key: ApiKey) {
    try {
      await keysApi.toggleStatus(key.id, key.status === 'active' ? 'inactive' : 'active');
      await loadKeys();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update status');
    }
  }

  async function resetQuota(key: ApiKey) {
    try {
      await keysApi.update(key.id, { reset_quota: true });
      toast.success('Quota usage reset');
      await loadKeys();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reset quota');
    }
  }

  async function resetRateLimit(key: ApiKey) {
    try {
      await keysApi.update(key.id, { reset_rate_limit_usage: true });
      toast.success('Rate limit usage reset');
      await loadKeys();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reset rate limit usage');
    }
  }

  async function confirmDelete() {
    if (!deleteKey) return;
    setSubmitting(true);
    try {
      await keysApi.delete(deleteKey.id);
      toast.success('API key deleted');
      setDeleteKey(null);
      await loadKeys();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete API key');
    } finally {
      setSubmitting(false);
    }
  }

  function copyKey(value: string) {
    navigator.clipboard.writeText(value);
    toast.success('Key copied');
  }

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <Card className="shadow-none ring-1 ring-[#1D3025]/10 rounded-md">
        <CardHeader className="px-4 gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base font-medium text-[#1D3025]">API Keys</CardTitle>
              <CardDescription className="text-sm text-[#5C7064]">
                Create keys, bind groups, control IP restrictions, quota, expiry and rolling spend limits.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={loadKeys} disabled={loading}>
                <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="success" onClick={openCreate}>
                <PlusIcon className="h-4 w-4" />
                Create Key
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(180px,1fr)_160px_180px_140px_120px_auto]">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-[#5C7064]" />
              <Input className="pl-8" placeholder="Search name or key" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applyFilters()} />
            </div>
            <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm text-[#1D3025]" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="quota_exhausted">Quota exhausted</option>
              <option value="expired">Expired</option>
            </select>
            <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm text-[#1D3025]" value={groupId} onChange={(event) => { setGroupId(event.target.value); setPage(1); }}>
              <option value="">All groups</option>
              <option value="0">No group</option>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select>
            <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm text-[#1D3025]" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="created_at">Created</option>
              <option value="name">Name</option>
              <option value="last_used_at">Last used</option>
              <option value="quota_used">Quota used</option>
            </select>
            <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm text-[#1D3025]" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}>
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
            data={keys}
            emptyMessage="No API keys found."
            isLoading={loading}
            loadingComponent={<div className="flex justify-center p-20"><Skeleton className="h-8 w-8 rounded-full" /></div>}
            cardTitle={(key) => (
                  <span>{key.name}</span>
            )}
            cardActions={(key) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(key)}><EditIcon className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteKey(key)}><TrashIcon className="h-4 w-4 text-[#BC1010]" /></Button>
              </div>
            )}
            columns={[
              {
                key: 'name',
                label: '名称',
                render: (key) => (
                  <div className="min-w-[120px]">
                    <span className="font-medium">{key.name}</span>
                  </div>
                ),
              },
              {
                key: 'key',
                label: 'API 密钥',
                render: (key) => (
                  <div className="flex items-center gap-2 min-w-[210px]">
                    <code className="block max-w-[170px] truncate rounded-sm bg-[#F1EEE4] px-2 py-1 text-xs">{key.key.slice(0, 24)}...</code>
                    <Button variant="ghost" size="icon-sm" onClick={() => copyKey(key.key)}><CopyIcon className="h-4 w-4" /></Button>
                  </div>
                ),
              },
              {
                key: 'group',
                label: '分组',
                render: (key) => {
                  return (
                    <select
                      className="h-8 min-w-[140px] rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-2 text-sm text-[#1D3025]"
                      value={key.group_id ?? ''}
                      onChange={async (event) => {
                        await keysApi.update(key.id, {
                          group_id: event.target.value ? Number(event.target.value) : null,
                        });
                        await loadKeys();
                      }}
                    >
                      <option value="">无分组</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  );
                },
              },
              {
                key: 'usage',
                label: '用量',
                render: (key) => {
                  const stats = usageStats[String(key.id)];
                  return (
                    <div className="flex flex-col gap-1 min-w-[150px]">
                      <span className="text-xs text-[#5C7064]">Today: <b className="text-[#1D3025]">{money(stats?.today_actual_cost, 4)}</b></span>
                      <span className="text-xs text-[#5C7064]">Total: <b className="text-[#1D3025]">{money(stats?.total_actual_cost ?? key.quota_used, 4)}</b></span>
                      {key.quota > 0 && (
                        <div className="mt-1">
                          <div className="mb-1 flex justify-between text-xs"><span>Quota</span><span>{money(key.quota_used)} / {money(key.quota)}</span></div>
                          <div className="h-1.5 rounded-full bg-[#D3DED8]"><div className="h-1.5 rounded-full bg-[#1F5134]" style={{ width: `${progressPercent(key.quota_used, key.quota)}%` }} /></div>
                        </div>
                      )}
                    </div>
                  );
                },
              },
              {
                key: 'expires',
                label: '过期时间',
                render: (key) => key.expires_at ? format(new Date(key.expires_at), 'yyyy-MM-dd') : 'Never',
              },
              {
                key: 'status',
                label: '状态',
                render: (key) => <Badge variant={statusVariant(key.status)}>{key.status}</Badge>,
              },
              {
                key: 'last_used',
                label: '上次使用时间',
                render: (key) => key.last_used_at ? format(new Date(key.last_used_at), 'yyyy-MM-dd HH:mm') : '-',
              },
              {
                key: 'created',
                label: '创建时间',
                render: (key) => format(new Date(key.created_at), 'yyyy-MM-dd HH:mm'),
              },
              {
                key: 'actions',
                label: '操作',
                mobilePriority: 'low',
                render: (key) => (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" title={key.status === 'active' ? 'Disable' : 'Enable'} onClick={() => toggleStatus(key)}>
                      {key.status === 'active' ? <BanIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon-sm" title="Edit" onClick={() => openEdit(key)}><EditIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm" title="Reset quota" onClick={() => resetQuota(key)}><RefreshCwIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm" title="Reset limits" onClick={() => resetRateLimit(key)}><ShieldIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon-sm" title="Delete" onClick={() => setDeleteKey(key)}><TrashIcon className="h-4 w-4 text-[#BC1010]" /></Button>
                  </div>
                ),
              },
            ]}
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <div className="text-sm text-[#5C7064]">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'edit' ? 'Edit API Key' : 'Create API Key'}</DialogTitle>
            <DialogDescription>Fields match the Sub2API backend key model.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Group</Label>
              <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm" value={form.group_id} onChange={(event) => setForm({ ...form, group_id: event.target.value })}>
                <option value="">No group</option>
                {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
            </div>
            {dialogMode === 'edit' && (
              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <select className="h-8 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as 'active' | 'inactive' })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
            {dialogMode === 'create' && (
              <div className="flex items-center justify-between gap-3 rounded-sm border border-[#D3DED8] p-3">
                <Label>Custom key</Label>
                <Switch checked={form.use_custom_key} onCheckedChange={(checked) => setForm({ ...form, use_custom_key: checked })} />
              </div>
            )}
            {dialogMode === 'create' && form.use_custom_key && (
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label>Custom key value</Label>
                <Input value={form.custom_key} onChange={(event) => setForm({ ...form, custom_key: event.target.value })} />
              </div>
            )}
            <div className="flex items-center justify-between gap-3 rounded-sm border border-[#D3DED8] p-3">
              <Label>IP restriction</Label>
              <Switch checked={form.enable_ip_restriction} onCheckedChange={(checked) => setForm({ ...form, enable_ip_restriction: checked })} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-sm border border-[#D3DED8] p-3">
              <Label>Quota</Label>
              <Switch checked={form.enable_quota} onCheckedChange={(checked) => setForm({ ...form, enable_quota: checked })} />
            </div>
            {form.enable_ip_restriction && (
              <>
                <div className="flex flex-col gap-2">
                  <Label>IP whitelist</Label>
                  <textarea className="min-h-24 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] p-2 text-sm" value={form.ip_whitelist} onChange={(event) => setForm({ ...form, ip_whitelist: event.target.value })} placeholder="One IP/CIDR per line" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>IP blacklist</Label>
                  <textarea className="min-h-24 rounded-sm border border-[#D3DED8] bg-[#FAFAFA] p-2 text-sm" value={form.ip_blacklist} onChange={(event) => setForm({ ...form, ip_blacklist: event.target.value })} placeholder="One IP/CIDR per line" />
                </div>
              </>
            )}
            {form.enable_quota && (
              <div className="flex flex-col gap-2">
                <Label>Quota USD</Label>
                <Input type="number" min="0" step="0.01" value={form.quota} onChange={(event) => setForm({ ...form, quota: event.target.value })} />
              </div>
            )}
            <div className="flex items-center justify-between gap-3 rounded-sm border border-[#D3DED8] p-3">
              <Label>Rolling spend limits</Label>
              <Switch checked={form.enable_rate_limit} onCheckedChange={(checked) => setForm({ ...form, enable_rate_limit: checked })} />
            </div>
            {form.enable_rate_limit && (
              <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-3">
                <div className="flex flex-col gap-2"><Label>5h USD</Label><Input type="number" min="0" step="0.01" value={form.rate_limit_5h} onChange={(event) => setForm({ ...form, rate_limit_5h: event.target.value })} /></div>
                <div className="flex flex-col gap-2"><Label>1d USD</Label><Input type="number" min="0" step="0.01" value={form.rate_limit_1d} onChange={(event) => setForm({ ...form, rate_limit_1d: event.target.value })} /></div>
                <div className="flex flex-col gap-2"><Label>7d USD</Label><Input type="number" min="0" step="0.01" value={form.rate_limit_7d} onChange={(event) => setForm({ ...form, rate_limit_7d: event.target.value })} /></div>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 rounded-sm border border-[#D3DED8] p-3">
              <Label>Expiration</Label>
              <Switch checked={form.enable_expiration} onCheckedChange={(checked) => setForm({ ...form, enable_expiration: checked })} />
            </div>
            {form.enable_expiration && (
              <div className="flex flex-col gap-2">
                <Label>Expires at</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={(event) => setForm({ ...form, expires_at: event.target.value })} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button variant="success" disabled={submitting} onClick={submitForm}>{submitting ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteKey} onOpenChange={(open) => !open && setDeleteKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>This removes the selected key permanently.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteKey(null)}>Cancel</Button>
            <Button variant="destructive" disabled={submitting} onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
