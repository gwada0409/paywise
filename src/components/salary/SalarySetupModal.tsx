"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Calendar,
  Coins,
  Sparkles,
  Calculator,
  ChevronDown,
  Info,
  Banknote,
} from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { toast } from "sonner";

interface SalarySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHILIPPINE_SALARY_PRESETS = [
  { label: "₱25k / mo", net: 25000 },
  { label: "₱35k / mo", net: 35000 },
  { label: "₱50k / mo", net: 50000 },
  { label: "₱75k / mo", net: 75000 },
  { label: "₱100k / mo", net: 100000 },
];

export function SalarySetupModal({ isOpen, onClose }: SalarySetupModalProps) {
  const { salarySettings, updateSalarySettings } = useFinance();

  const [monthlyNet, setMonthlyNet] = useState<number>(salarySettings.monthly_net || 45000);
  const [isSemiMonthly, setIsSemiMonthly] = useState<boolean>(
    salarySettings.is_semi_monthly ?? true
  );
  const [p1Day, setP1Day] = useState<number>(salarySettings.payday_1_day || 15);
  const [p2Day, setP2Day] = useState<number>(salarySettings.payday_2_day || 30);
  const [p1Expected, setP1Expected] = useState<number>(
    salarySettings.payday_1_expected || Math.round((salarySettings.monthly_net || 45000) / 2)
  );
  const [p2Expected, setP2Expected] = useState<number>(
    salarySettings.payday_2_expected || Math.round((salarySettings.monthly_net || 45000) / 2)
  );

  // Optional Philippine Deductions Calculator
  const [showTaxCalculator, setShowTaxCalculator] = useState(false);
  const [grossSalary, setGrossSalary] = useState<number>(50000);

  useEffect(() => {
    if (isOpen) {
      setMonthlyNet(salarySettings.monthly_net || 45000);
      setIsSemiMonthly(salarySettings.is_semi_monthly ?? true);
      setP1Day(salarySettings.payday_1_day || 15);
      setP2Day(salarySettings.payday_2_day || 30);
      setP1Expected(salarySettings.payday_1_expected || Math.round((salarySettings.monthly_net || 45000) / 2));
      setP2Expected(salarySettings.payday_2_expected || Math.round((salarySettings.monthly_net || 45000) / 2));
    }
  }, [isOpen, salarySettings]);

  if (!isOpen) return null;

  // Simple Philippine statutory deductions estimation (SSS, PhilHealth, Pag-IBIG, TRAIN Tax)
  const calculateEstimatedNet = (gross: number) => {
    // SSS (approx max ~₱1,350 employee share)
    const sss = Math.min(1350, Math.max(500, gross * 0.045));
    // PhilHealth (5% split evenly = 2.5%, max cap ₱2,500 employee share)
    const philhealth = Math.min(2500, Math.max(250, gross * 0.025));
    // Pag-IBIG (₱200 standard cap)
    const pagibig = 200;

    const totalMandatory = sss + philhealth + pagibig;
    const taxableIncome = Math.max(0, gross - totalMandatory);

    // TRAIN law monthly tax brackets
    let tax = 0;
    if (taxableIncome > 666667) {
      tax = 200833.33 + (taxableIncome - 666667) * 0.35;
    } else if (taxableIncome > 166667) {
      tax = 40833.33 + (taxableIncome - 166667) * 0.30;
    } else if (taxableIncome > 66667) {
      tax = 10833.33 + (taxableIncome - 66667) * 0.25;
    } else if (taxableIncome > 33333) {
      tax = 2500 + (taxableIncome - 33333) * 0.20;
    } else if (taxableIncome > 20833) {
      tax = (taxableIncome - 20833) * 0.15;
    }

    const estimatedNet = Math.max(0, Math.round(gross - totalMandatory - tax));
    return { estimatedNet, sss, philhealth, pagibig, tax };
  };

  const handleApplyCalculatedGross = () => {
    const { estimatedNet } = calculateEstimatedNet(grossSalary);
    setMonthlyNet(estimatedNet);
    const half = Math.round(estimatedNet / 2);
    setP1Expected(half);
    setP2Expected(half);
    setShowTaxCalculator(false);
    toast.success(`Calculated take-home pay: ₱${estimatedNet.toLocaleString()}/month`);
  };

  const handleNetChange = (val: number) => {
    setMonthlyNet(val);
    const half = isSemiMonthly ? Math.round(val / 2) : val;
    setP1Expected(half);
    setP2Expected(isSemiMonthly ? half : 0);
  };

  const handleSave = () => {
    if (monthlyNet <= 0) {
      toast.error("Please enter a valid monthly take-home salary.");
      return;
    }

    updateSalarySettings({
      monthly_net: monthlyNet,
      is_semi_monthly: isSemiMonthly,
      payday_1_day: p1Day,
      payday_2_day: isSemiMonthly ? p2Day : 0,
      payday_1_expected: p1Expected,
      payday_2_expected: isSemiMonthly ? p2Expected : 0,
    });

    toast.success("Salary & Payday Schedule Saved!", {
      description: isSemiMonthly
        ? `₱${p1Expected.toLocaleString()} on the ${p1Day}th & ₱${p2Expected.toLocaleString()} on the ${p2Day}th.`
        : `₱${monthlyNet.toLocaleString()} monthly on day ${p1Day}.`,
    });

    onClose();
  };

  const calculatedDetails = calculateEstimatedNet(grossSalary);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none touch-manipulation">
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Set Salary & Payday Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Configure your take-home pay and cutoff dates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* 1. Monthly Net Pay */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Monthly Net Take-Home Salary
              </label>
              <button
                type="button"
                onClick={() => setShowTaxCalculator(!showTaxCalculator)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Calculator className="h-3 w-3" />
                {showTaxCalculator ? "Hide Calculator" : "Estimate from Gross"}
              </button>
            </div>

            <CurrencyInput
              value={monthlyNet}
              onChange={handleNetChange}
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 mr-1">Presets:</span>
              {PHILIPPINE_SALARY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleNetChange(preset.net)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                    monthlyNet === preset.net
                      ? "bg-primary text-white shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional TRAIN Law & Statutory Deductions Calculator Accordion */}
          {showTaxCalculator && (
            <div className="rounded-2xl border border-sky-200 dark:border-slate-700 bg-sky-50/50 dark:bg-slate-800/50 p-3.5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Calculator className="h-3.5 w-3.5" />
                Philippine Net Take-Home Calculator
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Gross Monthly Salary (before deductions)
                </label>
                <CurrencyInput
                  value={grossSalary}
                  onChange={(val) => setGrossSalary(val)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div>SSS Contribution: ₱{calculatedDetails.sss.toLocaleString()}</div>
                <div>PhilHealth: ₱{calculatedDetails.philhealth.toLocaleString()}</div>
                <div>Pag-IBIG: ₱{calculatedDetails.pagibig.toLocaleString()}</div>
                <div>Withholding Tax: ₱{calculatedDetails.tax.toLocaleString()}</div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Est. Net: ₱{calculatedDetails.estimatedNet.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={handleApplyCalculatedGross}
                  className="px-3 py-1 text-xs font-bold rounded-xl bg-primary text-white hover:opacity-90 cursor-pointer"
                >
                  Use This Net Salary
                </button>
              </div>
            </div>
          )}

          {/* 2. Frequency: Semi-Monthly vs Monthly */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Payday Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSemiMonthly(true);
                  const half = Math.round(monthlyNet / 2);
                  setP1Expected(half);
                  setP2Expected(half);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSemiMonthly
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-xs font-extrabold">Semi-Monthly (Bimonthly)</div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  15th & 30th (Standard in PH companies & BPOs)
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSemiMonthly(false);
                  setP1Expected(monthlyNet);
                  setP2Expected(0);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  !isSemiMonthly
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-xs font-extrabold">Monthly (Once a month)</div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  Single payday (e.g. 25th, end of month, or freelance)
                </div>
              </button>
            </div>
          </div>

          {/* 3. Payday Cutoff Dates & Expected Amounts */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Cutoff Paydays & Amounts
            </label>

            {isSemiMonthly ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1st Cutoff */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="text-xs font-extrabold text-primary flex items-center justify-between">
                    <span>1st Cutoff</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15">
                      Day {p1Day}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Payday Day of Month
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={p1Day}
                      onChange={(e) => setP1Day(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Expected Net Pay
                    </label>
                    <input
                      type="number"
                      value={p1Expected}
                      onChange={(e) => setP1Expected(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* 2nd Cutoff */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="text-xs font-extrabold text-primary flex items-center justify-between">
                    <span>2nd Cutoff</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15">
                      Day {p2Day}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Payday Day of Month
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={p2Day}
                      onChange={(e) => setP2Day(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Expected Net Pay
                    </label>
                    <input
                      type="number"
                      value={p2Expected}
                      onChange={(e) => setP2Expected(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div className="text-xs font-extrabold text-primary flex items-center justify-between">
                  <span>Monthly Payday</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15">
                    Day {p1Day}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    Payday Day of Month
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={p1Day}
                    onChange={(e) => setP1Day(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Summary Preview */}
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Daily Spending Benchmark
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              ~₱{Math.round(monthlyNet / 30).toLocaleString()} / day
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-end gap-2.5 shrink-0 pb-[max(env(safe-area-inset-bottom),1rem)]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial px-4 py-2.5 min-h-[44px] text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial px-5 py-2.5 min-h-[44px] text-xs font-extrabold rounded-2xl bg-primary text-white shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            Save Salary Settings
          </button>
        </div>
      </div>
    </div>
  );
}
