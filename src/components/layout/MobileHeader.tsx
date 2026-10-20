"use client";

import React from "react";
import Link from "next/link";
import { Bell, User } from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { ThemeToggle } from "./ThemeToggle";

export function MobileHeader() {
  const { notifications } = useFinance();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-5 pt-safe md:hidden bg-transparent">
      {/* Brand Geometric Logo Mark (inspired by Reference 1 top left) */}
      <Link href="/dashboard" className="flex items-center gap-2 active:scale-95 transition-transform">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            {/* Minimalist 3-layer stepped financial emblem */}
            <path d="M4 6h16M7 12h13M10 18h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </Link>

      {/* Right controls: Bell icon in circular translucent glass + Profile pill */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full glass-pill text-slate-700 dark:text-slate-200 shadow-xs hover:bg-white/80 active:scale-95 transition-all"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute 0 top-0.5 right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </Link>

        <ThemeToggle className="h-9 w-9 rounded-full glass-pill shadow-xs" />

        <Link
          href="/settings"
          className="flex items-center gap-1.5 rounded-full glass-pill px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs hover:bg-white/80 active:scale-95 transition-all"
        >
          <User className="h-3.5 w-3.5" />
          <span>Profile</span>
        </Link>
      </div>
    </header>
  );
}
