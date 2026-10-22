"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Layers, Trash2 } from "lucide-react";
import { CurrencyInput } from "../common/CurrencyInput";
import { useFinance } from "@/lib/store/finance-context";
import { toast } from "sonner";

interface CategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: {
    category: string;
    type: "need" | "want";
    amount: number;
  } | null;
}

const COMMON_NEED_CATEGORIES = [
  "Rent",
  "Groceries",
  "Electricity",
  "Water",
  "Internet",
  "Transportation",
  "Healthcare",
  "Insurance",
  "Family Support",
  "Other Needs",
];

const COMMON_WANT_CATEGORIES = [
  "Dining Out",
  "Online Shopping",
  "Coffee & Milk Tea",
  "Subscriptions",
  "Entertainment",
  "Travel",
  "Gadgets",
  "Gaming",
  "Hobbies",
  "Other Wants",
];

export function CategoryBudgetModal({
  isOpen,
  onClose,
  categoryToEdit,
}: CategoryBudgetModalProps) {
  const { updateCategoryAllocation, removeCategoryAllocation } = useFinance();

  const [categoryName, setCategoryName] = useState("");
  const [type, setType] = useState<"need" | "want">("need");
  const [amount, setAmount] = useState<number>(3000);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setCategoryName(categoryToEdit.category);
      setType(categoryToEdit.type);
      setAmount(categoryToEdit.amount);
      const isPreset =
        categoryToEdit.type === "need"
          ? COMMON_NEED_CATEGORIES.includes(categoryToEdit.category)
          : COMMON_WANT_CATEGORIES.includes(categoryToEdit.category);
      setIsCustomCategory(!isPreset);
    } else {
      setCategoryName("Groceries");
      setType("need");
      setAmount(4000);
      setIsCustomCategory(false);
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = categoryName.trim();
    if (!finalName) {
      toast.error("Please specify a category name");
      return;
    }
    if (amount <= 0) {
      toast.error("Please enter a valid monthly allocation amount");
      return;
    }

    updateCategoryAllocation(finalName, amount);
    toast.success(`Allocated ₱${amount.toLocaleString()} / mo to ${finalName}`);
    onClose();
  };

  const handleDelete = () => {
    if (!categoryToEdit) return;
    removeCategoryAllocation(categoryToEdit.category);
    toast.info(`Removed allocation for ${categoryToEdit.category}`);
    onClose();
  };

  const activePresets = type === "need" ? COMMON_NEED_CATEGORIES : COMMON_WANT_CATEGORIES;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200 select-none touch-manipulation cursor-pointer"
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto pb-safe cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ref-blue/10 text-ref-blue">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {categoryToEdit ? "Edit Category Budget" : "Custom Category Allocation"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Set a specific monthly budget limit for this category.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 active:opacity-75 touch-manipulation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Pillar Switcher: Need vs Want */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Category Pillar
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType("need");
                  if (!isCustomCategory) setCategoryName(COMMON_NEED_CATEGORIES[0]);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors touch-manipulation cursor-pointer ${
                  type === "need"
                    ? "bg-ref-blue text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                Need (Essential)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("want");
                  if (!isCustomCategory) setCategoryName(COMMON_WANT_CATEGORIES[0]);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors touch-manipulation cursor-pointer ${
                  type === "want"
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                Want (Discretionary)
              </button>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Category Name
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(!isCustomCategory);
                  if (!isCustomCategory) {
                    setCategoryName("");
                  } else {
                    setCategoryName(activePresets[0]);
                  }
                }}
                className="text-xs font-semibold text-ref-blue hover:underline touch-manipulation cursor-pointer"
              >
                {isCustomCategory ? "Choose from list" : "+ Custom name"}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Gym Membership, Pet Food, Gas"
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ref-blue min-h-[44px]"
              />
            ) : (
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ref-blue min-h-[44px]"
              >
                {activePresets.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Monthly Budget Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Monthly Budget Allocation (₱)
            </label>
            <CurrencyInput
              value={amount}
              onChange={(val) => setAmount(val)}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Equivalent to ≈ ₱{Math.round(amount / 2).toLocaleString()} per semi-monthly cutoff.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            {categoryToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors touch-manipulation cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/50 transition-colors touch-manipulation cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-ref-blue px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-ref-blue/90 active:opacity-75 transition-opacity touch-manipulation cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Save Allocation
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
