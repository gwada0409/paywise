"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { toast } from "sonner";

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installPWA: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  isOnline: true,
  installPWA: async () => false,
});

export const usePWA = () => useContext(PWAContext);

export function PWARegister({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // 1. Initial network status check
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    // 2. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            // Check for updates
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("[PWA] New PayWise version available.");
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn("[PWA] ServiceWorker registration failed: ", err);
          });
      });
    }

    // 3. Online & Offline status listeners
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connected to internet", {
        description: "Your local records remain safely saved.",
        duration: 3500,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info("Offline Mode Active", {
        description: "You can keep using PayWise. All your budgets and transactions are saved locally.",
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 4. Capture beforeinstallprompt for PWA installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Detect if already running in standalone mode (PWA installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      toast.success("PayWise Installed", {
        description: "You can now launch PayWise directly from your home screen.",
      });
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
      return true;
    }
    return false;
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOnline,
        installPWA,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}
