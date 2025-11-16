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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full border-neutral-800 bg-neutral-950 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-xl text-white">
            {t("shortageDetails")}
          </SheetTitle>
          <SheetDescription className="text-neutral-400">
            {t("reviewShortage")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Product Info */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-neutral-500" />
                  <h3 className="font-semibold text-white">
                    {shortage.productName}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-neutral-400">
                  {t("sku")}: {shortage.sku}
                </p>
                <p className="text-sm text-neutral-400">
                  {t("customer")}: {shortage.customerName}
                </p>
                <p className="text-sm text-neutral-400">
                  {t("order")}: {shortage.orderId}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-red-400" />
                  <span className="text-2xl font-bold text-red-400">
                    {riskPercentage}%
                  </span>
                </div>
                <p className="text-xs text-neutral-500">{t("riskScore")}</p>
              </div>
            </div>
          </div>

          {/* Replacement Suggestions */}
          <div>
            <h4 className="mb-3 text-center text-sm font-medium text-neutral-300">
              {t("aiReplacementSuggestions")}
            </h4>
            <div className="space-y-3">
              {shortage.suggestedReplacements.map((replacement, index) => (
                <div
                  key={replacement.sku}
                  className="group rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 transition-all hover:border-blue-500/50 hover:bg-neutral-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">
                          {replacement.productName}
                        </p>
                        {index === 0 && (
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {t("recommended")}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        SKU: {replacement.sku}
                      </p>
                      <p className="mt-2 text-sm text-neutral-400">
                        {replacement.reason}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {replacement.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-neutral-700 bg-neutral-800/30 text-xs text-neutral-400"
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
          <div className="border-t border-neutral-800 pt-6">
            <Button
              variant="outline"
              className="w-full border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20 cursor-default"
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

