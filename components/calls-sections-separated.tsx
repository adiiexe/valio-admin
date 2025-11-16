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
import { CallRecord } from "@/lib/types";
import { CallDetailsDialog } from "./call-details-dialog";
import { PhoneIncoming, PhoneOutgoing, MessageSquare } from "lucide-react";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { format } from "date-fns";
import { useTranslations } from "@/lib/use-translations";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SpotlightTableRow } from "@/components/ui/spotlight-table-row";

interface CallsSectionsSeparatedProps {
  calls: CallRecord[];
}

export function CallsSectionsSeparated({ calls }: CallsSectionsSeparatedProps) {
  const { t } = useTranslations();
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewConversation = (call: CallRecord) => {
    setSelectedCall(call);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "text-green-500/80",
      failed: "text-red-500/80",
      in_progress: "text-blue-500/80",
    };
    const labels = {
      completed: t("completed"),
      failed: t("failed"),
      in_progress: t("inProgress"),
    };
    return (
      <span className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getOutcomeBadge = (outcome: string) => {
    const variants: Record<string, string> = {
      accepted: "text-green-500/80",
      replacement_accepted: "text-green-500/80",
      credits: "text-blue-500/80",
      credits_only: "text-blue-500/80",
      incomplete: "text-neutral-400/80",
      replacement_declined: "text-red-500/80",
      no_answer: "text-yellow-500/80",
    };
    const labels: Record<string, string> = {
      accepted: t("accepted"),
      replacement_accepted: t("accepted"),
      credits: t("credits"),
      credits_only: t("credits"),
      incomplete: t("incomplete"),
      replacement_declined: t("replacementDeclined"),
      no_answer: t("noAnswer"),
    };
    
    const variant = variants[outcome] || "text-muted-foreground/80";
    const label = labels[outcome] || outcome || "—";
    
    return (
      <span className={variant}>
        {label}
      </span>
    );
  };

  const outboundCalls = calls.filter(c => c.direction === "outbound");
  const inboundCalls = calls.filter(c => c.direction === "inbound");

  const CallTable = ({ calls: callList, title, Icon }: { calls: CallRecord[], title: string, Icon: typeof PhoneOutgoing }) => (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-2">
            <AnimatedIcon icon={Icon} className="h-5 w-5 text-blue-500" />
          </div>
          <CardTitle className="text-xl text-foreground">{title}</CardTitle>
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {callList.length} {t("calls")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent dark:border-border">
                <TableHead className="text-muted-foreground font-medium">{t("time")}</TableHead>
                <TableHead className="text-muted-foreground font-medium">{t("customer")}</TableHead>
                <TableHead className="text-muted-foreground font-medium">{t("status")}</TableHead>
                <TableHead className="text-muted-foreground font-medium">{t("outcome")}</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium">{t("action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {callList.map((call) => (
                <SpotlightTableRow
                  key={call.id}
                  spotlightColor="rgba(59, 130, 246, 0.15)"
                  className="border-border/30 transition-colors hover:bg-muted/30 dark:hover:bg-muted/50"
                  onClick={() => handleViewConversation(call)}
                >
                  <TableCell className="font-normal text-muted-foreground">
                    {format(new Date(call.time), "HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {call.customerName}
                  </TableCell>
                  <TableCell>{getStatusBadge(call.status)}</TableCell>
                  <TableCell>{getOutcomeBadge(call.outcome)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10 hover:text-primary/80 rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewConversation(call);
                      }}
                    >
                      <MessageSquare className="mr-1 h-4 w-4" />
                      {t("view")}
                    </Button>
                  </TableCell>
                </SpotlightTableRow>
              ))}
              {callList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t("noCallsYet")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        <CallTable calls={outboundCalls} title={t("outboundCalls")} Icon={PhoneOutgoing} />
        <CallTable calls={inboundCalls} title={t("inboundCalls")} Icon={PhoneIncoming} />
      </div>

      <CallDetailsDialog
        call={selectedCall}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}

