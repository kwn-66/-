import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "出游日记 | AI 城市出游路线规划",
  description: "基于定位的智能城市出游路线生成系统，吃喝玩乐一站规划",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
