"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { maskApiKey } from "@/lib/security/encryption";
import { SUPPORTED_GEMINI_MODELS } from "@/lib/ai/gemini";
import { toast } from "sonner";

export default function AISettingsPage() {
  const {
    aiPreferences,
    setAIPreferences,
    clientApiKey,
    setClientApiKey,
  } = useFinance();

  const [inputKey, setInputKey] = useState("");
  const [selectedModel, setSelectedModel] = useState(aiPreferences.model_name || "gemini-1.5-flash");
  const [isEnabled, setIsEnabled] = useState(aiPreferences.is_enabled);
  const [shareContext, setShareContext] = useState(aiPreferences.share_financial_context);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: inputKey.trim() || clientApiKey || undefined,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        toast.success("Gemini API connection verified!");
      } else {
        toast.error(data.message || "Connection failed");
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "Failed to test Gemini connection.",
      });
      toast.error("Failed to test connection.");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (inputKey.trim()) {
      setClientApiKey(inputKey.trim());
      setInputKey("");
    }

    setAIPreferences({
      is_enabled: isEnabled,
      model_name: selectedModel,
      share_financial_context: shareContext,
    });

    toast.success("AI Preferences saved successfully.");
  };

  const handleRemoveKey = () => {
    setClientApiKey("");
    setInputKey("");
    toast.info("Configured custom API key removed.");
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-white/90 text-ref-navy hover:bg-slate-50 shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ref-navy flex items-center gap-2">
              <Bot className="h-6 w-6 text-ref-green" />
              Google Gemini AI Settings
            </h1>
            <p className="text-xs text-ref-muted">
              Configure your API key, preferred model, and context sharing privacy.
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="rounded-[28px] sm:rounded-[32px] border border-border/60 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-xs space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div>
              <h2 className="text-sm font-bold text-ref-navy">Enable PayWise AI Assistant</h2>
              <p className="text-xs text-ref-muted">
                Power the chat assistant and affordability analyzer with Google Gemini.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="h-5 w-5 accent-ref-green rounded cursor-pointer"
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ref-muted mb-1.5">
              Gemini Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-2xl border border-sky-100 bg-sky-50/30 px-4 py-2.5 text-sm font-semibold text-ref-navy focus:outline-none focus:ring-2 focus:ring-ref-green min-h-[44px]"
            >
              {SUPPORTED_GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* API Key Configuration */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ref-muted">
              Gemini API Key
            </label>

            {clientApiKey && (
              <div className="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/40 px-4 py-3">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="h-4 w-4 text-ref-green" />
                  <span className="font-mono text-ref-muted font-medium">
                    Active Key: {maskApiKey(clientApiKey)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
            )}

            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder={clientApiKey ? "Enter new key to replace..." : "AIzaSy... (or set GEMINI_API_KEY in server .env)"}
              className="w-full rounded-2xl border border-sky-100 bg-sky-50/30 px-4 py-2.5 text-xs font-mono text-ref-navy focus:outline-none focus:ring-2 focus:ring-ref-green min-h-[44px]"
            />
            <p className="text-[11px] text-ref-muted">
              Your API key is transmitted securely via authenticated server routes and never exposed to public bundles.
            </p>
          </div>

          {/* Test Connection Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-white/90 px-5 py-2.5 text-xs font-bold text-ref-navy hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 min-h-[40px]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testing ? "animate-spin" : ""}`} />
              Test Connection
            </button>

            {testResult && (
              <div className={`text-xs font-bold flex items-center gap-1.5 ${
                testResult.success ? "text-ref-green" : "text-rose-500"
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Context Sharing Privacy Toggle */}
          <div className="pt-4 border-t border-border/50 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareContext}
                onChange={(e) => setShareContext(e.target.checked)}
                className="h-4 w-4 accent-ref-green rounded mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-ref-navy block">
                  Allow Financial Context Sharing
                </span>
                <span className="text-[11px] text-ref-muted leading-relaxed">
                  When enabled, PayWise safely shares high-level totals (spendable balance, days to payday, remaining Wants budget) so Gemini can answer questions like &quot;Can I afford this?&quot; No personal passwords or bank account numbers are ever sent.
                </span>
              </div>
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-ref-green px-7 py-3 text-xs font-bold text-white shadow-xs hover:bg-ref-green/90 active:scale-95 transition-all min-h-[42px]"
            >
              Save AI Settings
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
