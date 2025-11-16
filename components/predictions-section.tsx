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
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SpotlightTableRow } from "@/components/ui/spotlight-table-row";

interface PredictionsSectionProps {
  predictions: ShortagePrediction[];
}

export function PredictionsSection({
  predictions,
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
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/10 p-2">
              <AnimatedIcon icon={AlertTriangle} className="h-5 w-5 text-red-500" />
            </div>
            <CardTitle className="text-xl text-foreground">
              {t("predictedShortages")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent dark:border-border">
                  <TableHead className="text-muted-foreground font-medium">{t("product")}</TableHead>
                  <TableHead className="text-muted-foreground font-medium">{t("customer")}</TableHead>
                  <TableHead className="text-muted-foreground font-medium">{t("risk")}</TableHead>
                  <TableHead className="text-muted-foreground font-medium">{t("status")}</TableHead>
                  <TableHead className="text-right text-muted-foreground font-medium">{t("action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPredictions.map((prediction) => (
                  <SpotlightTableRow
                    key={prediction.id}
                    spotlightColor={prediction.riskScore >= 0.7 ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)"}
                    className={`border-border/30 transition-colors hover:bg-muted/30 dark:hover:bg-muted/50 ${
                      prediction.status === "resolved" ? "opacity-50" : ""
                    } ${
                      prediction.riskScore >= 0.7
                        ? "border-l-2 border-l-red-500/30 dark:border-l-red-500/50"
                        : ""
                    }`}
                    onClick={() => handleViewDetails(prediction)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {prediction.productName}
                    </TableCell>
                    <TableCell className="font-normal text-muted-foreground">
                      {prediction.customerName}
                    </TableCell>
                    <TableCell>{getRiskBadge(prediction.riskScore)}</TableCell>
                    <TableCell>{getStatusBadge(prediction.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(prediction);
                        }}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        {t("details")}
                      </Button>
                    </TableCell>
                  </SpotlightTableRow>
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
      />
    </>
  );
}

