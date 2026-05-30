'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { BoltIcon, CheckCircleIcon, CreditCardIcon, GiftIcon, InfoIcon, RefreshCwIcon, TicketIcon } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { Skeleton } from '@/components/ui/skeleton';
import { authApi } from '@/lib/auth';
import { redeemApi } from '@/lib/redeem';
import { useAuthStore } from '@/stores/auth';
import type { RedeemHistoryItem, RedeemResult } from '@/types';

function isBalance(type: string): boolean {
  return type === 'balance' || type === 'admin_balance';
}

function isSubscription(type: string): boolean {
  return type === 'subscription';
}

function historyTitle(item: RedeemHistoryItem): string {
  if (item.type === 'balance') return 'Balance redeemed';
  if (item.type === 'admin_balance') return item.value >= 0 ? 'Balance adjustment' : 'Balance deduction';
  if (item.type === 'concurrency') return 'Concurrency redeemed';
  if (item.type === 'admin_concurrency') return item.value >= 0 ? 'Concurrency adjustment' : 'Concurrency reduction';
  if (item.type === 'subscription') return 'Subscription assigned';
  return item.type;
}

function historyValue(item: RedeemHistoryItem): string {
  const sign = item.value >= 0 ? '+' : '';
  if (isBalance(item.type)) return `${sign}$${item.value.toFixed(2)}`;
  if (isSubscription(item.type)) {
    const days = item.validity_days || Math.round(item.value);
    return `${days} days${item.group?.name ? ` · ${item.group.name}` : ''}`;
  }
  return `${sign}${item.value} requests`;
}

export default function RedeemPage() {
  const { user, isAuthenticated, checkAuth, refreshUser } = useAuthStore();
  const [code, setCode] = useState('');
  const [history, setHistory] = useState<RedeemHistoryItem[]>([]);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [contactInfo, setContactInfo] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadHistory();
    authApi.getPublicSettings().then((settings) => setContactInfo(settings.contact_info || '')).catch(() => {});
  }, [isAuthenticated]);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      setHistory(await redeemApi.getHistory());
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleRedeem() {
    if (!code.trim()) {
      toast.error('Enter a redeem code');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const response = await redeemApi.redeem(code.trim());
      setResult(response);
      setCode('');
      await Promise.all([refreshUser(), loadHistory()]);
      toast.success('Code redeemed');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to redeem code');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Card className="overflow-hidden rounded-md shadow-none ring-1 ring-[#1D3025]/10">
          <div className="bg-[#1F5134] px-6 py-8 text-center text-[#FCF7E8]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-white/15">
              <CreditCardIcon className="h-7 w-7" />
            </div>
            <p className="text-sm text-[#F2ECD9]">Current Balance</p>
            <p className="mt-2 text-4xl font-semibold">${user?.balance?.toFixed(2) || '0.00'}</p>
            <p className="mt-2 text-sm text-[#F2ECD9]">Concurrency: {user?.concurrency || 0} requests</p>
          </div>
        </Card>

        <Card className="rounded-md shadow-none ring-1 ring-[#1D3025]/10">
          <CardHeader>
            <CardTitle className="text-base text-[#1D3025]">Redeem Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <GiftIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#5C7064]" />
                <Input className="h-10 pl-9 text-base" value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleRedeem()} placeholder="Enter balance, concurrency or subscription code" disabled={submitting} />
              </div>
              <Button className="h-10" variant="success" disabled={!code.trim() || submitting} onClick={handleRedeem}>
                {submitting ? <RefreshCwIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                {submitting ? 'Redeeming' : 'Redeem'}
              </Button>
            </div>
            {result && (
              <div className="rounded-md border border-[#1F5134]/20 bg-[#1F5134]/5 p-4 text-sm text-[#1D3025]">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 text-[#1F5134]" />
                  <div>
                    <p className="font-medium">{result.message}</p>
                    {result.type === 'balance' && <p>Added: ${result.value.toFixed(2)}</p>}
                    {result.type === 'concurrency' && <p>Added: {result.value} concurrent requests</p>}
                    {result.type === 'subscription' && <p>Subscription: {result.group_name || 'assigned'} {result.validity_days ? `· ${result.validity_days} days` : ''}</p>}
                    {result.new_balance !== undefined && <p>New balance: ${result.new_balance.toFixed(2)}</p>}
                    {result.new_concurrency !== undefined && <p>New concurrency: {result.new_concurrency}</p>}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-md border-[#D3DED8] bg-[#F1EEE4]/50 shadow-none">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-[#1D3025]">
            <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1F5134]" />
            <div>
              <p className="font-medium">Code rules</p>
              <p className="mt-1 text-[#5C7064]">Codes are single-use and may add balance, concurrency, or subscription access. Expired or disabled codes cannot be redeemed.</p>
              {contactInfo && <Badge variant="outline" className="mt-2">{contactInfo}</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md shadow-none ring-1 ring-[#1D3025]/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-[#1D3025]">Recent Activity</CardTitle>
            <Button variant="outline" onClick={loadHistory} disabled={loadingHistory}><RefreshCwIcon className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />Refresh</Button>
          </CardHeader>
          <CardContent>
            <ResponsiveTable
              data={history}
              emptyMessage="Redeem history will appear here."
              isLoading={loadingHistory}
              loadingComponent={<div className="flex justify-center p-10"><Skeleton className="h-8 w-8 rounded-full" /></div>}
              cardTitle={(item) => (
                <div className="flex items-center gap-2">
                  {isBalance(item.type) ? <CreditCardIcon className="h-4 w-4" /> : isSubscription(item.type) ? <TicketIcon className="h-4 w-4" /> : <BoltIcon className="h-4 w-4" />}
                  <span>{historyTitle(item)}</span>
                </div>
              )}
              columns={[
                {
                  key: 'type',
                  label: 'Type',
                  render: (item) => (
                    <div className="flex items-center gap-2">
                      <Badge variant={isBalance(item.type) ? 'active' : isSubscription(item.type) ? 'outline' : 'default'}>{item.type}</Badge>
                      <span>{historyTitle(item)}</span>
                    </div>
                  ),
                },
                {
                  key: 'value',
                  label: 'Value',
                  render: (item) => <span className="font-medium text-[#1D3025]">{historyValue(item)}</span>,
                },
                {
                  key: 'code',
                  label: 'Code',
                  render: (item) => item.type.startsWith('admin_') ? <span className="text-[#5C7064]">Admin adjustment</span> : <code className="rounded-sm bg-[#F1EEE4] px-2 py-1 text-xs">{item.code.slice(0, 10)}...</code>,
                },
                {
                  key: 'used',
                  label: 'Used At',
                  render: (item) => item.used_at ? format(new Date(item.used_at), 'yyyy-MM-dd HH:mm:ss') : '-',
                },
                {
                  key: 'notes',
                  label: 'Notes',
                  mobilePriority: 'low',
                  render: (item) => <span className="block max-w-[240px] truncate text-[#5C7064]">{item.notes || '-'}</span>,
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
