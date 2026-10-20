"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  X,
  CalendarDays,
  PiggyBank,
  Receipt,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  Bot,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { TransactionBottomSheet } from "../transactions/TransactionBottomSheet";
import { useFinance } from "@/lib/store/finance-context";

interface MoreItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isAI?: boolean;
  badge?: number;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const { notifications } = useFinance();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const moreLinks: MoreItem[] = [
    { label: "Salary & Payday", href: "/salary", icon: CalendarDays },
    { label: "Savings Goals", href: "/savings", icon: PiggyBank },
    { label: "Upcoming Bills", href: "/bills", icon: Receipt },
    { label: "Loans & Debts", href: "/loans", icon: CreditCard },
    { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: "PayWise AI Chat", href: "/ai", icon: Sparkles, isAI: true },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Gemini AI Config", href: "/settings/ai", icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Desktop Collapsible Sidebar */}
      <DesktopSidebar />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 pb-20 md:pb-8">
        {/* Mobile Top Header */}
        <MobileHeader />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Floating Action Button (FAB) for instant transaction entry on mobile */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <button
          onClick={() => setIsAddTxOpen(true)}
          aria-label="Add expense or income"
          className="flex h-13 w-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-primary/25"
        >
          <Plus className="h-6 w-6 stroke-[2.5px]" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar (5 tabs) */}
      <MobileBottomNavigation onOpenMore={() => setIsMoreOpen(true)} />

      {/* Mobile "More" Drawer Modal */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 animate-in fade-in duration-200"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl border border-border bg-card p-6 shadow-2xl max-h-[85vh] overflow-y-auto pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground">All Destinations</h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {moreLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-3 rounded-xl p-3.5 text-xs font-semibold transition-all min-h-[48px] ${
                      isActive
                        ? item.isAI
                          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                          : "bg-primary/10 text-primary border border-primary/20"
                        : "border border-border bg-card text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        item.isAI
                          ? "text-indigo-600 dark:text-indigo-400"
                          : isActive
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Global Add Transaction Bottom Sheet */}
      <TransactionBottomSheet
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
    </div>
  );
}
