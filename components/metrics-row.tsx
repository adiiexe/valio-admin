"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Phone, 
  CheckCircle2, 
  Clock 
} from "lucide-react";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { ShortagePrediction, CallRecord } from "@/lib/types";

interface MetricsRowProps {
  predictions: ShortagePrediction[];
  calls: CallRecord[];
}

export function MetricsRow({ predictions, calls }: MetricsRowProps) {
  const activeRisks = predictions.filter(p => p.status !== "resolved").length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const callsToday = calls.filter(call => {
    const callDate = new Date(call.time);
    callDate.setHours(0, 0, 0, 0);
    return callDate.getTime() === today.getTime();
  }).length;

  const completedCalls = calls.filter(c => c.status === "completed");
  const acceptedCalls = completedCalls.filter(
    c => c.outcome === "replacement_accepted"
  );
  const acceptanceRate = completedCalls.length > 0
    ? Math.round((acceptedCalls.length / completedCalls.length) * 100)
    : 0;

  const metrics = [
    {
      label: "Active Shortage Risks",
      value: activeRisks,
      caption: `${predictions.length} total predictions`,
      icon: AlertTriangle,
      color: "text-red-400",
    },
    {
      label: "AI Calls Today",
      value: callsToday,
      caption: `${calls.length} total in system`,
      icon: Phone,
      color: "text-blue-400",
    },
  ];

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-2">
      {metrics.map((metric) => {
        return (
          <Card 
            key={metric.label}
            className="border-neutral-800 bg-neutral-900/50 transition-all hover:bg-neutral-900/70 hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-400">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {metric.caption}
                  </p>
                </div>
                <div className={`rounded-lg bg-neutral-800/50 p-2 ${metric.color}`}>
                  <AnimatedIcon icon={metric.icon} className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

