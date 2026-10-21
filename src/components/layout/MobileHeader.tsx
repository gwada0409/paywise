"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, User, WifiOff } from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { ThemeToggle } from "./ThemeToggle";
import { MobileDrawer } from "./MobileDrawer";

export function MobileHeader() {
  const { notifications, isOnline } = useFinance();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-5 pt-safe md:hidden bg-transparent select-none touch-manipulation">
        {/* Brand Geometric Logo Mark / Drawer trigger */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Open Navigation Menu"
          className="flex items-center gap-2 touch-manipulation cursor-pointer active:opacity-75 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              {/* Stepped 3-bar menu emblem */}
              <path d="M4 6h16M7 12h13M10 18h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          {!isOnline && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5">
              <WifiOff className="h-2.5 w-2.5" />
              Offline
            </span>
          )}
        </button>

        {/* Right controls: Bell icon in circular translucent glass + Profile pill */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/notifications"
            prefetch={true}
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full glass-pill text-slate-700 dark:text-slate-200 shadow-xs active:opacity-75 transition-opacity touch-manipulation cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </Link>

          <ThemeToggle className="h-9 w-9 rounded-full glass-pill shadow-xs touch-manipulation" />

          <Link
            href="/settings"
            prefetch={true}
            className="flex items-center gap-1.5 rounded-full glass-pill px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs active:opacity-75 transition-opacity touch-manipulation cursor-pointer"
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile</span>
          </Link>
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
