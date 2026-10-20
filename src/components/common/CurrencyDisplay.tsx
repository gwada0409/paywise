import React from "react";
import { formatCurrency } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number | string | null | undefined;
  currency?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  className?: string;
  colored?: boolean; // if positive -> green, negative -> red
  type?: "income" | "expense" | "neutral";
  includeDecimals?: boolean;
}

export function CurrencyDisplay({
  amount,
  currency = "PHP",
  size = "base",
  weight = "semibold",
  className = "",
  colored = false,
  type = "neutral",
  includeDecimals = true,
}: CurrencyDisplayProps) {
  const numeric = typeof amount === "number" ? amount : Number(amount) || 0;
  const formatted = formatCurrency(numeric, currency, includeDecimals);

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl tracking-tight",
    "3xl": "text-3xl tracking-tight",
    "4xl": "text-4xl sm:text-5xl tracking-tight font-extrabold",
  }[size];

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  }[weight];

  let colorClass = "text-foreground";
  if (colored || type !== "neutral") {
    if (type === "income" || (colored && numeric > 0)) {
      colorClass = "text-emerald-600 dark:text-emerald-400";
    } else if (type === "expense" || (colored && numeric < 0)) {
      colorClass = "text-rose-600 dark:text-rose-400";
    }
  }

  return (
    <span className={`inline-flex items-baseline font-mono ${sizeClasses} ${weightClasses} ${colorClass} ${className}`}>
      {type === "income" && !formatted.startsWith("+") && "+"}
      {formatted}
    </span>
  );
}
