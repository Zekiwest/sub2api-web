'use client';

/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: API Key 管理页面，提供 CRUD 操作界面
 * 依赖关系: components/dashboard-layout.tsx, lib/keys.ts, stores/auth.ts, lib/i18n, shadcn Dialog
 * 变更同步:
 *   - Key 操作功能变化时，需更新本文件及 keys 翻译键
 *   - Dialog 结构变化时，需检查 shadcn 版本兼容性
 * 版本记录:
 *   - 2026-05-20: 添加移动端响应式表格（Card List Pattern）
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard-layout';
import { keysApi } from '@/lib/keys';
import { groupsApi } from '@/lib/groups';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';
import type { ApiKey, CreateApiKeyRequest, ApiKeyGroup } from '@/types';
import { format } from 'date-fns';
import { CopyIcon, EditIcon, TrashIcon, PlusIcon, ChevronDownIcon, FolderIcon } from 'lucide-react';

export default function KeysPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { translate } = useTranslation();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [groups, setGroups] = useState<ApiKeyGroup[]>([]);
  const [filterGroupId, setFilterGroupId] = useState<number | null>(null);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyQuota, setNewKeyQuota] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('');
  const [newKeyGroupId, setNewKeyGroupId] = useState<number | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editKeyName, setEditKeyName] = useState('');
  const [editKeyQuota, setEditKeyQuota] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      loadKeys();
      loadGroups();
    }
  }, [isAuthenticated, filterGroupId]);

  const loadGroups = async () => {
    try {
      const response = await groupsApi.list(1, 100);
      setGroups(response.items);
    } catch (error) {
      // Ignore errors for groups loading
    }
  };

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const filters = filterGroupId ? { group_id: filterGroupId } : undefined;
      const response = await keysApi.list(1, 100, filters);
      setKeys(response.items);
    } catch (error) {
      toast.error(translate('keys.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error(translate('keys.nameRequired'));
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreateApiKeyRequest = {
        name: newKeyName,
        quota: newKeyQuota ? parseFloat(newKeyQuota) : undefined,
        expires_in_days: newKeyExpiry ? parseInt(newKeyExpiry) : undefined,
        group_id: newKeyGroupId,
      };
      await keysApi.create(payload);
      toast.success(translate('keys.createSuccess'));
      setCreateDialogOpen(false);
      setNewKeyName('');
      setNewKeyQuota('');
      setNewKeyExpiry('');
      setNewKeyGroupId(undefined);
      loadKeys();
    } catch (error: any) {
      toast.error(error.message || translate('keys.createError'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedKey) return;

    setIsUpdating(true);
    try {
      await keysApi.update(selectedKey.id, {
        name: editKeyName,
        quota: editKeyQuota ? parseFloat(editKeyQuota) : undefined,
      });
      toast.success(translate('keys.updateSuccess'));
      setEditDialogOpen(false);
      loadKeys();
    } catch (error: any) {
      toast.error(error.message || translate('keys.updateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  const openDeleteDialog = (key: ApiKey) => {
    setKeyToDelete(key);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!keyToDelete) return;

    setIsDeleting(true);
    try {
      await keysApi.delete(keyToDelete.id);
      toast.success(translate('keys.deleteSuccess'));
      setDeleteDialogOpen(false);
      setKeyToDelete(null);
      loadKeys();
    } catch (error: any) {
      toast.error(error.message || translate('keys.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (key: ApiKey) => {
    const newStatus = key.status === 'active' ? 'inactive' : 'active';
    try {
      await keysApi.toggleStatus(key.id, newStatus);
      toast.success(translate(newStatus === 'active' ? 'keys.activated' : 'keys.deactivated'));
      loadKeys();
    } catch (error: any) {
      toast.error(error.message || translate('keys.toggleError'));
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(translate('keys.copySuccess'));
  };

  const openEditDialog = (key: ApiKey) => {
    setSelectedKey(key);
    setEditKeyName(key.name);
    setEditKeyQuota(key.quota?.toString() || '');
    setEditDialogOpen(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <Card className="shadow-none ring-1 ring-[#1D3025]/10 rounded-md">
        <CardHeader className="flex flex-row items-center justify-between px-4 gap-1">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-medium text-[#1D3025]">{translate('keys.title')}</CardTitle>
            <CardDescription className="text-sm text-[#5C7064]">{translate('keys.desc')}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Group Filter */}
            <div className="flex items-center gap-2">
              <select
                className="text-sm bg-[#FAFAFA] border border-[#D3DED8] rounded-sm px-3 py-1.5 text-[#1D3025]"
                value={filterGroupId || ''}
                onChange={(e) => setFilterGroupId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">All Groups</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {filterGroupId && (
                <Button variant="ghost" size="sm" onClick={() => setFilterGroupId(null)}>
                  Clear
                </Button>
              )}
            </div>
            <Button variant="success" onClick={() => setCreateDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              {translate('keys.createNew')}
            </Button>
          </div>
        </CardHeader>
        {isLoading ? (
          <CardContent className="flex justify-center p-20">
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardContent>
        ) : (
          <CardContent className="px-4">
            <ResponsiveTable
              data={keys}
              emptyMessage={translate('keys.noKeys')}
              isLoading={isLoading}
              loadingComponent={
                <div className="flex justify-center p-20">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              }
              cardTitle={(key) => (
                <div className="flex items-center gap-2">
                  <span>{key.name}</span>
                  <Badge variant={key.status === 'active' ? 'active' : 'inactive'}>
                    {translate(`keys.${key.status}`)}
                  </Badge>
                </div>
              )}
              cardActions={(key) => (
                <div className="flex gap-1 items-center">
                  <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEditDialog(key)}>
                    <EditIcon className="h-4 w-4 text-[#1D3025]" />
                  </Button>
                  <Switch
                    checked={key.status === 'active'}
                    onCheckedChange={() => handleToggleStatus(key)}
                  />
                  <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openDeleteDialog(key)}>
                    <TrashIcon className="h-4 w-4 text-[#BC1010]" />
                  </Button>
                </div>
              )}
              columns={[
                {
                  key: 'name',
                  label: translate('keys.name'),
                  render: (key) => key.name,
                },
                {
                  key: 'key',
                  label: translate('keys.key'),
                  mobileLabel: translate('keys.key'),
                  render: (key) => (
                    <div className="flex items-center gap-2">
                      <div className="max-w-[200px] rounded-sm px-2 py-1 bg-[#F1EEE4] overflow-hidden">
                        <code className="text-xs font-mono text-[#1D3025] truncate block">
                          {key.key.substring(0, 20)}...
                        </code>
                      </div>
                      <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => handleCopyKey(key.key)}>
                        <CopyIcon className="h-4 w-4 text-[#1D3025]" />
                      </Button>
                    </div>
                  ),
                },
                {
                  key: 'group',
                  label: translate('keys.group'),
                  mobileLabel: translate('keys.group'),
                  render: (key) => (
                    key.group_name ? (
                      <Badge variant="outline" className="bg-[#F1EEE4] text-[#1D3025] border-[#D3DED8] flex items-center gap-1">
                        <FolderIcon className="h-3 w-3" />
                        {key.group_name}
                      </Badge>
                    ) : (
                      <span className="text-[#5C7064] text-sm">-</span>
                    )
                  ),
                },
                {
                  key: 'status',
                  label: translate('keys.status'),
                  mobilePriority: 'low',
                  render: (key) => (
                    <Badge variant={key.status === 'active' ? 'active' : 'inactive'}>
                      {translate(`keys.${key.status}`)}
                    </Badge>
                  ),
                },
                {
                  key: 'quota',
                  label: translate('keys.quota'),
                  mobileLabel: translate('keys.quota'),
                  render: (key) => key.quota > 0 ? `$${key.quota.toFixed(2)}` : translate('keys.unlimited'),
                },
                {
                  key: 'used',
                  label: translate('keys.used'),
                  mobileLabel: translate('keys.used'),
                  render: (key) => `$${key.used_quota?.toFixed(2) || '0.00'}`,
                },
                {
                  key: 'expires',
                  label: translate('keys.expires'),
                  mobileLabel: translate('keys.expires'),
                  render: (key) => key.expires_at ? format(new Date(key.expires_at), 'yyyy-MM-dd') : translate('keys.never'),
                },
                {
                  key: 'created',
                  label: translate('keys.created'),
                  mobilePriority: 'low',
                  render: (key) => format(new Date(key.created_at), 'yyyy-MM-dd HH:mm'),
                },
                {
                  key: 'actions',
                  label: translate('keys.actions'),
                  mobilePriority: 'low',
                  render: (key) => (
                    <div className="flex gap-1 items-center">
                      <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEditDialog(key)}>
                        <EditIcon className="h-4 w-4 text-[#1D3025]" />
                      </Button>
                      <Switch
                        checked={key.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(key)}
                      />
                      <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openDeleteDialog(key)}>
                        <TrashIcon className="h-4 w-4 text-[#BC1010]" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate('keys.createTitle')}</DialogTitle>
            <DialogDescription>{translate('keys.createDesc')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{translate('keys.nameLabel')} *</label>
              <Input
                type="text"
                placeholder={translate('keys.namePlaceholder')}
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{translate('keys.groupLabel')}</label>
              <select
                className="text-sm bg-[#FAFAFA] border border-[#D3DED8] rounded-sm px-3 py-2 text-[#1D3025]"
                value={newKeyGroupId || ''}
                onChange={(e) => setNewKeyGroupId(e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">No Group</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{translate('keys.quotaLabel')}</label>
              <Input
                type="number"
                placeholder={translate('keys.quotaPlaceholder')}
                value={newKeyQuota}
                onChange={(e) => setNewKeyQuota(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{translate('keys.expiryLabel')}</label>
              <Input
                type="number"
                placeholder={translate('keys.expiryPlaceholder')}
                value={newKeyExpiry}
                onChange={(e) => setNewKeyExpiry(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {translate('keys.cancel')}
            </Button>
            <Button variant="success" disabled={isCreating} onClick={handleCreate}>
              {isCreating ? translate('keys.creating') : translate('keys.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate('keys.editTitle')}</DialogTitle>
            <DialogDescription>{translate('keys.editDesc')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{translate('keys.nameLabel')} *</label>
              <Input
                type="text"
                placeholder={translate('keys.namePlaceholder')}
                value={editKeyName}
                onChange={(e) => setEditKeyName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{translate('keys.quotaLabel')}</label>
              <Input
                type="number"
                placeholder={translate('keys.quotaPlaceholder')}
                value={editKeyQuota}
                onChange={(e) => setEditKeyQuota(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {translate('keys.cancel')}
            </Button>
            <Button variant="success" disabled={isUpdating} onClick={handleUpdate}>
              {isUpdating ? translate('keys.saving') : translate('keys.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate('keys.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {translate('keys.deleteDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {translate('keys.cancel')}
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? translate('keys.deleting') : translate('keys.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}