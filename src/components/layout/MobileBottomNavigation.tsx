"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Target,
  Settings,
} from "lucide-react";

/**
 * Optically Centered Gemini / PayWise AI Star Emblem.
 * Symmetrically balanced around (12, 12) with full-bleed diamond star tips
 * and bold radiance facets so it never appears small, tilted, or off-center.
 */
export function CenteredAIIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={`${className} max-w-full`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Primary Centered 4-Point AI Diamond Star */}
      <path
        d="M12 1C12 6.8 6.8 12 1 12C6.8 12 12 17.2 12 23C12 17.2 17.2 12 23 12C17.2 12 12 6.8 12 1Z"
        fill="currentColor"
      />
      {/* Symmetrical diagonal radiance facet for depth and brilliance */}
      <path
        d="M12 6C12 9.3 9.3 12 6 12C9.3 12 12 14.7 12 18C12 14.7 14.7 12 18 12C14.7 12 12 9.3 12 6Z"
        fill="white"
        fillOpacity="0.38"
      />
      {/* Center glowing focal core */}
      <circle cx="12" cy="12" r="1.6" fill="white" />
    </svg>
  );
}

export function MobileBottomNavigation() {
  const pathname = usePathname();

  const leftNavItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      label: "Reports",
      href: "/reports",
      icon: TrendingUp,
      isActive: pathname === "/reports",
    },
  ];

  const rightNavItems = [
    {
      label: "Goals",
      href: "/savings",
      icon: Target,
      isActive: pathname === "/savings",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      isActive: pathname === "/settings",
    },
  ];

  const isAIActive = pathname === "/ai";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 block md:hidden w-full select-none touch-manipulation pb-[max(env(safe-area-inset-bottom),0.5rem)]"
    >
      {/* Sculpted Mountain Curve Dock Background with Safe-Area Bottom Fill */}
      <div className="absolute inset-0 pointer-events-none drop-shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_-6px_24px_rgba(0,0,0,0.45)] flex flex-col">
        {/* Mountain arch SVG with smooth cubic Bezier dome */}
        <svg className="w-full max-w-full h-[68px] shrink-0 block" viewBox="0 0 360 68" preserveAspectRatio="none">
          {/* Base dock fill with smooth mountain peak */}
          <path
            d="M 0 20 L 115 20 C 132 20 146 17 158 9 C 168 3 192 3 202 9 C 214 17 228 20 245 20 L 360 20 L 360 68 L 0 68 Z"
            className="fill-white dark:fill-[#0A111E]"
          />
          {/* Subtle top edge border along the mountain silhouette */}
          <path
            d="M 0 20 L 115 20 C 132 20 146 17 158 9 C 168 3 192 3 202 9 C 214 17 228 20 245 20 L 360 20"
            className="stroke-slate-200/90 dark:stroke-slate-800/90"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
            fill="none"
          />
        </svg>
        {/* Safe-area extension to seamlessly fill under home bar on iPhone */}
        <div className="w-full flex-1 bg-white dark:bg-[#0A111E] -mt-px" />
      </div>

      {/* Navigation Container */}
      <div className="relative z-10 max-w-md mx-auto">
        {/* 5-Column Navigation Row positioned inside the dock body */}
        <div className="flex items-center justify-between h-[52px] mt-4 px-2">
          {/* Left Wing (Home & Reports) */}
          {leftNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                aria-label={item.label}
                className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 touch-manipulation cursor-pointer select-none active:scale-95 transition-all ${
                  item.isActive
                    ? "text-[#4A90FF] font-bold"
                    : "text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Icon
                    className={`h-5 w-5 transition-transform ${
                      item.isActive ? "stroke-[2.4px] scale-105" : "stroke-[1.8px]"
                    }`}
                  />
                  <span className="text-[10px] tracking-tight leading-none font-semibold">
                    {item.label}
                  </span>
                  {item.isActive ? (
                    <span className="h-1 w-1 rounded-full bg-[#4A90FF]" />
                  ) : (
                    <span className="h-1 w-1" />
                  )}
                </div>
              </Link>
            );
          })}

          {/* Center Column: Perfectly Centered AI FAB with Mountain Cradle */}
          <div className="flex-1 flex items-center justify-center -translate-y-1">
            <Link
              href="/ai"
              prefetch={true}
              aria-label="PayWise AI Copilot"
              className="group relative flex items-center justify-center touch-manipulation cursor-pointer select-none active:scale-90 transition-transform"
            >
              <div className="relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/35 ring-4 ring-white dark:ring-[#0A111E] group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all">
                <CenteredAIIcon className="h-8 w-8 text-white drop-shadow-sm" />
                {isAIActive && (
                  <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-white ring-2 ring-indigo-500" />
                )}
              </div>
            </Link>
          </div>

          {/* Right Wing (Goals & Settings) */}
          {rightNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                aria-label={item.label}
                className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 touch-manipulation cursor-pointer select-none active:scale-95 transition-all ${
                  item.isActive
                    ? "text-[#4A90FF] font-bold"
                    : "text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Icon
                    className={`h-5 w-5 transition-transform ${
                      item.isActive ? "stroke-[2.4px] scale-105" : "stroke-[1.8px]"
                    }`}
                  />
                  <span className="text-[10px] tracking-tight leading-none font-semibold">
                    {item.label}
                  </span>
                  {item.isActive ? (
                    <span className="h-1 w-1 rounded-full bg-[#4A90FF]" />
                  ) : (
                    <span className="h-1 w-1" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
