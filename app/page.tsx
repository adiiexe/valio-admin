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
        const [predictionsRes, callsRes] = await Promise.all([
          fetch("/api/predictions.json"),
          fetch("/api/calls.json"),
        ]);

        const predictionsData = await predictionsRes.json();
        const callsData = await callsRes.json();

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
  }, [toast]);

  // Real-time polling for updates (every 2.5 seconds)
  useEffect(() => {
    if (isLoading) return; // Don't poll until initial load is complete

    const pollInterval = setInterval(async () => {
      try {
        const [predictionsRes, callsRes] = await Promise.all([
          fetch("/api/predictions.json"),
          fetch("/api/calls.json"),
        ]);

        const predictionsData = await predictionsRes.json();
        const callsData = await callsRes.json();

        // Only update state if data has changed (compare JSON strings)
        setPredictions((prev) => {
          const prevJson = JSON.stringify(prev);
          const newJson = JSON.stringify(predictionsData);
          return prevJson !== newJson ? predictionsData : prev;
        });

        setCalls((prev) => {
          const prevJson = JSON.stringify(prev);
          const newJson = JSON.stringify(callsData);
          return prevJson !== newJson ? callsData : prev;
        });
      } catch (error) {
        // Silently fail on polling errors to avoid spam
        console.error("Polling error:", error);
      }
    }, 2500); // Poll every 2.5 seconds

    return () => clearInterval(pollInterval);
  }, [isLoading]);

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
