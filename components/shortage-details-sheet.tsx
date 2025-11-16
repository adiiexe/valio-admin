"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ShortagePrediction } from "@/lib/types";
import { Package, TrendingUp, FileText } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";
import { getProductBySKU, ProductCSVData } from "@/lib/products-csv";
import { translateCategoryName } from "@/lib/category-translations";
import { formatProductName } from "@/lib/format-product-name";

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
  const { t, language } = useTranslations();
  const [productData, setProductData] = useState<ProductCSVData | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    if (shortage && isOpen) {
      setLoadingProduct(true);
      getProductBySKU(shortage.sku)
        .then((data) => {
          setProductData(data);
          setLoadingProduct(false);
        })
        .catch(() => {
          setProductData(null);
          setLoadingProduct(false);
        });
    } else {
      setProductData(null);
    }
  }, [shortage?.sku, isOpen]);

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
                    {formatProductName(shortage.productName)}
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

          {/* Product Details from CSV */}
          {loadingProduct ? (
            <div className="rounded-xl border border-border/40 bg-muted/20 p-6">
              <p className="text-sm text-muted-foreground text-center">{t("loadingProductDetails")}</p>
            </div>
          ) : productData ? (
            <div className="rounded-xl border border-border/40 bg-muted/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">{t("productDetails")}</h4>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-normal text-muted-foreground mb-1">{t("eanCode")}</p>
                    <p className="text-sm font-medium text-foreground">{productData.eanKoodi || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-normal text-muted-foreground mb-1">{t("manufacturerName")}</p>
                    <p className="text-sm font-medium text-foreground">{productData.valmistajanNimi || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-normal text-muted-foreground mb-1">{t("categoryName")}</p>
                    <p className="text-sm font-medium text-foreground">
                      {productData.kategorianNimi 
                        ? translateCategoryName(productData.kategorianNimi, language)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-normal text-muted-foreground mb-1">{t("batchSize")}</p>
                    <p className="text-sm font-medium text-foreground">{productData.eranKoko || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-normal text-muted-foreground mb-1">{t("unitPrice")}</p>
                    <p className="text-sm font-medium text-foreground">{productData.yksikkohinta || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-normal text-muted-foreground mb-1">{t("totalIncludingVat")}</p>
                    <p className="text-sm font-medium text-foreground">{productData.yhteensa || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/40 bg-muted/20 p-6">
              <p className="text-sm text-muted-foreground text-center">{t("productDetailsNotFound")}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

