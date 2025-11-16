"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShortagePrediction, CallRecord } from "@/lib/types";
import { AlertTriangle, Phone, CheckCircle2, TrendingUp } from "lucide-react";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { useTranslations } from "@/lib/use-translations";
import { SpotlightCard } from "@/components/ui/spotlight-card";

interface DashboardOverviewProps {
  predictions: ShortagePrediction[];
  calls: CallRecord[];
  onNavigate: (view: string) => void;
  onViewCall?: (call: CallRecord) => void;
}

export function DashboardOverview({
  predictions,
  calls,
  onNavigate,
  onViewCall,
}: DashboardOverviewProps) {
  const { t } = useTranslations();
  const activeRisks = predictions.filter((p) => p.status !== "resolved").length;
  const today = new Date().toISOString().split("T")[0];
  const callsToday = calls.filter((c) => c.time.startsWith(today)).length;
  
  const completedCalls = calls.filter((c) => c.status === "completed");
  const acceptedCalls = completedCalls.filter(
    (c) => c.outcome === "replacement_accepted" || c.outcome === "accepted"
  );
  const acceptanceRate =
    completedCalls.length > 0
      ? Math.round((acceptedCalls.length / completedCalls.length) * 100)
      : 0;

  const stats = [
    {
      label: t("activeRisks"),
      value: activeRisks,
      change: `+2 ${t("fromYesterday")}`,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      spotlightColor: "rgba(239, 68, 68, 0.15)", // Red glow
      onClick: () => onNavigate("shortages"),
    },
    {
      label: t("aiCallsToday"),
      value: callsToday,
      change: `${t("lastCall")} 15 min ${t("ago")}`,
      icon: Phone,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      spotlightColor: "rgba(59, 130, 246, 0.15)", // Blue glow
      onClick: () => onNavigate("calls"),
    },
    {
      label: t("acceptanceRate"),
      value: `${acceptanceRate}%`,
      change: `+5% ${t("fromLastWeek")}`,
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      spotlightColor: "rgba(34, 197, 94, 0.15)", // Green glow
      onClick: () => onNavigate("calls"),
    },
    {
      label: t("resolvedToday"),
      value: predictions.filter((p) => p.status === "resolved").length,
      change: `${predictions.filter((p) => p.status === "pending").length} ${t("pendingAction")}`,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      spotlightColor: "rgba(168, 85, 247, 0.15)", // Purple glow
      onClick: () => onNavigate("shortages"),
    },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("welcomeBack")}</h1>
        <p className="text-base font-normal text-muted-foreground">
          {t("dashboardSubtitle")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <SpotlightCard
              key={stat.label}
              spotlightColor={stat.spotlightColor}
              className="cursor-pointer"
              onClick={stat.onClick}
            >
              <Card className="group border-border/50 bg-card transition-all hover:shadow-md hover:border-border/80 dark:hover:shadow-2xl h-full">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <p className="text-sm font-normal text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-semibold tracking-tight text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs font-normal text-muted-foreground">{stat.change}</p>
                    </div>
                    <div
                      className={`rounded-xl ${stat.bgColor} p-3 transition-all group-hover:scale-105`}
                    >
                      <AnimatedIcon icon={Icon} className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Recent Activity Preview */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">{t("recentActivity")}</CardTitle>
            <button
              onClick={() => onNavigate("calls")}
              className="text-sm font-normal text-primary hover:text-green-500 transition-colors"
            >
              {t("viewAll")}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calls.slice(0, 3).map((call) => (
              <SpotlightCard
                key={call.id}
                spotlightColor="rgba(59, 130, 246, 0.15)"
                className="cursor-pointer rounded-xl"
                onClick={() => onViewCall?.(call)}
              >
                <div
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-5 transition-all hover:border-border/60 hover:bg-muted/40 hover:shadow-sm"
                >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {call.customerName}
                    </p>
                    <p className="text-sm font-normal text-muted-foreground">{call.summary}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-normal text-muted-foreground">
                    {new Date(call.time).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

