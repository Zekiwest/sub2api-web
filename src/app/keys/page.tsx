'use client';

/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: API Key 管理页面，提供 CRUD 操作界面
 * 依赖关系: components/dashboard-layout.tsx, lib/keys.ts, stores/auth.ts, shadcn Dialog
 * 变更同步:
 *   - Key 操作功能变化时，需更新本文件
 *   - Dialog 结构变化时，需检查 shadcn 版本兼容性
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import toast from 'react-hot-toast';
import type { ApiKey, CreateApiKeyRequest } from '@/types';
import { format } from 'date-fns';
import { CopyIcon, EditIcon, TrashIcon, PlusIcon } from 'lucide-react';

export default function KeysPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
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
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name');
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
      toast.success('API key created successfully');
      setCreateDialogOpen(false);
      setNewKeyName('');
      setNewKeyQuota('');
      setNewKeyExpiry('');
      loadKeys();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create key');
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
      toast.success('API key updated successfully');
      setEditDialogOpen(false);
      loadKeys();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update key');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (key: ApiKey) => {
    if (!confirm('Are you sure you want to delete this key?')) return;

    try {
      await keysApi.delete(key.id);
      toast.success('API key deleted');
      loadKeys();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete key');
    }
  };

  const handleToggleStatus = async (key: ApiKey) => {
    const newStatus = key.status === 'active' ? 'inactive' : 'active';
    try {
      await keysApi.toggleStatus(key.id, newStatus);
      toast.success(`Key ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadKeys();
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle status');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Key copied to clipboard');
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage your API keys</CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Key
          </Button>
        </CardHeader>
        {isLoading ? (
          <CardContent className="flex justify-center p-20">
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardContent>
        ) : keys.length === 0 ? (
          <CardContent className="text-center text-muted-foreground p-10">
            No API keys found. Create one to get started.
          </CardContent>
        ) : (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quota</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                          {key.key.substring(0, 20)}...
                        </code>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleCopyKey(key.key)}>
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                        {key.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{key.quota > 0 ? `$${key.quota.toFixed(2)}` : 'Unlimited'}</TableCell>
                    <TableCell>{`$${key.used_quota?.toFixed(2) || '0.00'}`}</TableCell>
                    <TableCell>{key.expires_at ? format(new Date(key.expires_at), 'yyyy-MM-dd') : 'Never'}</TableCell>
                    <TableCell>{format(new Date(key.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(key)}>
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleToggleStatus(key)}>
                          {key.status === 'active' ? 'Disable' : 'Enable'}
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => handleDelete(key)}>
                          <TrashIcon className="h-4 w-4" />
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
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>Enter the details for your new API key</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                type="text"
                placeholder="Enter key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Quota (USD)</label>
              <Input
                type="number"
                placeholder="0 = unlimited"
                value={newKeyQuota}
                onChange={(e) => setNewKeyQuota(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Expires in (days)</label>
              <Input
                type="number"
                placeholder="Leave empty for no expiry"
                value={newKeyExpiry}
                onChange={(e) => setNewKeyExpiry(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isCreating} onClick={handleCreate}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>Update the API key settings</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                type="text"
                placeholder="Enter key name"
                value={editKeyName}
                onChange={(e) => setEditKeyName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Quota (USD)</label>
              <Input
                type="number"
                placeholder="0 = unlimited"
                value={editKeyQuota}
                onChange={(e) => setEditKeyQuota(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isUpdating} onClick={handleUpdate}>
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}