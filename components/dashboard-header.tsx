"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(format(new Date(), "EEEE, d MMMM yyyy"));
  }, []);

  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Valio Aimo Delivery Reliability Dashboard
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          {currentDate || "Loading..."}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-400">
          Demo Mode
        </Badge>
        <Badge variant="outline" className="border-neutral-700 bg-neutral-800/50 text-neutral-300">
          FI | EN
        </Badge>
      </div>
    </div>
  );
}

