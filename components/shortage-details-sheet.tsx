"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShortagePrediction } from "@/lib/types";
import { CheckCircle, Package, TrendingUp } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";

interface ShortageDetailsSheetProps {
  shortage: ShortagePrediction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShortageDetailsSheet({
  shortage,
  isOpen,
  onClose,
}: ShortageDetailsSheetProps) {
  const { t } = useTranslations();

  if (!shortage) return null;

  const riskPercentage = Math.round(shortage.riskScore * 100);
  
  // Determine color based on risk percentage (same logic as getRiskBadge)
  const getRiskColor = (percentage: number) => {
    if (percentage >= 70) {
      return {
        text: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
      };
    } else if (percentage >= 40) {
      return {
        text: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      };
    } else {
      return {
        text: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
      };
    }
  };

  const riskColor = getRiskColor(riskPercentage);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full border-border/50 bg-background sm:max-w-xl">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-xl font-semibold text-foreground">
            {t("shortageDetails")}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground font-normal">
            {t("reviewShortage")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-6 pb-6">
          {/* Product Info */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-muted/40 p-2 border border-border/30">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {shortage.productName}
                  </h3>
                </div>
                <div className="mt-4 space-y-1.5">
                  <p className="text-sm font-normal text-muted-foreground">
                    {t("sku")}: <span className="text-foreground">{shortage.sku}</span>
                  </p>
                  <p className="text-sm font-normal text-muted-foreground">
                    {t("customer")}: <span className="text-foreground">{shortage.customerName}</span>
                  </p>
                  <p className="text-sm font-normal text-muted-foreground">
                    {t("order")}: <span className="text-foreground">{shortage.orderId}</span>
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="flex items-center gap-2">
                  <div className={`rounded-xl ${riskColor.bg} p-2 border ${riskColor.border}`}>
                    <TrendingUp className={`h-5 w-5 ${riskColor.text}`} />
                  </div>
                  <span className={`text-2xl font-semibold ${riskColor.text}`}>
                    {riskPercentage}%
                  </span>
                </div>
                <p className="text-xs font-normal text-muted-foreground mt-1">{t("riskScore")}</p>
              </div>
            </div>
          </div>

          {/* Replacement Suggestions */}
          <div>
            <h4 className="mb-4 text-center text-sm font-semibold text-foreground">
              {t("aiReplacementSuggestions")}
            </h4>
            <div className="space-y-3">
              {shortage.suggestedReplacements.map((replacement, index) => (
                <div
                  key={replacement.sku}
                  className="group rounded-xl border border-border/40 bg-muted/20 p-5 transition-all hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-foreground">
                          {replacement.productName}
                        </p>
                        {index === 0 && (
                          <Badge className="bg-primary/10 text-primary border border-primary/20">
                            {t("recommended")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-normal text-muted-foreground">
                        SKU: <span className="text-foreground">{replacement.sku}</span>
                      </p>
                      <p className="mt-2 text-sm font-normal text-muted-foreground">
                        {replacement.reason}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {replacement.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-border/50 bg-background text-xs font-normal text-muted-foreground"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border/30 pt-6">
            <Button
              variant="outline"
              className="w-full border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:border-green-500/60 dark:text-green-400 cursor-default rounded-xl"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {t("markResolved")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

