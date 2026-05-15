/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Next.js App Router 根布局，挂载 Providers
 * 依赖关系: components/providers.tsx, globals.css
 * 变更同步:
 *   - Provider 配置变化时，需检查所有组件兼容性
 *   - 新增全局 Provider 时，需在 app/_dir.md 中记录
 * ============================================================================
 */

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Sub2API - AI API Gateway",
  description: "Manage your AI API keys and track usage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}