"use client";

import React, { useState } from "react";
import { Search, SquarePen, X, MessageSquare, ChevronRight, User } from "lucide-react";

interface HistoryItem {
  id: string;
  title: string;
  preview?: string;
  group: "Today" | "7 Days Ago" | "Older";
}

interface AIChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (title: string) => void;
  onNewChat: () => void;
}

const DEFAULT_HISTORY_ITEMS: HistoryItem[] = [
  { id: "1", title: "Analyze my spending", preview: "Overview of food and dining out", group: "Today" },
  { id: "2", title: "Track my budget", preview: "50/30/20 allocation check", group: "Today" },
  { id: "3", title: "Monthly expenses breakdown", preview: "Meralco and PLDT bill review", group: "7 Days Ago" },
  { id: "4", title: "Show savings growth", preview: "Emergency Fund projection", group: "7 Days Ago" },
  { id: "5", title: "Reduce my debt", preview: "SSS loan amortization payment", group: "7 Days Ago" },
  { id: "6", title: "Suggest smart investments", preview: "MP2 & High-yield digital banks", group: "Older" },
  { id: "7", title: "Analyze income expenses", preview: "Semi-monthly cutoff review", group: "Older" },
  { id: "8", title: "Optimize retirement plan", preview: "Long term compound interest", group: "Older" },
];

export function AIChatHistoryDrawer({
  isOpen,
  onClose,
  onSelectChat,
  onNewChat,
}: AIChatHistoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredItems = DEFAULT_HISTORY_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = ["Today", "7 Days Ago", "Older"] as const;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xs sm:max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-250 pb-safe pt-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Reference 2 Right Phone) */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Chat History
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="New Chat"
              >
                <SquarePen className="h-4 w-4 text-[#45C97A]" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-8.5 pr-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#45C97A]"
            />
          </div>
        </div>

        {/* Grouped Conversation Rows */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {groups.map((group) => {
            const items = filteredItems.filter((i) => i.group === group);
            if (items.length === 0) return null;

            return (
              <div key={group} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
                  <span>Chat</span>
                  <span>{group}</span>
                </div>

                <div className="space-y-0.5">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectChat(item.title);
                        onClose();
                      }}
                      className="w-full text-left rounded-2xl p-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-[0.99] transition-all flex items-center justify-between group"
                    >
                      <span className="truncate group-hover:text-[#16A34A]">{item.title}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Footer (Reference 2 Right Phone Bottom) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A] font-bold text-xs">
            <User className="h-4 w-4" />
          </div>
          <div className="truncate text-xs">
            <p className="font-bold text-slate-900 dark:text-white">Juan Dela Cruz</p>
            <p className="text-slate-400 text-[11px]">id : juandelacruz_ph</p>
          </div>
        </div>
      </div>
    </div>
  );
}
