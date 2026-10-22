"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, ArrowRight, Sparkles, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useFinance } from "@/lib/store/finance-context";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { loadDemoData } = useFinance();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message || "Failed to sign in. Please check your credentials.");
          setLoading(false);
          return;
        }

        toast.success("Welcome back to PayWise!");
        router.push("/dashboard");
        return;
      } catch (err: unknown) {
        console.error("Supabase login error:", err);
        toast.error("Authentication error. Falling back to local session.");
      }
    }

    // Local / Offline fallback
    setTimeout(() => {
      setLoading(false);
      toast.success("Welcome back to PayWise!");
      router.push("/dashboard");
    }, 400);
  };

  const handleDemoLogin = () => {
    loadDemoData();
    toast.success("Loaded Philippine Demo Data (₱30k salary, 15th/30th schedule)");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ref-gradient-canvas">
      <div className="w-full max-w-md rounded-[32px] border border-border/60 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ref-blue text-white shadow-xs mb-3">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ref-navy">Welcome Back</h1>
          <p className="mt-1 text-xs text-ref-muted">Sign in to your PayWise account</p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mt-6 rounded-2xl border border-sky-100 dark:border-slate-700 bg-[#DDF3FF]/60 dark:bg-slate-900/60 p-4 text-center">
          <p className="text-xs font-semibold text-sky-800 dark:text-sky-300">
            Want to test every feature instantly with realistic data?
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="mt-2.5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-ref-blue py-2.5 px-4 text-xs font-bold text-white shadow-2xs hover:bg-ref-blue/90 active:scale-95 transition-all min-h-[40px]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Sign In with Demo Mode (1-Click)
          </button>
        </div>

        <div className="relative my-6 text-center text-xs text-ref-muted font-semibold">
          <span className="bg-white dark:bg-slate-800 px-2">or continue with email</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ref-muted mb-1.5">
              Email address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-ref-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan.delacruz@paywise.ph"
                className="w-full rounded-2xl border border-sky-100 dark:border-slate-700 bg-sky-50/30 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 text-sm font-semibold text-ref-navy focus:outline-none focus:ring-2 focus:ring-ref-blue min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ref-muted mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-ref-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-sky-100 dark:border-slate-700 bg-sky-50/30 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 text-sm font-semibold text-ref-navy focus:outline-none focus:ring-2 focus:ring-ref-blue min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-ref-blue py-3 text-xs font-bold text-white shadow-xs hover:bg-ref-blue/90 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Signing in..." : "Sign In to PayWise"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ref-muted font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-ref-blue hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
