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

  const navItems = [
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
    {
      label: "AI Copilot",
      href: "/ai",
      icon: Sparkles,
      isActive: pathname === "/ai",
      isCenter: true,
    },
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

  return (
    <nav className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-40 block md:hidden max-w-md mx-auto select-none touch-manipulation pb-safe">
      <div className="relative h-[62px] w-full rounded-[28px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] flex items-center justify-between px-2">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <div key={item.href} className="flex-1 flex items-center justify-center">
                <Link
                  href={item.href}
                  prefetch={true}
                  aria-label="PayWise AI Assistant"
                  className="group relative -translate-y-3 flex items-center justify-center touch-manipulation cursor-pointer select-none active:scale-90 transition-transform"
                >
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-sky-500/35 ring-4 ring-white dark:ring-slate-900 group-hover:shadow-sky-500/50 transition-all">
                    <Sparkles className="h-5.5 w-5.5 text-white stroke-[2.2px] drop-shadow-xs" />
                    {item.isActive && (
                      <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-white ring-2 ring-sky-500" />
                    )}
                  </div>
                </Link>
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              aria-label={item.label}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 touch-manipulation cursor-pointer select-none active:scale-95 transition-all ${
                item.isActive
                  ? "text-primary font-bold"
                  : "text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    item.isActive ? "stroke-[2.4px] scale-105" : "stroke-[1.8px]"
                  }`}
                />
                <span className="text-[10px] tracking-tight leading-none font-semibold">
                  {item.label}
                </span>
                {item.isActive ? (
                  <span className="h-1 w-1 rounded-full bg-primary" />
                ) : (
                  <span className="h-1 w-1" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
