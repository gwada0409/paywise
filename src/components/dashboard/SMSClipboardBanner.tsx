"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardCopy,
  Check,
  X,
  Zap,
  ArrowRight,
  Sparkles,
  Smartphone,
  ChevronDown,
  Edit2,
} from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import {
  parsePhilippinePaymentSMS,
  ParsedPaymentSMS,
} from "@/lib/parsers/ph-sms-parser";
import { TransactionType, PaymentMethod } from "@/types";
import { toast } from "sonner";

interface SMSClipboardBannerProps {
  onOpenAddTx?: (prefill: {
    amount: number;
    description: string;
    category: string;
    account_id?: string;
    payment_method?: string;
  }) => void;
  isOpenExplicitly?: boolean;
  onClose?: () => void;
}

export function SMSClipboardBanner({
  onOpenAddTx,
  isOpenExplicitly = false,
  onClose,
}: SMSClipboardBannerProps) {
  const { accounts, addTransaction } = useFinance();
  const [parsedSMS, setParsedSMS] = useState<ParsedPaymentSMS | null>(null);
  const [manualText, setManualText] = useState("");
  const [isManualInputOpen, setIsManualInputOpen] = useState(isOpenExplicitly);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<TransactionType>("need");
  const [lastDismissedText, setLastDismissedText] = useState<string>("");

  useEffect(() => {
    if (isOpenExplicitly) {
      setIsManualInputOpen(true);
    }
  }, [isOpenExplicitly]);

  // Try to inspect clipboard on user interaction or mount
  const checkClipboard = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        setIsManualInputOpen(true);
        return;
      }
      const clipText = await navigator.clipboard.readText();
      if (!clipText || clipText === lastDismissedText) {
        setIsManualInputOpen(true);
        return;
      }

      const parsed = parsePhilippinePaymentSMS(clipText);
      if (parsed) {
        setParsedSMS(parsed);
        // Find matching account
        const match = accounts.find((a) =>
          a.name.toLowerCase().includes(parsed.source.toLowerCase())
        );
        if (match) setSelectedAccountId(match.id);
        else if (accounts[0]) setSelectedAccountId(accounts[0].id);
        toast.info(`Detected ${parsed.source} payment: ₱${parsed.amount.toLocaleString()}`);
      } else {
        setIsManualInputOpen(true);
      }
    } catch {
      // Clipboard permission denied or unavailable
      setIsManualInputOpen(true);
    }
  };

  const handleManualParse = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualText.trim()) return;

    const parsed = parsePhilippinePaymentSMS(manualText);
    if (parsed) {
      setParsedSMS(parsed);
      const match = accounts.find((a) =>
        a.name.toLowerCase().includes(parsed.source.toLowerCase())
      );
      if (match) setSelectedAccountId(match.id);
      else if (accounts[0]) setSelectedAccountId(accounts[0].id);
      toast.success(`Successfully parsed ${parsed.source} payment!`);
    } else {
      toast.error("Could not recognize payment format. Enter details manually or check SMS text.");
    }
  };

  const handle1TapLog = () => {
    if (!parsedSMS) return;

    const matchedAccount = accounts.find((a) => a.id === selectedAccountId);
    let paymentMethod: PaymentMethod = "other";
    const srcLower = parsedSMS.source.toLowerCase();
    if (srcLower === "gcash") paymentMethod = "gcash";
    else if (srcLower === "maya") paymentMethod = "maya";
    else if (
      srcLower === "bpi" ||
      srcLower === "bdo" ||
      srcLower === "unionbank" ||
      srcLower === "seabank" ||
      srcLower === "gotyme"
    )
      paymentMethod = "bank";
    else if (srcLower === "cash") paymentMethod = "cash";

    addTransaction({
      amount: parsedSMS.amount,
      title: parsedSMS.merchantOrRecipient,
      category: parsedSMS.category,
      type: selectedType,
      date: new Date().toISOString().split("T")[0],
      account_id: matchedAccount?.id,
      payment_method: paymentMethod,
      notes: parsedSMS.referenceNo
        ? `Ref: ${parsedSMS.referenceNo} (Logged via SMS Fast-Logger)`
        : "Logged via SMS Fast-Logger",
    });

    toast.success(
      `Logged ₱${parsedSMS.amount.toLocaleString()} to ${parsedSMS.merchantOrRecipient}!`,
      {
        description: `Charged to ${matchedAccount?.name || paymentMethod} • ${parsedSMS.category}`,
      }
    );

    setLastDismissedText(parsedSMS.rawText);
    setParsedSMS(null);
    setManualText("");
    setIsManualInputOpen(false);
    if (onClose) onClose();
  };

  const handleOpenInFullForm = () => {
    if (!parsedSMS) return;
    if (onOpenAddTx) {
      onOpenAddTx({
        amount: parsedSMS.amount,
        description: parsedSMS.merchantOrRecipient,
        category: parsedSMS.category,
        account_id: selectedAccountId,
        payment_method: parsedSMS.source,
      });
    }
    setParsedSMS(null);
    setIsManualInputOpen(false);
    if (onClose) onClose();
  };

  const handleDismiss = () => {
    if (parsedSMS) {
      setLastDismissedText(parsedSMS.rawText);
    }
    setParsedSMS(null);
    setIsManualInputOpen(false);
    if (onClose) onClose();
  };

  // If there's an active detected SMS: Show the 1-Tap Log Banner
  if (parsedSMS) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-sky-400/40 bg-gradient-to-r from-sky-500/10 via-sky-600/5 to-primary/10 dark:from-sky-950/60 dark:to-slate-900/80 p-4 shadow-sm animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-xs">
              <Zap className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-extrabold text-primary uppercase tracking-wider">
                  {parsedSMS.source} SMS Detected
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Ready to log
                </span>
              </div>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                  ₱{parsedSMS.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[160px] sm:max-w-xs">
                  {parsedSMS.merchantOrRecipient}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-medium text-slate-600 dark:text-slate-300">
                  🏷️ {parsedSMS.category}
                </span>

                {/* Account Selector Pill */}
                {accounts.length > 0 && (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 border-none focus:ring-1 focus:ring-primary outline-hidden cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        💳 {acc.name} (₱{acc.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                )}

                {/* Need vs Want toggle */}
                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedType("need")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      selectedType === "need"
                        ? "bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-2xs"
                        : "text-slate-500"
                    }`}
                  >
                    Need
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType("want")}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      selectedType === "want"
                        ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-2xs"
                        : "text-slate-500"
                    }`}
                  >
                    Want
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 active:scale-95 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-sky-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={handle1TapLog}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 min-h-[44px] text-xs font-extrabold text-white shadow-xs hover:opacity-95 active:scale-98 transition-all cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            1-Tap Log Expense
          </button>

          <button
            type="button"
            onClick={handleOpenInFullForm}
            className="flex items-center justify-center gap-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 min-h-[44px] text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 active:scale-98 transition-all cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      </div>
    );
  }

  // If manual input is opened
  if (isManualInputOpen) {
    return (
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-4 shadow-xs space-y-3 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardCopy className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                GCash / Maya SMS Fast-Logger
              </h4>
              <p className="text-[10px] text-slate-500">
                Paste payment SMS from GCash, Maya, or BPI to log in 1 tap
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsManualInputOpen(false);
              if (onClose) onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleManualParse} className="space-y-2.5">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Paste SMS here e.g. 'You have paid PHP 245.00 of GCash to JOLLIBEE on 10/23/2026. Ref. No. 12345...'"
            rows={2}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={checkClipboard}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <ClipboardCopy className="h-3 w-3" />
              Paste from Clipboard
            </button>

            <button
              type="submit"
              disabled={!manualText.trim()}
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:opacity-95 disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
            >
              Parse & Log
            </button>
          </div>
        </form>

        {/* Quick Sample Prompts */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Try sample: </span>
          <button
            type="button"
            onClick={() => {
              setManualText(
                "You have paid PHP 245.00 of GCash to JOLLIBEE FOODS on 10/23/2026. Ref. No. 98127391."
              );
            }}
            className="underline hover:text-primary mr-2"
          >
            GCash Jollibee ₱245
          </button>
          <button
            type="button"
            onClick={() => {
              setManualText(
                "You paid PHP 350.00 to Grab Philippines via Maya on 10/23/2026. Ref: MAYA-882199."
              );
            }}
            className="underline hover:text-primary"
          >
            Maya Grab ₱350
          </button>
        </div>
      </div>
    );
  }

  // Collapsed quick trigger pill
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-sky-50 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-800 px-3.5 py-2.5 min-h-[48px]">
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
          Copied a GCash or Maya payment?
        </span>
      </div>
      <button
        type="button"
        onClick={checkClipboard}
        className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-slate-700 px-3 py-1.5 min-h-[38px] text-xs font-extrabold text-primary shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shrink-0"
      >
        <ClipboardCopy className="h-3.5 w-3.5" />
        1-Tap Fast-Log
      </button>
    </div>
  );
}
