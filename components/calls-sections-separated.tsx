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
    const variants = {
      replacement_accepted: "text-green-500/80",
      replacement_declined: "text-red-500/80",
      credits_only: "text-blue-500/80",
      no_answer: "text-neutral-400/80",
    };
    const labels = {
      replacement_accepted: t("accepted"),
      replacement_declined: t("declined"),
      credits_only: t("creditsOnly"),
      no_answer: t("noAnswer"),
    };
    return (
      <span className={variants[outcome as keyof typeof variants]}>
        {labels[outcome as keyof typeof labels]}
      </span>
    );
  };

  const outboundCalls = calls.filter(c => c.direction === "outbound");
  const inboundCalls = calls.filter(c => c.direction === "inbound");

  const CallTable = ({ calls: callList, title, Icon }: { calls: CallRecord[], title: string, Icon: typeof PhoneOutgoing }) => (
    <Card className="border-neutral-800 bg-neutral-900/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AnimatedIcon icon={Icon} className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-xl text-white">{title}</CardTitle>
          <span className="ml-auto text-sm text-neutral-400">
            {callList.length} {t("calls")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-transparent">
                <TableHead className="text-neutral-400">{t("time")}</TableHead>
                <TableHead className="text-neutral-400">{t("customer")}</TableHead>
                <TableHead className="text-neutral-400">{t("status")}</TableHead>
                <TableHead className="text-neutral-400">{t("outcome")}</TableHead>
                <TableHead className="text-right text-neutral-400">{t("action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {callList.map((call) => (
                <TableRow
                  key={call.id}
                  className="border-neutral-800 transition-colors hover:bg-neutral-800/50"
                >
                  <TableCell className="text-neutral-400">
                    {format(new Date(call.time), "HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {call.customerName}
                  </TableCell>
                  <TableCell>{getStatusBadge(call.status)}</TableCell>
                  <TableCell>{getOutcomeBadge(call.outcome)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewConversation(call)}
                      className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                      <MessageSquare className="mr-1 h-4 w-4" />
                      {t("view")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {callList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-neutral-500 py-8">
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

