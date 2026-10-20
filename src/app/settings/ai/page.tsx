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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Bot className="h-6 w-6 text-indigo-600" />
              Google Gemini AI Settings
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure your API key, preferred model, and context sharing privacy.
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="rounded-3xl border border-indigo-500/25 bg-card p-6 shadow-xs space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-foreground">Enable PayWise AI Assistant</h2>
              <p className="text-xs text-muted-foreground">
                Power the chat assistant and affordability analyzer with Google Gemini.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Gemini Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Gemini API Key
            </label>

            {clientApiKey && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3.5 py-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="font-mono text-muted-foreground">
                    Active Key: {maskApiKey(clientApiKey)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1"
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
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            />
            <p className="text-[11px] text-muted-foreground">
              Your API key is transmitted securely via authenticated server routes and never exposed to public bundles.
            </p>
          </div>

          {/* Test Connection Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted/50 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testing ? "animate-spin" : ""}`} />
              Test Connection
            </button>

            {testResult && (
              <div className={`text-xs font-medium flex items-center gap-1.5 ${
                testResult.success ? "text-emerald-600" : "text-rose-600"
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
          <div className="pt-4 border-t border-border space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareContext}
                onChange={(e) => setShareContext(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded mt-0.5"
              />
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Allow Financial Context Sharing
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  When enabled, PayWise safely shares high-level totals (spendable balance, days to payday, remaining Wants budget) so Gemini can answer questions like &quot;Can I afford this?&quot; No personal passwords or bank account numbers are ever sent.
                </span>
              </div>
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 active:scale-95 transition-all min-h-[44px]"
            >
              Save AI Settings
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
