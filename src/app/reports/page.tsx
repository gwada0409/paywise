"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart as PieIcon,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { calculateSpendingByCategory } from "@/lib/calculations/finance";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#2563eb", // blue
  "#9333ea", // purple
  "#059669", // emerald
  "#d97706", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#64748b", // slate
];

export default function ReportsPage() {
  const {
    transactions,
    incomeRecords,
    budgetSummary,
    spendableBreakdown,
    salarySettings,
    savingsGoals,
    loans,
  } = useFinance();

  const [dateFilter, setDateFilter] = useState("all");

  const categoryBreakdown = useMemo(() => {
    return calculateSpendingByCategory(transactions);
  }, [transactions]);

  const pieData = categoryBreakdown.slice(0, 6).map((c, idx) => ({
    name: c.category,
    value: c.amount,
    color: COLORS[idx % COLORS.length],
  }));

  const totalIncome = incomeRecords.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "need" || t.type === "want" || t.type === "bill_payment")
    .reduce((s, t) => s + t.amount, 0);

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
    link.setAttribute("download", `PayWise_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV export downloaded successfully.");
  };

  // PDF Export
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("PayWise Financial Summary Report", 14, 22);

      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString("en-PH")}`, 14, 30);
      doc.text(`Monthly Expected Salary: PHP ${salarySettings.monthly_net.toLocaleString()}`, 14, 36);
      doc.text(`Total Income Logged: PHP ${totalIncome.toLocaleString()}`, 14, 42);
      doc.text(`Total Expenses Logged: PHP ${totalExpenses.toLocaleString()}`, 14, 48);
      doc.text(`Available Spendable Balance: PHP ${spendableBreakdown.availableToSpend.toLocaleString()}`, 14, 54);

      doc.setFontSize(13);
      doc.text("Spending by Category", 14, 68);

      doc.setFontSize(9);
      let y = 76;
      categoryBreakdown.forEach((cat, index) => {
        if (y < 280) {
          doc.text(`${index + 1}. ${cat.category}: PHP ${cat.amount.toLocaleString()} (${cat.percentage}%)`, 16, y);
          y += 6;
        }
      });

      doc.save(`PayWise_Summary_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF summary generated.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF.");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <BarChart3 className="h-7 w-7 text-primary" />
              Reports & Analytics
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Visual cash flow trends, category distributions, and statements.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted/50 active:scale-95 transition-all min-h-[44px]"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Total Income</span>
            <div className="mt-1">
              <CurrencyDisplay amount={totalIncome} size="lg" weight="bold" type="income" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Total Expenses</span>
            <div className="mt-1">
              <CurrencyDisplay amount={totalExpenses} size="lg" weight="bold" type="expense" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Needs Spending</span>
            <div className="mt-1">
              <CurrencyDisplay amount={budgetSummary.spent_needs} size="lg" weight="bold" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <span className="text-xs text-muted-foreground">Wants Spending</span>
            <div className="mt-1">
              <CurrencyDisplay amount={budgetSummary.spent_wants} size="lg" weight="bold" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Donut Chart */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-base font-bold text-foreground mb-1">Expenses by Category</h2>
            <p className="text-xs text-muted-foreground mb-4">Breakdown of everyday expenditures.</p>

            <div className="h-64 w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`₱${val.toLocaleString()}`, "Amount"]}
                      contentStyle={{
                        borderRadius: "12px",
                        backgroundColor: "#1e293b",
                        border: "none",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No expense records to chart.
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart: Needs vs Wants vs Savings */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-base font-bold text-foreground mb-1">50/30/20 Budget Performance</h2>
            <p className="text-xs text-muted-foreground mb-4">Spent vs Target Allocation</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      category: "Needs (50%)",
                      Spent: budgetSummary.spent_needs,
                      Target: budgetSummary.allocated_needs,
                    },
                    {
                      category: "Wants (30%)",
                      Spent: budgetSummary.spent_wants,
                      Target: budgetSummary.allocated_wants,
                    },
                    {
                      category: "Savings (20%)",
                      Spent: budgetSummary.saved_amount,
                      Target: budgetSummary.allocated_savings,
                    },
                  ]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: number) => [`₱${val.toLocaleString()}`, ""]}
                    contentStyle={{
                      borderRadius: "12px",
                      backgroundColor: "#1e293b",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spent" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-slate-400" />
                <span>Target Allocation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-600" />
                <span>Actual Usage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Category Table */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-base font-bold text-foreground mb-4">Category Spending Breakdown</h2>

          <table className="w-full text-xs text-left">
            <thead className="border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Transactions</th>
                <th className="py-2.5 text-right">% of Total</th>
                <th className="py-2.5 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {categoryBreakdown.map((cat) => (
                <tr key={cat.category}>
                  <td className="py-2.5 font-semibold text-foreground">{cat.category}</td>
                  <td className="py-2.5 text-muted-foreground">{cat.count} txns</td>
                  <td className="py-2.5 text-right font-mono">{cat.percentage}%</td>
                  <td className="py-2.5 text-right font-mono font-bold text-foreground">
                    ₱{cat.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
