export type ReplacementSuggestion = {
  sku: string;
  productName: string;
  reason: string;
  tags: string[];
};

export type ShortagePrediction = {
  id: string;
  sku: string;
  productName: string;
  customerName: string;
  riskScore: number; // 0-1
  status: "pending" | "resolved";
  orderId: string;
  suggestedReplacements: ReplacementSuggestion[];
};

export type TranscriptTurn = {
  speaker: "agent" | "customer";
  text: string;
};

export type CallRecord = {
  id: string;
  time: string; // ISO
  customerName: string;
  direction: "inbound" | "outbound";
  language: string;
  status: "completed" | "failed" | "in_progress";
  outcome: "replacement_accepted" | "replacement_declined" | "credits_only" | "incomplete" | "no_answer" | "accepted" | "credits"; // Support both old and new formats
  relatedOrderId: string | null;
  relatedSku: string | null;
  summary: string;
  transcript: TranscriptTurn[];
  durationSeconds: number;
  audioUrl?: string; // From ElevenLabs via n8n
  photoUrl?: string; // Photo of missing product from n8n
};

