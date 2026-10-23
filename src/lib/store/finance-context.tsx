"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
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
  UserProfile,
} from "@/types";
import { createClient, isSupabaseConfigured } from "../supabase/client";
import {
  generateUUID,
  isValidUUID,
  fetchUserData,
  syncInsertTransaction,
  syncDeleteTransaction,
  syncInsertIncome,
  syncSalarySettings,
  syncBudgetRules,
  syncUpsertAccount,
  syncInsertBill,
  syncUpdateBillStatus,
  syncInsertSavingsGoal,
  syncSavingsMovement,
  syncInsertLoan,
  syncLoanPayment,
  resetUserCloudData,
} from "../supabase/db";
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
  userProfile: UserProfile;
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
  isOnline: boolean;

  // Derived calculations
  spendableBreakdown: SpendableBalanceBreakdown;
  nextPayday: NextPaydayInfo;
  budgetSummary: BudgetSummary;
  thresholdAlerts: BudgetThresholdAlert[];
  financialContext: FinancialContextSummary;

  // Actions
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void> | void;
  signOut: () => Promise<void>;
  addAccount: (account: Omit<FinancialAccount, "id" | "created_at">) => void;
  addTransaction: (tx: Omit<FinancialTransaction, "id" | "created_at">) => void;
  deleteTransaction: (id: string) => void;
  recordSalaryIncome: (income: Omit<IncomeRecord, "id" | "created_at">) => void;
  updateSalarySettings: (settings: Partial<SalarySettings>) => void;
  updateBudgetRules: (rules: Partial<BudgetRules>) => void;
  updateCategoryAllocation: (category: string, amount: number) => void;
  removeCategoryAllocation: (category: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "current_amount" | "created_at" | "updated_at">) => void;
  recordSavingsTransfer: (goalId: string, amount: number, type: "deposit" | "withdrawal", accountId?: string) => void;
  addBill: (bill: Omit<Bill, "id" | "status" | "created_at">) => void;
  markBillAsPaid: (billId: string, accountId?: string) => void;
  addLoan: (loan: Omit<Loan, "id" | "created_at">) => void;
  recordLoanPayment: (loanId: string, amount: number, accountId?: string) => void;
  planPayday: (allocation: { needs: number; wants: number; savings: number; debt?: number }) => void;
  setAIPreferences: (prefs: Partial<AIPreferences>) => void;
  setClientApiKey: (key: string) => void;
  loadDemoData: () => void;
  resetAllData: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  exportLocalData: () => void;
  importLocalData: (jsonData: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const USER_STORAGE_KEY = "paywise_user_profile_v1";
const getStorageKey = (userId?: string) =>
  "paywise_finance_state_" + (userId && userId !== "guest" ? userId : "guest");

const EMPTY_SALARY_SETTINGS: SalarySettings = {
  monthly_net: 0,
  payday_1_day: 15,
  payday_2_day: 30,
  payday_1_expected: 0,
  payday_2_expected: 0,
  is_semi_monthly: true,
};

const EMPTY_BUDGET_RULES: BudgetRules = {
  preset_name: "50/20/20/10",
  needs_percent: 50,
  wants_percent: 20,
  savings_percent: 20,
  debt_percent: 10,
  fourth_pillar_name: "Debt & Loans",
  category_allocations: {},
};

export function cleanAndDeduplicateAccounts(accList: FinancialAccount[]): FinancialAccount[] {
  const seen = new Set<string>();
  const unique: FinancialAccount[] = [];

  for (const acc of accList) {
    const key = (acc.name || "").trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(acc);
    }
  }

  // Ensure standard Philippine digital banks and e-wallets are available
  const standardSeeds: Omit<FinancialAccount, "id">[] = [
    { name: "MariBank", type: "bank", balance: 0, is_default: true },
    { name: "GCash", type: "gcash", balance: 0, is_default: false },
    { name: "Maya", type: "maya", balance: 0, is_default: false },
    { name: "SeaBank", type: "bank", balance: 0, is_default: false },
    { name: "Cash on Hand", type: "cash", balance: 0, is_default: false },
  ];

  for (const seed of standardSeeds) {
    const key = seed.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({
        ...seed,
        id: generateUUID(),
      });
    }
  }

  return unique;
}

const DEFAULT_USER_PROFILE: UserProfile = {
  id: "guest",
  email: "guest@paywise.ph",
  display_name: "Juan Dela Cruz",
  currency: "PHP",
  theme: "system",
  onboarding_completed: false,
};

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [salarySettings, setSalarySettings] = useState<SalarySettings>(EMPTY_SALARY_SETTINGS);
  const [budgetRules, setBudgetRules] = useState<BudgetRules>(EMPTY_BUDGET_RULES);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsMovements, setSavingsMovements] = useState<SavingsMovement[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [clientApiKey, setClientApiKey] = useState<string>("");
  const [aiPreferences, setAiPreferencesState] = useState<AIPreferences>({
    is_enabled: true,
    model_name: "gemini-3.5-flash-lite",
    share_financial_context: true,
    temperature: 0.7,
    daily_request_limit: 50,
  });
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Monitor online status
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const setOnline = () => setIsOnline(true);
      const setOffline = () => setIsOnline(false);
      window.addEventListener("online", setOnline);
      window.addEventListener("offline", setOffline);
      return () => {
        window.removeEventListener("online", setOnline);
        window.removeEventListener("offline", setOffline);
      };
    }
  }, []);

  // Load persisted state from localStorage on client mount & sync Supabase Cloud
  useEffect(() => {
    let currentUserId = "guest";

    try {
      // 1. Check if user profile is stored locally
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id) currentUserId = parsedUser.id;
        if (parsedUser.display_name || parsedUser.email) {
          setUserProfile(parsedUser);
        }
      }

      // 2. Load cached records for this specific user/guest
      const userKey = getStorageKey(currentUserId);
      const stored = localStorage.getItem(userKey);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.salarySettings) setSalarySettings(parsed.salarySettings);
        if (parsed.budgetRules) setBudgetRules(parsed.budgetRules);
        if (parsed.accounts) setAccounts(cleanAndDeduplicateAccounts(parsed.accounts));
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.incomeRecords) setIncomeRecords(parsed.incomeRecords);
        if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
        if (parsed.savingsMovements) setSavingsMovements(parsed.savingsMovements);
        if (parsed.bills) setBills(parsed.bills);
        if (parsed.loans) setLoans(parsed.loans);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (typeof parsed.isDemoMode === "boolean") {
          setIsDemoMode(currentUserId === "guest" ? parsed.isDemoMode : false);
        }
        if (parsed.aiPreferences) setAiPreferencesState(parsed.aiPreferences);
        if (parsed.clientApiKey) setClientApiKey(parsed.clientApiKey);
      } else if (currentUserId !== "guest") {
        // Authenticated user with no local cache yet: initialize clean state with standard Philippine accounts
        setAccounts(cleanAndDeduplicateAccounts([]));
        setSalarySettings(EMPTY_SALARY_SETTINGS);
        setBudgetRules(EMPTY_BUDGET_RULES);
        setTransactions([]);
        setIncomeRecords([]);
        setSavingsGoals([]);
        setSavingsMovements([]);
        setBills([]);
        setLoans([]);
        setNotifications([]);
        setIsDemoMode(false);
      } else {
        // Guest user without cache: load demo records
        setAccounts(DEMO_ACCOUNTS);
        setSalarySettings(DEMO_SALARY_SETTINGS);
        setBudgetRules(DEMO_BUDGET_RULES);
        setTransactions(DEMO_TRANSACTIONS);
        setIncomeRecords(DEMO_INCOME_RECORDS);
        setSavingsGoals(DEMO_SAVINGS_GOALS);
        setSavingsMovements(DEMO_SAVINGS_MOVEMENTS);
        setBills(DEMO_BILLS);
        setLoans(DEMO_LOANS);
        setNotifications(DEMO_NOTIFICATIONS);
        setIsDemoMode(true);
      }
    } catch (e) {
      console.error("Failed to load PayWise local storage", e);
    } finally {
      setIsInitialized(true);
    }

    // 3. Connect and fetch live cloud records if Supabase is active
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();

        const syncUserWithCloud = async (user: any) => {
          const userId = user.id;
          const meta = (user.user_metadata as Record<string, string>) || {};
          const resolvedName =
            meta.full_name ||
            meta.name ||
            (user.email ? user.email.split("@")[0] : "User");

          const updatedProfile: UserProfile = {
            id: userId,
            email: user.email || "",
            display_name: resolvedName,
            currency: "PHP",
            theme: "system",
            onboarding_completed: true,
          };

          setUserProfile(updatedProfile);
          try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedProfile));
          } catch {}

          // Fetch cloud database records
          const cloudData = await fetchUserData(userId);
          if (cloudData) {
            if (cloudData.accounts && cloudData.accounts.length > 0) {
              setAccounts(cleanAndDeduplicateAccounts(cloudData.accounts));
            }
            if (cloudData.salarySettings) {
              setSalarySettings(cloudData.salarySettings);
            }
            if (cloudData.budgetRules) {
              setBudgetRules(cloudData.budgetRules);
            }
            setTransactions(cloudData.transactions || []);
            setIncomeRecords(cloudData.incomeRecords || []);
            setSavingsGoals(cloudData.savingsGoals || []);
            setSavingsMovements(cloudData.savingsMovements || []);
            setBills(cloudData.bills || []);
            setLoans(cloudData.loans || []);
            setNotifications(cloudData.notifications || []);
            setIsDemoMode(false);
          } else {
            setIsDemoMode(false);
          }
        };

        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) {
            syncUserWithCloud(data.user);
          }
        });

        const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            syncUserWithCloud(session.user);
          }
        });

        return () => {
          authSub.subscription.unsubscribe();
        };
      } catch (err) {
        console.warn("Could not attach Supabase auth sync listener", err);
      }
    }
  }, []);

  // Save to localStorage when state updates (keyed per user)
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
      const userKey = getStorageKey(userProfile.id);
      localStorage.setItem(userKey, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save PayWise state", e);
    }
  }, [
    isInitialized,
    userProfile.id,
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
  const addAccount = (account: Omit<FinancialAccount, "id" | "created_at">) => {
    const accId = generateUUID();
    const newAcc: FinancialAccount = {
      ...account,
      id: accId,
      created_at: new Date().toISOString(),
    };

    setAccounts((prev) => [...prev, newAcc]);

    if (userProfile.id && userProfile.id !== "guest") {
      syncUpsertAccount(userProfile.id, newAcc).catch(console.error);
    }
  };

  const addTransaction = (tx: Omit<FinancialTransaction, "id" | "created_at">) => {
    const txId = generateUUID();
    const targetAccountId =
      tx.account_id && isValidUUID(tx.account_id)
        ? tx.account_id
        : accounts[0]?.id || generateUUID();

    const newTx: FinancialTransaction = {
      ...tx,
      id: txId,
      account_id: targetAccountId,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Calculate synchronously so newBal is guaranteed defined
    const targetAcc = accounts.find((a) => a.id === targetAccountId);
    const prevBalance = targetAcc ? targetAcc.balance : 0;
    const delta = tx.type === "income" ? tx.amount : -tx.amount;
    const newBal = roundMoney(prevBalance + delta);

    setAccounts((prev) =>
      prev.map((acc) => (acc.id === targetAccountId ? { ...acc, balance: newBal } : acc))
    );

    if (userProfile.id && userProfile.id !== "guest") {
      syncInsertTransaction(userProfile.id, newTx, newBal).catch(console.error);
    }
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    let revertedBalance: number | undefined;

    if (tx && tx.account_id) {
      const targetAcc = accounts.find((a) => a.id === tx.account_id);
      if (targetAcc) {
        const revert = tx.type === "income" ? -tx.amount : tx.amount;
        revertedBalance = roundMoney(targetAcc.balance + revert);
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === tx.account_id ? { ...acc, balance: revertedBalance! } : acc))
        );
      }
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (userProfile.id && userProfile.id !== "guest") {
      syncDeleteTransaction(userProfile.id, id, tx?.account_id, revertedBalance).catch(console.error);
    }
  };

  const recordSalaryIncome = (income: Omit<IncomeRecord, "id" | "created_at">) => {
    const incId = generateUUID();
    const targetAccountId =
      income.account_id && isValidUUID(income.account_id)
        ? income.account_id
        : accounts[0]?.id || generateUUID();

    const newRecord: IncomeRecord = {
      ...income,
      id: incId,
      account_id: targetAccountId,
      created_at: new Date().toISOString(),
    };

    setIncomeRecords((prev) => [newRecord, ...prev]);

    if (userProfile.id && userProfile.id !== "guest") {
      syncInsertIncome(userProfile.id, newRecord).catch(console.error);
    }

    // Also record transaction and update account
    addTransaction({
      title: `${income.type === "salary" ? "Payday Salary" : "Additional Income"} (${income.payday_period})`,
      amount: income.amount,
      type: "income",
      category: "Salary",
      payment_method: "bank",
      account_id: targetAccountId,
      payday_period: income.payday_period,
      date: income.date,
      notes: income.notes,
    });

    // Add notification
    setNotifications((prev) => [
      {
        id: generateUUID(),
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
    setSalarySettings((prev) => {
      const updated = { ...prev, ...settings };
      if (userProfile.id && userProfile.id !== "guest") {
        syncSalarySettings(userProfile.id, updated).catch(console.error);
      }
      return updated;
    });
  };

  const updateBudgetRules = (rules: Partial<BudgetRules>) => {
    setBudgetRules((prev) => {
      const updated = { ...prev, ...rules };
      if (userProfile.id && userProfile.id !== "guest") {
        syncBudgetRules(userProfile.id, updated).catch(console.error);
      }
      return updated;
    });
  };

  const updateCategoryAllocation = (category: string, amount: number) => {
    setBudgetRules((prev) => {
      const updated = {
        ...prev,
        category_allocations: {
          ...(prev.category_allocations || {}),
          [category]: Math.max(0, amount),
        },
      };
      if (userProfile.id && userProfile.id !== "guest") {
        syncBudgetRules(userProfile.id, updated).catch(console.error);
      }
      return updated;
    });
  };

  const removeCategoryAllocation = (category: string) => {
    setBudgetRules((prev) => {
      const next = { ...(prev.category_allocations || {}) };
      delete next[category];
      const updated = {
        ...prev,
        category_allocations: next,
      };
      if (userProfile.id && userProfile.id !== "guest") {
        syncBudgetRules(userProfile.id, updated).catch(console.error);
      }
      return updated;
    });
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, "id" | "current_amount" | "created_at" | "updated_at">) => {
    const goalId = generateUUID();
    const newGoal: SavingsGoal = {
      ...goal,
      id: goalId,
      current_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);

    if (userProfile.id && userProfile.id !== "guest") {
      syncInsertSavingsGoal(userProfile.id, newGoal).catch(console.error);
    }
  };

  const recordSavingsTransfer = (
    goalId: string,
    amount: number,
    type: "deposit" | "withdrawal",
    accountId?: string
  ) => {
    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    if (!targetGoal) return;

    const delta = type === "deposit" ? amount : -amount;
    const newAmount = roundMoney(Math.max(0, targetGoal.current_amount + delta));

    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            current_amount: newAmount,
            updated_at: new Date().toISOString(),
          };
        }
        return g;
      })
    );

    const movementId = generateUUID();
    const movement: SavingsMovement = {
      id: movementId,
      goal_id: goalId,
      amount,
      type,
      account_id: accountId && isValidUUID(accountId) ? accountId : undefined,
      date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
    };

    setSavingsMovements((prev) => [movement, ...prev]);

    let newAccBalance: number | undefined;
    if (accountId) {
      const targetAcc = accounts.find((a) => a.id === accountId);
      if (targetAcc) {
        const accDelta = type === "deposit" ? -amount : amount;
        newAccBalance = roundMoney(targetAcc.balance + accDelta);
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === accountId ? { ...acc, balance: newAccBalance! } : acc))
        );
      }
    }

    if (userProfile.id && userProfile.id !== "guest") {
      syncSavingsMovement(userProfile.id, movement, newAmount, newAccBalance).catch(console.error);
    }

    // Check if goal reached
    if (type === "deposit" && targetGoal.current_amount + amount >= targetGoal.target_amount) {
      setNotifications((prev) => [
        {
          id: generateUUID(),
          title: "Goal Reached!",
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
    const billId = generateUUID();
    const targetAccountId =
      bill.account_id && isValidUUID(bill.account_id) ? bill.account_id : undefined;

    const newBill: Bill = {
      ...bill,
      id: billId,
      account_id: targetAccountId,
      status: "upcoming",
      created_at: new Date().toISOString(),
    };
    setBills((prev) => [...prev, newBill]);

    if (userProfile.id && userProfile.id !== "guest") {
      syncInsertBill(userProfile.id, newBill).catch(console.error);
    }
  };

  const markBillAsPaid = (billId: string, accountId?: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;

    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, status: "paid" } : b))
    );

    if (userProfile.id && userProfile.id !== "guest") {
      syncUpdateBillStatus(userProfile.id, billId, "paid").catch(console.error);
    }

    // Add transaction
    addTransaction({
      title: `Bill Payment: ${bill.name}`,
      amount: bill.amount,
      type: "bill_payment",
      category: bill.category || "Bills & Utilities",
      payment_method: "gcash",
      account_id: accountId || bill.account_id || accounts[0]?.id,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const addLoan = (loan: Omit<Loan, "id" | "created_at">) => {
    const loanId = generateUUID();
    const newLoan: Loan = {
      ...loan,
      id: loanId,
      created_at: new Date().toISOString(),
    };
    setLoans((prev) => [...prev, newLoan]);

    if (userProfile.id && userProfile.id !== "guest") {
      syncInsertLoan(userProfile.id, newLoan).catch(console.error);
    }
  };

  const recordLoanPayment = (loanId: string, amount: number, accountId?: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const newBalance = roundMoney(Math.max(0, targetLoan.current_balance - amount));
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, current_balance: newBalance } : l))
    );

    let newAccBalance: number | undefined;
    const targetAccId = accountId || accounts[0]?.id;
    if (targetAccId) {
      const targetAcc = accounts.find((a) => a.id === targetAccId);
      if (targetAcc) {
        newAccBalance = roundMoney(targetAcc.balance - amount);
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === targetAccId ? { ...acc, balance: newAccBalance! } : acc))
        );
      }
    }

    if (userProfile.id && userProfile.id !== "guest") {
      syncLoanPayment(userProfile.id, loanId, newBalance, newAccBalance, targetAccId).catch(console.error);
    }

    // Add transaction
    addTransaction({
      title: `Loan Payment: ${targetLoan.name}`,
      amount,
      type: "loan_payment",
      category: "Loan Payments",
      payment_method: "bank",
      account_id: targetAccId,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const planPayday = (allocation: { needs: number; wants: number; savings: number; debt?: number }) => {
    const debtMsg = allocation.debt !== undefined ? `, Debt/Loans (₱${allocation.debt.toLocaleString()})` : "";
    setNotifications((prev) => [
      {
        id: generateUUID(),
        title: "Payday Plan Activated",
        message: `Plan saved: Needs (₱${allocation.needs.toLocaleString()}), Wants (₱${allocation.wants.toLocaleString()}), Savings (₱${allocation.savings.toLocaleString()})${debtMsg}.`,
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

  const updateUserProfile = async (profileUpdate: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated: UserProfile = { ...prev, ...profileUpdate };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to store user profile", err);
      }
      return updated;
    });

    if (isSupabaseConfigured() && profileUpdate.display_name) {
      try {
        const supabase = createClient();
        await supabase.auth.updateUser({
          data: { full_name: profileUpdate.display_name },
        });
      } catch (err) {
        console.warn("Could not sync profile name to Supabase:", err);
      }
    }

    // If user id changed or signed in, immediately load their user-keyed records and fetch from cloud
    if (profileUpdate.id && profileUpdate.id !== "guest") {
      const userKey = getStorageKey(profileUpdate.id);
      try {
        const stored = localStorage.getItem(userKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.accounts) setAccounts(cleanAndDeduplicateAccounts(parsed.accounts));
          if (parsed.transactions) setTransactions(parsed.transactions);
          if (parsed.incomeRecords) setIncomeRecords(parsed.incomeRecords);
          if (parsed.salarySettings) setSalarySettings(parsed.salarySettings);
          if (parsed.budgetRules) setBudgetRules(parsed.budgetRules);
          if (parsed.bills) setBills(parsed.bills);
          if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
          if (parsed.savingsMovements) setSavingsMovements(parsed.savingsMovements);
          if (parsed.loans) setLoans(parsed.loans);
        }
      } catch {}

      if (isSupabaseConfigured()) {
        fetchUserData(profileUpdate.id)
          .then((cloudData) => {
            if (cloudData) {
              if (cloudData.accounts && cloudData.accounts.length > 0) {
                setAccounts(cleanAndDeduplicateAccounts(cloudData.accounts));
              }
              if (cloudData.salarySettings) setSalarySettings(cloudData.salarySettings);
              if (cloudData.budgetRules) setBudgetRules(cloudData.budgetRules);
              setTransactions(cloudData.transactions || []);
              setIncomeRecords(cloudData.incomeRecords || []);
              setSavingsGoals(cloudData.savingsGoals || []);
              setSavingsMovements(cloudData.savingsMovements || []);
              setBills(cloudData.bills || []);
              setLoans(cloudData.loans || []);
              setNotifications(cloudData.notifications || []);
              setIsDemoMode(false);
            }
          })
          .catch(console.error);
      }
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Sign out error", err);
      }
    }
    const currentId = userProfile.id;
    setUserProfile(DEFAULT_USER_PROFILE);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      if (currentId) {
        localStorage.removeItem(getStorageKey(currentId));
      }
    } catch {}

    setSalarySettings(EMPTY_SALARY_SETTINGS);
    setBudgetRules(EMPTY_BUDGET_RULES);
    setAccounts(cleanAndDeduplicateAccounts([]));
    setTransactions([]);
    setIncomeRecords([]);
    setSavingsGoals([]);
    setSavingsMovements([]);
    setBills([]);
    setLoans([]);
    setNotifications([]);
    setIsDemoMode(false);

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
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
    setSalarySettings(EMPTY_SALARY_SETTINGS);
    setBudgetRules(EMPTY_BUDGET_RULES);
    setAccounts(cleanAndDeduplicateAccounts([]));
    setIncomeRecords([]);
    setTransactions([]);
    setSavingsGoals([]);
    setSavingsMovements([]);
    setBills([]);
    setLoans([]);
    setNotifications([]);
    setIsDemoMode(false);

    try {
      localStorage.removeItem(getStorageKey(userProfile.id));
    } catch {}

    if (userProfile.id && userProfile.id !== "guest") {
      resetUserCloudData(userProfile.id).catch(console.error);
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const exportLocalData = () => {
    try {
      const payload = {
        version: "1.0",
        exportDate: new Date().toISOString(),
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
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `paywise-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export PayWise local data", e);
    }
  };

  const importLocalData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
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
      if (parsed.aiPreferences) setAiPreferencesState(parsed.aiPreferences);
      return true;
    } catch (e) {
      console.error("Failed to import PayWise data", e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        signOut,
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
        isOnline,
        spendableBreakdown,
        nextPayday,
        budgetSummary,
        thresholdAlerts,
        financialContext,
        addAccount,
        addTransaction,
        deleteTransaction,
        recordSalaryIncome,
        updateSalarySettings,
        updateBudgetRules,
        updateCategoryAllocation,
        removeCategoryAllocation,
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
        exportLocalData,
        importLocalData,
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
