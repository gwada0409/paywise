"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { TransactionBottomSheet } from "../transactions/TransactionBottomSheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  // For /ai page, we use the pure white/clean theme as requested in Section 6
  const isAIPage = pathname === "/ai";

  return (
    <div className={`min-h-screen text-foreground flex flex-col md:flex-row ${
      isAIPage ? "bg-white dark:bg-slate-950" : "ref-gradient-canvas"
    }`}>
      {/* Desktop Collapsible Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 pb-28 md:pb-10">
        {/* Mobile Header (unless AI page has its own top header) */}
        {!isAIPage && <MobileHeader />}

        {/* Page Container */}
        <main className={`flex-1 w-full ${isAIPage ? "p-0" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6"}`}>
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation (Home, Analytics, Rainbow AI, Goals, Settings) */}
      {!isAIPage && <MobileBottomNavigation />}

      {/* Global Add Transaction Bottom Sheet */}
      <TransactionBottomSheet
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
    </div>
  );
}
