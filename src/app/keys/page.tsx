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
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard-layout';
import { keysApi } from '@/lib/keys';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';
import type { ApiKey, CreateApiKeyRequest } from '@/types';
import { format } from 'date-fns';
import { CopyIcon, EditIcon, TrashIcon, PlusIcon } from 'lucide-react';

export default function KeysPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { translate } = useTranslation();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyQuota, setNewKeyQuota] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('');
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
    }
  }, [isAuthenticated]);

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const response = await keysApi.list(1, 100);
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
      };
      await keysApi.create(payload);
      toast.success(translate('keys.createSuccess'));
      setCreateDialogOpen(false);
      setNewKeyName('');
      setNewKeyQuota('');
      setNewKeyExpiry('');
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
          <div>
            <CardTitle className="text-base font-medium text-[#1D3025]">{translate('keys.title')}</CardTitle>
            <CardDescription className="text-sm text-[#5C7064]">{translate('keys.desc')}</CardDescription>
          </div>
          <Button variant="success" onClick={() => setCreateDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {translate('keys.createNew')}
          </Button>
        </CardHeader>
        {isLoading ? (
          <CardContent className="flex justify-center p-20">
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardContent>
        ) : keys.length === 0 ? (
          <CardContent className="text-center text-muted-foreground p-10">
            {translate('keys.noKeys')}
          </CardContent>
        ) : (
          <CardContent className="px-4">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#D3DED8]">
                  <TableHead className="h-10 px-2 text-sm font-medium text-[#1D3025]">{translate('keys.name')}</TableHead>
                  <TableHead className="h-10 px-2 text-sm font-medium text-[#1D3025]">{translate('keys.key')}</TableHead>
                  <TableHead className="h-10 px-2 text-sm font-medium text-[#1D3025]">{translate('keys.status')}</TableHead>
                  <TableHead className="h-10 px-2 text-sm font-medium text-[#1D3025]">{translate('keys.quota')}</TableHead>
                  <TableHead className="h-10 px-2 text-sm font-medium text-[#1D3025]">{translate('keys.used')}</TableHead>
                  <TableHead className="h-10 px-2 text-sm font-medium text-[#1D3025]">{translate('keys.expires')}</TableHead>
                  <TableHead className="h-10 px-2 text-sm font-medium text-[#1D3025]">{translate('keys.created')}</TableHead>
                  <TableHead className="h-10 px-2 text-sm font-medium text-[#1D3025]">{translate('keys.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key, index) => (
                  <TableRow key={key.id} className={index === keys.length - 1 ? 'border-0' : 'border-b border-[#D3DED8]'}>
                    <TableCell className="p-2 text-sm font-medium text-[#1D3025]">{key.name}</TableCell>
                    <TableCell className="p-2">
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
                    </TableCell>
                    <TableCell className="p-2">
                      <Badge variant={key.status === 'active' ? 'active' : 'inactive'}>
                        {translate(`keys.${key.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-2 text-sm text-[#1D3025]">{key.quota > 0 ? `$${key.quota.toFixed(2)}` : translate('keys.unlimited')}</TableCell>
                    <TableCell className="p-2 text-sm text-[#1D3025]">{`$${key.used_quota?.toFixed(2) || '0.00'}`}</TableCell>
                    <TableCell className="p-2 text-sm text-[#1D3025]">{key.expires_at ? format(new Date(key.expires_at), 'yyyy-MM-dd') : translate('keys.never')}</TableCell>
                    <TableCell className="p-2 text-sm text-[#1D3025]">{format(new Date(key.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                    <TableCell className="p-2">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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