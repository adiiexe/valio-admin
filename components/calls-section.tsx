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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CallRecord } from "@/lib/types";
import { CallDetailsDialog } from "./call-details-dialog";
import { Phone, MessageSquare } from "lucide-react";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { format } from "date-fns";

interface CallsSectionProps {
  calls: CallRecord[];
}

export function CallsSection({ calls }: CallsSectionProps) {
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewConversation = (call: CallRecord) => {
    setSelectedCall(call);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-500/20 text-green-400 border-green-500/50",
      failed: "bg-red-500/20 text-red-400 border-red-500/50",
      in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    };
    const labels = {
      completed: "Completed",
      failed: "Failed",
      in_progress: "In Progress",
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getOutcomeBadge = (outcome: string) => {
    const variants = {
      replacement_accepted: "bg-green-500/20 text-green-400",
      replacement_declined: "bg-red-500/20 text-red-400",
      credits_only: "bg-blue-500/20 text-blue-400",
      no_answer: "bg-neutral-500/20 text-neutral-400",
    };
    const labels = {
      replacement_accepted: "✓ Accepted",
      replacement_declined: "✗ Declined",
      credits_only: "$ Credits",
      no_answer: "— No Answer",
    };
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${variants[outcome as keyof typeof variants]}`}>
        {labels[outcome as keyof typeof labels]}
      </span>
    );
  };

  return (
    <>
      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AnimatedIcon icon={Phone} className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-xl text-white">
              AI Calls & Customer Outcomes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800 hover:bg-transparent">
                  <TableHead className="text-neutral-400">Time</TableHead>
                  <TableHead className="text-neutral-400">Customer</TableHead>
                  <TableHead className="text-neutral-400">Direction</TableHead>
                  <TableHead className="text-neutral-400">Lang</TableHead>
                  <TableHead className="text-neutral-400">Status</TableHead>
                  <TableHead className="text-neutral-400">Outcome</TableHead>
                  <TableHead className="text-right text-neutral-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => (
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
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-neutral-700 bg-neutral-800/30 text-neutral-300"
                      >
                        {call.direction === "outbound" ? "→ Out" : "← In"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-400 uppercase">
                      {call.language}
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
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CallDetailsDialog
        call={selectedCall}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}

