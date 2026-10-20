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
    <div className="min-h-screen ref-gradient-canvas text-ref-navy flex flex-col selection:bg-ref-blue/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-white/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ref-blue text-white shadow-xs">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-ref-navy">PayWise</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-ref-muted hover:text-ref-navy transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-ref-blue px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-ref-blue/90 active:scale-95 transition-all"
            >
              Try Live Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-4 py-1.5 text-xs font-bold text-sky-800 mb-6 shadow-2xs backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-ref-blue" />
          <span>Tailored for Philippine Semi-Monthly Paydays & Gemini AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-ref-navy leading-[1.12]">
          Make Every Payday Count.
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-ref-muted max-w-2xl leading-relaxed">
          Master your 15th and 30th salary schedules. Know your true spendable balance, divide income into Needs, Wants, and Savings, reserve upcoming bills, and get intelligent answers from Google Gemini AI.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-ref-blue px-7 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-ref-blue/90 active:scale-95 transition-all"
          >
            Launch Interactive Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/onboarding"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-white/90 px-6 py-3.5 text-sm font-bold text-ref-navy hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          >
            Setup Wizard (Onboarding)
          </Link>
        </div>

        {/* Key Feature Highlights */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
          <div className="rounded-[28px] border border-border/60 bg-white/95 p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-ref-blue mb-4">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-ref-navy">Semi-Monthly Paydays</h3>
            <p className="mt-2 text-xs sm:text-sm text-ref-muted leading-relaxed">
              Track 15th and 30th salary days with intelligent February leap-year clamping and unequal payout distributions.
            </p>
          </div>

          <div className="rounded-[28px] border border-border/60 bg-white/95 p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 mb-4">
              <PieChart className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-ref-navy">50/30/20 Smart Budget</h3>
            <p className="mt-2 text-xs sm:text-sm text-ref-muted leading-relaxed">
              Keep Needs, Wants, and Savings strictly isolated. Get automated threshold alerts before you overspend.
            </p>
          </div>

          <div className="rounded-[28px] border border-border/60 bg-white/95 p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-ref-green mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-ref-navy">PayWise AI Assistant</h3>
            <p className="mt-2 text-xs sm:text-sm text-ref-muted leading-relaxed">
              Ask &quot;Can I afford this?&quot; in English, Tagalog, or Taglish. Powered by Gemini with server-side context privacy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-ref-muted">
        <p>© 2026 PayWise. Built for Philippine employees and smart earners.</p>
      </footer>
    </div>
  );
}
