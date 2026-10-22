"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
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
  PlusCircle,
  Download,
  Wifi,
  WifiOff,
  ChevronRight,
  Smartphone,
} from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { usePWA } from "../pwa/PWARegister";
import { ThemeToggle } from "./ThemeToggle";
import { TransactionBottomSheet } from "../transactions/TransactionBottomSheet";
import { IncomeFormModal } from "../income/IncomeFormModal";
import { PaydayPlannerModal } from "../payday/PaydayPlannerModal";
import { toast } from "sonner";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawerNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  isAI?: boolean;
  badge?: number;
}

interface NavSection {
  title: string;
  items: DrawerNavItem[];
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { notifications, isOnline, exportLocalData, isDemoMode } = useFinance();
  const { isInstallable, installPWA } = usePWA();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  if (!isOpen) return null;

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleExport = () => {
    exportLocalData();
    toast.success("Backup Downloaded", {
      description: "Your local financial records have been exported safely.",
    });
  };

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      onClose();
    }
  };

  const navSections: NavSection[] = [
    {
      title: "Finance Core",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Wallet },
        { label: "Salary & Payday", href: "/salary", icon: CalendarDays },
        { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
        { label: "Budget Allocation", href: "/budget", icon: PieChart },
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
        { label: "PayWise AI Assistant", href: "/ai", icon: Sparkles, isAI: true },
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 select-none touch-manipulation"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-xs flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-left duration-250 select-none touch-manipulation">
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M4 6h16M7 12h13M10 18h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  PayWise
                </span>
                {isDemoMode && (
                  <span className="rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1 py-0.2 text-[9px] font-bold">
                    Demo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isOnline ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <Wifi className="h-3 w-3" /> Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    <WifiOff className="h-3 w-3" /> Offline Mode
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white active:opacity-70 transition-opacity touch-manipulation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Action Pills */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                setIsAddTxOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs active:opacity-75 touch-manipulation"
            >
              <PlusCircle className="h-3.5 w-3.5 text-ref-blue" />
              <span>Add Expense</span>
            </button>

            <button
              onClick={() => {
                onClose();
                setIsIncomeOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs active:opacity-75 touch-manipulation"
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-500" />
              <span>Add Income</span>
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigate(item.href)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold touch-manipulation cursor-pointer active:opacity-75 transition-colors ${
                        isActive
                          ? "bg-ref-blue text-white shadow-xs font-bold"
                          : item.isAI
                          ? "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/40"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : item.isAI ? "text-sky-500" : "text-slate-500 dark:text-slate-400"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`h-3 w-3 ${isActive ? "text-white/80" : "text-slate-300 dark:text-slate-600"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Offline & PWA Utilities */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <h3 className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Offline & PWA
            </h3>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation cursor-pointer active:opacity-75"
            >
              <div className="flex items-center gap-2.5">
                <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span>Export Local Backup</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">JSON</span>
            </button>

            {isInstallable && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 touch-manipulation cursor-pointer active:opacity-75"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  <span>Install PayWise App</span>
                </div>
                <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-900 dark:text-emerald-100">
                  PWA
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>Theme Mode</span>
          </div>
          <ThemeToggle className="h-8 w-8 rounded-full shadow-2xs" />
        </div>
      </div>

      {/* Action Modals triggered from drawer */}
      <TransactionBottomSheet
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
      <IncomeFormModal
        isOpen={isIncomeOpen}
        onClose={() => setIsIncomeOpen(false)}
      />
      <PaydayPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
      />
    </>
  );
}
