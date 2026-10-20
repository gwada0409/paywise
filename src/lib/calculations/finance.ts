import { FinancialAccount, FinancialTransaction, IncomeRecord, Bill } from "@/types";
import { roundMoney } from "../utils";

export interface SpendableBalanceBreakdown {
  liquidCashTotal: number;
  reservedBillsTotal: number;
  availableToSpend: number;
  creditCardLiabilities: number;
}

/**
 * Calculates current spendable balance:
 * Only actual money in liquid accounts (Cash, GCash, Maya, Bank) counts.
 * Displays reserved obligations clearly without treating unpaid bills as already-spent money.
 */
export function calculateSpendableBalance(
  accounts: FinancialAccount[],
  upcomingBillsBeforePayday: Bill[] = []
): SpendableBalanceBreakdown {
  let liquidCash = 0;
  let creditCardLiabilities = 0;

  for (const acc of accounts) {
    if (acc.is_archived) continue;
    if (acc.type === "credit_card") {
      // Negative balance represents debt
      if (acc.balance < 0) {
        creditCardLiabilities += Math.abs(acc.balance);
      }
    } else {
      // Cash, GCash, Maya, Bank
      liquidCash += acc.balance;
    }
  }

  // Calculate unpaid upcoming bills
  let reservedBills = 0;
  for (const b of upcomingBillsBeforePayday) {
    if (b.status !== "paid") {
      reservedBills += b.amount;
    }
  }

  liquidCash = roundMoney(liquidCash);
  reservedBills = roundMoney(reservedBills);
  creditCardLiabilities = roundMoney(creditCardLiabilities);

  // Available to spend is liquid cash minus immediate required bill obligations
  const availableToSpend = roundMoney(Math.max(0, liquidCash - reservedBills));

  return {
    liquidCashTotal: liquidCash,
    reservedBillsTotal: reservedBills,
    availableToSpend,
    creditCardLiabilities,
  };
}

/**
 * Computes total actual income received in a specific month
 */
export function calculateIncomeReceivedForMonth(
  records: IncomeRecord[],
  year: number,
  monthIndex: number
): number {
  let total = 0;
  for (const rec of records) {
    const d = new Date(rec.date);
    if (d.getFullYear() === year && d.getMonth() === monthIndex) {
      total += rec.amount;
    }
  }
  return roundMoney(total);
}

/**
 * Groups transactions by category with total amount, count, and percentage
 */
export interface CategorySpending {
  category: string;
  type: string;
  amount: number;
  count: number;
  percentage: number;
}

export function calculateSpendingByCategory(
  transactions: FinancialTransaction[]
): CategorySpending[] {
  const map = new Map<string, { category: string; type: string; amount: number; count: number }>();
  let totalExpenses = 0;

  for (const tx of transactions) {
    // Only count expenses (Needs, Wants, Bill Payments)
    if (tx.type === "need" || tx.type === "want" || tx.type === "bill_payment") {
      totalExpenses += tx.amount;
      const key = tx.category || "Uncategorized";
      const existing = map.get(key) || { category: key, type: tx.type, amount: 0, count: 0 };
      existing.amount += tx.amount;
      existing.count += 1;
      map.set(key, existing);
    }
  }

  const result: CategorySpending[] = [];
  map.forEach((val) => {
    result.push({
      category: val.category,
      type: val.type,
      amount: roundMoney(val.amount),
      count: val.count,
      percentage: totalExpenses > 0 ? Math.round((val.amount / totalExpenses) * 100) : 0,
    });
  });

  // Sort descending by amount
  return result.sort((a, b) => b.amount - a.amount);
}
