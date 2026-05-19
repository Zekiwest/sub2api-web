/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 邀请页面 - 用户邀请链接、邀请统计、邀请列表
 * 依赖关系: components/dashboard-layout, stores/auth, lib/i18n, ui/card
 * 变更同步:
 *   - 邀请相关字段变化时，需同步 types/index.ts
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { UserIcon, GiftIcon, LinkIcon, CopyIcon, CheckIcon, UsersIcon, DollarSignIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import type { InviteStats, Invitee } from '@/types';

// Mock data for development
const MOCK_INVITE_STATS: InviteStats = {
  invite_code: 'DEMO2026',
  invite_link: 'https://sub2api.com/register?invite=DEMO2026',
  total_invites: 12,
  active_invites: 8,
  total_rewards: 25.50,
  pending_rewards: 5.00,
  invitees: [
    { id: 1, username: 'UserA', email: 'usera@example.com', registered_at: '2026-05-10', status: 'active', rewards_generated: 5.00 },
    { id: 2, username: 'UserB', email: 'userb@example.com', registered_at: '2026-05-12', status: 'active', rewards_generated: 3.50 },
    { id: 3, username: 'UserC', email: 'userc@example.com', registered_at: '2026-05-14', status: 'inactive', rewards_generated: 2.00 },
  ],
};

export default function InvitePage() {
  const { user } = useAuthStore();
  const { translate } = useTranslation();
  const [inviteStats, setInviteStats] = useState<InviteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setInviteStats(MOCK_INVITE_STATS);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleCopyLink = () => {
    if (inviteStats?.invite_link) {
      navigator.clipboard.writeText(inviteStats.invite_link);
      setCopied(true);
      toast.success(translate('invite.linkCopied') || 'Invite link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (inviteStats?.invite_code) {
      navigator.clipboard.writeText(inviteStats.invite_code);
      toast.success(translate('invite.codeCopied') || 'Invite code copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282' }}>
            {translate('usage.loading') || 'Loading...'}
          </span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full">
        {/* Page Title */}
        <h1
          className="font-semibold"
          style={{
            fontSize: '24px',
            color: '#101828',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {translate('invite.title') || 'Invite Friends'}
        </h1>

        {/* Invite Link Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full w-10 h-10"
              style={{ backgroundColor: '#D4E6D8' }}
            >
              <LinkIcon className="h-5 w-5" style={{ color: '#1F5134' }} />
            </div>
            <div className="flex flex-col">
              <CardTitle style={{ fontFamily: 'var(--font-sans)', color: '#101828' }}>
                {translate('invite.yourLink') || 'Your Invite Link'}
              </CardTitle>
              <CardDescription style={{ fontFamily: 'var(--font-sans)', color: '#6A7282' }}>
                {translate('invite.shareDesc') || 'Share this link with friends to earn rewards'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={inviteStats?.invite_link || ''}
                readOnly
                className="flex-1"
                style={{ fontFamily: 'var(--font-sans)' }}
              />
              <Button onClick={handleCopyLink} className="flex items-center gap-2">
                {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                {copied ? (translate('invite.copied') || 'Copied') : (translate('invite.copy') || 'Copy')}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282', fontSize: '14px' }}>
                {translate('invite.inviteCode') || 'Invite Code'}:
              </span>
              <code
                className="px-2 py-1 rounded text-sm font-mono"
                style={{ backgroundColor: '#F3F4F6', color: '#1F5134' }}
              >
                {inviteStats?.invite_code || ''}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyCode}>
                <CopyIcon className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className="flex items-center justify-center rounded-full w-10 h-10"
                style={{ backgroundColor: '#F3F4F6' }}
              >
                <UsersIcon className="h-5 w-5" style={{ color: '#4A5565' }} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282', fontSize: '12px' }}>
                  {translate('invite.totalInvites') || 'Total Invites'}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', color: '#101828', fontSize: '24px', fontWeight: 600 }}>
                  {inviteStats?.total_invites || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className="flex items-center justify-center rounded-full w-10 h-10"
                style={{ backgroundColor: '#D4E6D8' }}
              >
                <UserIcon className="h-5 w-5" style={{ color: '#1F5134' }} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282', fontSize: '12px' }}>
                  {translate('invite.activeInvites') || 'Active'}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', color: '#1F5134', fontSize: '24px', fontWeight: 600 }}>
                  {inviteStats?.active_invites || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className="flex items-center justify-center rounded-full w-10 h-10"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <GiftIcon className="h-5 w-5" style={{ color: '#D97706' }} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282', fontSize: '12px' }}>
                  {translate('invite.totalRewards') || 'Total Rewards'}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', color: '#D97706', fontSize: '24px', fontWeight: 600 }}>
                  ${inviteStats?.total_rewards?.toFixed(2) || '0.00'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className="flex items-center justify-center rounded-full w-10 h-10"
                style={{ backgroundColor: '#DBEAFE' }}
              >
                <DollarSignIcon className="h-5 w-5" style={{ color: '#3B82F6' }} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282', fontSize: '12px' }}>
                  {translate('invite.pendingRewards') || 'Pending'}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', color: '#3B82F6', fontSize: '24px', fontWeight: 600 }}>
                  ${inviteStats?.pending_rewards?.toFixed(2) || '0.00'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invitees List */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-sans)', color: '#101828' }}>
              {translate('invite.invitees') || 'Invited Users'}
            </CardTitle>
            <CardDescription style={{ fontFamily: 'var(--font-sans)', color: '#6A7282' }}>
              {translate('invite.inviteesDesc') || 'Users who registered with your invite link'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inviteStats?.invitees?.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282' }}>
                  {translate('invite.noInvitees') || 'No invited users yet'}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {inviteStats?.invitees?.map((invitee) => (
                  <div
                    key={invitee.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: '#F9FAFB' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center rounded-full w-8 h-8"
                        style={{ backgroundColor: invitee.status === 'active' ? '#D4E6D8' : '#FEE2E2' }}
                      >
                        <span style={{ fontFamily: 'var(--font-sans)', color: invitee.status === 'active' ? '#1F5134' : '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                          {invitee.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span style={{ fontFamily: 'var(--font-sans)', color: '#101828', fontSize: '14px', fontWeight: 500 }}>
                          {invitee.username}
                        </span>
                        <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282', fontSize: '12px' }}>
                          {invitee.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: invitee.status === 'active' ? '#D4E6D8' : '#FEE2E2',
                          color: invitee.status === 'active' ? '#1F5134' : '#DC2626',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {invitee.status === 'active' ? (translate('keys.active') || 'Active') : (translate('keys.inactive') || 'Inactive')}
                      </span>
                      <div className="flex flex-col items-end">
                        <span style={{ fontFamily: 'var(--font-sans)', color: '#D97706', fontSize: '14px', fontWeight: 500 }}>
                          +${invitee.rewards_generated.toFixed(2)}
                        </span>
                        <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282', fontSize: '11px' }}>
                          {invitee.registered_at}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-sans)', color: '#101828' }}>
              {translate('invite.howItWorks') || 'How It Works'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className="flex items-center justify-center rounded-full w-8 h-8"
                  style={{ backgroundColor: '#D4E6D8' }}
                >
                  <span style={{ fontFamily: 'var(--font-sans)', color: '#1F5134', fontWeight: 600 }}>1</span>
                </div>
                <div className="flex flex-col">
                  <span style={{ fontFamily: 'var(--font-sans)', color: '#101828', fontSize: '14px', fontWeight: 500 }}>
                    {translate('invite.step1') || 'Share your invite link'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282', fontSize: '13px' }}>
                    {translate('invite.step1Desc') || 'Send your unique invite link to friends'}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-4">
                <div
                  className="flex items-center justify-center rounded-full w-8 h-8"
                  style={{ backgroundColor: '#D4E6D8' }}
                >
                  <span style={{ fontFamily: 'var(--font-sans)', color: '#1F5134', fontWeight: 600 }}>2</span>
                </div>
                <div className="flex flex-col">
                  <span style={{ fontFamily: 'var(--font-sans)', color: '#101828', fontSize: '14px', fontWeight: 500 }}>
                    {translate('invite.step2') || 'Friends register'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282', fontSize: '13px' }}>
                    {translate('invite.step2Desc') || 'They create an account using your link'}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-4">
                <div
                  className="flex items-center justify-center rounded-full w-8 h-8"
                  style={{ backgroundColor: '#D4E6D8' }}
                >
                  <span style={{ fontFamily: 'var(--font-sans)', color: '#1F5134', fontWeight: 600 }}>3</span>
                </div>
                <div className="flex flex-col">
                  <span style={{ fontFamily: 'var(--font-sans)', color: '#101828', fontSize: '14px', fontWeight: 500 }}>
                    {translate('invite.step3') || 'Earn rewards'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', color: '#6A7282', fontSize: '13px' }}>
                    {translate('invite.step3Desc') || 'Get $2.00 for each active invited user'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}