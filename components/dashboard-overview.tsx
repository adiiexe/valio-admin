"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShortagePrediction, CallRecord } from "@/lib/types";
import { AlertTriangle, Phone, CheckCircle2, TrendingUp } from "lucide-react";
import { AnimatedIcon } from "@/components/ui/animated-icon";

interface DashboardOverviewProps {
  predictions: ShortagePrediction[];
  calls: CallRecord[];
  onNavigate: (view: string) => void;
}

export function DashboardOverview({
  predictions,
  calls,
  onNavigate,
}: DashboardOverviewProps) {
  const activeRisks = predictions.filter((p) => p.status !== "resolved").length;
  const today = new Date().toISOString().split("T")[0];
  const callsToday = calls.filter((c) => c.time.startsWith(today)).length;
  
  const completedCalls = calls.filter((c) => c.status === "completed");
  const acceptedCalls = completedCalls.filter(
    (c) => c.outcome === "replacement_accepted"
  );
  const acceptanceRate =
    completedCalls.length > 0
      ? Math.round((acceptedCalls.length / completedCalls.length) * 100)
      : 0;

  const stats = [
    {
      label: "Active Risks",
      value: activeRisks,
      change: "+2 from yesterday",
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      onClick: () => onNavigate("shortages"),
    },
    {
      label: "AI Calls Today",
      value: callsToday,
      change: "Last call 15 min ago",
      icon: Phone,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      onClick: () => onNavigate("calls"),
    },
    {
      label: "Acceptance Rate",
      value: `${acceptanceRate}%`,
      change: "+5% from last week",
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      onClick: () => onNavigate("calls"),
    },
    {
      label: "Resolved Today",
      value: predictions.filter((p) => p.status === "resolved").length,
      change: "3 pending action",
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      onClick: () => onNavigate("shortages"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-neutral-400">
          Here's what's happening with your operations today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="group cursor-pointer border-neutral-800 bg-neutral-900/50 transition-all hover:scale-105 hover:border-neutral-700 hover:bg-neutral-900/70 hover:shadow-2xl"
              onClick={stat.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-400">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-neutral-500">{stat.change}</p>
                  </div>
                  <div
                    className={`rounded-lg ${stat.bgColor} p-3 transition-transform group-hover:scale-110`}
                  >
                    <AnimatedIcon icon={Icon} className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => onNavigate("shortages")}
              className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-800/30 p-4 text-left transition-all hover:border-neutral-700 hover:bg-neutral-800/50"
            >
              <div className="rounded-lg bg-red-500/20 p-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-medium text-white">View Shortages</p>
                <p className="text-sm text-neutral-400">
                  {activeRisks} active risks
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate("calls")}
              className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-800/30 p-4 text-left transition-all hover:border-neutral-700 hover:bg-neutral-800/50"
            >
              <div className="rounded-lg bg-blue-500/20 p-2">
                <Phone className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">View All Calls</p>
                <p className="text-sm text-neutral-400">{calls.length} total</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate("settings")}
              className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-800/30 p-4 text-left transition-all hover:border-neutral-700 hover:bg-neutral-800/50"
            >
              <div className="rounded-lg bg-purple-500/20 p-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">View Analytics</p>
                <p className="text-sm text-neutral-400">Performance metrics</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Preview */}
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <button
              onClick={() => onNavigate("calls")}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View all →
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calls.slice(0, 3).map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-800/30 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/20 p-2">
                    <Phone className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {call.customerName}
                    </p>
                    <p className="text-sm text-neutral-400">{call.summary}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-400">
                    {new Date(call.time).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

