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
      {/* Container with relative positioning for the reverse drop notch SVG & buttons */}
      <div className="relative h-16 w-full">
        {/* Sculpted Reverse Drop Notch SVG Dock Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          viewBox="0 0 360 64"
          preserveAspectRatio="none"
        >
          {/* Reverse drop notch path: smooth concave cradle centered at X=180 */}
          <path
            d="M 24 0 L 146 0 C 155 0 159 10 164 21 C 171 33 189 33 196 21 C 201 10 205 0 214 0 L 336 0 A 24 24 0 0 1 360 24 L 360 40 A 24 24 0 0 1 336 64 L 24 64 A 24 24 0 0 1 0 40 L 0 24 A 24 24 0 0 1 24 0 Z"
            className="fill-white/95 dark:fill-slate-900/95 stroke-slate-200/90 dark:stroke-slate-800 stroke-[1.2]"
          />
        </svg>

        {/* 5-Item Navigation Grid */}
        <div className="relative h-full flex items-center justify-between px-3">
          {/* 1. Home */}
          <Link
            href="/dashboard"
            prefetch={true}
            onClick={(e) => handleNav(e, "/dashboard")}
            aria-label="Dashboard"
            className={`flex-1 flex flex-col items-center justify-center min-h-[52px] touch-manipulation cursor-pointer select-none active:opacity-60 transition-opacity ${
              pathname === "/dashboard"
                ? "text-[#4A90FF] font-bold"
                : "text-slate-400 dark:text-slate-500"
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
            className={`flex-1 flex flex-col items-center justify-center min-h-[52px] touch-manipulation cursor-pointer select-none active:opacity-60 transition-opacity ${
              pathname === "/reports"
                ? "text-[#4A90FF] font-bold"
                : "text-slate-400 dark:text-slate-500"
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

          {/* 3. Center AI Button: Nestled into the Reverse Drop Notch Cradle */}
          <div className="flex-1 flex items-center justify-center relative">
            <Link
              href="/ai"
              prefetch={true}
              onClick={(e) => handleNav(e, "/ai")}
              aria-label="PayWise AI Assistant"
              className="absolute -top-3.5 flex items-center justify-center touch-manipulation cursor-pointer select-none active:opacity-75 transition-opacity"
            >
              <div className="relative flex h-13 w-13 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md ring-2 ring-white/90 dark:ring-slate-900">
                <Sparkles className="h-6 w-6 stroke-[2.2px]" />
                {pathname === "/ai" && (
                  <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-[#4A90FF] ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
            </Link>
          </div>

          {/* 4. Goals / Savings */}
          <Link
            href="/savings"
            prefetch={true}
            onClick={(e) => handleNav(e, "/savings")}
            aria-label="Savings Goals"
            className={`flex-1 flex flex-col items-center justify-center min-h-[52px] touch-manipulation cursor-pointer select-none active:opacity-60 transition-opacity ${
              pathname === "/savings"
                ? "text-[#4A90FF] font-bold"
                : "text-slate-400 dark:text-slate-500"
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
            className={`flex-1 flex flex-col items-center justify-center min-h-[52px] touch-manipulation cursor-pointer select-none active:opacity-60 transition-opacity ${
              pathname === "/settings"
                ? "text-[#4A90FF] font-bold"
                : "text-slate-400 dark:text-slate-500"
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
