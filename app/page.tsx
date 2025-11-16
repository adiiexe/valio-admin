"use client";

import { useEffect, useRef, useState } from "react";
import { SidebarNew } from "@/components/sidebar-new";
import { DashboardOverview } from "@/components/dashboard-overview";
import { PredictionsSection } from "@/components/predictions-section";
import { CallsSectionsSeparated } from "@/components/calls-sections-separated";
import { CallDetailsDialog } from "@/components/call-details-dialog";
import { ShortagePrediction, CallRecord } from "@/lib/types";
import { formatProductName } from "@/lib/format-product-name";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fi, enUS } from "date-fns/locale";
import { TranslationsProvider, useTranslations } from "@/lib/use-translations";
import { fetchConversations } from "@/lib/elevenlabs-client";
import { AnimatedThemeToggleButton } from "@/components/ui/animated-theme-toggle-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Database, Mail, TrendingUp, Phone, CheckCircle2, BarChart3, ArrowRight } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

// Data source URLs
// Example orders and prediction batch APIs are called directly from the frontend.
// You can override these with NEXT_PUBLIC_EXAMPLE_DATA_URL and NEXT_PUBLIC_PREDICTION_BATCH_URL in .env.local if needed.
const EXAMPLE_DATA_URL =
  process.env.NEXT_PUBLIC_EXAMPLE_DATA_URL ||
  "https://otso.veistera.com/get-example-data";
const PREDICTION_BATCH_URL =
  process.env.NEXT_PUBLIC_PREDICTION_BATCH_URL ||
  "https://otso.veistera.com/prediction-batch";
// Optional static fallback for calls (used only if ElevenLabs has no data or fails)
// Defaults to `public/api/calls.json` to match ELEVENLABS_SETUP.md
const CALLS_URL =
  process.env.NEXT_PUBLIC_CALLS_URL || "api/calls.json";
// Proxy endpoint that calls the n8n webhook server-side to avoid CORS issues
const OUTBOUND_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_OUTBOUND_CALLS_WEBHOOK_URL ||
  "/api/outbound-shortages";

// Shape of outbound resolution entries coming from the n8n webhook
type OutboundWebhookRow = {
  // Newer n8n flow uses `product_name`; older one used `Tuote`
  product_name?: string;
  Tuote?: string;
  product_qty?: string;
  customer_number?: string | number;
  replaced?: boolean | null;
  called?: boolean | null;
  replacedWith?: string | null;
  replacedWith_qty?: number | null;
  replacedWith_id?: number | null;
  product_id?: number | string;
  id?: number | string;
  createdAt?: string;
  updatedAt?: string;
};

// Map the prediction API response shape to our ShortagePrediction[] domain model.
function mapPredictionsResponse(raw: any): ShortagePrediction[] {
  // If it already looks like ShortagePrediction[], return as-is
  if (Array.isArray(raw) && raw.length > 0 && raw[0] && typeof raw[0] === "object") {
    const first = raw[0] as any;
    if ("id" in first && "sku" in first && "riskScore" in first) {
      return raw as ShortagePrediction[];
    }
  }

  const root = Array.isArray(raw) ? raw[0] : raw;

  // Support multiple common response shapes:
  // - { orders: [...] }
  // - { data: { orders: [...] } }
  // - [{ orders: [...] }]
  const orders =
    (root && Array.isArray(root.orders) && root.orders) ||
    (root &&
      root.data &&
      Array.isArray(root.data.orders) &&
      root.data.orders) ||
    (raw &&
      raw.data &&
      Array.isArray(raw.data.orders) &&
      raw.data.orders);
  if (!Array.isArray(orders)) return [];

  const predictions: ShortagePrediction[] = [];

  for (const order of orders) {
    const orderNumber = order.order_number ?? "UNKNOWN_ORDER";
    const customerNumber = order.customer_number ?? "Unknown customer";
    const items = Array.isArray(order.items) ? order.items : [];

    for (const item of items) {
      // Optionally skip truly low-risk items
      if (
        typeof item.risk_level === "string" &&
        item.risk_level.toUpperCase() === "LOW"
      ) {
        continue;
      }

      const productCode = item.product_code ?? "UNKNOWN_PRODUCT";
      const productInfo = item.product_info ?? {};
      const rawProductName =
        (productInfo && (productInfo["Tuote"] as string)) || productCode;
      const productName = formatProductName(rawProductName);
      const stockoutProbability =
        typeof item.stockout_probability === "number"
          ? item.stockout_probability
          : 0;

      const id = `${orderNumber}-${productCode}`;

      predictions.push({
        id,
        sku: productCode,
        productName,
        customerName: customerNumber,
        riskScore: stockoutProbability,
        status: "pending",
        orderId: orderNumber,
        // Prediction payload doesn't include replacements yet, so leave empty
        suggestedReplacements: [],
      });
    }
  }

  return predictions;
}

async function fetchShortagePredictions(): Promise<ShortagePrediction[]> {
  try {
    console.log(
      "[Predictions] Fetching example data from",
      EXAMPLE_DATA_URL
    );

    const exampleRes = await fetch(EXAMPLE_DATA_URL);
    if (!exampleRes.ok) {
      console.warn(
        "[Predictions] Example data API returned status:",
        exampleRes.status
      );
      return [];
    }

    const exampleJson = await exampleRes.json();
    const orders =
      exampleJson?.multi_customer_orders?.data?.orders ??
      exampleJson?.batch_orders_example?.data?.orders ??
      exampleJson?.cake_bakery_order?.data?.orders;

    if (!Array.isArray(orders) || orders.length === 0) {
      console.warn(
        "[Predictions] Example data payload missing orders array (multi_customer_orders / batch_orders_example / cake_bakery_order)"
      );
      return [];
    }

    console.log(
      "[Predictions] Sending prediction batch request to",
      PREDICTION_BATCH_URL,
      "with",
      orders.length,
      "orders"
    );

    const predictionRes = await fetch(PREDICTION_BATCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orders }),
    });

    if (!predictionRes.ok) {
      console.warn(
        "[Predictions] Prediction batch API returned status:",
        predictionRes.status
      );
      return [];
    }

    const predictionRaw = await predictionRes.json();
    const mapped = mapPredictionsResponse(predictionRaw);

    console.log(
      "[Predictions] Received",
      Array.isArray(mapped) ? mapped.length : "unknown",
      "shortage predictions"
    );

    return mapped;
  } catch (error: any) {
    console.error(
      "[Predictions] Failed to fetch predictions:",
      error?.message || error
    );
    return [];
  }
}

function DashboardContent({ onLanguageChange }: { onLanguageChange: (lang: "fi" | "en") => void }) {
  const [predictions, setPredictions] = useState<ShortagePrediction[]>([]);
  const [observedShortages, setObservedShortages] = useState<ShortagePrediction[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t, language } = useTranslations();
  const hasLoadedRef = useRef(false);

  const normalize = (value: string | number | null | undefined) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  // Initial data fetch
  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;

    const fetchData = async () => {
      try {
        console.log(
          "[Dashboard] Sending initial predictions request to",
          EXAMPLE_DATA_URL,
          "and",
          PREDICTION_BATCH_URL
        );

        const predictionsData: ShortagePrediction[] =
          await fetchShortagePredictions();

        // Fetch calls: ElevenLabs as primary source, static JSON only as fallback
        let callsData: CallRecord[] = [];

        // First, try ElevenLabs API
        try {
          const elevenLabsCalls = await fetchConversations();
          console.log(
            "[Dashboard] Received calls from ElevenLabs:",
            elevenLabsCalls.length,
            "items"
          );

          if (elevenLabsCalls.length > 0) {
            callsData = elevenLabsCalls;
            console.log("[Dashboard] Using ElevenLabs calls as primary source");
          } else {
            console.log(
              "[Dashboard] ElevenLabs returned no calls; will try static JSON fallback if configured"
            );
          }
        } catch (elevenLabsError: any) {
          console.warn(
            "[Dashboard] ElevenLabs API failed; will try static JSON fallback if configured:",
            elevenLabsError?.message || elevenLabsError
          );
        }

        // If ElevenLabs had no data or failed, optionally fall back to static JSON
        if ((!Array.isArray(callsData) || callsData.length === 0) && CALLS_URL) {
          try {
            const callsRes = await fetch(CALLS_URL);
            if (callsRes.ok) {
              callsData = await callsRes.json();
              console.log(
                "[Dashboard] Loaded calls from static JSON fallback:",
                callsData.length,
                "items"
              );
            } else {
              console.warn(
                "[Dashboard] Static JSON fallback returned status:",
                callsRes.status
              );
            }
          } catch (fallbackError: any) {
            console.warn(
              "[Dashboard] Failed to load calls from static JSON fallback:",
              fallbackError?.message || fallbackError
            );
          }
        }

        setPredictions(predictionsData);
        setCalls(callsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: t("error"),
          description: t("failedToLoadData"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, t]);

  // Poll outbound resolution webhook periodically to auto-resolve shortages
  useEffect(() => {
    if (isLoading) return;
    if (!OUTBOUND_WEBHOOK_URL) return;

    const pollWebhook = async () => {
      try {
        console.log(
          "[Dashboard] Polling outbound shortages webhook at",
          new Date().toISOString(),
          "via",
          OUTBOUND_WEBHOOK_URL
        );

        const res = await fetch(OUTBOUND_WEBHOOK_URL);
        if (!res.ok) {
          console.warn(
            "[Dashboard] Outbound webhook returned status:",
            res.status
          );
          return;
        }

        const json = await res.json();
        if (!Array.isArray(json)) {
          console.warn(
            "[Dashboard] Outbound webhook payload was not an array; got",
            json
          );
          return;
        }

        const rows = json as OutboundWebhookRow[];
        console.log(
          "[Dashboard] Outbound webhook returned rows:",
          rows.length,
          rows
        );

        setPredictions((prev: ShortagePrediction[]): ShortagePrediction[] => {
          if (!Array.isArray(prev) || prev.length === 0) return prev;

          let changed = false;

          const next: ShortagePrediction[] = prev.map((prediction) => {
            const match = rows.find((row) => {
              const sameProductId =
                normalize(row.product_id) === normalize(prediction.sku);

              const webhookName = row.product_name ?? row.Tuote;
              const sameProductName =
                normalize(webhookName) === normalize(prediction.productName);

              return row.replaced === true && (sameProductId || sameProductName);
            });

            if (match && prediction.status !== "resolved") {
              changed = true;
              console.log("[Dashboard] Auto-resolved shortage from webhook", {
                prediction,
                match,
              });
              return {
                ...prediction,
                status: "resolved" as ShortagePrediction["status"],
              };
            }

            return prediction;
          });

          return changed ? next : prev;
        });

        // Extract observed shortages (items that haven't been replaced)
        const observed: ShortagePrediction[] = rows
          .filter((row) => row.replaced !== true && (row.called === true || row.called === null))
          .map((row, index) => {
            const rawProductName = row.product_name ?? row.Tuote ?? "Unknown Product";
            const productName = formatProductName(rawProductName);
            const productId = String(row.product_id ?? row.id ?? `observed-${index}`);
            const customerNumber = String(row.customer_number ?? "Unknown Customer");
            const rawReplacementProduct = row.replacedWith ?? null;
            const replacementProduct = rawReplacementProduct ? formatProductName(rawReplacementProduct) : null;

            return {
              id: `observed-${productId}-${index}`,
              sku: String(row.product_id ?? productId),
              productName: productName,
              customerName: customerNumber,
              riskScore: 1.0, // Observed shortages are 100% risk
              status: "pending" as const,
              orderId: `OBS-${productId}`,
              suggestedReplacements: [],
              type: "observed" as const,
              replacementProduct: replacementProduct, // Store replacement product name
            };
          });

        // Remove duplicates and update observed shortages
        const uniqueObserved = observed.filter((obs, index, self) =>
          index === self.findIndex((o) => o.sku === obs.sku && o.customerName === obs.customerName)
        );

        setObservedShortages(uniqueObserved);
      } catch (error) {
        console.error(
          "[Dashboard] Failed to poll outbound webhook:",
          (error as any)?.message || error
        );
      }
    };

    // Initial poll, then every 60 seconds
    void pollWebhook();
    const intervalId = setInterval(pollWebhook, 60_000);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Keep ElevenLabs call logs live using a lightweight polling loop
  useEffect(() => {
    if (isLoading) return; // Don't poll until initial load is complete

    const pollInterval = setInterval(async () => {
      try {
        // Fetch calls: ElevenLabs as primary source, static JSON only as fallback
        let callsData: CallRecord[] = [];

        // Try ElevenLabs API first
        try {
          const elevenLabsCalls = await fetchConversations();
          if (elevenLabsCalls.length > 0) {
            callsData = elevenLabsCalls;
          }
        } catch {
          // Ignore errors here; we'll optionally fall back to static JSON
        }

        // If ElevenLabs had no data or failed, optionally fall back to static JSON
        if ((!Array.isArray(callsData) || callsData.length === 0) && CALLS_URL) {
          try {
            const callsRes = await fetch(CALLS_URL);
            if (callsRes.ok) {
              callsData = await callsRes.json();
            }
          } catch {
            // Ignore static JSON errors during polling; keep previous state
          }
        }

        if (!Array.isArray(callsData) || callsData.length === 0) {
          return;
        }

        setCalls((prev) => {
          // Compare by IDs to detect new calls or updates
          const prevIds = new Set(prev.map((c) => c.id));
          const hasNewCalls = callsData.some((c) => !prevIds.has(c.id));
          const newCalls = callsData.filter((c) => !prevIds.has(c.id));
          const hasUpdates = prev.some((p) => {
            const updated = callsData.find((c) => c.id === p.id);
            return updated && JSON.stringify(p) !== JSON.stringify(updated);
          });

          if (hasNewCalls || hasUpdates || prev.length !== callsData.length) {
            // Show toast notification for newly detected calls
            if (hasNewCalls && newCalls.length > 0) {
              const latestCall = newCalls[0];
              toast({
                title: t("newCallReceived"),
                description: `${t("callFrom")} ${latestCall.customerName} - ${latestCall.summary}`,
              });
            }

            return callsData;
          }

          return prev;
        });
      } catch (error) {
        // Silently fail on polling errors to avoid spam
        console.error("[Dashboard] Calls polling error:", error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [isLoading, toast, t]);

  const handleTriggerCall = async (shortageId: string) => {
    try {
      // For static export, simulate the API call
      // In a real deployment, this would call an external API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Note: Status remains pending until manually resolved
      // The call is triggered but status doesn't change automatically

      const shortage = predictions.find((p) => p.id === shortageId);
      toast({
        title: t("aiCallTriggered"),
        description: `${t("calling")} ${shortage?.customerName} ${t("about")} ${shortage?.productName}`,
      });
    } catch (error) {
      console.error("Failed to trigger call:", error);
      toast({
        title: t("error"),
        description: t("failedToTriggerCall"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <>
            <DashboardOverview
              predictions={predictions}
              calls={calls}
              onNavigate={setCurrentView}
              onViewCall={(call: CallRecord) => {
                setSelectedCall(call);
                setIsCallDialogOpen(true);
              }}
            />
            <CallDetailsDialog
              call={selectedCall}
              isOpen={isCallDialogOpen}
              onClose={() => {
                setIsCallDialogOpen(false);
                setSelectedCall(null);
              }}
            />
          </>
        );
      case "shortages":
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("shortages")}</h1>
              <p className="text-base font-normal text-muted-foreground">
                {t("manageShortages")}
              </p>
            </div>
            <PredictionsSection
              predictions={predictions}
              observedShortages={observedShortages}
            />
          </div>
        );
      case "calls":
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("aiCalls")}</h1>
              <p className="text-base font-normal text-muted-foreground hover:text-green-500 transition-colors cursor-default">
                {t("viewAllCallsSubtitle")}
              </p>
            </div>
            <CallsSectionsSeparated calls={calls} />
          </div>
        );
      case "info":
        return (
          <div className="space-y-10">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("info")}</h1>
              <p className="text-base font-normal text-muted-foreground">
                {t("aboutDescription")}
              </p>
            </div>

            {/* How It Works - Visual Flow */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{t("howItWorks")}</h2>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Step 1 */}
                <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.15)" className="rounded-2xl">
                  <Card className="border-border/50 bg-card relative overflow-hidden group hover:shadow-md transition-all h-full">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20">
                          <TrendingUp className="h-6 w-6 text-red-500" />
                        </div>
                        <CardTitle className="text-lg text-foreground">{t("step1Title")}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                        {t("step1Description")}
                      </p>
                    </CardContent>
                  </Card>
                </SpotlightCard>

                {/* Step 2 */}
                <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.15)" className="rounded-2xl">
                  <Card className="border-border/50 bg-card relative overflow-hidden group hover:shadow-md transition-all h-full">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-500/10 p-3 border border-blue-500/20">
                          <Phone className="h-6 w-6 text-blue-500" />
                        </div>
                        <CardTitle className="text-lg text-foreground">{t("step2Title")}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                        {t("step2Description")}
                      </p>
                    </CardContent>
                  </Card>
                </SpotlightCard>

                {/* Step 3 */}
                <SpotlightCard spotlightColor="rgba(34, 197, 94, 0.15)" className="rounded-2xl">
                  <Card className="border-border/50 bg-card relative overflow-hidden group hover:shadow-md transition-all h-full">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-green-500/10 p-3 border border-green-500/20">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <CardTitle className="text-lg text-foreground">{t("step3Title")}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                        {t("step3Description")}
                      </p>
                    </CardContent>
                  </Card>
                </SpotlightCard>

                {/* Step 4 */}
                <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.15)" className="rounded-2xl">
                  <Card className="border-border/50 bg-card relative overflow-hidden group hover:shadow-md transition-all h-full">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-purple-500/10 p-3 border border-purple-500/20">
                          <BarChart3 className="h-6 w-6 text-purple-500" />
                        </div>
                        <CardTitle className="text-lg text-foreground">{t("step4Title")}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-normal text-muted-foreground leading-relaxed">
                        {t("step4Description")}
                      </p>
                    </CardContent>
                  </Card>
                </SpotlightCard>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Data Sources & Technologies Card */}
              <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.15)" className="rounded-2xl">
                <Card className="border-border/50 bg-card h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-500/10 p-2 border border-blue-500/20">
                        <Database className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardTitle className="text-foreground">{t("dataSources")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        {t("dataSources")}
                      </p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">
                        {t("dataSourcesList")}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        {t("technologies")}
                      </p>
                      <p className="text-sm font-normal text-foreground leading-relaxed">
                        {t("technologiesList")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>

              {/* Contact Card */}
              <SpotlightCard spotlightColor="rgba(34, 197, 94, 0.15)" className="rounded-2xl">
                <Card className="border-border/50 bg-card h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-green-500/10 p-2 border border-green-500/20">
                        <Mail className="h-5 w-5 text-green-500" />
                      </div>
                      <CardTitle className="text-foreground">{t("contact")}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      {t("contactEmail")}
                    </p>
                    <a
                      href="mailto:contact@valio.fi"
                      className="text-sm font-normal text-primary hover:text-primary/80 transition-colors"
                    >
                      contact@valio.fi
                    </a>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNew 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onExpandChange={setIsSidebarExpanded}
      />
      <main 
        className="flex-1 p-6 transition-all duration-300 md:p-8 lg:p-10"
        style={{ marginLeft: isSidebarExpanded ? '240px' : '80px' }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Top Bar */}
          <div className="mb-10 flex items-center justify-between py-2">
            <div className="text-sm font-normal text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy", {
                locale: language === "fi" ? fi : enUS,
              })}
            </div>
            <div className="flex items-center gap-3">
              <AnimatedThemeToggleButton type="horizontal" />
              <button
                onClick={() => {
                  const newLang = language === "fi" ? "en" : "fi";
                  onLanguageChange(newLang);
                  localStorage.setItem("language", newLang);
                }}
                className="rounded-xl border border-border/50 bg-background px-4 py-2 text-xs font-normal text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:border-border cursor-pointer shadow-sm"
              >
                <span className={language === "fi" ? "text-foreground font-medium" : "font-normal"}>FI</span>
                {" | "}
                <span className={language === "en" ? "text-foreground font-medium" : "font-normal"}>EN</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  // Always start from "fi" on the server to avoid hydration mismatches,
  // then read the persisted language preference on the client.
  const [language, setLanguage] = useState<"fi" | "en">("fi");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("language");
    if (saved === "fi" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  return (
    <TranslationsProvider language={language}>
      <DashboardContent onLanguageChange={setLanguage} />
    </TranslationsProvider>
  );
}
