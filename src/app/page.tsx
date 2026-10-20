import Link from "next/link";
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PieChart,
  CalendarDays,
  Smartphone,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">PayWise</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-all"
            >
              Try Live Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-6 animate-pulse-subtle">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Tailored for Philippine Semi-Monthly Paydays & Gemini AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Make Every Payday Count.
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Master your 15th and 30th salary schedules. Know your true spendable balance, divide income into Needs, Wants, and Savings, reserve upcoming bills, and get intelligent answers from Google Gemini AI.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-md hover:opacity-95 active:scale-95 transition-all"
          >
            Launch Interactive Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/onboarding"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground hover:bg-muted/50 active:scale-95 transition-all"
          >
            Setup Wizard (Onboarding)
          </Link>
        </div>

        {/* Key Feature Highlights */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Semi-Monthly Paydays</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Track 15th and 30th salary days with intelligent February leap-year clamping and unequal payout distributions.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-4">
              <PieChart className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">50/30/20 Smart Budget</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Keep Needs, Wants, and Savings strictly isolated. Get automated threshold alerts before you overspend.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-primary/40 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">PayWise AI Assistant</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Ask "Can I afford this?" in English, Tagalog, or Taglish. Powered by Gemini with server-side context privacy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 PayWise. Built for Philippine employees and smart earners.</p>
      </footer>
    </div>
  );
}
