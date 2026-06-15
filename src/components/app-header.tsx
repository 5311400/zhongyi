'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Search,
  Bell,
  ChevronDown,
  Leaf,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '仪表盘', icon: LayoutDashboard },
  { href: '/patients', label: '患者', icon: Users },
  { href: '/account', label: '账号设置', icon: UserCog },
] as const;

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-card">
            <Leaf className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-bold text-foreground leading-tight">本草医案</div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              中医诊所档案管理系统
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'px-3 py-1.5 rounded-md text-sm font-medium bg-primary/10 text-primary flex items-center gap-1.5 transition-colors'
                    : 'px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-surface-container hover:text-foreground flex items-center gap-1.5 transition-colors'
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-md ml-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="搜索患者姓名 / 电话 / 病历号…"
              className="w-full h-9 pl-9 pr-3 bg-surface-container border-none rounded-md text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="relative w-9 h-9 rounded-md hover:bg-surface-container flex items-center justify-center text-muted-foreground transition-colors"
            aria-label="通知"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
          </button>
          <button
            type="button"
            className="ml-1 flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-surface-container transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center text-sm font-bold">
              王
            </div>
            <span className="hidden sm:inline text-sm font-medium text-foreground">王志远</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
