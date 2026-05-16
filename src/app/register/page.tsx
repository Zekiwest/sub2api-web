/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 注册页面
 * 依赖关系: lib/i18n, lib/auth, stores/auth, ui/card, ui/button
 * 变更同步:
 *   - 表单字段变化时，需同步 auth 翻译键
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';
import type { PublicSettings } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { translate } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    authApi.getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.register({
        username,
        email,
        password,
        invitation_code: invitationCode || undefined,
        promo_code: promoCode || undefined,
      });
      setUser(response.user);
      toast.success(translate('auth.registerSuccess'));
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || translate('auth.registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-accent/20 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col gap-1 p-6">
          <CardTitle className="text-2xl font-bold">{translate('auth.registerTitle')}</CardTitle>
          <CardDescription>{translate('auth.registerDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">{translate('auth.username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder={translate('auth.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{translate('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={translate('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{translate('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={translate('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {settings?.invitation_required && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="invitation">Invitation Code</Label>
                <Input
                  id="invitation"
                  type="text"
                  placeholder="Enter invitation code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="promo">Promo Code</Label>
              <Input
                id="promo"
                type="text"
                placeholder="Enter promo code (optional)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? translate('usage.loading') : translate('common.register')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center gap-2 p-6 text-sm">
          <span className="text-muted-foreground">{translate('auth.haveAccount')}</span>
          <Link href="/login" className="text-primary font-semibold">
            {translate('common.login')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}