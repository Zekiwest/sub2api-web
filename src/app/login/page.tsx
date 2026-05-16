/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 登录页面
 * 依赖关系: lib/i18n, lib/auth, stores/auth, ui/card, ui/button
 * 变更同步:
 *   - 表单字段变化时，需同步 auth 翻译键
 * ============================================================================
 */

'use client';

import { useState } from 'react';
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

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { translate } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      toast.success(translate('auth.loginSuccess'));
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || translate('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted to-accent/20 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col gap-1 p-6">
          <CardTitle className="text-2xl font-bold">{translate('auth.loginTitle')}</CardTitle>
          <CardDescription>{translate('auth.loginDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? translate('usage.loading') : translate('common.login')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center gap-2 p-6 text-sm">
          <span className="text-muted-foreground">{translate('auth.noAccount')}</span>
          <Link href="/register" className="text-primary font-semibold">
            {translate('common.register')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}