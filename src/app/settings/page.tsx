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
  const [email, setEmail] = useState("juan@example.com");

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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-primary" />
            Settings & Preferences
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your profile, currency, theme, demo data, and AI configuration.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">User Profile</h2>
              <p className="text-xs text-muted-foreground">Account and display preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Currency & Appearance Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Currency & Localization</h2>
                <p className="text-xs text-muted-foreground">Philippine Peso default</p>
              </div>
            </div>

            <span className="font-mono text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-lg">
              PHP (₱)
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Theme Appearance</h2>
                <p className="text-xs text-muted-foreground">Toggle light or dark theme</p>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </div>

        {/* Gemini AI Config Quick Link */}
        <Link
          href="/settings/ai"
          className="rounded-3xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/10 via-card to-card p-6 shadow-xs flex items-center justify-between hover:border-indigo-500/50 transition-all block"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                Google Gemini AI Configuration
                <span className="rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] px-1.5 py-0.5 font-bold">
                  {aiPreferences.is_enabled ? "Active" : "Disabled"}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Set custom Gemini API key, choose model ({aiPreferences.model_name}), test connection.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>

        {/* Demo Mode & Data Management */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Data Management & Demo Mode</h2>
              <p className="text-xs text-muted-foreground">Load test data, backup or reset state</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-muted/20">
              <div>
                <p className="text-xs font-bold text-foreground">Philippine Finance Demo Dataset</p>
                <p className="text-[11px] text-muted-foreground">
                  Load ₱30k salary, 15th/30th paydays, GCash/Maya accounts, Meralco/PLDT bills.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all shrink-0 min-h-[40px]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Demo Data
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-muted/20">
              <div>
                <p className="text-xs font-bold text-foreground">Export Data Backup (JSON)</p>
                <p className="text-[11px] text-muted-foreground">Download full local backup of your records.</p>
              </div>
              <button
                type="button"
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 active:scale-95 transition-all shrink-0 min-h-[40px]"
              >
                Export JSON
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-rose-500/25 bg-rose-500/5">
              <div>
                <p className="text-xs font-bold text-rose-600">Reset All Financial Records</p>
                <p className="text-[11px] text-muted-foreground">Wipes all stored balances, transactions, and bills.</p>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/20 active:scale-95 transition-all shrink-0 min-h-[40px]"
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
