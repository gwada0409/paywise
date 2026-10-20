"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Bot,
  User,
  Check,
  AlertCircle,
  HelpCircle,
  Calculator,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/store/finance-context";
import { CurrencyDisplay } from "@/components/common/CurrencyDisplay";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { analyzePurchaseAffordability } from "@/lib/ai/financial-context";
import { toast } from "sonner";
import { AIMessage } from "@/types";

const INITIAL_SUGGESTIONS = [
  "Can I afford a ₱3,500 purchase right now?",
  "How should I allocate my upcoming salary?",
  "What bills are due before my next payday?",
  "Am I spending too much on Wants?",
  "How can I reach my Emergency Fund goal faster?",
  "Magkano ang pwede kong gastusin bawat araw?",
];

export default function AIAssistantPage() {
  const {
    financialContext,
    aiPreferences,
    clientApiKey,
    salarySettings,
    budgetRules,
    accounts,
    transactions,
    incomeRecords,
    savingsGoals,
    savingsMovements,
    bills,
    loans,
  } = useFinance();

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome-1",
      conversation_id: "default",
      role: "assistant",
      content:
        "Hello! I'm **PayWise AI**, your personal Philippine finance companion. I have access to your verified financial summary (₱" +
        financialContext.available_spendable_balance.toLocaleString() +
        " available to spend, " +
        financialContext.days_until_next_payday +
        " days until payday on " +
        financialContext.next_payday_date +
        ").\n\nHow can I help you make smart money decisions today?",
      created_at: new Date().toISOString(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAffordabilityModalOpen, setIsAffordabilityModalOpen] = useState(false);
  const [affordItemName, setAffordItemName] = useState("");
  const [affordItemPrice, setAffordItemPrice] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: "default",
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsLoading(true);

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const assistantMessage: AIMessage = {
      id: assistantPlaceholderId,
      conversation_id: "default",
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: aiPreferences.share_financial_context ? financialContext : null,
          model: aiPreferences.model_name || "gemini-1.5-flash",
          clientApiKey: clientApiKey || undefined,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json();
        throw new Error(errorJson.error || "Failed to receive response from Gemini AI");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((m) => (m.id === assistantPlaceholderId ? { ...m, content: accumulated } : m))
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantPlaceholderId
            ? {
                ...m,
                content:
                  "⚠️ " +
                  (err.message ||
                    "Could not connect to Gemini AI. Check your API Key in Settings > Gemini AI Config."),
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAffordabilityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!affordItemName.trim() || affordItemPrice <= 0) return;

    const analysis = analyzePurchaseAffordability(
      affordItemName.trim(),
      affordItemPrice,
      {
        salarySettings,
        budgetRules,
        accounts,
        transactions,
        incomeRecords,
        savingsGoals,
        savingsMovements,
        bills,
        loans,
      }
    );

    setIsAffordabilityModalOpen(false);

    // Format query for chat
    const promptText = `Can I afford to buy "${affordItemName}" for ₱${affordItemPrice.toLocaleString()} right now?`;
    handleSendMessage(promptText);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)] max-w-4xl mx-auto animate-in fade-in duration-300">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-foreground">PayWise AI</h1>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-600 px-2 py-0.5 text-[10px] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {aiPreferences.model_name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Financial Companion • Context Sharing:{" "}
                <span className="font-semibold text-foreground">
                  {aiPreferences.share_financial_context ? "Active" : "Disabled"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAffordabilityModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all min-h-[40px]"
            >
              <Calculator className="h-4 w-4" />
              Affordability Check
            </button>
            <Link
              href="/settings/ai"
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted/60 transition-all"
              title="AI Settings"
            >
              <Bot className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Message Bubbles Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs group ${
                    isUser
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                      : "bg-card border border-border text-foreground rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {!isUser && msg.content && (
                    <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Google Gemini</span>
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-foreground opacity-60 hover:opacity-100 transition-opacity"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        Copy
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0">
                <Sparkles className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-2xl bg-card border border-border px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                PayWise AI is thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 3 && (
          <div className="py-2 overflow-x-auto flex gap-2 no-scrollbar">
            {INITIAL_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSendMessage(suggestion)}
                className="rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 whitespace-nowrap active:scale-95 transition-all shrink-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Composer Input Bar */}
        <div className="pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 rounded-2xl border border-input bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask PayWise AI in English or Taglish..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none min-h-[44px]"
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-1.5 text-[10px] text-center text-muted-foreground">
            PayWise AI verifies calculations against your database records. Read-only advisor.
          </p>
        </div>
      </div>

      {/* Affordability Modal */}
      {isAffordabilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-bold text-foreground">Purchase Affordability Analyzer</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Calculate if this purchase fits your current cash, reserved bills, and Wants budget.
            </p>

            <form onSubmit={handleRunAffordabilityCheck} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Item or Expense Name
                </label>
                <input
                  type="text"
                  required
                  value={affordItemName}
                  onChange={(e) => setAffordItemName(e.target.value)}
                  placeholder="e.g. Wireless Earbuds, Shoes, Weekend Trip"
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Price / Cost
                </label>
                <CurrencyInput value={affordItemPrice} onChange={setAffordItemPrice} />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAffordabilityModalOpen(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground hover:bg-muted/50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={affordItemPrice <= 0 || !affordItemName.trim()}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
                >
                  Analyze with AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
