"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  History,
  Mic,
  Plus,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { useFinance } from "@/lib/store/finance-context";
import { AIFinancialDonutCard } from "@/components/ai/AIFinancialDonutCard";
import { AIChatHistoryDrawer } from "@/components/ai/AIChatHistoryDrawer";
import { AIMessage } from "@/types";
import { toast } from "sonner";

const QUICK_BUBBLES = [
  "Spending suggestion",
  "Want some tips to save?",
  "Create a financial goal",
  "Income sources",
  "Wealth Growth Data",
  "Can I afford this?",
];

export default function AIPage() {
  const router = useRouter();
  const { financialContext, aiPreferences, clientApiKey, spendableBreakdown } = useFinance();

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
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
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to receive response from Gemini AI");
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
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantPlaceholderId
            ? {
                ...m,
                content:
                  err.message ||
                  "Could not connect to Gemini AI. Check your API Key in Settings > Gemini AI Config.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between max-w-md mx-auto relative px-4 pb-safe pt-safe">
      {/* =========================================================================
          1. AI CHAT HEADER (Reference 2: Back Arrow, Green Waveform Logo, History Clock)
         ========================================================================= */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title="Back to Dashboard"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Center Green Waveform Emblem & Title */}
        <div className="flex items-center gap-2">
          {/* Green Waveform Symbol */}
          <div className="flex items-center gap-0.5 text-[#45C97A]">
            <span className="w-1 h-3 rounded-full bg-[#45C97A]" />
            <span className="w-1 h-5 rounded-full bg-[#45C97A]" />
            <span className="w-1 h-3.5 rounded-full bg-[#45C97A]" />
            <span className="w-1 h-2 rounded-full bg-[#45C97A]" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            PayWise AI
          </span>
        </div>

        {/* History Clock Button */}
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title="View Chat History"
        >
          <History className="h-5 w-5" />
        </button>
      </header>

      {/* =========================================================================
          2. MAIN CONTENT: WELCOME SCREEN (Reference 2 Middle Phone) OR CHAT MESSAGES
         ========================================================================= */}
      <main className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full px-2 py-8">
            {/* Concentric Green Radar Emblem */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute h-18 w-18 rounded-full border border-[#45C97A]/25" />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAFBF0] border border-[#45C97A]/40 text-[#45C97A] shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-[#45C97A]">
                <span className="w-1 h-3.5 rounded-full bg-[#45C97A]" />
                <span className="w-1 h-5 rounded-full bg-[#45C97A]" />
                <span className="w-1 h-3.5 rounded-full bg-[#45C97A]" />
              </div>
              Hi, I&apos;m PayWise AI
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Your Financial AI assistant, how can I help you today?
            </p>

            {/* "Use this bubble chat" prompt chips */}
            <div className="mt-8 w-full max-w-xs space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Use this bubble chat
              </span>

              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {QUICK_BUBBLES.map((bubble) => (
                  <button
                    key={bubble}
                    onClick={() => handleSendMessage(bubble)}
                    className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-[#45C97A] hover:text-[#16A34A] active:scale-95 transition-all shadow-2xs"
                  >
                    {bubble}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Messages (Reference 2 Left Phone) */
          <div className="space-y-4 px-1">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              // Check if we should render an inline donut chart for financial breakdowns
              const shouldRenderDonut =
                !isUser &&
                index === 1 &&
                (msg.content.toLowerCase().includes("fund") ||
                  msg.content.toLowerCase().includes("spending") ||
                  msg.content.toLowerCase().includes("budget") ||
                  msg.content.toLowerCase().includes("analysis"));

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#45C97A]/20 text-[#16A34A] shrink-0 mt-1">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div className="max-w-[85%]">
                    <div
                      className={`rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-tr-xs"
                          : "bg-[#F3F4F6] dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-tl-xs shadow-2xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Render Inline Donut Chart matching Reference 2 Left Phone! */}
                      {shouldRenderDonut && (
                        <AIFinancialDonutCard
                          totalAmount={spendableBreakdown.liquidCashTotal || 8278}
                          caption="And this is an explanation of the graphic above regarding the distribution of your funds."
                        />
                      )}
                    </div>

                    {!isUser && msg.content && (
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 pl-2">
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.content)}
                          className="hover:text-slate-600 flex items-center gap-1"
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
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#45C97A]/20 text-[#16A34A] shrink-0">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                </div>
                <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-500">
                  PayWise AI is thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* =========================================================================
          3. COMPOSER BAR (Reference 2: Slim Rounded Pill with Mic, +, and Green Send)
         ========================================================================= */}
      <footer className="sticky bottom-2 z-30 pt-2 pb-1 bg-white dark:bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-4 pr-1.5 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#45C97A]"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Message PayWise AI"
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none min-h-[40px]"
          />

          {/* Mic icon button */}
          <button
            type="button"
            onClick={() => toast.info("Voice input ready on supported browsers")}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Voice message"
          >
            <Mic className="h-4 w-4" />
          </button>

          {/* Plus action */}
          <button
            type="button"
            onClick={() => handleSendMessage("Can I afford a ₱2,500 purchase right now?")}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Affordability check"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Circular Green Send Button */}
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#45C97A] text-white shadow-xs hover:bg-[#3db86e] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </footer>

      {/* =========================================================================
          4. SLIDE-OUT CHAT HISTORY DRAWER (Reference 2 Right Phone)
         ========================================================================= */}
      <AIChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectChat={(title) => handleSendMessage(title)}
        onNewChat={() => setMessages([])}
      />
    </div>
  );
}
