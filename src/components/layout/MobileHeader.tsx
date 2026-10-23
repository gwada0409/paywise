"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, User, WifiOff, Menu, RefreshCw } from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { ThemeToggle } from "./ThemeToggle";
import { MobileDrawer } from "./MobileDrawer";

export function MobileHeader() {
  const { notifications, isOnline, userProfile, nextPayday, syncWithCloud, isSyncing } = useFinance();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const firstName = userProfile?.display_name?.split(" ")[0] || "there";

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#0A111E] border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs select-none touch-manipulation transition-colors md:hidden pt-[max(env(safe-area-inset-top),2.75rem)] pb-2 px-4 sm:px-5">
        <div className="flex h-11 w-full items-center justify-between">
          {/* Left: Drawer Menu Button + Contextual Greeting */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Navigation Menu"
              className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 active:scale-95 transition-all cursor-pointer touch-manipulation shadow-2xs"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Kumusta, {firstName}
                </span>
                <span className="inline-block text-[11px] animate-pulse">👋</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!isOnline ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <WifiOff className="h-2.5 w-2.5" />
                    Offline
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {nextPayday?.daysRemaining > 0
                      ? `Payday in ${nextPayday.daysRemaining}d`
                      : "Payday today!"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right controls: Cloud Sync + Bell Notification + ThemeToggle + Profile Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => syncWithCloud()}
              disabled={isSyncing}
              aria-label="Sync with Cloud"
              title="Sync latest financial records"
              className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 active:scale-95 transition-all touch-manipulation cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-primary" : ""}`} />
            </button>

            <Link
              href="/notifications"
              prefetch={true}
              aria-label="Notifications"
              className="relative flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/70 active:scale-95 transition-all touch-manipulation cursor-pointer shadow-2xs"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <ThemeToggle className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs touch-manipulation active:scale-95 transition-all" />

            <Link
              href="/settings"
              prefetch={true}
              aria-label="Profile and Settings"
              className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl bg-primary text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all touch-manipulation cursor-pointer ring-1 ring-primary/40"
            >
              {firstName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
