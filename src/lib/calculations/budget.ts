import { BudgetRules, BudgetSummary, FinancialTransaction, SavingsMovement } from "@/types";
import { roundMoney } from "../utils";

export interface BudgetThresholdAlert {
  type: "needs" | "wants";
  percentage: number;
  spent: number;
  allocated: number;
  message: string;
  severity: "info" | "warning" | "danger";
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
