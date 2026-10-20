import {
  SalarySettings,
  BudgetRules,
  FinancialAccount,
  FinancialTransaction,
  IncomeRecord,
  SavingsGoal,
  SavingsMovement,
  Bill,
  Loan,
  FinancialContextSummary,
  AffordabilityAnalysis,
} from "@/types";
import { calculateNextPayday, getCurrentPaydayDateRange } from "../calculations/payday";
import { calculateSpendableBalance, calculateIncomeReceivedForMonth } from "../calculations/finance";
import { calculateBudgetSummary } from "../calculations/budget";
import { roundMoney } from "../utils";

export interface CompleteFinancialDataset {
  salarySettings: SalarySettings;
  budgetRules: BudgetRules;
  accounts: FinancialAccount[];
  transactions: FinancialTransaction[];
  incomeRecords: IncomeRecord[];
  savingsGoals: SavingsGoal[];
  savingsMovements: SavingsMovement[];
  bills: Bill[];
  loans: Loan[];
}

/**
 * Builds the compact, structured financial summary sent safely to the AI assistant.
 * Strict privacy: no account numbers, passwords, or unrelated personal info.
 */
export function buildFinancialContextSummary(
  dataset: CompleteFinancialDataset,
  refDate: Date = new Date()
): FinancialContextSummary {
  const {
    salarySettings,
    budgetRules,
    accounts,
    transactions,
    incomeRecords,
    savingsGoals,
    savingsMovements,
    bills,
    loans,
  } = dataset;

  const nextPayday = calculateNextPayday(salarySettings, refDate);
  const currentPaydayRange = getCurrentPaydayDateRange(salarySettings, refDate);

  // Filter bills due before the next payday that are still unpaid
  const upcomingBills = bills.filter((b) => b.status !== "paid");
  const upcomingBillsTotal = upcomingBills.reduce((sum, b) => sum + b.amount, 0);

  // Spendable balance
  const balanceBreakdown = calculateSpendableBalance(accounts, upcomingBills);

  // Income received this month
  const incomeReceivedMonth = calculateIncomeReceivedForMonth(
    incomeRecords,
    refDate.getFullYear(),
    refDate.getMonth()
  );

  // Budget calculations
  const budgetSummary = calculateBudgetSummary(
    incomeReceivedMonth > 0 ? incomeReceivedMonth : salarySettings.monthly_net,
    budgetRules,
    transactions,
    savingsMovements
  );

  // Total savings across all goals
  const totalSavings = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);

  // Outstanding debt
  const outstandingDebt = loans
    .filter((l) => !l.is_archived && l.current_balance > 0)
    .reduce((sum, l) => sum + l.current_balance, 0);

  // Recent expenses (last 5)
  const recentExpenses = transactions
    .filter((t) => t.type === "need" || t.type === "want" || t.type === "bill_payment")
    .slice(0, 5)
    .map((t) => ({
      title: t.title,
      amount: t.amount,
      category: t.category,
      date: t.date,
    }));

  return {
    currency: "PHP",
    timestamp: new Date().toISOString(),
    monthly_expected_salary: salarySettings.monthly_net,
    monthly_income_received: incomeReceivedMonth,
    total_cash_liquid_balance: balanceBreakdown.liquidCashTotal,
    available_spendable_balance: balanceBreakdown.availableToSpend,
    needs_spent: budgetSummary.spent_needs,
    wants_spent: budgetSummary.spent_wants,
    savings_total: totalSavings,
    upcoming_unpaid_bills_total: roundMoney(upcomingBillsTotal),
    upcoming_bills_count: upcomingBills.length,
    outstanding_debt_total: roundMoney(outstandingDebt),
    next_payday_date: nextPayday.isoDate,
    days_until_next_payday: nextPayday.daysRemaining,
    current_payday_period: currentPaydayRange.period,
    budget_needs_remaining: budgetSummary.remaining_needs,
    budget_wants_remaining: budgetSummary.remaining_wants,
    recent_expenses: recentExpenses,
    upcoming_bills: upcomingBills.slice(0, 5).map((b) => ({
      name: b.name,
      amount: b.amount,
      due_day: b.due_day,
      status: b.status,
    })),
  };
}

/**
 * Deterministic Purchase Affordability Analyzer
 * Analyzes whether the user can afford a purchase based on actual cash, bills, and wants budget.
 */
export function analyzePurchaseAffordability(
  purchaseName: string,
  purchaseAmount: number,
  dataset: CompleteFinancialDataset,
  refDate: Date = new Date()
): AffordabilityAnalysis {
  const summary = buildFinancialContextSummary(dataset, refDate);
  const purchase = roundMoney(purchaseAmount);

  const availableCash = summary.total_cash_liquid_balance;
  const upcomingBills = summary.upcoming_unpaid_bills_total;
  const cashAfterBills = roundMoney(availableCash - upcomingBills);
  const cashAfterPurchaseAndBills = roundMoney(cashAfterBills - purchase);

  const wantsRemaining = summary.budget_wants_remaining;
  const wantsAfterPurchase = roundMoney(wantsRemaining - purchase);

  const recommendations: string[] = [];
  let verdict: "safe" | "caution" | "not_recommended" = "safe";
  let canAfford = true;
  let reasoning = "";

  if (cashAfterPurchaseAndBills < 0) {
    verdict = "not_recommended";
    canAfford = false;
    reasoning = `Making this purchase of ₱${purchase.toLocaleString()} will cause a cash deficit of ₱${Math.abs(cashAfterPurchaseAndBills).toLocaleString()} after paying your upcoming bills (₱${upcomingBills.toLocaleString()}).`;
    recommendations.push("Postpone this purchase until after your next payday.");
    recommendations.push(`Prioritize paying upcoming bills worth ₱${upcomingBills.toLocaleString()} first.`);
  } else if (cashAfterPurchaseAndBills < 1000) {
    verdict = "caution";
    canAfford = true;
    reasoning = `You technically have enough cash, but after this purchase and your upcoming bills (₱${upcomingBills.toLocaleString()}), you will have only ₱${cashAfterPurchaseAndBills.toLocaleString()} left to last ${summary.days_until_next_payday} days until payday.`;
    recommendations.push(`Keep an emergency buffer for daily food and transport until next payday on ${summary.next_payday_date}.`);
    if (wantsAfterPurchase < 0) {
      recommendations.push(`This will exceed your planned Wants budget by ₱${Math.abs(wantsAfterPurchase).toLocaleString()}.`);
    }
  } else {
    if (wantsAfterPurchase < 0) {
      verdict = "caution";
      canAfford = true;
      reasoning = `You have sufficient cash (₱${cashAfterPurchaseAndBills.toLocaleString()} left after bills), but this purchase exceeds your remaining Wants budget by ₱${Math.abs(wantsAfterPurchase).toLocaleString()}.`;
      recommendations.push("Consider offsetting this purchase by trimming other discretionary spending this cycle.");
    } else {
      verdict = "safe";
      canAfford = true;
      reasoning = `You can afford this ₱${purchase.toLocaleString()} purchase comfortably. You will maintain ₱${cashAfterPurchaseAndBills.toLocaleString()} in liquid cash after paying all upcoming bills, and remain within your Wants budget.`;
      recommendations.push(`You have ${summary.days_until_next_payday} days until next payday (${summary.next_payday_date}).`);
    }
  }

  return {
    purchase_name: purchaseName,
    purchase_amount: purchase,
    can_afford: canAfford,
    available_cash: availableCash,
    upcoming_bills_before_payday: upcomingBills,
    cash_after_bills: cashAfterBills,
    cash_after_purchase_and_bills: cashAfterPurchaseAndBills,
    wants_budget_remaining: wantsRemaining,
    wants_budget_after_purchase: wantsAfterPurchase,
    verdict,
    reasoning,
    recommendations,
  };
}
