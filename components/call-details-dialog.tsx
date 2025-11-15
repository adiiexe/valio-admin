"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CallRecord } from "@/lib/types";
import { Phone, Clock, Globe, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "@/lib/use-translations";

interface CallDetailsDialogProps {
  call: CallRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CallDetailsDialog({
  call,
  isOpen,
  onClose,
}: CallDetailsDialogProps) {
  const { t } = useTranslations();
  if (!call) return null;

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
      <span className={`text-xs ${variants[outcome as keyof typeof variants]}`}>
        {labels[outcome as keyof typeof labels]}
      </span>
    );
  };

  const minutes = Math.floor(call.durationSeconds / 60);
  const seconds = call.durationSeconds % 60;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-neutral-800 bg-neutral-950 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {t("callConversation")}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            {call.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 rounded-md bg-neutral-900/50 px-3 py-1.5">
              <Phone className="h-3.5 w-3.5 text-neutral-500" />
              <span className="text-xs text-neutral-400">
                {call.direction === "outbound" ? t("outbound") : t("inbound")}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-neutral-900/50 px-3 py-1.5">
              <Globe className="h-3.5 w-3.5 text-neutral-500" />
              <span className="text-xs text-neutral-400 uppercase">
                {call.language}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-neutral-900/50 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              <span className="text-xs text-neutral-400">
                {call.status === "in_progress"
                  ? t("inProgress")
                  : `${minutes}m ${seconds}s`}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-neutral-900/50 px-3 py-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-neutral-500" />
              {getOutcomeBadge(call.outcome)}
            </div>
          </div>

          {/* Transcript */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-neutral-300">
              {t("transcript")}
            </h4>
            <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 max-h-96 overflow-y-auto">
              {call.transcript.map((turn, index) => (
                <div
                  key={index}
                  className={`flex ${
                    turn.speaker === "agent" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                      turn.speaker === "agent"
                        ? "bg-blue-500/20 text-blue-100"
                        : "bg-neutral-800 text-neutral-200"
                    }`}
                  >
                    <p className="mb-1 text-xs font-medium uppercase opacity-70">
                      {turn.speaker === "agent" ? t("aiAgent") : t("customer")}
                    </p>
                    <p className="text-sm leading-relaxed">{turn.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Player */}
          {call.audioUrl ? (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
              <p className="mb-2 text-sm font-medium text-neutral-300">
                {t("callRecording")}
              </p>
              <audio controls className="w-full">
                <source src={call.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-neutral-800 p-2">
                  <Phone className="h-4 w-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-300">
                    {t("callRecording")}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {t("willBeAvailable")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Photo of Missing Product */}
          {call.photoUrl && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
              <p className="mb-2 text-sm font-medium text-neutral-300">
                {t("photoOfMissingProduct")}
              </p>
              <img 
                src={call.photoUrl} 
                alt="Missing product" 
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Additional Info */}
          <div className="border-t border-neutral-800 pt-4 text-xs text-neutral-500">
            <p>{t("callId")}: {call.id}</p>
            <p>{t("time")}: {format(new Date(call.time), "PPpp")}</p>
            {call.relatedOrderId && <p>{t("relatedOrder")}: {call.relatedOrderId}</p>}
            {call.relatedSku && <p>{t("relatedSku")}: {call.relatedSku}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

