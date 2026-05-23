/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: 首页入口，展示登录/注册按钮，引导用户进入系统
 * 依赖关系: ui/card, ui/button, Next.js Link
 * 变更同步:
 *   - 首页文案变化时，需同步 i18n 翻译键
 *   - 登录/注册路由变化时，需更新 Link href
 * ============================================================================
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-muted to-accent/20">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col gap-1 p-6">
          <CardTitle className="text-2xl font-bold text-center">Sub2API</CardTitle>
          <CardDescription className="text-center">
            AI API Gateway Platform - Manage your API keys and track token usage
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4 p-6">
          <Link href="/login" className={buttonVariants({ variant: 'default' })}>
            Login
          </Link>
          <Link href="/register" className={buttonVariants({ variant: 'outline' })}>
            Register
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}