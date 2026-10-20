"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Coins,
  Palette,
  Bot,
  Database,
  Trash2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { toast } from "sonner";

export default function SettingsPage() {
  const {
    isDemoMode,
    loadDemoData,
    resetAllData,
    aiPreferences,
  } = useFinance();

  const [displayName, setDisplayName] = useState("Juan Dela Cruz");
  const [email, setEmail] = useState("juan.delacruz@paywise.ph");

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all financial records? This will clear all transactions, bills, and goals.")) {
      resetAllData();
      toast.info("All financial records have been reset.");
    }
  };

  const handleLoadDemo = () => {
    loadDemoData();
    toast.success("Loaded realistic Philippine finance demo data (₱30k salary, GCash, Maya, Meralco bills).");
  };

  const handleExportJSON = () => {
    const raw = localStorage.getItem("paywise_finance_state_v1");
    if (!raw) {
      toast.error("No stored data found.");
      return;
    }
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paywise_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast.success("Data backup downloaded.");
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ref-navy flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-ref-blue" />
            Settings & Preferences
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ref-muted">
            Manage your profile, currency, theme, demo data, and AI configuration.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-[28px] sm:rounded-[32px] border border-border/60 dark:border-slate-700 bg-white/95 dark:bg-slate-800/90 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/50 dark:border-slate-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 dark:bg-slate-700 text-ref-blue">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ref-navy">User profile</h2>
              <p className="text-xs text-ref-muted">Account and display preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-ref-muted mb-1.5">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-2xl border border-sky-100 dark:border-slate-700 bg-sky-50/30 dark:bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-ref-navy focus:outline-none focus:ring-2 focus:ring-ref-blue min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ref-muted mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-sky-100 dark:border-slate-700 bg-sky-50/30 dark:bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-ref-navy focus:outline-none focus:ring-2 focus:ring-ref-blue min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Currency & Appearance Card */}
        <div className="rounded-[28px] sm:rounded-[32px] border border-border/60 dark:border-slate-700 bg-white/95 dark:bg-slate-800/90 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 dark:bg-slate-700 text-ref-blue">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ref-navy">Currency & localization</h2>
                <p className="text-xs text-ref-muted">Philippine Peso default</p>
              </div>
            </div>

            <span className="tabular-nums text-xs font-bold text-ref-blue px-3.5 py-1.5 bg-sky-50 dark:bg-slate-700 rounded-full border border-sky-100 dark:border-slate-600">
              PHP (₱)
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 dark:bg-slate-700 text-amber-700 dark:text-amber-400">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ref-navy">Theme appearance</h2>
                <p className="text-xs text-ref-muted">Toggle light or dark theme</p>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </div>

        {/* Gemini AI Config Quick Link */}
        <Link
          href="/settings/ai"
          className="rounded-[28px] sm:rounded-[32px] border border-sky-200/80 dark:border-slate-700 bg-[#DDF3FF]/60 dark:bg-slate-800/90 p-6 sm:p-7 shadow-xs flex items-center justify-between hover:bg-[#DDF3FF] dark:hover:bg-slate-800 transition-colors block group"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ref-blue text-white shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ref-navy flex items-center gap-2">
                Google Gemini AI Configuration
                <span className="rounded-full bg-ref-green/15 text-ref-green text-[10px] px-2.5 py-0.5 font-bold">
                  {aiPreferences.is_enabled ? "Active" : "Disabled"}
                </span>
              </h2>
              <p className="text-xs text-ref-muted">
                Set custom Gemini API key, choose model ({aiPreferences.model_name}), test connection.
              </p>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-ref-blue group-hover:bg-ref-blue group-hover:text-white transition-colors">
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* Demo Mode & Data Management */}
        <div className="rounded-[28px] sm:rounded-[32px] border border-border/60 dark:border-slate-700 bg-white/95 dark:bg-slate-800/90 backdrop-blur-md p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ref-navy">Data Management & Demo Mode</h2>
              <p className="text-xs text-ref-muted">Load test data, backup or reset state</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/50 bg-slate-50/50">
              <div>
                <p className="text-xs font-bold text-ref-navy">Philippine Finance Demo Dataset</p>
                <p className="text-[11px] text-ref-muted">
                  Load ₱30k salary, 15th/30th paydays, GCash/Maya accounts, Meralco/PLDT bills.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-2xs active:scale-95 transition-all shrink-0 min-h-[38px]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Demo Data
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/50 bg-slate-50/50">
              <div>
                <p className="text-xs font-bold text-ref-navy">Export Data Backup (JSON)</p>
                <p className="text-[11px] text-ref-muted">Download full local backup of your records.</p>
              </div>
              <button
                type="button"
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-4 py-2 text-xs font-bold text-ref-navy hover:bg-slate-50 active:scale-95 transition-all shrink-0 min-h-[38px]"
              >
                Export JSON
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-rose-100 bg-rose-50/40">
              <div>
                <p className="text-xs font-bold text-rose-600">Reset All Financial Records</p>
                <p className="text-[11px] text-ref-muted">Wipes all stored balances, transactions, and bills.</p>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/20 active:scale-95 transition-all shrink-0 min-h-[38px]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
