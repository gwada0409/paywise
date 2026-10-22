"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  TrendingUp,
  Target,
  Settings,
  Sparkles,
} from "lucide-react";

export function MobileBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-4 right-4 z-40 block md:hidden max-w-md mx-auto select-none touch-manipulation">
      {/* Container with relative positioning for the smooth dome SVG & buttons */}
      <div className="relative h-[68px] w-full">
        {/* Sculpted Smooth Mountain Dome SVG Dock Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_-6px_24px_rgba(0,0,0,0.55)]"
          viewBox="0 0 360 74"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Silky-smooth circular mountain dome arch over the center notch: zero sharp tip */}
          <path
            d="M 22 24 L 120 24 C 134 24 144 22 152 16 A 44 44 0 0 1 208 16 C 216 22 226 24 240 24 L 338 24 A 18 18 0 0 1 356 42 L 356 56 A 18 18 0 0 1 338 74 L 22 74 A 18 18 0 0 1 4 56 L 4 42 A 18 18 0 0 1 22 24 Z"
            className="fill-white dark:fill-slate-900 stroke-slate-200/90 dark:stroke-slate-800 stroke-[1.2]"
          />
        </svg>

        {/* 5-Item Navigation Grid: All 5 icons seated inside the dock */}
        <div className="relative h-full flex items-center justify-between px-3 pt-3">
          {/* 1. Home */}
          <Link
            href="/dashboard"
            prefetch={true}
            aria-label="Dashboard"
            className={`flex-1 flex flex-col items-center justify-center min-h-[48px] touch-manipulation cursor-pointer select-none active:scale-[0.96] transition-transform ${
              pathname === "/dashboard"
                ? "text-[#4A90FF] font-bold"
                : "text-slate-400 dark:text-slate-400"
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Home className={`h-5 w-5 ${pathname === "/dashboard" ? "stroke-[2.4px]" : "stroke-[1.8px]"}`} />
              {pathname === "/dashboard" ? (
                <span className="h-1 w-1 rounded-full bg-[#4A90FF]" />
              ) : (
                <span className="h-1 w-1" />
              )}
            </div>
          </Link>

          {/* 2. Analytics / Reports */}
          <Link
            href="/reports"
            prefetch={true}
            aria-label="Reports"
            className={`flex-1 flex flex-col items-center justify-center min-h-[48px] touch-manipulation cursor-pointer select-none active:scale-[0.96] transition-transform ${
              pathname === "/reports"
                ? "text-[#4A90FF] font-bold"
                : "text-slate-400 dark:text-slate-400"
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <TrendingUp className={`h-5 w-5 ${pathname === "/reports" ? "stroke-[2.4px]" : "stroke-[1.8px]"}`} />
              {pathname === "/reports" ? (
                <span className="h-1 w-1 rounded-full bg-[#4A90FF]" />
              ) : (
                <span className="h-1 w-1" />
              )}
            </div>
          </Link>

          {/* 3. Center AI Button: Kept safely INSIDE the notch, framed by the smooth dome */}
          <div className="flex-1 flex items-center justify-center">
            <Link
              href="/ai"
              prefetch={true}
              aria-label="PayWise AI Assistant"
              className="flex items-center justify-center touch-manipulation cursor-pointer select-none active:scale-[0.96] transition-transform"
            >
              <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-ai-rainbow shadow-md shadow-sky-500/25 ring-2 ring-white/70 dark:ring-slate-800">
                <Sparkles className="h-5.5 w-5.5 text-white stroke-[2.2px] drop-shadow-xs" />
                {pathname === "/ai" && (
                  <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-white ring-2 ring-sky-500" />
                )}
              </div>
            </Link>
          </div>

          {/* 4. Goals / Savings */}
          <Link
            href="/savings"
            prefetch={true}
            aria-label="Savings Goals"
            className={`flex-1 flex flex-col items-center justify-center min-h-[48px] touch-manipulation cursor-pointer select-none active:scale-[0.96] transition-transform ${
              pathname === "/savings"
                ? "text-[#4A90FF] font-bold"
                : "text-slate-400 dark:text-slate-400"
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Target className={`h-5 w-5 ${pathname === "/savings" ? "stroke-[2.4px]" : "stroke-[1.8px]"}`} />
              {pathname === "/savings" ? (
                <span className="h-1 w-1 rounded-full bg-[#4A90FF]" />
              ) : (
                <span className="h-1 w-1" />
              )}
            </div>
          </Link>

          {/* 5. Settings */}
          <Link
            href="/settings"
            prefetch={true}
            aria-label="Settings"
            className={`flex-1 flex flex-col items-center justify-center min-h-[48px] touch-manipulation cursor-pointer select-none active:scale-[0.96] transition-transform ${
              pathname === "/settings"
                ? "text-[#4A90FF] font-bold"
                : "text-slate-400 dark:text-slate-400"
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Settings className={`h-5 w-5 ${pathname === "/settings" ? "stroke-[2.4px]" : "stroke-[1.8px]"}`} />
              {pathname === "/settings" ? (
                <span className="h-1 w-1 rounded-full bg-[#4A90FF]" />
              ) : (
                <span className="h-1 w-1" />
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
