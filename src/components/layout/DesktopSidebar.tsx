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
        { label: "Savings Goals", href: "/savings", icon: PiggyBank },
        { label: "Upcoming Bills", href: "/bills", icon: Receipt },
        { label: "Loans & Debts", href: "/loans", icon: CreditCard },
      ],
    },
    {
      title: "AI & Intelligence",
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
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-border bg-card">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
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
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
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
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? item.isAI
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                          : "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive
                            ? item.isAI
                              ? "text-indigo-600 dark:text-indigo-400 stroke-[2.2px]"
                              : "text-primary stroke-[2.2px]"
                            : "stroke-[1.75px]"
                        }`}
                      />
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
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium leading-none text-foreground">Juan Dela Cruz</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">PH Payday Tracker</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
