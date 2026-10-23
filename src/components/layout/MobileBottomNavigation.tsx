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
    <nav className="fixed bottom-0 inset-x-0 z-40 block md:hidden w-full bg-white dark:bg-[#0B111D] border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] select-none touch-manipulation pb-[max(env(safe-area-inset-bottom),1rem)] pt-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-between h-14">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <div key={item.href} className="flex-1 flex items-center justify-center">
                <Link
                  href={item.href}
                  prefetch={true}
                  aria-label="PayWise AI Assistant"
                  className="group relative -translate-y-4 flex items-center justify-center touch-manipulation cursor-pointer select-none active:scale-90 transition-transform"
                >
                  <div className="relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-sky-500/35 ring-4 ring-white dark:ring-[#0B111D] group-hover:shadow-sky-500/50 transition-all">
                    <Sparkles className="h-6 w-6 text-white stroke-[2.2px] drop-shadow-xs" />
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
