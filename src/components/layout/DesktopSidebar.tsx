"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  CalendarDays,
  ArrowLeftRight,
  PieChart,
  PiggyBank,
  Receipt,
  CreditCard,
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  Bot,
  User,
  LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useFinance } from "@/lib/store/finance-context";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isAI?: boolean;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const { notifications, isDemoMode } = useFinance();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const navGroups: NavGroup[] = [
    {
      title: "Finance Core",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Wallet },
        { label: "Salary & Payday", href: "/salary", icon: CalendarDays },
        { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
        { label: "Budget (50/30/20)", href: "/budget", icon: PieChart },
      ],
    },
    {
      title: "Planning & Obligations",
      items: [
        { label: "Savings & Goals", href: "/savings", icon: PiggyBank },
        { label: "Upcoming Bills", href: "/bills", icon: Receipt },
        { label: "Loans & Debts", href: "/loans", icon: CreditCard },
      ],
    },
    {
      title: "Intelligence & Insights",
      items: [
        { label: "PayWise AI", href: "/ai", icon: Sparkles, isAI: true },
        { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
      ],
    },
    {
      title: "Settings & System",
      items: [
        {
          label: "Notifications",
          href: "/notifications",
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { label: "Settings", href: "/settings", icon: Settings },
        { label: "Gemini AI Config", href: "/settings/ai", icon: Bot },
      ],
    },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-sky-100 dark:border-slate-800 bg-[#F5F9FF]/95 dark:bg-slate-900/95 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-sky-100 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5 active:scale-95 transition-transform">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M4 6h16M7 12h13M10 18h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              PayWise
              {isDemoMode && (
                <span className="rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 text-[10px] font-semibold">
                  Demo
                </span>
              )}
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {group.title}
            </p>
            <div className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? item.isAI
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/60 shadow-xs"
                          : "bg-white dark:bg-slate-800 text-ref-blue font-bold shadow-xs border border-sky-100/80 dark:border-slate-700"
                        : "text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800/50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.isAI ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ai-rainbow shadow-2xs">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <Icon
                          className={`h-4 w-4 ${
                            isActive
                              ? "text-[#4A90FF] stroke-[2.2px]"
                              : "text-slate-400 stroke-[1.8px]"
                          }`}
                        />
                      )}
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User profile footer */}
      <div className="border-t border-sky-100 dark:border-slate-800 p-4 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-[#4A90FF] dark:bg-slate-800 dark:text-sky-300">
            <User className="h-4 w-4" />
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Juan Dela Cruz</p>
            <p className="text-xs text-slate-400 truncate">Philippine Payday Tracker</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
