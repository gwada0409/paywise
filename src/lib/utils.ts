import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numerical amount to Philippine Peso (or given currency)
 * e.g. 15000 -> ₱15,000.00
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = "PHP",
  includeDecimals: boolean = true
): string {
  const numeric = typeof amount === "number" ? amount : Number(amount) || 0;
  const symbol = currency === "USD" ? "$" : "₱";
  
  const formatted = new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(numeric);

  return `${symbol}${formatted}`;
}

/**
 * Parse string or number to safe decimal rounded to 2 places
 */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Format ISO date string or Date to readable format (e.g. "Oct 15, 2026")
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";
  
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format to relative date (e.g. "Today", "Tomorrow", "In 3 days", "3 days ago")
 */
export function formatRelativeDays(targetDate: string | Date): string {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const now = new Date();
  
  // Set both to start of day for clean day difference
  const d1 = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = d1.getTime() - d2.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}
