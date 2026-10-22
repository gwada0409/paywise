import { BudgetRules, BudgetSummary, FinancialTransaction, SavingsMovement, NeedCategory, WantCategory } from "@/types";
import { roundMoney } from "../utils";

export interface BudgetThresholdAlert {
  type: "needs" | "wants";
  percentage: number;
  spent: number;
  allocated: number;
  message: string;
  severity: "info" | "warning" | "danger";
}

export const BUDGET_PRESETS = {
  "50/30/20": {
    name: "Balanced Standard",
    description: "Classic benchmark: 50% Needs, 30% Wants, 20% Savings.",
    needs: 50,
    wants: 30,
    savings: 20,
  },
  "60/20/20": {
    name: "Metro Manila / High Needs",
    description: "Accounts for higher rent and commuting costs in Philippine cities.",
    needs: 60,
    wants: 20,
    savings: 20,
  },
  "70/20/10": {
    name: "Conservative / Tight",
    description: "Focus on primary essentials during periods of tight cashflow.",
    needs: 70,
    wants: 20,
    savings: 10,
  },
  "40/30/30": {
    name: "Aggressive Saver / FIRE",
    description: "Accelerate emergency fund and long-term financial independence.",
    needs: 40,
    wants: 30,
    savings: 30,
  },
} as const;

export const DEFAULT_CATEGORY_ALLOCATIONS: Record<string, number> = {
  Groceries: 6000,
  Rent: 8000,
  Electricity: 2500,
  Water: 600,
  Internet: 1500,
  Transportation: 2500,
  Healthcare: 1000,
  "Dining Out": 3000,
  "Online Shopping": 2000,
  "Coffee & Milk Tea": 1000,
  Subscriptions: 800,
  Entertainment: 1200,
};

export interface CategoryProgress {
  category: string;
  type: "need" | "want";
  spent: number;
  allocated: number;
  remaining: number;
  percentage: number;
  isOverLimit: boolean;
}

/**
 * Calculates budget split (50/30/20 default or custom) for a given income amount.
 */
export function calculateBudgetAllocation(
  incomeAmount: number,
  rules: BudgetRules = { needs_percent: 50, wants_percent: 30, savings_percent: 20 }
) {
  const needs = roundMoney((incomeAmount * (rules.needs_percent || 50)) / 100);
  const wants = roundMoney((incomeAmount * (rules.wants_percent || 30)) / 100);
  const savings = roundMoney(incomeAmount - needs - wants); // Ensure exact total matching

  return {
    needs,
    wants,
    savings,
    total: incomeAmount,
  };
}

/**
 * Computes full budget summary including actual expenditures and remaining balances.
 */
export function calculateBudgetSummary(
  incomeBase: number,
  rules: BudgetRules,
  transactions: FinancialTransaction[],
  savingsMovements: SavingsMovement[] = []
): BudgetSummary {
  const allocation = calculateBudgetAllocation(incomeBase, rules);

  let spentNeeds = 0;
  let spentWants = 0;

  for (const tx of transactions) {
    if (tx.type === "need" || (tx.type === "bill_payment" && tx.category !== "Wants")) {
      spentNeeds += tx.amount;
    } else if (tx.type === "want") {
      spentWants += tx.amount;
    }
  }

  // Net savings saved in this period
  let savedAmount = 0;
  for (const sm of savingsMovements) {
    if (sm.type === "deposit") {
      savedAmount += sm.amount;
    } else if (sm.type === "withdrawal") {
      savedAmount -= sm.amount;
    }
  }
  // Also account for direct savings_transfer transactions if any
  for (const tx of transactions) {
    if (tx.type === "savings_transfer") {
      savedAmount += tx.amount;
    }
  }

  spentNeeds = roundMoney(spentNeeds);
  spentWants = roundMoney(spentWants);
  savedAmount = roundMoney(Math.max(0, savedAmount));

  const remainingNeeds = roundMoney(allocation.needs - spentNeeds);
  const remainingWants = roundMoney(allocation.wants - spentWants);
  const remainingSavings = roundMoney(allocation.savings - savedAmount);

  const percentNeeds = allocation.needs > 0 ? Math.round((spentNeeds / allocation.needs) * 100) : 0;
  const percentWants = allocation.wants > 0 ? Math.round((spentWants / allocation.wants) * 100) : 0;
  const percentSavings = allocation.savings > 0 ? Math.round((savedAmount / allocation.savings) * 100) : 0;

  return {
    allocated_needs: allocation.needs,
    allocated_wants: allocation.wants,
    allocated_savings: allocation.savings,
    spent_needs: spentNeeds,
    spent_wants: spentWants,
    saved_amount: savedAmount,
    remaining_needs: remainingNeeds,
    remaining_wants: remainingWants,
    remaining_savings: remainingSavings,
    percent_needs: percentNeeds,
    percent_wants: percentWants,
    percent_savings: percentSavings,
  };
}

/**
 * Checks for 80%, 90%, 100% budget threshold alerts
 */
export function checkBudgetThresholdAlerts(
  summary: BudgetSummary,
  rules: BudgetRules
): BudgetThresholdAlert[] {
  const alerts: BudgetThresholdAlert[] = [];

  const checkCategory = (
    name: "needs" | "wants",
    spent: number,
    allocated: number,
    percent: number
  ) => {
    if (allocated <= 0) return;

    if (rules.alert_threshold_100 && percent >= 100) {
      alerts.push({
        type: name,
        percentage: percent,
        spent,
        allocated,
        severity: "danger",
        message: `You have reached 100% of your ${name.toUpperCase()} budget (₱${spent.toLocaleString()} / ₱${allocated.toLocaleString()}).`,
      });
    } else if (rules.alert_threshold_90 && percent >= 90) {
      alerts.push({
        type: name,
        percentage: percent,
        spent,
        allocated,
        severity: "warning",
        message: `You have used ${percent}% of your ${name.toUpperCase()} budget. Careful with additional spending.`,
      });
    } else if (rules.alert_threshold_80 && percent >= 80) {
      alerts.push({
        type: name,
        percentage: percent,
        spent,
        allocated,
        severity: "info",
        message: `You're at ${percent}% of your ${name.toUpperCase()} budget.`,
      });
    }
  };

  checkCategory("needs", summary.spent_needs, summary.allocated_needs, summary.percent_needs);
  checkCategory("wants", summary.spent_wants, summary.allocated_wants, summary.percent_wants);

  return alerts;
}

/**
 * Calculates per-category spent vs allocated amounts based on custom allocations.
 */
export function calculateCategoryProgressList(
  transactions: FinancialTransaction[],
  categoryAllocations: Record<string, number> = DEFAULT_CATEGORY_ALLOCATIONS,
  multiplier: number = 1
): CategoryProgress[] {
  // Aggregate transactions by category
  const spentMap: Record<string, { spent: number; type: "need" | "want" }> = {};

  for (const tx of transactions) {
    if (tx.type === "need" || tx.type === "bill_payment" || tx.type === "want") {
      const type = tx.type === "want" ? "want" : "need";
      if (!spentMap[tx.category]) {
        spentMap[tx.category] = { spent: 0, type };
      }
      spentMap[tx.category].spent += tx.amount;
    }
  }

  // Known categories combining allocations and spent
  const allCategories = Array.from(
    new Set([...Object.keys(categoryAllocations), ...Object.keys(spentMap)])
  );

  const WANT_KEYWORDS = [
    "dining", "food delivery", "restaurant", "shopping", "coffee", "milk tea",
    "subscription", "entertainment", "gaming", "gadget", "travel", "hobbies",
    "wants"
  ];

  return allCategories.map((cat) => {
    const rawAllocated = categoryAllocations[cat] ?? 1000;
    const allocated = roundMoney(rawAllocated * multiplier);
    const spentData = spentMap[cat];
    const spent = roundMoney(spentData?.spent ?? 0);
    const isWant =
      spentData?.type === "want" ||
      WANT_KEYWORDS.some((kw) => cat.toLowerCase().includes(kw));

    const remaining = roundMoney(allocated - spent);
    const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

    return {
      category: cat,
      type: isWant ? "want" : "need",
      spent,
      allocated,
      remaining,
      percentage,
      isOverLimit: spent > allocated,
    };
  });
}
