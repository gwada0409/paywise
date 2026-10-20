"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ArrowLeftRight,
  PieChart,
  Sparkles,
  Menu,
} from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";

interface MobileBottomNavigationProps {
  onOpenMore: () => void;
}

export function MobileBottomNavigation({ onOpenMore }: MobileBottomNavigationProps) {
  const pathname = usePathname();
  const { notifications } = useFinance();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const tabs = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Activity", href: "/transactions", icon: ArrowLeftRight },
    { label: "Budget", href: "/budget", icon: PieChart },
    { label: "AI Chat", href: "/ai", icon: Sparkles, isAI: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-border bg-card/90 backdrop-blur-md pb-safe">
      <div className="grid h-16 grid-cols-5 items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 min-h-[44px] ${
                isActive
                  ? tab.isAI
                    ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 ${
                    isActive && tab.isAI
                      ? "stroke-[2.5px] text-indigo-600 dark:text-indigo-400"
                      : isActive
                      ? "stroke-[2.5px] text-primary"
                      : "stroke-[1.75px]"
                  }`}
                />
              </div>
              <span className="mt-1 text-[10px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}

        {/* More tab opens mobile sheet with remaining destinations */}
        <button
          onClick={onOpenMore}
          className="relative flex flex-col items-center justify-center py-1 text-muted-foreground hover:text-foreground transition-all active:scale-95 min-h-[44px]"
        >
          <div className="relative">
            <Menu className="h-5 w-5 stroke-[1.75px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500 ring-2 ring-card" />
            )}
          </div>
          <span className="mt-1 text-[10px] tracking-tight">More</span>
        </button>
      </div>
    </nav>
  );
}
