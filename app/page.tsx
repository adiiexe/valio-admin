"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { DashboardOverview } from "@/components/dashboard-overview";
import { PredictionsSection } from "@/components/predictions-section";
import { CallsSectionsSeparated } from "@/components/calls-sections-separated";
import { ShortagePrediction, CallRecord } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fi, enUS } from "date-fns/locale";
import { TranslationsProvider, useTranslations } from "@/lib/use-translations";
import { fetchConversations } from "@/lib/elevenlabs-client";

// Data source URLs
// Predictions are fetched from n8n via GET (JSON response).
// You can override this with NEXT_PUBLIC_PREDICTIONS_URL in .env.local if needed.
const PREDICTIONS_URL =
  process.env.NEXT_PUBLIC_PREDICTIONS_URL ||
  "https://otsobear.app.n8n.cloud/webhook/34f21b26-15b9-4fac-b525-320d4295caf4";
const CALLS_URL =
  process.env.NEXT_PUBLIC_CALLS_URL || "api/calls.json";

// Map the n8n response shape to our ShortagePrediction[] domain model.
function mapPredictionsResponse(raw: any): ShortagePrediction[] {
  // If it already looks like ShortagePrediction[], return as-is
  if (Array.isArray(raw) && raw.length > 0 && raw[0] && typeof raw[0] === "object") {
    const first = raw[0] as any;
    if ("id" in first && "sku" in first && "riskScore" in first) {
      return raw as ShortagePrediction[];
    }
  }

  const root = Array.isArray(raw) ? raw[0] : raw;
  const orders = root?.orders;
  if (!Array.isArray(orders)) return [];

  const predictions: ShortagePrediction[] = [];

  for (const order of orders) {
    const orderNumber = order.order_number ?? "UNKNOWN_ORDER";
    const customerNumber = order.customer_number ?? "Unknown customer";
    const items = Array.isArray(order.items) ? order.items : [];

    for (const item of items) {
      // Optionally skip truly low-risk items
      if (
        typeof item.risk_level === "string" &&
        item.risk_level.toUpperCase() === "LOW"
      ) {
        continue;
      }

      const productCode = item.product_code ?? "UNKNOWN_PRODUCT";
      const productInfo = item.product_info ?? {};
      const productName =
        (productInfo && (productInfo["Tuote"] as string)) || productCode;
      const stockoutProbability =
        typeof item.stockout_probability === "number"
          ? item.stockout_probability
          : 0;

      const id = `${orderNumber}-${productCode}`;

      predictions.push({
        id,
        sku: productCode,
        productName,
        customerName: customerNumber,
        riskScore: stockoutProbability,
        status: "pending",
        orderId: orderNumber,
        // n8n payload doesn't include replacements yet, so leave empty
        suggestedReplacements: [],
      });
    }
  }

  return predictions;
}

function DashboardContent({ onLanguageChange }: { onLanguageChange: (lang: "fi" | "en") => void }) {
  const [predictions, setPredictions] = useState<ShortagePrediction[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { toast } = useToast();
  const { t, language } = useTranslations();

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(
          "[Dashboard] Sending initial predictions request to",
          PREDICTIONS_URL
        );

        let predictionsData: ShortagePrediction[] = [];
        try {
          const predictionsRes = await fetch(PREDICTIONS_URL);
          if (predictionsRes.ok) {
            const rawPredictions = await predictionsRes.json();
            predictionsData = mapPredictionsResponse(rawPredictions);
            console.log(
              "[Dashboard] Received initial predictions",
              Array.isArray(predictionsData) ? predictionsData.length : "unknown",
              "items"
            );
          } else {
            console.warn("[Dashboard] Predictions API returned status:", predictionsRes.status);
          }
        } catch (predictionsError: any) {
          console.error("[Dashboard] Failed to fetch predictions:", predictionsError?.message || predictionsError);
          // Continue with empty array
        }

        // Fetch calls: Try static JSON first, then ElevenLabs if available
        let callsData: CallRecord[] = [];
        
        // First, try to load static JSON as base (demo data)
        try {
          const callsRes = await fetch(CALLS_URL);
          if (callsRes.ok) {
            callsData = await callsRes.json();
            console.log("[Dashboard] Loaded calls from static JSON:", callsData.length, "items");
          } else {
            console.warn("[Dashboard] Static JSON returned status:", callsRes.status);
          }
        } catch (fallbackError: any) {
          console.warn("[Dashboard] Failed to load calls from static JSON:", fallbackError?.message || fallbackError);
          // Continue with empty array, will try ElevenLabs
        }
        
        // Then try ElevenLabs API - if it has calls, use those instead
        try {
          const elevenLabsCalls = await fetchConversations();
          console.log(
            "[Dashboard] Received calls from ElevenLabs:",
            elevenLabsCalls.length,
            "items"
          );
          
          // If ElevenLabs has calls, use those (they're real calls)
          if (elevenLabsCalls.length > 0) {
            callsData = elevenLabsCalls;
            console.log("[Dashboard] Using ElevenLabs calls instead of static JSON");
          } else {
            console.log("[Dashboard] ElevenLabs returned no calls, keeping static JSON demo data");
          }
        } catch (elevenLabsError: any) {
          console.warn("[Dashboard] ElevenLabs API failed, using static JSON:", elevenLabsError?.message || elevenLabsError);
          // Keep the static JSON data we already loaded (or empty array if that also failed)
        }

        setPredictions(predictionsData);
        setCalls(callsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: t("error"),
          description: t("failedToLoadData"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, t]);

  // Real-time polling for updates (every 2.5 seconds)
  useEffect(() => {
    if (isLoading) return; // Don't poll until initial load is complete

    const pollInterval = setInterval(async () => {
      try {
        console.log(
          "[Dashboard] Polling predictions from",
          PREDICTIONS_URL
        );

        let predictionsData: ShortagePrediction[] = [];
        try {
          const predictionsRes = await fetch(PREDICTIONS_URL);
          if (predictionsRes.ok) {
            const rawPredictions = await predictionsRes.json();
            predictionsData = mapPredictionsResponse(rawPredictions);
          }
        } catch (predictionsError) {
          // Silently fail on polling errors to avoid spam
          console.error("Polling predictions error:", predictionsError);
        }

        // Fetch calls: Try static JSON first, then ElevenLabs if available
        let callsData: CallRecord[] = [];
        
        // First, try to load static JSON as base (demo data)
        try {
          const callsRes = await fetch(CALLS_URL);
          callsData = await callsRes.json();
        } catch (fallbackError) {
          // Continue with previous state on fallback failure
          return;
        }
        
        // Then try ElevenLabs API - if it has calls, use those instead
        try {
          const elevenLabsCalls = await fetchConversations();
          // If ElevenLabs has calls, use those (they're real calls)
          if (elevenLabsCalls.length > 0) {
            callsData = elevenLabsCalls;
          }
        } catch (elevenLabsError) {
          // Silently keep static JSON on polling errors
        }

        console.log(
          "[Dashboard] Polling response received:",
          Array.isArray(predictionsData) ? predictionsData.length : "unknown",
          "prediction items"
        );

        // Only update state if data has changed (compare JSON strings)
        setPredictions((prev) => {
          const prevJson = JSON.stringify(prev);
          const newJson = JSON.stringify(predictionsData);
          return prevJson !== newJson ? predictionsData : prev;
        });

        setCalls((prev) => {
          // Compare by IDs to detect new calls, not just JSON string comparison
          const prevIds = new Set(prev.map(c => c.id));
          const newIds = new Set(callsData.map(c => c.id));
          
          // Check if there are new calls or if any existing calls have been updated
          const hasNewCalls = callsData.some(c => !prevIds.has(c.id));
          const newCalls = callsData.filter(c => !prevIds.has(c.id));
          const hasUpdates = prev.some(p => {
            const updated = callsData.find(c => c.id === p.id);
            return updated && JSON.stringify(p) !== JSON.stringify(updated);
          });
          
          if (hasNewCalls || hasUpdates || prev.length !== callsData.length) {
            console.log(
              "[Dashboard] Calls updated:",
              callsData.length,
              "total calls",
              hasNewCalls ? `(${newCalls.length} new call(s) detected)` : ""
            );
            
            // Show toast notification for new calls
            if (hasNewCalls && newCalls.length > 0) {
              const latestCall = newCalls[0];
              toast({
                title: t("newCallReceived"),
                description: `${t("callFrom")} ${latestCall.customerName} - ${latestCall.summary}`,
              });
            }
            
            return callsData;
          }
          return prev;
        });
      } catch (error) {
        // Silently fail on polling errors to avoid spam
        console.error("Polling error:", error);
      }
    }, 2500); // Poll every 2.5 seconds

    return () => clearInterval(pollInterval);
  }, [isLoading, toast, t]);

  const handleTriggerCall = async (shortageId: string) => {
    try {
      // For static export, simulate the API call
      // In a real deployment, this would call an external API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Note: Status remains pending until manually resolved
      // The call is triggered but status doesn't change automatically

      const shortage = predictions.find((p) => p.id === shortageId);
      toast({
        title: t("aiCallTriggered"),
        description: `${t("calling")} ${shortage?.customerName} ${t("about")} ${shortage?.productName}`,
      });
    } catch (error) {
      console.error("Failed to trigger call:", error);
      toast({
        title: t("error"),
        description: t("failedToTriggerCall"),
        variant: "destructive",
      });
    }
  };

  const handleMarkResolved = (shortageId: string) => {
    setPredictions((prev) =>
      prev.map((p) => (p.id === shortageId ? { ...p, status: "resolved" } : p))
    );

    const shortage = predictions.find((p) => p.id === shortageId);
    toast({
      title: t("markedResolved"),
      description: `${shortage?.productName} ${t("about")} ${shortage?.customerName}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-neutral-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardOverview
            predictions={predictions}
            calls={calls}
            onNavigate={setCurrentView}
          />
        );
      case "shortages":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{t("predictedShortages")}</h1>
              <p className="mt-1 text-neutral-400">
                {t("manageShortages")}
              </p>
            </div>
            <PredictionsSection
              predictions={predictions}
              onTriggerCall={handleTriggerCall}
              onMarkResolved={handleMarkResolved}
            />
          </div>
        );
      case "calls":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{t("aiCalls")}</h1>
              <p className="mt-1 text-neutral-400">
                {t("viewAllCallsSubtitle")}
              </p>
            </div>
            <CallsSectionsSeparated calls={calls} />
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{t("settings")}</h1>
              <p className="mt-1 text-neutral-400">
                {t("configureDashboard")}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-8 text-center">
              <p className="text-neutral-400">
                {t("settingsPanelComingSoon")}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onExpandChange={setIsSidebarExpanded}
      />
      <main 
        className="flex-1 p-6 transition-all duration-300 md:p-8 lg:p-10"
        style={{ marginLeft: isSidebarExpanded ? '240px' : '80px' }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Top Bar */}
          <div className="mb-8 flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              {format(new Date(), "EEEE, MMMM d, yyyy", {
                locale: language === "fi" ? fi : enUS,
              })}
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-blue-500/50 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                {t("demoMode")}
              </div>
              <button
                onClick={() => {
                  const newLang = language === "fi" ? "en" : "fi";
                  onLanguageChange(newLang);
                  localStorage.setItem("language", newLang);
                }}
                className="rounded-full border border-neutral-700 bg-neutral-800/50 px-3 py-1 text-xs text-neutral-400 transition-all hover:bg-neutral-700/50 hover:text-white cursor-pointer"
              >
                <span className={language === "fi" ? "text-white font-medium" : ""}>FI</span>
                {" | "}
                <span className={language === "en" ? "text-white font-medium" : ""}>EN</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  const [language, setLanguage] = useState<"fi" | "en">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      return (saved === "fi" || saved === "en") ? saved : "fi";
    }
    return "fi";
  });

  return (
    <TranslationsProvider language={language}>
      <DashboardContent onLanguageChange={setLanguage} />
    </TranslationsProvider>
  );
}
