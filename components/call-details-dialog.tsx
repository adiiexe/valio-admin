"use client";

import { useState, useEffect, useRef } from "react";
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
import { fetchConversation, fetchConversationAudio } from "@/lib/elevenlabs-client";

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
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioBlobUrlRef = useRef<string | null>(null);

  // Fetch full conversation details and audio when dialog opens
  useEffect(() => {
    if (isOpen && call) {
      setIsLoadingTranscript(true);
      setIsLoadingAudio(true);
      
      // Always fetch full conversation to ensure we have the latest transcript
      fetchConversation(call.id)
        .then((fullConversation) => {
          setFullCall(fullConversation);
          
          // Check if audio is available and fetch it
          // Audio is available if: status is completed, or has_audio flag is true, or audioUrl exists
          const shouldFetchAudio = 
            fullConversation.status === "completed" || 
            fullConversation.audioUrl !== undefined;
          
          if (shouldFetchAudio) {
            console.log("[CallDetailsDialog] Fetching audio for conversation:", call.id);
            fetchConversationAudio(call.id)
              .then((blobUrl) => {
                // Revoke previous blob URL if exists
                if (audioBlobUrlRef.current) {
                  URL.revokeObjectURL(audioBlobUrlRef.current);
                }
                audioBlobUrlRef.current = blobUrl;
                setAudioBlobUrl(blobUrl);
                console.log("[CallDetailsDialog] Audio loaded successfully:", blobUrl ? "yes" : "no");
              })
              .catch((error) => {
                console.warn("[CallDetailsDialog] Failed to fetch audio:", error);
              })
              .finally(() => {
                setIsLoadingAudio(false);
              });
          } else {
            console.log("[CallDetailsDialog] Audio not available for this call");
            setIsLoadingAudio(false);
          }
        })
        .catch((error) => {
          console.error("[CallDetailsDialog] Failed to fetch full conversation:", error);
          // If fetch fails, use the call data we have (might have partial transcript)
          setFullCall(call);
          setIsLoadingAudio(false);
        })
        .finally(() => {
          setIsLoadingTranscript(false);
        });
    } else if (call) {
      setFullCall(call);
    }
    
    // Cleanup: revoke blob URL when dialog closes or component unmounts
    return () => {
      if (audioBlobUrlRef.current) {
        URL.revokeObjectURL(audioBlobUrlRef.current);
        audioBlobUrlRef.current = null;
        setAudioBlobUrl(null);
      }
    };
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
      <DialogContent className="border-border/50 bg-background sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] dark:shadow-lg">
        <DialogHeader className="flex-shrink-0 px-8 pt-8">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {t("callConversation")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-normal">
            {fullCall.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6 overflow-y-auto flex-1 px-8 pb-8 pr-4">
          {/* Metadata */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-4 py-2 border border-border/30">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-normal text-muted-foreground">
                {fullCall.direction === "outbound" ? t("outbound") : t("inbound")}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-4 py-2 border border-border/30">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-normal text-muted-foreground uppercase">
                {fullCall.language}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-4 py-2 border border-border/30">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-normal text-muted-foreground">
                {fullCall.status === "in_progress"
                  ? t("inProgress")
                  : `${minutes}m ${seconds}s`}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-4 py-2 border border-border/30">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              {getOutcomeBadge(fullCall.outcome)}
            </div>
          </div>

          {/* Transcript */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              {t("transcript")}
            </h4>
            <div className="space-y-4 rounded-xl border border-border/40 bg-muted/20 p-6">
              {isLoadingTranscript ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="ml-2 text-sm text-muted-foreground">{t("loading")}</span>
                </div>
              ) : fullCall.transcript.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
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
                    className={`max-w-[75%] sm:max-w-[65%] rounded-xl px-5 py-3 ${
                      turn.speaker === "agent"
                        ? "bg-primary/10 text-foreground border border-primary/20"
                        : "bg-muted/40 text-foreground border border-border/30"
                    }`}
                  >
                    <p className="mb-1.5 text-xs font-medium uppercase opacity-60">
                      {turn.speaker === "agent" ? t("aiAgent") : t("customer")}
                    </p>
                    <p className="text-sm font-normal leading-relaxed">{turn.text}</p>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Audio Player */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-6">
            <p className="mb-4 text-sm font-semibold text-foreground">
              {t("callRecording")}
            </p>
            {isLoadingAudio ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="ml-2 text-sm text-muted-foreground">{t("loadingAudio")}</span>
              </div>
            ) : audioBlobUrl ? (
              <audio controls className="w-full" src={audioBlobUrl}>
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className="flex items-center gap-4 py-4">
                <div className="rounded-xl bg-muted/40 p-3 border border-border/30">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("callRecording")}
                  </p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {t("audioNotAvailable")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Photo of Missing Product */}
          {fullCall.photoUrl && (
            <div className="rounded-xl border border-border/40 bg-muted/20 p-6">
              <p className="mb-4 text-sm font-semibold text-foreground">
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
          <div className="border-t border-border/30 pt-6 text-xs font-normal text-muted-foreground space-y-1">
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

