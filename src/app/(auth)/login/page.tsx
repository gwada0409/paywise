"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, ArrowRight, Sparkles, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useFinance } from "@/lib/store/finance-context";

export default function LoginPage() {
  const router = useRouter();
  const { loadDemoData } = useFinance();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-3">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your PayWise account</p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-center">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Want to test every feature instantly with realistic data?
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="mt-2.5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 dark:bg-amber-500 py-2.5 px-3 text-xs font-bold text-white shadow-xs hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Sign In with Demo Mode (1-Click)
          </button>
        </div>

        <div className="relative my-6 text-center text-xs uppercase text-muted-foreground">
          <span className="bg-card px-2">or continue with email</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@example.com"
                className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
