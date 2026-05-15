'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
          <Button asChild>
            <Link href="/login">
              Login
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">
              Register
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}