"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { LoanFormModal } from "@/components/loans/LoanFormModal";
import { calculateDebtOverview, generateAmortizationSchedule } from "@/lib/calculations/loans";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Loan } from "@/types";

export default function LoansPage() {
  const { loans, recordLoanPayment, accounts } = useFinance();

  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Loan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [viewScheduleLoan, setViewScheduleLoan] = useState<Loan | null>(null);

  const debtOverview = calculateDebtOverview(loans);

  const handleMakePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForPayment || paymentAmount <= 0) return;

    recordLoanPayment(selectedLoanForPayment.id, paymentAmount, accounts[0]?.id);
    toast.success(`Payment of ₱${paymentAmount.toLocaleString()} recorded for ${selectedLoanForPayment.name}`);
    setSelectedLoanForPayment(null);
    setPaymentAmount(0);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <CreditCard className="h-7 w-7 text-rose-600" />
              Loans & Debt Management
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Monitor debt balances, interest rates, installment dates, and amortization.
            </p>
          </div>

          <button
            onClick={() => setIsAddLoanOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            Add Loan / Debt
          </button>
        </div>

        {/* Total Debt Summary Hero */}
        <div className="rounded-3xl border border-rose-500/20 bg-card p-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Outstanding Debt
              </p>
              <div className="mt-1">
                <CurrencyDisplay amount={debtOverview.totalCurrentBalance} size="3xl" weight="bold" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Original Principal: ₱{debtOverview.totalPrincipal.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly Debt Installments
              </p>
              <div className="mt-1">
                <CurrencyDisplay amount={debtOverview.totalMonthlyObligations} size="2xl" weight="bold" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                across {debtOverview.totalLoansCount} active obligation{debtOverview.totalLoansCount === 1 ? "" : "s"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Projected Debt-Free
              </p>
              <div className="mt-1 font-mono text-2xl font-extrabold text-foreground">
                {debtOverview.projectedDebtFreeMonths > 0
                  ? `~${debtOverview.projectedDebtFreeMonths} Months`
                  : "Debt Free!"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                at current regular monthly payment rate
              </p>
            </div>
          </div>
        </div>

        {/* Loans List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loans.map((loan) => {
            const isZero = loan.current_balance <= 0;
            const progress = loan.principal > 0
              ? Math.round(((loan.principal - loan.current_balance) / loan.principal) * 100)
              : 100;

            return (
              <div
                key={loan.id}
                className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{loan.name}</h3>
                      <p className="text-xs text-muted-foreground">{loan.lender}</p>
                    </div>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isZero ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"
                    }`}>
                      {isZero ? "Fully Paid" : "Active"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block">Remaining Balance</span>
                      <CurrencyDisplay amount={loan.current_balance} size="xl" weight="bold" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Installment</span>
                      <CurrencyDisplay amount={loan.monthly_payment} size="base" weight="semibold" />
                    </div>
                  </div>

                  {/* Progress bar (paid off percentage) */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Repayment Progress</span>
                      <span className="font-mono font-bold text-emerald-600">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Interest Rate:</span>
                      <span className="font-semibold text-foreground">{loan.interest_rate}% p.a. ({loan.interest_type})</span>
                    </div>
                    {loan.next_due_date && (
                      <div className="flex justify-between">
                        <span>Next Due Date:</span>
                        <span className="font-semibold text-foreground">{formatDate(loan.next_due_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedLoanForPayment(loan);
                      setPaymentAmount(loan.monthly_payment || 1000);
                    }}
                    disabled={isZero}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-95 active:scale-95 disabled:opacity-50 min-h-[44px]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Record Payment
                  </button>

                  <button
                    onClick={() => setViewScheduleLoan(loan)}
                    className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 active:scale-95 min-h-[44px]"
                  >
                    Amortization
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Amortization Schedule Drawer/Modal */}
        {viewScheduleLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-base font-bold text-foreground">
                  Estimated Amortization: {viewScheduleLoan.name}
                </h3>
                <button
                  onClick={() => setViewScheduleLoan(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4">
                <table className="w-full text-xs text-left">
                  <thead className="border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-2">Month</th>
                      <th className="py-2 text-right">Payment</th>
                      <th className="py-2 text-right">Principal</th>
                      <th className="py-2 text-right">Interest</th>
                      <th className="py-2 text-right">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-mono">
                    {generateAmortizationSchedule(
                      viewScheduleLoan.current_balance,
                      viewScheduleLoan.interest_rate,
                      viewScheduleLoan.monthly_payment
                    ).schedule.slice(0, 12).map((row) => (
                      <tr key={row.month}>
                        <td className="py-2 font-semibold">M{row.month}</td>
                        <td className="py-2 text-right">₱{row.payment.toLocaleString()}</td>
                        <td className="py-2 text-right text-emerald-600">₱{row.principal.toLocaleString()}</td>
                        <td className="py-2 text-right text-rose-600">₱{row.interest.toLocaleString()}</td>
                        <td className="py-2 text-right font-bold">₱{row.remainingBalance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {selectedLoanForPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <h3 className="text-base font-bold text-foreground">
                Record Payment: {selectedLoanForPayment.name}
              </h3>
              <form onSubmit={handleMakePayment} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Payment Amount
                  </label>
                  <CurrencyInput value={paymentAmount} onChange={setPaymentAmount} autoFocus />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLoanForPayment(null)}
                    className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentAmount <= 0}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-50 min-h-[44px]"
                  >
                    Confirm Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <LoanFormModal
        isOpen={isAddLoanOpen}
        onClose={() => setIsAddLoanOpen(false)}
      />
    </AppShell>
  );
}
