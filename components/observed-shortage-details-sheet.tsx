"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ObservedShortage } from "@/lib/types";
import { Package, PhoneIncoming, Database } from "lucide-react";

interface ObservedShortageDetailsSheetProps {
  shortage: ObservedShortage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ObservedShortageDetailsSheet({
  shortage,
  isOpen,
  onClose,
}: ObservedShortageDetailsSheetProps) {
  if (!shortage) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full border-border/50 bg-background sm:max-w-xl">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-xl font-semibold text-foreground">
            Observed shortage
          </SheetTitle>
          <SheetDescription className="text-muted-foreground font-normal">
            The order has been updated in the database. The system was made
            aware of this shortage via an inbound call to an AI voice agent.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-6 pb-6">
          {/* Source & channel */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4 flex items-start gap-3">
            <div className="rounded-xl bg-muted/40 p-2 border border-border/30">
              <PhoneIncoming className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Reported via inbound AI voice call
              </p>
              <p className="text-xs text-muted-foreground">
                Customer called in about a shortage and the system created this
                observed record after updating the underlying order in the
                source systems.
              </p>
            </div>
          </div>

          {/* Core info */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-muted/40 p-2 border border-border/30">
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Company
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {shortage.company}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Missing product
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {shortage.missingProduct}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Qty:{" "}
                    <span className="text-foreground font-medium">
                      {shortage.missingProductQty}
                    </span>
                    {shortage.orderDay
                      ? ` · Order day: ${shortage.orderDay}`
                      : null}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Replacement product
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {shortage.replacementProduct}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Qty:{" "}
                    <span className="text-foreground font-medium">
                      {shortage.replacementProductQty}
                    </span>
                    {shortage.replacementProductId
                      ? ` · SKU: ${shortage.replacementProductId}`
                      : null}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System metadata */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4 flex items-start gap-3">
            <div className="rounded-xl bg-muted/40 p-2 border border-border/30">
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Order & system status
              </p>
              <p className="text-xs text-muted-foreground">
                This observed shortage reflects the latest confirmed state in
                your operational systems and is kept in sync via n8n.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Created:{" "}
                <span className="text-foreground">
                  {shortage.createdAt ?? "n/a"}
                </span>
                {" · "}
                Updated:{" "}
                <span className="text-foreground">
                  {shortage.updatedAt ?? "n/a"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


