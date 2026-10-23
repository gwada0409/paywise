import { createClient, isSupabaseConfigured } from "./client";
import { roundMoney } from "../utils";
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
} from "@/types";

/**
 * Generates an RFC4122 v4 compliant UUID for PostgreSQL tables
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

export interface UserCloudData {
  salarySettings: SalarySettings | null;
  budgetRules: BudgetRules | null;
  accounts: FinancialAccount[];
  transactions: FinancialTransaction[];
  incomeRecords: IncomeRecord[];
  savingsGoals: SavingsGoal[];
  savingsMovements: SavingsMovement[];
  bills: Bill[];
  loans: Loan[];
  notifications: NotificationItem[];
}

/**
 * Fetches all financial data for a logged-in user from Supabase.
 * If the user has never initialized accounts or settings, creates their default clean account.
 */
export async function fetchUserData(userId: string): Promise<UserCloudData | null> {
  if (!isSupabaseConfigured() || !userId || userId === "guest") {
    return null;
  }

  try {
    const supabase = createClient();

    const [
      salaryRes,
      budgetRes,
      accountsRes,
      transactionsRes,
      incomeRes,
      goalsRes,
      movementsRes,
      billsRes,
      loansRes,
      notifsRes,
    ] = await Promise.all([
      supabase.from("salary_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("budget_rules").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("financial_accounts").select("*").eq("user_id", userId).eq("is_archived", false),
      supabase
        .from("financial_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(200),
      supabase
        .from("income_records")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false }),
      supabase.from("savings_goals").select("*").eq("user_id", userId).eq("is_archived", false),
      supabase
        .from("savings_movements")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false }),
      supabase.from("bills").select("*").eq("user_id", userId).order("due_day", { ascending: true }),
      supabase.from("loans").select("*").eq("user_id", userId).eq("is_archived", false),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    // Parse accounts and deduplicate by name
    let rawAccounts: FinancialAccount[] = (accountsRes.data || []).map((a: any) => ({
      id: a.id,
      user_id: a.user_id,
      name: a.name,
      type: a.type,
      balance: Number(a.balance) || 0,
      is_default: Boolean(a.is_default),
      is_archived: Boolean(a.is_archived),
      created_at: a.created_at,
    }));

    // Deduplicate any duplicate accounts by name (e.g. two "Cash on Hand")
    const seenNames = new Set<string>();
    const deduplicatedAccounts: FinancialAccount[] = [];
    const duplicateIdsToDelete: string[] = [];

    for (const acc of rawAccounts) {
      const cleanKey = (acc.name || "").trim().toLowerCase();
      if (seenNames.has(cleanKey)) {
        duplicateIdsToDelete.push(acc.id);
      } else {
        seenNames.add(cleanKey);
        deduplicatedAccounts.push(acc);
      }
    }

    if (duplicateIdsToDelete.length > 0) {
      try {
        await supabase
          .from("financial_accounts")
          .delete()
          .in("id", duplicateIdsToDelete);
        console.log("[DB] Cleaned up duplicate accounts from cloud:", duplicateIdsToDelete);
      } catch (err) {
        console.warn("Could not delete duplicate accounts:", err);
      }
    }

    let accounts: FinancialAccount[] = deduplicatedAccounts;

    // Standard default Philippine accounts: MariBank, GCash, Maya, SeaBank, Cash on Hand
    const defaultTemplates = [
      { name: "MariBank", type: "bank" as const, is_default: true },
      { name: "GCash", type: "gcash" as const, is_default: false },
      { name: "Maya", type: "maya" as const, is_default: false },
      { name: "SeaBank", type: "bank" as const, is_default: false },
      { name: "Cash on Hand", type: "cash" as const, is_default: false },
    ];

    const missingAccountsToCreate: any[] = [];
    for (const tpl of defaultTemplates) {
      const exists = accounts.some(
        (a) => (a.name || "").trim().toLowerCase() === tpl.name.toLowerCase()
      );
      if (!exists) {
        missingAccountsToCreate.push({
          id: generateUUID(),
          user_id: userId,
          name: tpl.name,
          type: tpl.type,
          balance: 0,
          is_default: tpl.is_default,
          is_archived: false,
        });
      }
    }

    if (missingAccountsToCreate.length > 0) {
      const { data: createdAccs } = await supabase
        .from("financial_accounts")
        .insert(missingAccountsToCreate)
        .select();

      if (createdAccs && createdAccs.length > 0) {
        const mapped = createdAccs.map((a: any) => ({
          id: a.id,
          user_id: a.user_id,
          name: a.name,
          type: a.type,
          balance: Number(a.balance) || 0,
          is_default: Boolean(a.is_default),
          is_archived: Boolean(a.is_archived),
          created_at: a.created_at,
        }));
        accounts = [...accounts, ...mapped];
      } else {
        accounts = [...accounts, ...missingAccountsToCreate];
      }
    }

    // Parse salary settings
    let salarySettings: SalarySettings | null = null;
    if (salaryRes.data) {
      salarySettings = {
        id: salaryRes.data.id,
        user_id: salaryRes.data.user_id,
        monthly_net: Number(salaryRes.data.monthly_net) || 0,
        payday_1_day: salaryRes.data.payday_1_day || 15,
        payday_2_day: salaryRes.data.payday_2_day || 30,
        payday_1_expected: Number(salaryRes.data.payday_1_expected) || 0,
        payday_2_expected: Number(salaryRes.data.payday_2_expected) || 0,
        is_semi_monthly: salaryRes.data.is_semi_monthly ?? true,
        updated_at: salaryRes.data.updated_at,
      };
    }

    // Parse budget rules
    let budgetRules: BudgetRules | null = null;
    if (budgetRes.data) {
      budgetRules = {
        id: budgetRes.data.id,
        user_id: budgetRes.data.user_id,
        preset_name: budgetRes.data.preset_name || "50/20/20/10",
        needs_percent: Number(budgetRes.data.needs_percent) || 50,
        wants_percent: Number(budgetRes.data.wants_percent) || 20,
        savings_percent: Number(budgetRes.data.savings_percent) || 20,
        debt_percent: Number(budgetRes.data.debt_percent) || 10,
        fourth_pillar_name: budgetRes.data.fourth_pillar_name || "Debt & Loans",
        category_allocations: budgetRes.data.category_allocations || {},
        alert_threshold_80: budgetRes.data.alert_threshold_80 ?? true,
        alert_threshold_90: budgetRes.data.alert_threshold_90 ?? true,
        alert_threshold_100: budgetRes.data.alert_threshold_100 ?? true,
        updated_at: budgetRes.data.updated_at,
      };
    }

    // Parse transactions
    const transactions: FinancialTransaction[] = (transactionsRes.data || []).map((t: any) => ({
      id: t.id,
      user_id: t.user_id,
      title: t.title,
      amount: Number(t.amount) || 0,
      type: t.type,
      category: t.category,
      payment_method: t.payment_method,
      account_id: t.account_id,
      payday_period: t.payday_period,
      date: t.date,
      notes: t.notes,
      created_at: t.created_at,
    }));

    // Parse income
    const incomeRecords: IncomeRecord[] = (incomeRes.data || []).map((i: any) => ({
      id: i.id,
      user_id: i.user_id,
      amount: Number(i.amount) || 0,
      date: i.date,
      payday_period: i.payday_period,
      type: i.type,
      account_id: i.account_id,
      notes: i.notes,
      created_at: i.created_at,
    }));

    // Parse savings goals
    const savingsGoals: SavingsGoal[] = (goalsRes.data || []).map((g: any) => ({
      id: g.id,
      user_id: g.user_id,
      name: g.name,
      target_amount: Number(g.target_amount) || 0,
      current_amount: Number(g.current_amount) || 0,
      target_date: g.target_date,
      color: g.color || "emerald",
      icon: g.icon || "piggy-bank",
      is_archived: Boolean(g.is_archived),
      created_at: g.created_at,
      updated_at: g.updated_at,
    }));

    // Parse movements
    const savingsMovements: SavingsMovement[] = (movementsRes.data || []).map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      goal_id: m.goal_id,
      amount: Number(m.amount) || 0,
      type: m.type,
      account_id: m.account_id,
      date: m.date,
      notes: m.notes,
      created_at: m.created_at,
    }));

    // Parse bills
    const bills: Bill[] = (billsRes.data || []).map((b: any) => ({
      id: b.id,
      user_id: b.user_id,
      name: b.name,
      amount: Number(b.amount) || 0,
      due_day: b.due_day,
      recurrence: b.recurrence || "monthly",
      category: b.category,
      account_id: b.account_id,
      status: b.status || "upcoming",
      notes: b.notes,
      created_at: b.created_at,
    }));

    // Parse loans
    const loans: Loan[] = (loansRes.data || []).map((l: any) => ({
      id: l.id,
      user_id: l.user_id,
      name: l.name,
      lender: l.lender,
      principal: Number(l.principal) || 0,
      current_balance: Number(l.current_balance) || 0,
      interest_rate: Number(l.interest_rate) || 0,
      interest_type: l.interest_type || "fixed",
      monthly_payment: Number(l.monthly_payment) || 0,
      payment_frequency: l.payment_frequency || "monthly",
      is_archived: Boolean(l.is_archived),
      notes: l.notes,
      created_at: l.created_at,
    }));

    // Parse notifications
    const notifications: NotificationItem[] = (notifsRes.data || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      is_read: Boolean(n.is_read),
      created_at: n.created_at,
    }));

    // Reconcile and guarantee account balances reflect transaction ledger if out of sync
    for (const acc of accounts) {
      const accTxs = transactions.filter((t) => t.account_id === acc.id);
      if (accTxs.length > 0) {
        const ledgerBalance = accTxs.reduce((sum, t) => {
          return sum + (t.type === "income" ? t.amount : -t.amount);
        }, 0);

        if (acc.balance === 0 && ledgerBalance > 0) {
          acc.balance = roundMoney(ledgerBalance);
          try {
            await supabase
              .from("financial_accounts")
              .update({ balance: acc.balance })
              .eq("id", acc.id)
              .eq("user_id", userId);
            console.log(`[DB] Reconciled ${acc.name} balance to ₱${acc.balance}`);
          } catch (e) {
            console.warn("Could not sync reconciled balance to cloud", e);
          }
        }
      }
    }

    // If there are transactions with null or mismatched account_id, attribute to default account
    const defaultAcc = accounts.find((a) => a.is_default) || accounts[0];
    if (defaultAcc) {
      const unmatchedTxs = transactions.filter(
        (t) => !t.account_id || !accounts.some((a) => a.id === t.account_id)
      );
      if (unmatchedTxs.length > 0) {
        const unmatchedDelta = unmatchedTxs.reduce(
          (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
          0
        );
        if (unmatchedDelta > 0 && defaultAcc.balance === 0) {
          defaultAcc.balance = roundMoney(unmatchedDelta);
          try {
            await supabase
              .from("financial_accounts")
              .update({ balance: defaultAcc.balance })
              .eq("id", defaultAcc.id)
              .eq("user_id", userId);
          } catch (e) {
            console.warn("Could not sync unmatched delta to cloud", e);
          }
        }
      }
    }

    return {
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
    };
  } catch (err) {
    console.error("Error loading user data from Supabase:", err);
    return null;
  }
}

/**
 * Inserts a transaction into Supabase and updates the associated account balance
 */
export async function syncInsertTransaction(
  userId: string,
  tx: FinancialTransaction,
  newAccountBalance?: number
) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    const accountUuid = tx.account_id && isValidUUID(tx.account_id) ? tx.account_id : null;

    // Check if accountUuid exists in Supabase to avoid foreign key violation
    let validAccountUuid: string | null = null;
    if (accountUuid) {
      const { data: accCheck } = await supabase
        .from("financial_accounts")
        .select("id")
        .eq("id", accountUuid)
        .eq("user_id", userId)
        .maybeSingle();

      if (accCheck?.id) {
        validAccountUuid = accCheck.id;
      }
    }

    // Fallback: match by payment method name if account not found by UUID
    if (!validAccountUuid && tx.payment_method) {
      const { data: matchedAcc } = await supabase
        .from("financial_accounts")
        .select("id")
        .eq("user_id", userId)
        .ilike("name", `%${tx.payment_method}%`)
        .maybeSingle();

      if (matchedAcc?.id) {
        validAccountUuid = matchedAcc.id;
      }
    }

    const row = {
      id: isValidUUID(tx.id) ? tx.id : generateUUID(),
      user_id: userId,
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      payment_method: tx.payment_method,
      account_id: validAccountUuid,
      payday_period: tx.payday_period || "other",
      date: tx.date,
      notes: tx.notes || null,
    };

    const { error: txErr } = await supabase.from("financial_transactions").insert(row);
    if (txErr) {
      console.error("[DB] Failed to insert transaction to Supabase:", txErr);
    }

    if (validAccountUuid && typeof newAccountBalance === "number") {
      const { error: accErr } = await supabase
        .from("financial_accounts")
        .update({ balance: newAccountBalance })
        .eq("id", validAccountUuid)
        .eq("user_id", userId);

      if (accErr) {
        console.error("[DB] Failed to update financial_accounts balance in Supabase:", accErr);
      }
    }
  } catch (err) {
    console.error("Failed to sync transaction to Supabase:", err);
  }
}

/**
 * Updates an account balance in Supabase
 */
export async function syncUpdateAccountBalance(userId: string, accountId: string, balance: number) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;
  try {
    const supabase = createClient();
    await supabase
      .from("financial_accounts")
      .update({ balance: roundMoney(balance) })
      .eq("id", accountId)
      .eq("user_id", userId);
  } catch (err) {
    console.error("Failed to update account balance in Supabase:", err);
  }
}

/**
 * Inserts an income record into Supabase
 */
export async function syncInsertIncome(userId: string, inc: IncomeRecord) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    const accountUuid = inc.account_id && isValidUUID(inc.account_id) ? inc.account_id : null;
    let validAccountUuid: string | null = null;
    if (accountUuid) {
      const { data: accCheck } = await supabase
        .from("financial_accounts")
        .select("id")
        .eq("id", accountUuid)
        .eq("user_id", userId)
        .maybeSingle();

      if (accCheck?.id) {
        validAccountUuid = accCheck.id;
      }
    }

    await supabase.from("income_records").insert({
      id: isValidUUID(inc.id) ? inc.id : generateUUID(),
      user_id: userId,
      amount: inc.amount,
      date: inc.date,
      payday_period: inc.payday_period || "other",
      type: inc.type || "salary",
      account_id: validAccountUuid,
      notes: inc.notes || null,
    });
  } catch (err) {
    console.error("Failed to sync income record to Supabase:", err);
  }
}

/**
 * Pushes all unsynced local data to Supabase for the authenticated user
 */
export async function syncAllLocalToCloud(userId: string, localData: any) {
  if (!isSupabaseConfigured() || !userId || userId === "guest" || !localData) return;

  try {
    // 1. Sync Salary Settings
    if (localData.salarySettings && localData.salarySettings.monthly_net > 0) {
      await syncSalarySettings(userId, localData.salarySettings);
    }

    // 2. Sync Budget Rules
    if (localData.budgetRules) {
      await syncBudgetRules(userId, localData.budgetRules);
    }

    // 3. Sync Accounts
    if (localData.accounts && Array.isArray(localData.accounts) && localData.accounts.length > 0) {
      for (const acc of localData.accounts) {
        await syncUpsertAccount(userId, acc);
      }
    }

    // 4. Sync Transactions
    if (localData.transactions && Array.isArray(localData.transactions) && localData.transactions.length > 0) {
      for (const tx of localData.transactions) {
        await syncInsertTransaction(userId, tx);
      }
    }

    // 5. Sync Bills
    if (localData.bills && Array.isArray(localData.bills) && localData.bills.length > 0) {
      for (const bill of localData.bills) {
        await syncInsertBill(userId, bill);
      }
    }

    // 6. Sync Income Records
    if (localData.incomeRecords && Array.isArray(localData.incomeRecords) && localData.incomeRecords.length > 0) {
      for (const inc of localData.incomeRecords) {
        await syncInsertIncome(userId, inc);
      }
    }

    console.log("[DB] Pushed local records to Supabase for user:", userId);
  } catch (err) {
    console.error("Failed to sync local data to Supabase:", err);
  }
}

/**
 * Deletes a transaction from Supabase and updates the account balance
 */
export async function syncDeleteTransaction(
  userId: string,
  txId: string,
  accountId?: string,
  revertedBalance?: number
) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    if (isValidUUID(txId)) {
      await supabase.from("financial_transactions").delete().eq("id", txId).eq("user_id", userId);
    }
    if (accountId && isValidUUID(accountId) && typeof revertedBalance === "number") {
      await supabase
        .from("financial_accounts")
        .update({ balance: revertedBalance })
        .eq("id", accountId)
        .eq("user_id", userId);
    }
  } catch (err) {
    console.error("Failed to sync delete transaction to Supabase:", err);
  }
}

/**
 * Upserts salary settings in Supabase
 */
export async function syncSalarySettings(userId: string, settings: SalarySettings) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    await supabase.from("salary_settings").upsert(
      {
        user_id: userId,
        monthly_net: settings.monthly_net,
        payday_1_day: settings.payday_1_day,
        payday_2_day: settings.payday_2_day,
        payday_1_expected: settings.payday_1_expected,
        payday_2_expected: settings.payday_2_expected,
        is_semi_monthly: settings.is_semi_monthly,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (err) {
    console.error("Failed to sync salary settings to Supabase:", err);
  }
}

/**
 * Upserts budget rules in Supabase
 */
export async function syncBudgetRules(userId: string, rules: BudgetRules) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    await supabase.from("budget_rules").upsert(
      {
        user_id: userId,
        preset_name: rules.preset_name || "50/20/20/10",
        needs_percent: rules.needs_percent,
        wants_percent: rules.wants_percent,
        savings_percent: rules.savings_percent,
        debt_percent: rules.debt_percent || 10,
        fourth_pillar_name: rules.fourth_pillar_name || "Debt & Loans",
        category_allocations: rules.category_allocations || {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (err) {
    console.error("Failed to sync budget rules to Supabase:", err);
  }
}

/**
 * Inserts or updates a financial account in Supabase
 */
export async function syncUpsertAccount(userId: string, acc: FinancialAccount) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    await supabase.from("financial_accounts").upsert({
      id: isValidUUID(acc.id) ? acc.id : generateUUID(),
      user_id: userId,
      name: acc.name,
      type: acc.type,
      balance: acc.balance,
      is_default: Boolean(acc.is_default),
      is_archived: Boolean(acc.is_archived),
    });
  } catch (err) {
    console.error("Failed to sync account to Supabase:", err);
  }
}

/**
 * Inserts a bill into Supabase
 */
export async function syncInsertBill(userId: string, bill: Bill) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    const accountUuid = bill.account_id && isValidUUID(bill.account_id) ? bill.account_id : null;

    await supabase.from("bills").insert({
      id: isValidUUID(bill.id) ? bill.id : generateUUID(),
      user_id: userId,
      name: bill.name,
      amount: bill.amount,
      due_day: bill.due_day,
      recurrence: bill.recurrence || "monthly",
      category: bill.category,
      account_id: accountUuid,
      status: bill.status || "upcoming",
      notes: bill.notes || null,
    });
  } catch (err) {
    console.error("Failed to sync bill to Supabase:", err);
  }
}

/**
 * Updates a bill status in Supabase
 */
export async function syncUpdateBillStatus(userId: string, billId: string, status: string) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    if (isValidUUID(billId)) {
      await supabase.from("bills").update({ status }).eq("id", billId).eq("user_id", userId);
    }
  } catch (err) {
    console.error("Failed to sync bill status to Supabase:", err);
  }
}

/**
 * Inserts a savings goal into Supabase
 */
export async function syncInsertSavingsGoal(userId: string, goal: SavingsGoal) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    await supabase.from("savings_goals").insert({
      id: isValidUUID(goal.id) ? goal.id : generateUUID(),
      user_id: userId,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount || 0,
      target_date: goal.target_date || null,
      color: goal.color || "emerald",
      icon: goal.icon || "piggy-bank",
    });
  } catch (err) {
    console.error("Failed to sync savings goal to Supabase:", err);
  }
}

/**
 * Updates savings goal balance and inserts a movement record
 */
export async function syncSavingsMovement(
  userId: string,
  movement: SavingsMovement,
  newGoalAmount: number,
  newAccountBalance?: number
) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    if (isValidUUID(movement.goal_id)) {
      await supabase
        .from("savings_goals")
        .update({ current_amount: newGoalAmount, updated_at: new Date().toISOString() })
        .eq("id", movement.goal_id)
        .eq("user_id", userId);

      await supabase.from("savings_movements").insert({
        id: isValidUUID(movement.id) ? movement.id : generateUUID(),
        user_id: userId,
        goal_id: movement.goal_id,
        amount: movement.amount,
        type: movement.type,
        account_id: movement.account_id && isValidUUID(movement.account_id) ? movement.account_id : null,
        date: movement.date,
        notes: movement.notes || null,
      });
    }

    if (movement.account_id && isValidUUID(movement.account_id) && typeof newAccountBalance === "number") {
      await supabase
        .from("financial_accounts")
        .update({ balance: newAccountBalance })
        .eq("id", movement.account_id)
        .eq("user_id", userId);
    }
  } catch (err) {
    console.error("Failed to sync savings movement to Supabase:", err);
  }
}

/**
 * Inserts a loan record into Supabase
 */
export async function syncInsertLoan(userId: string, loan: Loan) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    await supabase.from("loans").insert({
      id: isValidUUID(loan.id) ? loan.id : generateUUID(),
      user_id: userId,
      name: loan.name,
      lender: loan.lender,
      principal: loan.principal,
      current_balance: loan.current_balance,
      interest_rate: loan.interest_rate || 0,
      interest_type: loan.interest_type || "fixed",
      monthly_payment: loan.monthly_payment || 0,
      payment_frequency: loan.payment_frequency || "monthly",
      notes: loan.notes || null,
    });
  } catch (err) {
    console.error("Failed to sync loan to Supabase:", err);
  }
}

/**
 * Updates a loan balance in Supabase
 */
export async function syncLoanPayment(
  userId: string,
  loanId: string,
  newBalance: number,
  newAccountBalance?: number,
  accountId?: string
) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    if (isValidUUID(loanId)) {
      await supabase
        .from("loans")
        .update({ current_balance: newBalance })
        .eq("id", loanId)
        .eq("user_id", userId);
    }
    if (accountId && isValidUUID(accountId) && typeof newAccountBalance === "number") {
      await supabase
        .from("financial_accounts")
        .update({ balance: newAccountBalance })
        .eq("id", accountId)
        .eq("user_id", userId);
    }
  } catch (err) {
    console.error("Failed to sync loan payment to Supabase:", err);
  }
}

/**
 * Resets user cloud data in Supabase (clears transactions, bills, loans, etc.)
 */
export async function resetUserCloudData(userId: string) {
  if (!isSupabaseConfigured() || !userId || userId === "guest") return;

  try {
    const supabase = createClient();
    await Promise.all([
      supabase.from("financial_transactions").delete().eq("user_id", userId),
      supabase.from("income_records").delete().eq("user_id", userId),
      supabase.from("bills").delete().eq("user_id", userId),
      supabase.from("savings_goals").delete().eq("user_id", userId),
      supabase.from("loans").delete().eq("user_id", userId),
      supabase.from("financial_accounts").delete().eq("user_id", userId),
      supabase.from("salary_settings").delete().eq("user_id", userId),
      supabase.from("budget_rules").delete().eq("user_id", userId),
    ]);

    // Recreate clean default Philippine accounts with 0 balance
    const defaultAccounts = [
      { id: generateUUID(), user_id: userId, name: "MariBank", type: "bank", balance: 0, is_default: true, is_archived: false },
      { id: generateUUID(), user_id: userId, name: "GCash", type: "gcash", balance: 0, is_default: false, is_archived: false },
      { id: generateUUID(), user_id: userId, name: "Maya", type: "maya", balance: 0, is_default: false, is_archived: false },
      { id: generateUUID(), user_id: userId, name: "SeaBank", type: "bank", balance: 0, is_default: false, is_archived: false },
      { id: generateUUID(), user_id: userId, name: "Cash on Hand", type: "cash", balance: 0, is_default: false, is_archived: false },
    ];
    await supabase.from("financial_accounts").insert(defaultAccounts);
  } catch (err) {
    console.error("Failed to reset user cloud data:", err);
  }
}
