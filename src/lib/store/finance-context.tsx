"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
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
  NotificationItem,
  AIPreferences,
  FinancialContextSummary,
  BudgetSummary,
} from "@/types";
import {
  DEMO_SALARY_SETTINGS,
  DEMO_BUDGET_RULES,
  DEMO_ACCOUNTS,
  DEMO_INCOME_RECORDS,
  DEMO_TRANSACTIONS,
  DEMO_SAVINGS_GOALS,
  DEMO_SAVINGS_MOVEMENTS,
  DEMO_BILLS,
  DEMO_LOANS,
  DEMO_NOTIFICATIONS,
} from "../demo/sample-data";
import { calculateNextPayday, getCurrentPaydayDateRange, NextPaydayInfo } from "../calculations/payday";
import { calculateSpendableBalance, SpendableBalanceBreakdown } from "../calculations/finance";
import { calculateBudgetSummary, checkBudgetThresholdAlerts, BudgetThresholdAlert } from "../calculations/budget";
import { buildFinancialContextSummary } from "../ai/financial-context";
import { roundMoney } from "../utils";

interface FinanceContextType {
  // State
  salarySettings: SalarySettings;
  budgetRules: BudgetRules;
  accounts: FinancialAccount[];
  transactions: FinancialTransaction[];
  incomeRecords: IncomeRecord[];
  savingsGoals: SavingsGoal[];
  savingsMovements: SavingsMovement[];
  bills: Bill[];
  loans: Loan[];
  notifications: NotificationItem[];
  aiPreferences: AIPreferences;
  isDemoMode: boolean;
  clientApiKey: string;
  isInitialized: boolean;

  // Derived calculations
  spendableBreakdown: SpendableBalanceBreakdown;
  nextPayday: NextPaydayInfo;
  budgetSummary: BudgetSummary;
  thresholdAlerts: BudgetThresholdAlert[];
  financialContext: FinancialContextSummary;

  // Actions
  addTransaction: (tx: Omit<FinancialTransaction, "id" | "created_at">) => void;
  deleteTransaction: (id: string) => void;
  recordSalaryIncome: (income: Omit<IncomeRecord, "id" | "created_at">) => void;
  updateSalarySettings: (settings: Partial<SalarySettings>) => void;
  updateBudgetRules: (rules: Partial<BudgetRules>) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "current_amount" | "created_at" | "updated_at">) => void;
  recordSavingsTransfer: (goalId: string, amount: number, type: "deposit" | "withdrawal", accountId?: string) => void;
  addBill: (bill: Omit<Bill, "id" | "status" | "created_at">) => void;
  markBillAsPaid: (billId: string, accountId?: string) => void;
  addLoan: (loan: Omit<Loan, "id" | "created_at">) => void;
  recordLoanPayment: (loanId: string, amount: number, accountId?: string) => void;
  planPayday: (allocation: { needs: number; wants: number; savings: number }) => void;
  setAIPreferences: (prefs: Partial<AIPreferences>) => void;
  setClientApiKey: (key: string) => void;
  loadDemoData: () => void;
  resetAllData: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const STORAGE_KEY = "paywise_finance_state_v1";

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [salarySettings, setSalarySettings] = useState<SalarySettings>(DEMO_SALARY_SETTINGS);
  const [budgetRules, setBudgetRules] = useState<BudgetRules>(DEMO_BUDGET_RULES);
  const [accounts, setAccounts] = useState<FinancialAccount[]>(DEMO_ACCOUNTS);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(DEMO_TRANSACTIONS);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(DEMO_INCOME_RECORDS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(DEMO_SAVINGS_GOALS);
  const [savingsMovements, setSavingsMovements] = useState<SavingsMovement[]>(DEMO_SAVINGS_MOVEMENTS);
  const [bills, setBills] = useState<Bill[]>(DEMO_BILLS);
  const [loans, setLoans] = useState<Loan[]>(DEMO_LOANS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [clientApiKey, setClientApiKey] = useState<string>("");
  const [aiPreferences, setAiPreferencesState] = useState<AIPreferences>({
    is_enabled: true,
    model_name: "gemini-1.5-flash",
    share_financial_context: true,
    temperature: 0.7,
    daily_request_limit: 50,
  });
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load persisted state from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.salarySettings) setSalarySettings(parsed.salarySettings);
        if (parsed.budgetRules) setBudgetRules(parsed.budgetRules);
        if (parsed.accounts) setAccounts(parsed.accounts);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.incomeRecords) setIncomeRecords(parsed.incomeRecords);
        if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
        if (parsed.savingsMovements) setSavingsMovements(parsed.savingsMovements);
        if (parsed.bills) setBills(parsed.bills);
        if (parsed.loans) setLoans(parsed.loans);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (typeof parsed.isDemoMode === "boolean") setIsDemoMode(parsed.isDemoMode);
        if (parsed.aiPreferences) setAiPreferencesState(parsed.aiPreferences);
        if (parsed.clientApiKey) setClientApiKey(parsed.clientApiKey);
      }
    } catch (e) {
      console.error("Failed to load PayWise local storage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const payload = {
        salarySettings,
        budgetRules,
        accounts,
        transactions,
        incomeRecords,
        savingsGoals,
        savingsMovements,
        bills,
        loans,
        notifications,
        isDemoMode,
        aiPreferences,
        clientApiKey,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save PayWise state", e);
    }
  }, [
    isInitialized,
    salarySettings,
    budgetRules,
    accounts,
    transactions,
    incomeRecords,
    savingsGoals,
    savingsMovements,
    bills,
    loans,
    notifications,
    isDemoMode,
    aiPreferences,
    clientApiKey,
  ]);

  // Derived financial computations
  const nextPayday = useMemo(() => {
    return calculateNextPayday(salarySettings);
  }, [salarySettings]);

  const spendableBreakdown = useMemo(() => {
    return calculateSpendableBalance(accounts, bills);
  }, [accounts, bills]);

  const budgetSummary = useMemo(() => {
    const currentMonthIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
    const baseAmount = currentMonthIncome > 0 ? currentMonthIncome : salarySettings.monthly_net;
    return calculateBudgetSummary(baseAmount, budgetRules, transactions, savingsMovements);
  }, [incomeRecords, salarySettings.monthly_net, budgetRules, transactions, savingsMovements]);

  const thresholdAlerts = useMemo(() => {
    return checkBudgetThresholdAlerts(budgetSummary, budgetRules);
  }, [budgetSummary, budgetRules]);

  const financialContext = useMemo(() => {
    return buildFinancialContextSummary({
      salarySettings,
      budgetRules,
      accounts,
      transactions,
      incomeRecords,
      savingsGoals,
      savingsMovements,
      bills,
      loans,
    });
  }, [
    salarySettings,
    budgetRules,
    accounts,
    transactions,
    incomeRecords,
    savingsGoals,
    savingsMovements,
    bills,
    loans,
  ]);

  // Action implementations
  const addTransaction = (tx: Omit<FinancialTransaction, "id" | "created_at">) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    if (tx.account_id) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === tx.account_id) {
            const deduction = tx.type === "income" ? -tx.amount : tx.amount;
            return { ...acc, balance: roundMoney(acc.balance - deduction) };
          }
          return acc;
        })
      );
    }
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx && tx.account_id) {
      // Revert account balance
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === tx.account_id) {
            const revert = tx.type === "income" ? -tx.amount : tx.amount;
            return { ...acc, balance: roundMoney(acc.balance + revert) };
          }
          return acc;
        })
      );
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const recordSalaryIncome = (income: Omit<IncomeRecord, "id" | "created_at">) => {
    const newRecord: IncomeRecord = {
      ...income,
      id: `inc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setIncomeRecords((prev) => [newRecord, ...prev]);

    // Also record transaction and update account
    addTransaction({
      title: `${income.type === "salary" ? "Payday Salary" : "Additional Income"} (${income.payday_period})`,
      amount: income.amount,
      type: "income",
      category: "Salary",
      payment_method: "bank",
      account_id: income.account_id || accounts[0]?.id,
      payday_period: income.payday_period,
      date: income.date,
      notes: income.notes,
    });

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Salary Recorded",
        message: `₱${income.amount.toLocaleString()} received for ${income.payday_period}. Available spendable balance updated.`,
        type: "salary",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const updateSalarySettings = (settings: Partial<SalarySettings>) => {
    setSalarySettings((prev) => ({ ...prev, ...settings }));
  };

  const updateBudgetRules = (rules: Partial<BudgetRules>) => {
    setBudgetRules((prev) => ({ ...prev, ...rules }));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, "id" | "current_amount" | "created_at" | "updated_at">) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      current_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const recordSavingsTransfer = (
    goalId: string,
    amount: number,
    type: "deposit" | "withdrawal",
    accountId?: string
  ) => {
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const newMovement: SavingsMovement = {
      id: `sm-${Date.now()}`,
      goal_id: goalId,
      amount,
      type,
      account_id: accountId,
      date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
    };

    setSavingsMovements((prev) => [newMovement, ...prev]);

    // Update goal balance
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const delta = type === "deposit" ? amount : -amount;
          return {
            ...g,
            current_amount: roundMoney(Math.max(0, g.current_amount + delta)),
            updated_at: new Date().toISOString(),
          };
        }
        return g;
      })
    );

    // Update source account if provided
    if (accountId) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === accountId) {
            const delta = type === "deposit" ? -amount : amount;
            return { ...acc, balance: roundMoney(acc.balance + delta) };
          }
          return acc;
        })
      );
    }

    // Check if goal reached
    if (type === "deposit" && targetGoal.current_amount + amount >= targetGoal.target_amount) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: "Goal Reached! 🎉",
          message: `Congratulations! You've reached your target of ₱${targetGoal.target_amount.toLocaleString()} for ${targetGoal.name}.`,
          type: "savings_milestone",
          is_read: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const addBill = (bill: Omit<Bill, "id" | "status" | "created_at">) => {
    const newBill: Bill = {
      ...bill,
      id: `bill-${Date.now()}`,
      status: "upcoming",
      created_at: new Date().toISOString(),
    };
    setBills((prev) => [...prev, newBill]);
  };

  const markBillAsPaid = (billId: string, accountId?: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;

    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, status: "paid" } : b))
    );

    // Add transaction
    addTransaction({
      title: `Bill Payment: ${bill.name}`,
      amount: bill.amount,
      type: "bill_payment",
      category: bill.category || "Bills & Utilities",
      payment_method: "gcash",
      account_id: accountId || accounts[0]?.id,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const addLoan = (loan: Omit<Loan, "id" | "created_at">) => {
    const newLoan: Loan = {
      ...loan,
      id: `loan-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setLoans((prev) => [...prev, newLoan]);
  };

  const recordLoanPayment = (loanId: string, amount: number, accountId?: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          const newBal = roundMoney(Math.max(0, l.current_balance - amount));
          return { ...l, current_balance: newBal };
        }
        return l;
      })
    );

    // Add transaction
    addTransaction({
      title: `Loan Payment: ${targetLoan.name}`,
      amount,
      type: "loan_payment",
      category: "Loan Payments",
      payment_method: "bank",
      account_id: accountId || accounts[0]?.id,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const planPayday = (allocation: { needs: number; wants: number; savings: number }) => {
    // User customizes allocation for the active payday
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Payday Plan Activated",
        message: `Plan saved: Needs (₱${allocation.needs.toLocaleString()}), Wants (₱${allocation.wants.toLocaleString()}), Savings (₱${allocation.savings.toLocaleString()}).`,
        type: "payday",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const setAIPreferences = (prefs: Partial<AIPreferences>) => {
    setAiPreferencesState((prev) => ({ ...prev, ...prefs }));
  };

  const loadDemoData = () => {
    setSalarySettings(DEMO_SALARY_SETTINGS);
    setBudgetRules(DEMO_BUDGET_RULES);
    setAccounts(DEMO_ACCOUNTS);
    setIncomeRecords(DEMO_INCOME_RECORDS);
    setTransactions(DEMO_TRANSACTIONS);
    setSavingsGoals(DEMO_SAVINGS_GOALS);
    setSavingsMovements(DEMO_SAVINGS_MOVEMENTS);
    setBills(DEMO_BILLS);
    setLoans(DEMO_LOANS);
    setNotifications(DEMO_NOTIFICATIONS);
    setIsDemoMode(true);
  };

  const resetAllData = () => {
    setSalarySettings({
      monthly_net: 0,
      payday_1_day: 15,
      payday_2_day: 30,
      payday_1_expected: 0,
      payday_2_expected: 0,
      is_semi_monthly: true,
    });
    setBudgetRules({
      needs_percent: 50,
      wants_percent: 30,
      savings_percent: 20,
    });
    setAccounts([
      { id: "acc-cash", name: "Cash on Hand", type: "cash", balance: 0 },
      { id: "acc-gcash", name: "GCash Wallet", type: "gcash", balance: 0 },
    ]);
    setIncomeRecords([]);
    setTransactions([]);
    setSavingsGoals([]);
    setSavingsMovements([]);
    setBills([]);
    setLoans([]);
    setNotifications([]);
    setIsDemoMode(false);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <FinanceContext.Provider
      value={{
        salarySettings,
        budgetRules,
        accounts,
        transactions,
        incomeRecords,
        savingsGoals,
        savingsMovements,
        bills,
        loans,
        notifications,
        aiPreferences,
        isDemoMode,
        clientApiKey,
        isInitialized,
        spendableBreakdown,
        nextPayday,
        budgetSummary,
        thresholdAlerts,
        financialContext,
        addTransaction,
        deleteTransaction,
        recordSalaryIncome,
        updateSalarySettings,
        updateBudgetRules,
        addSavingsGoal,
        recordSavingsTransfer,
        addBill,
        markBillAsPaid,
        addLoan,
        recordLoanPayment,
        planPayday,
        setAIPreferences,
        setClientApiKey,
        loadDemoData,
        resetAllData,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
