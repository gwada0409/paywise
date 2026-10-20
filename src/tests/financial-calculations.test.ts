import { describe, it, expect } from "vitest";
import {
  getEffectivePayday,
  calculateNextPayday,
  getCurrentPaydayDateRange,
} from "../lib/calculations/payday";
import {
  calculateBudgetAllocation,
  calculateBudgetSummary,
  checkBudgetThresholdAlerts,
} from "../lib/calculations/budget";
import {
  calculateSpendableBalance,
  calculateSpendingByCategory,
} from "../lib/calculations/finance";
import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateDebtOverview,
} from "../lib/calculations/loans";
import { analyzePurchaseAffordability } from "../lib/ai/financial-context";
import {
  SalarySettings,
  BudgetRules,
  FinancialAccount,
  FinancialTransaction,
  SavingsGoal,
  SavingsMovement,
  Bill,
  Loan,
} from "../types";

describe("Payday Calculations & Philippine Schedule", () => {
  it("correctly handles February in non-leap year (clamps 30th to 28th)", () => {
    // 2025 is not a leap year, February has 28 days
    const febPayday = getEffectivePayday(2025, 1, 30);
    expect(febPayday.getDate()).toBe(28);
    expect(febPayday.getMonth()).toBe(1);
  });

  it("correctly handles February in leap year (clamps 30th to 29th)", () => {
    // 2024 is a leap year, February has 29 days
    const febPayday = getEffectivePayday(2024, 1, 30);
    expect(febPayday.getDate()).toBe(29);
    expect(febPayday.getMonth()).toBe(1);
  });

  it("handles 30-day months (e.g. April 30th)", () => {
    // April (month 3) has 30 days
    const aprPayday = getEffectivePayday(2026, 3, 30);
    expect(aprPayday.getDate()).toBe(30);
  });

  it("calculates next payday correctly for semi-monthly schedule", () => {
    const settings: SalarySettings = {
      monthly_net: 30000,
      payday_1_day: 15,
      payday_2_day: 30,
      payday_1_expected: 15000,
      payday_2_expected: 15000,
      is_semi_monthly: true,
    };

    // When today is Oct 10, 2026 -> next payday is Oct 15
    const refDate1 = new Date(2026, 9, 10);
    const next1 = calculateNextPayday(settings, refDate1);
    expect(next1.period).toBe("payday_1");
    expect(next1.date.getDate()).toBe(15);
    expect(next1.daysRemaining).toBe(5);

    // When today is Oct 18, 2026 -> next payday is Oct 30
    const refDate2 = new Date(2026, 9, 18);
    const next2 = calculateNextPayday(settings, refDate2);
    expect(next2.period).toBe("payday_2");
    expect(next2.date.getDate()).toBe(30);
    expect(next2.daysRemaining).toBe(12);

    // When today is Oct 31, 2026 -> next payday is Nov 15
    const refDate3 = new Date(2026, 9, 31);
    const next3 = calculateNextPayday(settings, refDate3);
    expect(next3.period).toBe("payday_1");
    expect(next3.date.getMonth()).toBe(10); // Nov
    expect(next3.date.getDate()).toBe(15);
  });

  it("supports unequal payday salaries (e.g. 10k on 15th, 20k on 30th)", () => {
    const settings: SalarySettings = {
      monthly_net: 30000,
      payday_1_day: 15,
      payday_2_day: 30,
      payday_1_expected: 10000,
      payday_2_expected: 20000,
      is_semi_monthly: true,
    };

    const nextP1 = calculateNextPayday(settings, new Date(2026, 9, 5));
    expect(nextP1.expectedAmount).toBe(10000);

    const nextP2 = calculateNextPayday(settings, new Date(2026, 9, 16));
    expect(nextP2.expectedAmount).toBe(20000);
  });
});

describe("50/30/20 Budget Calculations & Threshold Alerts", () => {
  const rules: BudgetRules = {
    needs_percent: 50,
    wants_percent: 30,
    savings_percent: 20,
    alert_threshold_80: true,
    alert_threshold_90: true,
    alert_threshold_100: true,
  };

  it("accurately allocates 50/30/20 with exact sum matching income", () => {
    const allocation = calculateBudgetAllocation(30000, rules);
    expect(allocation.needs).toBe(15000);
    expect(allocation.wants).toBe(9000);
    expect(allocation.savings).toBe(6000);
    expect(allocation.needs + allocation.wants + allocation.savings).toBe(30000);
  });

  it("calculates budget usage, remaining amounts, and avoids double counting savings", () => {
    const transactions: FinancialTransaction[] = [
      {
        id: "1",
        title: "Groceries",
        amount: 3000,
        type: "need",
        category: "Groceries",
        payment_method: "gcash",
        date: "2026-10-16",
      },
      {
        id: "2",
        title: "Dinner",
        amount: 1500,
        type: "want",
        category: "Dining Out",
        payment_method: "cash",
        date: "2026-10-17",
      },
    ];

    const savingsMovements: SavingsMovement[] = [
      {
        id: "sm1",
        goal_id: "g1",
        amount: 2000,
        type: "deposit",
        date: "2026-10-15",
      },
    ];

    const summary = calculateBudgetSummary(15000, rules, transactions, savingsMovements);
    // For 15000 income base:
    // Needs allocated = 7500, spent = 3000, remaining = 4500
    // Wants allocated = 4500, spent = 1500, remaining = 3000
    // Savings allocated = 3000, saved = 2000, remaining = 1000
    expect(summary.allocated_needs).toBe(7500);
    expect(summary.spent_needs).toBe(3000);
    expect(summary.remaining_needs).toBe(4500);
    expect(summary.percent_needs).toBe(40);

    expect(summary.allocated_wants).toBe(4500);
    expect(summary.spent_wants).toBe(1500);
    expect(summary.remaining_wants).toBe(3000);
    expect(summary.percent_wants).toBe(33);

    expect(summary.saved_amount).toBe(2000);
    expect(summary.remaining_savings).toBe(1000);
  });

  it("triggers threshold alerts at 80%, 90%, 100%", () => {
    const txHighNeeds: FinancialTransaction[] = [
      {
        id: "1",
        title: "Heavy Needs",
        amount: 7200, // 7200 / 7500 = 96%
        type: "need",
        category: "Rent",
        payment_method: "bank",
        date: "2026-10-16",
      },
    ];

    const summary = calculateBudgetSummary(15000, rules, txHighNeeds, []);
    const alerts = checkBudgetThresholdAlerts(summary, rules);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].severity).toBe("warning");
    expect(alerts[0].percentage).toBe(96);
  });
});

describe("Cash Balances & Reserved Obligations (No Phantom Balances)", () => {
  it("counts only real money in liquid accounts and isolates upcoming bills without treating them as spent", () => {
    const accounts: FinancialAccount[] = [
      { id: "1", name: "Cash", type: "cash", balance: 2000 },
      { id: "2", name: "GCash", type: "gcash", balance: 5000 },
      { id: "3", name: "BDO", type: "bank", balance: 10000 },
    ];

    const bills: Bill[] = [
      {
        id: "b1",
        name: "Electricity",
        amount: 2500,
        due_day: 20,
        recurrence: "monthly",
        category: "Electricity",
        status: "upcoming",
      },
      {
        id: "b2",
        name: "Internet",
        amount: 1500,
        due_day: 25,
        recurrence: "monthly",
        category: "Internet",
        status: "paid", // Paid bill must not be reserved
      },
    ];

    const breakdown = calculateSpendableBalance(accounts, bills);
    expect(breakdown.liquidCashTotal).toBe(17000); // 2000 + 5000 + 10000
    expect(breakdown.reservedBillsTotal).toBe(2500); // only unpaid electricity
    expect(breakdown.availableToSpend).toBe(14500); // 17000 - 2500
  });
});

describe("Loan Amortization & Debt Calculations", () => {
  it("calculates monthly payment correctly for zero-interest loan", () => {
    const pmt = calculateMonthlyPayment(12000, 0, 6);
    expect(pmt).toBe(2000);
  });

  it("calculates monthly payment and amortization for standard interest loan", () => {
    const pmt = calculateMonthlyPayment(20000, 10, 12);
    expect(pmt).toBeGreaterThan(1666.67);
    const { schedule, estimatedMonths } = generateAmortizationSchedule(20000, 10, pmt);
    expect(estimatedMonths).toBeLessThanOrEqual(12);
    expect(schedule[schedule.length - 1].remainingBalance).toBe(0);
  });
});

describe("AI Affordability Analyzer (Deterministic Core)", () => {
  it("recommends rejection when purchase causes cash deficit after bills", () => {
    const dataset = {
      salarySettings: {
        monthly_net: 30000,
        payday_1_day: 15,
        payday_2_day: 30,
        payday_1_expected: 15000,
        payday_2_expected: 15000,
        is_semi_monthly: true,
      },
      budgetRules: { needs_percent: 50, wants_percent: 30, savings_percent: 20 },
      accounts: [{ id: "1", name: "Cash", type: "cash" as const, balance: 5000 }],
      transactions: [],
      incomeRecords: [],
      savingsGoals: [],
      savingsMovements: [],
      bills: [
        {
          id: "b1",
          name: "Rent",
          amount: 4000,
          due_day: 20,
          recurrence: "monthly" as const,
          category: "Rent",
          status: "upcoming" as const,
        },
      ],
      loans: [],
    };

    // User wants to buy a ₱2,000 gadget:
    // Cash: 5000, Bills: 4000 -> After bills: 1000. Purchase: 2000 -> Deficit: -1000.
    const analysis = analyzePurchaseAffordability("Shoes", 2000, dataset, new Date(2026, 9, 16));
    expect(analysis.can_afford).toBe(false);
    expect(analysis.verdict).toBe("not_recommended");
    expect(analysis.cash_after_purchase_and_bills).toBe(-1000);
  });

  it("approves safe purchase when cash buffer and budget are ample", () => {
    const dataset = {
      salarySettings: {
        monthly_net: 30000,
        payday_1_day: 15,
        payday_2_day: 30,
        payday_1_expected: 15000,
        payday_2_expected: 15000,
        is_semi_monthly: true,
      },
      budgetRules: { needs_percent: 50, wants_percent: 30, savings_percent: 20 },
      accounts: [{ id: "1", name: "Bank", type: "bank" as const, balance: 25000 }],
      transactions: [],
      incomeRecords: [{ id: "i1", amount: 15000, date: "2026-10-15", payday_period: "payday_1" as const, type: "salary" as const }],
      savingsGoals: [],
      savingsMovements: [],
      bills: [{ id: "b1", name: "Internet", amount: 1699, due_day: 25, recurrence: "monthly" as const, category: "Internet", status: "upcoming" as const }],
      loans: [],
    };

    // Purchase ₱1,500 dinner
    const analysis = analyzePurchaseAffordability("Celebration Dinner", 1500, dataset, new Date(2026, 9, 16));
    expect(analysis.can_afford).toBe(true);
    expect(analysis.verdict).toBe("safe");
    expect(analysis.cash_after_purchase_and_bills).toBe(21801); // 25000 - 1699 - 1500
  });
});
