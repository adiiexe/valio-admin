"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { AnimatedIcon } from "@/components/ui/animated-icon";

const mockData = [
  { time: "08:00", calls: 2 },
  { time: "09:00", calls: 4 },
  { time: "10:00", calls: 6 },
  { time: "11:00", calls: 3 },
  { time: "12:00", calls: 5 },
  { time: "13:00", calls: 7 },
  { time: "14:00", calls: 4 },
];

export function AiCoverageChart() {
  return (
    <Card className="border-neutral-800 bg-neutral-900/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AnimatedIcon icon={TrendingUp} className="h-5 w-5 text-purple-400" />
          <CardTitle className="text-xl text-white">
            AI Coverage Today
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis
              dataKey="time"
              stroke="#737373"
              tick={{ fill: "#a3a3a3" }}
              fontSize={12}
            />
            <YAxis
              stroke="#737373"
              tick={{ fill: "#a3a3a3" }}
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #404040",
                borderRadius: "8px",
                color: "#fff",
              }}
              cursor={{ fill: "#262626" }}
            />
            <Bar
              dataKey="calls"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="AI Handled Calls"
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-4 text-center text-sm text-neutral-500">
          Hourly AI call activity throughout the day
        </p>
      </CardContent>
    </Card>
  );
}

