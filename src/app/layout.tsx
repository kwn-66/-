import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "成都探店路线规划",
  description: "输入想吃的店铺，自动规划最省时的探店路线",
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
