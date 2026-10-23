"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  X,
  Check,
  AlertCircle,
  FileText,
  CreditCard,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { TransactionType, PaymentMethod } from "@/types";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface ScannedData {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  payment_method: PaymentMethod;
  date: string;
  reference_number: string | null;
  raw_summary: string;
  model_used?: string;
}

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTransaction?: (data: ScannedData) => void;
}

export function ReceiptScannerModal({
  isOpen,
  onClose,
  onApplyTransaction,
}: ReceiptScannerModalProps) {
  const { addTransaction, accounts, clientApiKey } = useFinance();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [customCategory, setCustomCategory] = useState<string>("");
  const [customType, setCustomType] = useState<TransactionType>("want");
  const [customMethod, setCustomMethod] = useState<PaymentMethod>("gcash");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync default account
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Support pasting image from clipboard anywhere while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            toast.success("Image pasted from clipboard!");
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large. Max size is 10MB.");
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setScannedData(null);
      // Auto-trigger scan
      scanImage(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const scanImage = async (base64Img: string, typeStr: string) => {
    setIsScanning(true);
    setScannedData(null);

    try {
      const res = await fetch("/api/ai/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Img,
          mimeType: typeStr,
          clientApiKey,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to scan receipt image.");
      }

      const data: ScannedData = json.data;
      setScannedData(data);
      setCustomTitle(data.title);
      setCustomAmount(data.amount);
      setCustomCategory(data.category);
      setCustomType(data.type);
      setCustomMethod(data.payment_method);

      // Best effort matching payment method to an account
      const matchedAccount = accounts.find((a) => {
        const accType = a.type.toLowerCase();
        const accName = a.name.toLowerCase();
        if (data.payment_method === "gcash" && (accType === "ewallet" || accName.includes("gcash"))) return true;
        if (data.payment_method === "maya" && (accType === "ewallet" || accName.includes("maya"))) return true;
        if (data.payment_method === "bank" && accType === "bank") return true;
        if (data.payment_method === "credit_card" && accType === "credit") return true;
        if (data.payment_method === "cash" && accType === "cash") return true;
        return false;
      });

      if (matchedAccount) {
        setSelectedAccountId(matchedAccount.id);
      }

      toast.success("Receipt scanned successfully!", {
        description: `${data.title} • ₱${data.amount.toLocaleString()}`,
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to parse receipt. Please verify image clarity.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveTransaction = () => {
    if (customAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!customTitle.trim()) {
      toast.error("Please enter a merchant or description.");
      return;
    }

    const targetAccount = selectedAccountId || accounts[0]?.id;

    addTransaction({
      title: customTitle.trim(),
      amount: customAmount,
      type: customType,
      category: customCategory || "Dining Out",
      payment_method: customMethod,
      account_id: targetAccount,
      date: scannedData?.date || new Date().toISOString().split("T")[0],
      notes: scannedData?.reference_number
        ? `Ref: ${scannedData.reference_number}`
        : scannedData?.raw_summary || undefined,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });

    toast.success("Transaction added to records!");
    handleClose();
  };

  const handleClose = () => {
    setImagePreview(null);
    setScannedData(null);
    setIsScanning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                Scan Receipt / Screenshot
                <span className="flex items-center gap-1 rounded-full bg-ai-rainbow px-2 py-0.5 text-[10px] font-extrabold text-white">
                  <Sparkles className="h-3 w-3" />
                  Gemini Vision
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                GCash, Maya, ShopeePay, or physical store receipts
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* File Picker / Dropzone */}
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 p-8 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                <Upload className="h-7 w-7" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Tap to upload or take a photo
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Supports GCash & Maya transfer screenshots, food delivery, and supermarket receipts.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground font-mono bg-muted/60 px-3 py-1.5 rounded-xl border border-border">
                <span>Tip: You can also press <strong>Ctrl+V</strong> to paste a screenshot directly</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview with Scanner Line Animation */}
              <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-950 flex items-center justify-center max-h-56">
                <img
                  src={imagePreview}
                  alt="Receipt Preview"
                  className="w-full h-auto max-h-56 object-contain"
                />

                {isScanning && (
                  <div className="absolute inset-0 bg-sky-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                    {/* Glowing animated scanner beam */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/40 shadow-lg">
                      <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                      <span className="text-xs font-semibold text-cyan-200">
                        Analyzing GCash / Maya Details...
                      </span>
                    </div>
                  </div>
                )}

                {!isScanning && (
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setScannedData(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Scanned & Extracted Form */}
              {scannedData && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Extracted Transaction
                    </span>
                    {scannedData.reference_number && (
                      <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        Ref: {scannedData.reference_number}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Merchant / Title */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Merchant / Recipient
                      </label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Amount (PHP)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-sm font-bold text-muted-foreground">
                          ₱
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={customAmount || ""}
                          onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Type */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Pillar
                      </label>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value as TransactionType)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 capitalize font-medium"
                      >
                        <option value="need">Need (Essential)</option>
                        <option value="want">Want (Lifestyle)</option>
                        <option value="bill_payment">Bill Payment</option>
                        <option value="income">Income / Cash-in</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Payment Method
                      </label>
                      <select
                        value={customMethod}
                        onChange={(e) => setCustomMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase font-medium"
                      >
                        <option value="gcash">GCash</option>
                        <option value="maya">Maya</option>
                        <option value="bank">Bank</option>
                        <option value="credit_card">Card</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                  </div>

                  {/* Account Selector */}
                  {accounts.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Deduct From Account
                      </label>
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.type.toUpperCase()}) — ₱{acc.balance.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Raw Summary */}
                  {scannedData.raw_summary && (
                    <p className="text-[11px] text-muted-foreground italic bg-muted/30 p-2.5 rounded-xl border border-border/50">
                      💡 {scannedData.raw_summary}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>

          {scannedData ? (
            <button
              type="button"
              onClick={handleSaveTransaction}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md shadow-sky-500/25 active:scale-95 transition-all"
            >
              <Check className="h-4 w-4" />
              Save Transaction
            </button>
          ) : imagePreview && !isScanning ? (
            <button
              type="button"
              onClick={() => scanImage(imagePreview, mimeType)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-md active:scale-95 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Scan Again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
