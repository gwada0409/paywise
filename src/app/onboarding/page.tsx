"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  CalendarDays,
  PieChart,
  Coins,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";

export default function OnboardingPage() {
  const router = useRouter();
  const {
    updateSalarySettings,
    updateBudgetRules,
    setAIPreferences,
    setClientApiKey,
    accounts,
  } = useFinance();

  const [step, setStep] = useState(1);

  // Form State
  const [monthlySalary, setMonthlySalary] = useState(30000);
  const [p1Day, setP1Day] = useState(15);
  const [p2Day, setP2Day] = useState(30);
  const [p1Expected, setP1Expected] = useState(15000);
  const [p2Expected, setP2Expected] = useState(15000);

  const [needsPercent, setNeedsPercent] = useState(50);
  const [wantsPercent, setWantsPercent] = useState(30);
  const [savingsPercent, setSavingsPercent] = useState(20);

  const [cashBalance, setCashBalance] = useState(2500);
  const [gcashBalance, setGcashBalance] = useState(4500);
  const [bankBalance, setBankBalance] = useState(12000);

  const [aiEnabled, setAiEnabled] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [shareContext, setShareContext] = useState(true);

  const totalPercent = needsPercent + wantsPercent + savingsPercent;

  const handleSalaryChange = (val: number) => {
    setMonthlySalary(val);
    setP1Expected(Math.round(val / 2));
    setP2Expected(Math.round(val / 2));
  };

  const handleFinish = () => {
    // Save to finance context
    updateSalarySettings({
      monthly_net: monthlySalary,
      payday_1_day: p1Day,
      payday_2_day: p2Day,
      payday_1_expected: p1Expected,
      payday_2_expected: p2Expected,
      is_semi_monthly: true,
    });

    updateBudgetRules({
      needs_percent: needsPercent,
      wants_percent: wantsPercent,
      savings_percent: savingsPercent,
    });

    setAIPreferences({
      is_enabled: aiEnabled,
      share_financial_context: shareContext,
      model_name: "gemini-1.5-flash",
    });

    if (geminiApiKey.trim()) {
      setClientApiKey(geminiApiKey.trim());
    }

    toast.success("PayWise configuration complete! Welcome aboard.");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">PayWise Setup</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <span>Step {step} of 6</span>
          </div>
        </div>

        <div className="w-full bg-muted/60 h-1.5 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-primary mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Welcome to PayWise
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Let&apos;s personalize your finances. In just 2 minutes, we&apos;ll configure your semi-monthly paydays, 50/30/20 budget, and intelligent Gemini assistant.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
              >
                Let&apos;s Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Salary & Payday */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Salary & Payday Schedule
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Configure your expected net earnings per month and semi-monthly payday days.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Monthly Net Salary (Take-Home)
              </label>
              <CurrencyInput value={monthlySalary} onChange={handleSalaryChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  1st Payday Date
                </label>
                <div className="flex items-center rounded-xl border border-input bg-card px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground mr-1.5">Day</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={p1Day}
                    onChange={(e) => setP1Day(Number(e.target.value))}
                    className="w-full bg-transparent font-mono text-sm font-semibold focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Usually the 15th</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  2nd Payday Date
                </label>
                <div className="flex items-center rounded-xl border border-input bg-card px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground mr-1.5">Day</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={p2Day}
                    onChange={(e) => setP2Day(Number(e.target.value))}
                    className="w-full bg-transparent font-mono text-sm font-semibold focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Usually 30th (or month-end)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  1st Expected Payout
                </label>
                <CurrencyInput value={p1Expected} onChange={setP1Expected} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  2nd Expected Payout
                </label>
                <CurrencyInput value={p2Expected} onChange={setP2Expected} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Budget Allocation */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Budget Allocation
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Customize your Needs, Wants, and Savings ratio. Must total 100%.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Needs (Bills, Groceries, Rent)</span>
                  <span className="text-sm font-bold font-mono text-blue-600">{needsPercent}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={needsPercent}
                  onChange={(e) => setNeedsPercent(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="text-[11px] text-muted-foreground mt-1">
                  Projected: ₱{((monthlySalary * needsPercent) / 100).toLocaleString()}/month
                </div>
              </div>

              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Wants (Dining, Shopping, Fun)</span>
                  <span className="text-sm font-bold font-mono text-purple-600">{wantsPercent}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={wantsPercent}
                  onChange={(e) => setWantsPercent(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="text-[11px] text-muted-foreground mt-1">
                  Projected: ₱{((monthlySalary * wantsPercent) / 100).toLocaleString()}/month
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Savings & Investments</span>
                  <span className="text-sm font-bold font-mono text-emerald-600">{savingsPercent}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={savingsPercent}
                  onChange={(e) => setSavingsPercent(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="text-[11px] text-muted-foreground mt-1">
                  Projected: ₱{((monthlySalary * savingsPercent) / 100).toLocaleString()}/month
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-xl text-center text-xs font-bold ${
              totalPercent === 100
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-rose-500/10 text-rose-600"
            }`}>
              Total: {totalPercent}% {totalPercent !== 100 && "(Must equal 100%)"}
            </div>
          </div>
        )}

        {/* STEP 4: Starting Finances */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                Starting Cash & Wallets
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your current actual liquid money so PayWise can track real balances.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Cash on Hand
              </label>
              <CurrencyInput value={cashBalance} onChange={setCashBalance} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                GCash / Maya Balance
              </label>
              <CurrencyInput value={gcashBalance} onChange={setGcashBalance} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Bank / Payroll Account Balance
              </label>
              <CurrencyInput value={bankBalance} onChange={setBankBalance} />
            </div>
          </div>
        )}

        {/* STEP 5: Gemini AI Setup */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Google Gemini AI Assistant
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Optional: PayWise includes an intelligent financial companion powered by Google Gemini.
              </p>
            </div>

            <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-4 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-foreground">Enable Gemini Financial Assistant</span>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="h-4 w-4 accent-indigo-600 rounded"
                />
              </label>

              {aiEnabled && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Gemini API Key (Optional — or use server env)
                    </label>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy... (Leave empty if server configured)"
                      className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px]"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={shareContext}
                      onChange={(e) => setShareContext(e.target.checked)}
                      className="h-3.5 w-3.5 accent-indigo-600 rounded"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      Allow Gemini to reference my spending summary to answer &quot;Can I afford this?&quot;
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: Complete Overview */}
        {step === 6 && (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-2">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              You&apos;re All Set!
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Here is your configured financial baseline:
            </p>

            <div className="rounded-2xl border border-border bg-muted/20 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Net Salary:</span>
                <CurrencyDisplay amount={monthlySalary} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paydays:</span>
                <span className="font-semibold text-foreground">Day {p1Day} & Day {p2Day}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget Split:</span>
                <span className="font-semibold text-foreground">{needsPercent}% Needs / {wantsPercent}% Wants / {savingsPercent}% Savings</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starting Liquid Cash:</span>
                <CurrencyDisplay amount={cashBalance + gcashBalance + bankBalance} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gemini AI:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {aiEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
            >
              Enter PayWise Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Wizard Controls */}
        {step > 1 && step < 6 && (
          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 active:scale-95 min-h-[44px]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <button
              type="button"
              disabled={step === 3 && totalPercent !== 100}
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              Next Step
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
