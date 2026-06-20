import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '本草医案 | 中医诊所档案管理系统',
    template: '%s | 本草医案',
  },
  description:
    '本草医案 — 面向个人中医诊所和中医爱好者的诊疗档案管理系统。记录脉象、舌象、面相等中医特色诊断信息，支持中药处方、针灸推拿等外治方案，AI 智能辨证参考。',
  keywords: ['中医', '诊所', '病历管理', '脉象', '舌象', '中药处方', '针灸', 'AI 辨证', '本草医案'],
  authors: [{ name: '本草医案' }],
  generator: '本草医案',
  openGraph: {
    title: '本草医案 | 中医诊所档案管理系统',
    description: '本草医案 — 让中医诊疗档案管理更专业、更智能。',
    siteName: '本草医案',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.cn/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="antialiased bg-background text-foreground font-sans">
        {isDev && <Inspector />}
        {children}
      <script dangerouslySetInnerHTML={{ __html: `if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js")}` }} /></body>
    </html>
  );
}
