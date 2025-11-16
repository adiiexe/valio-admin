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
import { ObservedShortage, ShortagePrediction } from "@/lib/types";
import { ShortageDetailsSheet } from "./shortage-details-sheet";
import { ObservedShortageDetailsSheet } from "./observed-shortage-details-sheet";
import { AlertTriangle, Eye } from "lucide-react";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { useTranslations } from "@/lib/use-translations";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SpotlightTableRow } from "@/components/ui/spotlight-table-row";
import { formatProductName } from "@/lib/format-product-name";

interface PredictionsSectionProps {
  predictions: ShortagePrediction[];
  observedShortages?: ObservedShortage[];
}

export function PredictionsSection({
  predictions,
  observedShortages = [],
}: PredictionsSectionProps) {
  const { t } = useTranslations();
  const [selectedShortage, setSelectedShortage] = useState<ShortagePrediction | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedObservedShortage, setSelectedObservedShortage] = useState<ObservedShortage | null>(null);
  const [isObservedSheetOpen, setIsObservedSheetOpen] = useState(false);

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

  // Sort observed shortages: newest first based on updatedAt
  const sortedObserved = [...observedShortages].sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });

  const formatRelativeTime = (iso?: string | null) => {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "just now";

    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hrs ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  };

  const renderTable = (shortages: ShortagePrediction[]) => (
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
        {shortages.map((shortage) => (
          <SpotlightTableRow
            key={shortage.id}
            spotlightColor={shortage.riskScore >= 0.7 ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)"}
            className={`border-border/30 transition-colors hover:bg-muted/30 dark:hover:bg-muted/50 ${
              shortage.status === "resolved" ? "opacity-50" : ""
            }`}
            onClick={() => handleViewDetails(shortage)}
          >
            <TableCell className="font-medium text-foreground">
              {formatProductName(shortage.productName)}
            </TableCell>
            <TableCell className="font-normal text-muted-foreground">
              {shortage.customerName}
            </TableCell>
            <TableCell>{getRiskBadge(shortage.riskScore)}</TableCell>
            <TableCell>{getStatusBadge(shortage.status)}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(shortage);
                }}
              >
                <Eye className="mr-1 h-4 w-4" />
                {shortage.status === "resolved"
                  ? "Resolved with AI agent outbound call"
                  : t("details")}
              </Button>
            </TableCell>
          </SpotlightTableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderObservedTable = (shortages: ObservedShortage[]) => (
    <Table>
      <TableHeader>
        <TableRow className="border-border/30 hover:bg-transparent dark:border-border">
          <TableHead className="text-muted-foreground font-medium w-[120px]">
            {t("time")}
          </TableHead>
          <TableHead className="text-muted-foreground font-medium">Company</TableHead>
          <TableHead className="text-muted-foreground font-medium">{t("product")}</TableHead>
          <TableHead className="text-muted-foreground font-medium">{t("replacementProduct")}</TableHead>
          <TableHead className="text-right text-muted-foreground font-medium w-[120px]">
            Qty
          </TableHead>
          <TableHead className="text-right text-muted-foreground font-medium w-[140px]">
            {t("action")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shortages.map((shortage) => (
          <SpotlightTableRow
            key={shortage.id}
            spotlightColor="rgba(59, 130, 246, 0.15)"
            className="border-border/30 transition-colors hover:bg-muted/30 dark:hover:bg-muted/50"
            onClick={() => {
              setSelectedObservedShortage(shortage);
              setIsObservedSheetOpen(true);
            }}
          >
            <TableCell className="text-xs text-muted-foreground">
              {formatRelativeTime(shortage.updatedAt ?? shortage.createdAt)}
            </TableCell>
            <TableCell className="font-medium text-foreground">
              {shortage.company}
            </TableCell>
            <TableCell className="font-normal text-foreground">
              {shortage.missingProduct}
            </TableCell>
            <TableCell className="font-normal text-foreground">
              {shortage.replacementProduct}
            </TableCell>
            <TableCell className="text-right font-medium text-foreground">
              {shortage.missingProductQty} → {shortage.replacementProductQty}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedObservedShortage(shortage);
                  setIsObservedSheetOpen(true);
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
  );

  return (
    <>
      <div className="space-y-8">
        {/* Predicted Shortages */}
        <div id="predicted-shortages" className="scroll-mt-8">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-500/10 p-2">
                  <AnimatedIcon icon={AlertTriangle} className="h-5 w-5 text-orange-500" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  {t("predictedShortages")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {sortedPredictions.length > 0 ? (
                renderTable(sortedPredictions)
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t("noShortages")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Observed Shortages */}
        <div id="observed-shortages" className="scroll-mt-8">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-500/10 p-2">
                  <AnimatedIcon icon={AlertTriangle} className="h-5 w-5 text-red-500" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  {t("observedShortages")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {sortedObserved.length > 0 ? (
                renderObservedTable(sortedObserved)
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t("noShortages")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ShortageDetailsSheet
        shortage={selectedShortage}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
      <ObservedShortageDetailsSheet
        shortage={selectedObservedShortage}
        isOpen={isObservedSheetOpen}
        onClose={() => setIsObservedSheetOpen(false)}
      />
    </>
  );
}

