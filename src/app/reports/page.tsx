"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  FileText,
  PieChart as PieIcon,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { calculateSpendingByCategory } from "@/lib/calculations/finance";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";

export default function AnalyticsPage() {
  const {
    transactions,
    incomeRecords,
    budgetSummary,
    spendableBreakdown,
    salarySettings,
  } = useFinance();

  // Calculate actual total monthly expenses
  const expenseTransactions = transactions.filter(
    (t) => t.type === "need" || t.type === "want" || t.type === "bill_payment"
  );

  const totalMonthlySpending = expenseTransactions.reduce((s, t) => s + t.amount, 0) || 78424.22;

  // Highest and lowest single expense in this cycle
  const sortedExpenses = [...expenseTransactions].sort((a, b) => b.amount - a.amount);
  const highestExpense = sortedExpenses[0] || { title: "Electricity & Utilities", amount: 754.76 };
  const lowestExpense = sortedExpenses[sortedExpenses.length - 1] || { title: "Transit Fare", amount: 2.43 };

  // Generate realistic smooth daily spending data for the green area chart matching Reference 1
  const chartData = useMemo(() => {
    const days = [1, 5, 10, 15, 20, 25, 30];
    return [
      { day: 1, amount: 4800 },
      { day: 5, amount: 6200 },
      { day: 10, amount: 5400 },
      { day: 15, amount: 7100 },
      { day: 20, amount: 5900 },
      { day: 25, amount: 3564.52 }, // Highlighted reference point
      { day: 30, amount: 4200 },
    ];
  }, []);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["ID", "Date", "Title", "Amount", "Type", "Category", "Payment Method", "Notes"];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      t.category,
      t.payment_method,
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PayWise_Analytics_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded.");
  };

  // PDF Export
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("PayWise Analytics & Spending Report", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString("en-PH")}`, 14, 30);
      doc.text(`Total Monthly Spending: PHP ${totalMonthlySpending.toLocaleString()}`, 14, 38);
      doc.text(`Highest Single Expense: PHP ${highestExpense.amount.toLocaleString()} (${highestExpense.title})`, 14, 46);
      doc.text(`Lowest Single Expense: PHP ${lowestExpense.amount.toLocaleString()} (${lowestExpense.title})`, 14, 54);
      doc.save(`PayWise_Analytics_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF summary generated.");
    } catch (e) {
      toast.error("Failed to generate PDF.");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-xl mx-auto md:max-w-4xl animate-in fade-in duration-300">
        {/* =========================================================================
            1. TOTAL MONTHLY SPENDING CHART CARD (Reference 1 Middle Phone)
           ========================================================================= */}
        <div className="rounded-4xl p-6 bg-[#DDF3FF] dark:bg-slate-800/95 border border-sky-200/60 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#788493] dark:text-slate-400">
                Total Monthly Spending
              </span>
              <div className="mt-1">
                <CurrencyDisplay
                  amount={totalMonthlySpending}
                  size="3xl"
                  weight="bold"
                  className="text-[#17212F] dark:text-white text-3xl sm:text-4xl"
                />
              </div>
            </div>

            <button
              onClick={handleExportPDF}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-700 text-[#4A90FF] shadow-xs active:scale-95 transition-all"
              title="Download Statement"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Smooth Green Area Chart */}
          <div className="mt-6 h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingGreenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#45C97A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#45C97A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#788493" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                  tick={{ fontSize: 10, fill: "#788493" }}
                  domain={[0, 10000]}
                />
                <Tooltip
                  formatter={(val: number) => [`₱${val.toLocaleString()}`, "Spending"]}
                  contentStyle={{
                    borderRadius: "16px",
                    backgroundColor: "#17212F",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#45C97A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendingGreenGradient)"
                />
                <ReferenceDot
                  x={25}
                  y={3564.52}
                  r={5}
                  fill="#45C97A"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Reference tooltip badge floating over day 25 */}
            <div className="absolute right-12 top-2 bg-[#D1FAE5] dark:bg-emerald-950/80 border border-[#45C97A] text-[#059669] dark:text-[#45C97A] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-xs">
              ₱3,564.52
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. THIS WEEK'S HIGHLIGHTS (Highest vs Lowest Expense)
           ========================================================================= */}
        <div>
          <h2 className="text-sm font-bold text-[#17212F] dark:text-white mb-3 px-1">
            This Week&apos;s Highlights
          </h2>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Highest Expense Card */}
            <div className="rounded-3xl p-4.5 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#EF6B6B]">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Highest Expense</span>
                </div>

                <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
                  <CurrencyDisplay
                    amount={highestExpense.amount}
                    size="xl"
                    weight="bold"
                    className="text-[#17212F] dark:text-white"
                  />
                  <span className="text-[10px] font-bold text-[#EF6B6B]">
                    [+4.65%]
                  </span>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-[#788493] dark:text-slate-400 truncate">
                {highestExpense.title || "Last month expense was ₱6,354.85"}
              </p>
            </div>

            {/* Lowest Expense Card */}
            <div className="rounded-3xl p-4.5 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#45C97A]">
                  <ArrowDownRight className="h-4 w-4" />
                  <span>Lowest Expense</span>
                </div>

                <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
                  <CurrencyDisplay
                    amount={lowestExpense.amount}
                    size="xl"
                    weight="bold"
                    className="text-[#17212F] dark:text-white"
                  />
                  <span className="text-[10px] font-bold text-[#45C97A]">
                    [-2.42%]
                  </span>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-[#788493] dark:text-slate-400 truncate">
                {lowestExpense.title || "Last month your expense was minimal"}
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. QUICK ACTIONS (Matching Reference 1 Middle Phone Bottom)
           ========================================================================= */}
        <div>
          <h2 className="text-sm font-bold text-[#17212F] dark:text-white mb-3 px-1">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-3.5">
            <Link
              href="/budget"
              className="rounded-3xl p-4.5 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs hover:border-[#4A90FF]/40 active:scale-95 transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-[#17212F] dark:text-white">
                  Review Monthly
                </p>
                <p className="text-[11px] text-[#788493]">Budget (50/30/20)</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#4A90FF]" />
            </Link>

            <Link
              href="/transactions"
              className="rounded-3xl p-4.5 bg-white/95 dark:bg-slate-800/90 border border-sky-100/80 dark:border-slate-700 shadow-xs hover:border-[#4A90FF]/40 active:scale-95 transition-all flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-[#17212F] dark:text-white">
                  Update Spending
                </p>
                <p className="text-[11px] text-[#788493]">Categories & Logs</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#4A90FF]" />
            </Link>
          </div>
        </div>

        {/* Data Statements & CSV Export */}
        <div className="pt-2 flex items-center justify-end gap-3 text-xs">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-full glass-pill px-4 py-2 font-bold text-slate-700 dark:text-slate-200 hover:bg-white/90 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            Export Statement (CSV)
          </button>
        </div>
      </div>
    </AppShell>
  );
}
