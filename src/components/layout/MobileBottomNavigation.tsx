"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Target,
  Settings,
  Sparkles,
} from "lucide-react";

export function MobileBottomNavigation() {
  const pathname = usePathname();

  // If on the AI chat page, we can show a more streamlined footer or maintain navigation
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40 block md:hidden max-w-md mx-auto">
      <div className="relative flex h-16 items-center justify-between px-6 rounded-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-100/90 dark:border-slate-800">
        {/* 1. Home */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center p-2 min-h-[44px] transition-all active:scale-95 ${
            pathname === "/dashboard"
              ? "text-[#4A90FF] font-bold"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Home className={`h-5 w-5 ${pathname === "/dashboard" ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
          {pathname === "/dashboard" && (
            <span className="h-1 w-1 rounded-full bg-[#4A90FF] mt-0.5" />
          )}
        </Link>

        {/* 2. Analytics */}
        <Link
          href="/reports"
          className={`flex flex-col items-center justify-center p-2 min-h-[44px] transition-all active:scale-95 ${
            pathname === "/reports"
              ? "text-[#4A90FF] font-bold"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <TrendingUp className={`h-5 w-5 ${pathname === "/reports" ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
          {pathname === "/reports" && (
            <span className="h-1 w-1 rounded-full bg-[#4A90FF] mt-0.5" />
          )}
        </Link>

        {/* 3. Center Vibrant Rainbow AI Button */}
        <Link
          href="/ai"
          className="relative -top-2 flex flex-col items-center justify-center active:scale-90 transition-transform"
          aria-label="PayWise AI"
        >
          <div className="flex h-13 w-13 items-center justify-center rounded-full bg-ai-rainbow shadow-lg shadow-sky-500/25 ring-4 ring-white dark:ring-slate-900">
            <Sparkles className="h-6 w-6 text-white stroke-[2.2px] drop-shadow-xs" />
          </div>
        </Link>

        {/* 4. Goals / Savings */}
        <Link
          href="/savings"
          className={`flex flex-col items-center justify-center p-2 min-h-[44px] transition-all active:scale-95 ${
            pathname === "/savings"
              ? "text-[#4A90FF] font-bold"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Target className={`h-5 w-5 ${pathname === "/savings" ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
          {pathname === "/savings" && (
            <span className="h-1 w-1 rounded-full bg-[#4A90FF] mt-0.5" />
          )}
        </Link>

        {/* 5. Settings */}
        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center p-2 min-h-[44px] transition-all active:scale-95 ${
            pathname === "/settings"
              ? "text-[#4A90FF] font-bold"
              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Settings className={`h-5 w-5 ${pathname === "/settings" ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
          {pathname === "/settings" && (
            <span className="h-1 w-1 rounded-full bg-[#4A90FF] mt-0.5" />
          )}
        </Link>
      </div>
    </nav>
  );
}
