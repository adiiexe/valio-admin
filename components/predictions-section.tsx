"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShortagePrediction } from "@/lib/types";
import { ShortageDetailsSheet } from "./shortage-details-sheet";
import { AlertTriangle, Eye } from "lucide-react";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { useTranslations } from "@/lib/use-translations";

interface PredictionsSectionProps {
  predictions: ShortagePrediction[];
  onTriggerCall: (id: string) => void;
  onMarkResolved: (id: string) => void;
}

export function PredictionsSection({
  predictions,
  onTriggerCall,
  onMarkResolved,
}: PredictionsSectionProps) {
  const { t } = useTranslations();
  const [selectedShortage, setSelectedShortage] = useState<ShortagePrediction | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleViewDetails = (shortage: ShortagePrediction) => {
    setSelectedShortage(shortage);
    setIsSheetOpen(true);
  };

  const getRiskBadge = (riskScore: number) => {
    const percentage = Math.round(riskScore * 100);
    if (riskScore >= 0.7) {
      return (
        <span className="text-red-500/80">
          {percentage}% {t("high")}
        </span>
      );
    } else if (riskScore >= 0.4) {
      return (
        <span className="text-amber-500/80">
          {percentage}% {t("medium")}
        </span>
      );
    } else {
      return (
        <span className="text-green-500/80">
          {percentage}% {t("low")}
        </span>
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "text-yellow-500/80",
      resolved: "text-green-500/80",
    };
    const labels = {
      pending: t("pending"),
      resolved: t("resolved"),
    };
    return (
      <span className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // Sort: resolved to bottom, then by risk score
  const sortedPredictions = [...predictions].sort((a, b) => {
    if (a.status === "resolved" && b.status !== "resolved") return 1;
    if (a.status !== "resolved" && b.status === "resolved") return -1;
    return b.riskScore - a.riskScore;
  });

  return (
    <>
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AnimatedIcon icon={AlertTriangle} className="h-5 w-5 text-red-400" />
            <CardTitle className="text-xl text-white">
              {t("predictedShortages")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800 hover:bg-transparent">
                  <TableHead className="text-neutral-400">{t("product")}</TableHead>
                  <TableHead className="text-neutral-400">{t("customer")}</TableHead>
                  <TableHead className="text-neutral-400">{t("risk")}</TableHead>
                  <TableHead className="text-neutral-400">{t("status")}</TableHead>
                  <TableHead className="text-right text-neutral-400">{t("action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPredictions.map((prediction) => (
                  <TableRow
                    key={prediction.id}
                    className={`border-neutral-800 transition-colors hover:bg-neutral-800/50 ${
                      prediction.status === "resolved" ? "opacity-50" : ""
                    } ${
                      prediction.riskScore >= 0.7
                        ? "border-l-2 border-l-red-500/50"
                        : ""
                    }`}
                  >
                    <TableCell className="font-medium text-white">
                      {prediction.productName}
                    </TableCell>
                    <TableCell className="text-neutral-400">
                      {prediction.customerName}
                    </TableCell>
                    <TableCell>{getRiskBadge(prediction.riskScore)}</TableCell>
                    <TableCell>{getStatusBadge(prediction.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(prediction)}
                        className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        {t("details")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ShortageDetailsSheet
        shortage={selectedShortage}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onTriggerCall={onTriggerCall}
        onMarkResolved={onMarkResolved}
      />
    </>
  );
}

