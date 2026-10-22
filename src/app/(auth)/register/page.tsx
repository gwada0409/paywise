"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, ArrowRight, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) {
          toast.error(error.message || "Failed to create account.");
          setLoading(false);
          return;
        }

        // If email confirmation is enabled on Supabase
        if (data?.session) {
          toast.success("Account created successfully!");
          router.push("/onboarding");
        } else {
          toast.success("Account created! Please check your email to confirm your account.");
          router.push("/login");
        }
        return;
      } catch (err: unknown) {
        console.error("Supabase register error:", err);
        toast.error("Registration error. Continuing in local mode.");
      }
    }

    // Local / Offline fallback
    setTimeout(() => {
      setLoading(false);
      toast.success("Account created successfully!");
      router.push("/onboarding");
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ref-gradient-canvas">
      <div className="w-full max-w-md rounded-[32px] border border-border/60 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ref-blue text-white shadow-xs mb-3">
            <Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ref-navy">Create Account</h1>
          <p className="mt-1 text-xs text-ref-muted">Start managing your paydays with PayWise</p>
        </div>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ref-muted mb-1.5">
              Full name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4 w-4 text-ref-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Dela Cruz"
                className="w-full rounded-2xl border border-sky-100 dark:border-slate-700 bg-sky-50/30 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 text-sm font-semibold text-ref-navy focus:outline-none focus:ring-2 focus:ring-ref-blue min-h-[44px]"
              />
            </div>
          </div>

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
                placeholder="At least 6 characters"
                className="w-full rounded-2xl border border-sky-100 dark:border-slate-700 bg-sky-50/30 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 text-sm font-semibold text-ref-navy focus:outline-none focus:ring-2 focus:ring-ref-blue min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-ref-blue py-3 text-xs font-bold text-white shadow-xs hover:bg-ref-blue/90 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Creating..." : "Continue to Onboarding"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ref-muted font-medium">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-ref-blue hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
