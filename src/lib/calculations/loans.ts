import { Loan } from "@/types";
import { roundMoney } from "../utils";

export interface AmortizationMonth {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

/**
 * Calculates monthly loan installment using standard amortization formula
 * P = Principal, annualRate = Annual interest percentage (e.g. 5 for 5%), months = duration
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRate <= 0) return roundMoney(principal / months);

  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  const payment = (principal * (monthlyRate * factor)) / (factor - 1);
  return roundMoney(payment);
}

/**
 * Generates an estimated amortization schedule for a loan
 */
export function generateAmortizationSchedule(
  balance: number,
  annualRate: number,
  monthlyPayment: number,
  maxMonths: number = 120
): { schedule: AmortizationMonth[]; estimatedMonths: number } {
  const schedule: AmortizationMonth[] = [];
  let remaining = balance;
  const monthlyRate = annualRate / 100 / 12;
  let month = 1;

  while (remaining > 0 && month <= maxMonths) {
    const interest = roundMoney(remaining * monthlyRate);
    let principal = roundMoney(monthlyPayment - interest);

    if (principal <= 0) {
      // Monthly payment too low to even cover interest
      break;
    }

    if (principal > remaining) {
      principal = remaining;
    }

    const actualPayment = roundMoney(principal + interest);
    remaining = roundMoney(Math.max(0, remaining - principal));

    schedule.push({
      month,
      payment: actualPayment,
      principal,
      interest,
      remainingBalance: remaining,
    });

    if (remaining === 0) break;
    month++;
  }

  return {
    schedule,
    estimatedMonths: schedule.length,
  };
}

/**
 * Computes overall debt metrics across all active loans
 */
export interface DebtOverview {
  totalPrincipal: number;
  totalCurrentBalance: number;
  totalMonthlyObligations: number;
  totalLoansCount: number;
  projectedDebtFreeMonths: number;
}

export function calculateDebtOverview(loans: Loan[]): DebtOverview {
  let totalPrincipal = 0;
  let totalCurrentBalance = 0;
  let totalMonthlyObligations = 0;
  let activeLoans = 0;

  for (const loan of loans) {
    if (loan.is_archived || loan.current_balance <= 0) continue;
    activeLoans++;
    totalPrincipal += loan.principal;
    totalCurrentBalance += loan.current_balance;
    totalMonthlyObligations += loan.monthly_payment;
  }

  const projectedDebtFreeMonths =
    totalMonthlyObligations > 0
      ? Math.ceil(totalCurrentBalance / totalMonthlyObligations)
      : 0;

  return {
    totalPrincipal: roundMoney(totalPrincipal),
    totalCurrentBalance: roundMoney(totalCurrentBalance),
    totalMonthlyObligations: roundMoney(totalMonthlyObligations),
    totalLoansCount: activeLoans,
    projectedDebtFreeMonths,
  };
}
