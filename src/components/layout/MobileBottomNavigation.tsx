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
  const router = useRouter();

  // Instant single-tap navigation handler
  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <nav className="fixed bottom-3 left-4 right-4 z-40 block md:hidden max-w-md mx-auto select-none touch-manipulation">
      {/* Container with relative positioning for the smooth dome SVG & buttons */}
      <div className="relative h-[70px] w-full">
        {/* Sculpted Smooth Mountain Dome SVG Dock Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_-6px_24px_rgba(0,0,0,0.55)]"
          viewBox="0 0 360 74"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Silky-smooth mountain dome: broad, gentle rounded crest with zero sharp tip */}
          <path
            d="M 22 22 L 115 22 C 132 22 146 19 158 11 C 168 5 192 5 202 11 C 214 19 228 22 245 22 L 338 22 A 18 18 0 0 1 356 40 L 356 56 A 18 18 0 0 1 338 74 L 22 74 A 18 18 0 0 1 4 56 L 4 40 A 18 18 0 0 1 22 22 Z"
            className="fill-white dark:fill-slate-900 stroke-slate-200/90 dark:stroke-slate-800 stroke-[1.2]"
          />
        </svg>

        {/* 5-Item Navigation Grid: Side items aligned in the flat baseline dock */}
        <div className="relative h-full flex items-center justify-between px-3 pt-3">
          {/* 1. Home */}
          <Link
            href="/dashboard"
            prefetch={true}
            onClick={(e) => handleNav(e, "/dashboard")}
            aria-label="Dashboard"
            className={`flex-1 flex flex-col items-center justify-center min-h-[48px] touch-manipulation cursor-pointer select-none active:opacity-60 transition-opacity ${
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
            onClick={(e) => handleNav(e, "/reports")}
            aria-label="Reports"
            className={`flex-1 flex flex-col items-center justify-center min-h-[48px] touch-manipulation cursor-pointer select-none active:opacity-60 transition-opacity ${
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

          {/* 3. Center Spacer for AI Button */}
          <div className="flex-1 flex items-center justify-center" aria-hidden="true">
            <div className="w-13 h-13" />
          </div>

          {/* 4. Goals / Savings */}
          <Link
            href="/savings"
            prefetch={true}
            onClick={(e) => handleNav(e, "/savings")}
            aria-label="Savings Goals"
            className={`flex-1 flex flex-col items-center justify-center min-h-[48px] touch-manipulation cursor-pointer select-none active:opacity-60 transition-opacity ${
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
            onClick={(e) => handleNav(e, "/settings")}
            aria-label="Settings"
            className={`flex-1 flex flex-col items-center justify-center min-h-[48px] touch-manipulation cursor-pointer select-none active:opacity-60 transition-opacity ${
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

        {/* Center AI Button: Perched symmetrically on the smooth rounded dome */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-10 flex items-center justify-center">
          <Link
            href="/ai"
            prefetch={true}
            onClick={(e) => handleNav(e, "/ai")}
            aria-label="PayWise AI Assistant"
            className="flex items-center justify-center touch-manipulation cursor-pointer select-none active:opacity-80 transition-opacity"
          >
            <div className="relative flex h-13 w-13 items-center justify-center rounded-full bg-ai-rainbow shadow-lg shadow-sky-500/25 ring-4 ring-white dark:ring-slate-900">
              <Sparkles className="h-6 w-6 text-white stroke-[2.2px] drop-shadow-xs" />
              {pathname === "/ai" && (
                <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-white ring-2 ring-sky-500" />
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
