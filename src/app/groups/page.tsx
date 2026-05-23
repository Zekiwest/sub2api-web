'use client';

/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: API Key 分组管理页面，提供 CRUD 操作界面
 * 依赖关系: components/dashboard-layout.tsx, lib/groups.ts, stores/auth.ts, lib/i18n
 * 变更同步:
 *   - Group 操作功能变化时，需更新本文件及 groups 翻译键
 *   - Dialog 结构变化时，需检查 shadcn 版本兼容性
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { groupsApi } from '@/lib/groups';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';
import type { ApiKeyGroup, CreateGroupRequest } from '@/types';
import { format } from 'date-fns';
import { EditIcon, TrashIcon, PlusIcon, FolderIcon } from 'lucide-react';

export default function GroupsPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { translate } = useTranslation();
  const [groups, setGroups] = useState<ApiKeyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<ApiKeyGroup | null>(null);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ApiKeyGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      loadGroups();
    }
  }, [isAuthenticated]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const response = await groupsApi.list(1, 100);
      setGroups(response.items);
    } catch (error) {
      toast.error(translate('groups.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newGroupName.trim()) {
      toast.error(translate('groups.nameRequired'));
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreateGroupRequest = {
        name: newGroupName,
        description: newGroupDesc || undefined,
      };
      await groupsApi.create(payload);
      toast.success(translate('groups.createSuccess'));
      setCreateDialogOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      loadGroups();
    } catch (error: any) {
      toast.error(error.message || translate('groups.createError'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedGroup) return;

    setIsUpdating(true);
    try {
      await groupsApi.update(selectedGroup.id, {
        name: editGroupName,
        description: editGroupDesc || undefined,
      });
      toast.success(translate('groups.updateSuccess'));
      setEditDialogOpen(false);
      loadGroups();
    } catch (error: any) {
      toast.error(error.message || translate('groups.updateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  const openDeleteDialog = (group: ApiKeyGroup) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!groupToDelete) return;

    setIsDeleting(true);
    try {
      await groupsApi.delete(groupToDelete.id);
      toast.success(translate('groups.deleteSuccess'));
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
      loadGroups();
    } catch (error: any) {
      toast.error(error.message || translate('groups.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (group: ApiKeyGroup) => {
    setSelectedGroup(group);
    setEditGroupName(group.name);
    setEditGroupDesc(group.description || '');
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
            <CardTitle className="text-base font-medium text-[#1D3025]">{translate('groups.title')}</CardTitle>
            <CardDescription className="text-sm text-[#5C7064]">{translate('groups.desc')}</CardDescription>
          </div>
          <Button variant="success" onClick={() => setCreateDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {translate('groups.createNew')}
          </Button>
        </CardHeader>
        {isLoading ? (
          <CardContent className="flex justify-center p-20">
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardContent>
        ) : (
          <CardContent className="px-4">
            <ResponsiveTable
              data={groups}
              emptyMessage={translate('groups.noGroups')}
              isLoading={isLoading}
              loadingComponent={
                <div className="flex justify-center p-20">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              }
              cardTitle={(group) => (
                <div className="flex items-center gap-2">
                  <FolderIcon className="h-4 w-4 text-[#5C7064]" />
                  <span>{group.name}</span>
                </div>
              )}
              cardActions={(group) => (
                <div className="flex gap-1 items-center">
                  <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEditDialog(group)}>
                    <EditIcon className="h-4 w-4 text-[#1D3025]" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openDeleteDialog(group)}>
                    <TrashIcon className="h-4 w-4 text-[#BC1010]" />
                  </Button>
                </div>
              )}
              columns={[
                {
                  key: 'name',
                  label: translate('groups.name'),
                  render: (group) => (
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-4 w-4 text-[#5C7064]" />
                      <span className="font-medium">{group.name}</span>
                    </div>
                  ),
                },
                {
                  key: 'description',
                  label: translate('groups.description'),
                  mobilePriority: 'medium',
                  render: (group) => (
                    <span className="text-[#5C7064] text-sm">{group.description || '-'}</span>
                  ),
                },
                {
                  key: 'keyCount',
                  label: translate('groups.keyCount'),
                  mobileLabel: translate('groups.keyCount'),
                  render: (group) => (
                    <Badge variant="outline" className="bg-[#F1EEE4] text-[#1D3025] border-[#D3DED8]">
                      {group.key_count || 0}
                    </Badge>
                  ),
                },
                {
                  key: 'created',
                  label: translate('groups.created'),
                  mobilePriority: 'low',
                  render: (group) => format(new Date(group.created_at), 'yyyy-MM-dd HH:mm'),
                },
                {
                  key: 'actions',
                  label: translate('groups.actions'),
                  mobilePriority: 'low',
                  render: (group) => (
                    <div className="flex gap-1 items-center">
                      <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openEditDialog(group)}>
                        <EditIcon className="h-4 w-4 text-[#1D3025]" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="size-7" onClick={() => openDeleteDialog(group)}>
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
            <DialogTitle>{translate('groups.createTitle')}</DialogTitle>
            <DialogDescription>{translate('groups.createDesc')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{translate('groups.nameLabel')} *</label>
              <Input
                type="text"
                placeholder={translate('groups.namePlaceholder')}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{translate('groups.descLabel')}</label>
              <Input
                type="text"
                placeholder={translate('groups.descPlaceholder')}
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {translate('groups.cancel')}
            </Button>
            <Button variant="success" disabled={isCreating} onClick={handleCreate}>
              {isCreating ? translate('groups.creating') : translate('groups.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate('groups.editTitle')}</DialogTitle>
            <DialogDescription>{translate('groups.editDesc')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{translate('groups.nameLabel')} *</label>
              <Input
                type="text"
                placeholder={translate('groups.namePlaceholder')}
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{translate('groups.descLabel')}</label>
              <Input
                type="text"
                placeholder={translate('groups.descPlaceholder')}
                value={editGroupDesc}
                onChange={(e) => setEditGroupDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {translate('groups.cancel')}
            </Button>
            <Button variant="success" disabled={isUpdating} onClick={handleUpdate}>
              {isUpdating ? translate('groups.saving') : translate('groups.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate('groups.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {translate('groups.deleteDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {translate('groups.cancel')}
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? translate('groups.deleting') : translate('groups.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}