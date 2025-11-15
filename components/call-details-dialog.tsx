"use client";

import { useState, useEffect } from "react";
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
import { fetchConversation } from "@/lib/elevenlabs-client";

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
  const [fullCall, setFullCall] = useState<CallRecord | null>(call);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);

  // Fetch full conversation details when dialog opens (always fetch to get latest transcript)
  useEffect(() => {
    if (isOpen && call) {
      setIsLoadingTranscript(true);
      // Always fetch full conversation to ensure we have the latest transcript
      fetchConversation(call.id)
        .then((fullConversation) => {
          setFullCall(fullConversation);
        })
        .catch((error) => {
          console.error("[CallDetailsDialog] Failed to fetch full conversation:", error);
          // If fetch fails, use the call data we have (might have partial transcript)
          setFullCall(call);
        })
        .finally(() => {
          setIsLoadingTranscript(false);
        });
    } else if (call) {
      setFullCall(call);
    }
  }, [isOpen, call]);

  if (!call || !fullCall) return null;

  const getOutcomeBadge = (outcome: string) => {
    const variants = {
      accepted: "text-green-500/80",
      credits: "text-blue-500/80",
      incomplete: "text-neutral-400/80",
    };
    const labels = {
      accepted: t("accepted"),
      credits: t("credits"),
      incomplete: t("incomplete"),
    };
    return (
      <span className={`text-xs ${variants[outcome as keyof typeof variants]}`}>
        {labels[outcome as keyof typeof labels]}
      </span>
    );
  };

  const minutes = Math.floor(fullCall.durationSeconds / 60);
  const seconds = fullCall.durationSeconds % 60;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-neutral-800 bg-neutral-950 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {t("callConversation")}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            {fullCall.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 rounded-md bg-neutral-900/50 px-3 py-1.5">
              <Phone className="h-3.5 w-3.5 text-neutral-500" />
              <span className="text-xs text-neutral-400">
                {fullCall.direction === "outbound" ? t("outbound") : t("inbound")}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-neutral-900/50 px-3 py-1.5">
              <Globe className="h-3.5 w-3.5 text-neutral-500" />
              <span className="text-xs text-neutral-400 uppercase">
                {fullCall.language}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-neutral-900/50 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              <span className="text-xs text-neutral-400">
                {fullCall.status === "in_progress"
                  ? t("inProgress")
                  : `${minutes}m ${seconds}s`}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-neutral-900/50 px-3 py-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-neutral-500" />
              {getOutcomeBadge(fullCall.outcome)}
            </div>
          </div>

          {/* Transcript */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-neutral-300">
              {t("transcript")}
            </h4>
            <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/30 p-4 max-h-96 overflow-y-auto">
              {isLoadingTranscript ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  <span className="ml-2 text-sm text-neutral-400">{t("loading")}</span>
                </div>
              ) : fullCall.transcript.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  {t("noTranscriptAvailable")}
                </div>
              ) : (
                fullCall.transcript.map((turn, index) => (
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
                ))
              )}
            </div>
          </div>

          {/* Audio Player */}
          {fullCall.audioUrl ? (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
              <p className="mb-2 text-sm font-medium text-neutral-300">
                {t("callRecording")}
              </p>
              <audio controls className="w-full">
                <source src={fullCall.audioUrl} type="audio/mpeg" />
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
          {fullCall.photoUrl && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
              <p className="mb-2 text-sm font-medium text-neutral-300">
                {t("photoOfMissingProduct")}
              </p>
              <img 
                src={fullCall.photoUrl} 
                alt="Missing product" 
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Additional Info */}
          <div className="border-t border-neutral-800 pt-4 text-xs text-neutral-500">
            <p>{t("callId")}: {fullCall.id}</p>
            <p>{t("time")}: {format(new Date(fullCall.time), "PPpp")}</p>
            {fullCall.relatedOrderId && <p>{t("relatedOrder")}: {fullCall.relatedOrderId}</p>}
            {fullCall.relatedSku && <p>{t("relatedSku")}: {fullCall.relatedSku}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

