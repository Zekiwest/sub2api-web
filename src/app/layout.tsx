/**
 * ============================================================================
 * GEB L3 文件级自指注释块
 * ============================================================================
 * 文件作用: Next.js App Router 根布局，挂载 Providers
 * 依赖关系: components/providers.tsx, globals.css, next/font/google
 * 变更同步:
 *   - Provider 配置变化时，需检查所有组件兼容性
 *   - 新增全局 Provider 时，需在 app/_dir.md 中记录
 *   - 字体配置变化时，需同步更新 globals.css --font-sans
 * 版本记录:
 *   - 2026-05-16: Montserrat + Noto Sans SC fallback (中英双语支持)
 * ============================================================================
 */

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

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
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}