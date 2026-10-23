"use client";

import React, { useEffect, useState } from "react";
import { Download, Share2, PlusSquare, X, Smartphone, Check } from "lucide-react";
import { usePWA } from "./PWARegister";

const PWA_DISMISSED_KEY = "paywise_pwa_banner_dismissed_until";

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if running on iOS Safari
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      setIsIOS(isIOSDevice && !isStandalone);

      // Check dismissal timestamp
      const dismissedUntil = localStorage.getItem(PWA_DISMISSED_KEY);
      if (!dismissedUntil || Date.now() > parseInt(dismissedUntil, 10)) {
        setIsDismissed(false);
      }
    }
  }, []);

  if (isInstalled || isDismissed) {
    return null;
  }

  // Only show if installable on Android/Desktop OR running in regular iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    // Dismiss for 5 days
    localStorage.setItem(
      PWA_DISMISSED_KEY,
      (Date.now() + 5 * 24 * 60 * 60 * 1000).toString()
    );
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      await installPWA();
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 dark:border-sky-800/60 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-blue-500/10 dark:from-sky-950/40 dark:via-emerald-950/30 dark:to-blue-950/40 p-4 shadow-sm backdrop-blur-sm transition-all duration-300">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 text-white shadow-md shadow-sky-500/20">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Install PayWise App
                </h4>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  Offline Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isIOS
                  ? "Add to your iPhone / iPad home screen for instant full-screen access."
                  : "Install on your device for lightning-fast budgeting even without WiFi."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm active:scale-95 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center text-white">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Install on iOS</h3>
                  <p className="text-xs text-muted-foreground">Takes less than 10 seconds</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2 text-sm text-foreground">
              <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  1
                </div>
                <p className="text-xs leading-relaxed">
                  Tap the <strong className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400"><Share2 className="h-3.5 w-3.5 inline" /> Share</strong> button in Safari toolbar at the bottom of your screen.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  2
                </div>
                <p className="text-xs leading-relaxed">
                  Scroll down the share options and tap <strong className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400"><PlusSquare className="h-3.5 w-3.5 inline" /> Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  3
                </div>
                <p className="text-xs leading-relaxed">
                  Tap <strong className="font-semibold text-foreground">Add</strong> in the top-right corner. PayWise will appear as an app icon!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs active:scale-98 transition-transform"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
