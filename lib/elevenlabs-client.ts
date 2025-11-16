import { CallRecord, TranscriptTurn } from "./types";

// ElevenLabs API types based on their documentation
type ElevenLabsConversationListItem = {
  agent_id: string;
  conversation_id: string;
  status: "processing" | "done" | "failed" | "initiated";
  start_time_unix_secs: number;
  call_duration_secs: number;
  message_count: number;
  call_successful?: string;
  transcript_summary?: string | null;
  call_summary_title?: string | null;
  direction?: "inbound" | "outbound" | null;
  agent_name?: string;
  [key: string]: any;
};

type ElevenLabsConversationFull = {
  agent_id: string;
  conversation_id: string;
  status: "processing" | "done" | "failed" | "initiated";
  transcript: Array<{
    role: "user" | "agent";
    message: string;
    time_in_call_secs: number;
    [key: string]: any;
  }>;
  metadata: {
    start_time_unix_secs: number;
    call_duration_secs: number;
    main_language?: string;
    phone_call?: {
      direction: "inbound" | "outbound";
      external_number?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  analysis?: {
    call_summary_title?: string | null;
    transcript_summary?: string | null;
    call_successful?: string;
    [key: string]: any;
  };
  has_audio?: boolean;
  has_user_audio?: boolean;
  has_response_audio?: boolean;
  [key: string]: any;
};

type ElevenLabsConversation = ElevenLabsConversationListItem | ElevenLabsConversationFull;

type ElevenLabsConversationsResponse = {
  conversations?: ElevenLabsConversationListItem[];
  next_cursor?: string;
  has_more?: boolean;
  [key: string]: any;
};

const ELEVENLABS_API_BASE = process.env.NEXT_PUBLIC_ELEVENLABS_API_BASE_URL || "https://api.elevenlabs.io/v1";
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

/**
 * Fetch all conversations from ElevenLabs API
 */
export async function fetchConversations(): Promise<CallRecord[]> {
  if (!ELEVENLABS_API_KEY) {
    console.warn("[ElevenLabs] API key not found, falling back to empty array");
    return [];
  }

  try {
    // Try the convai conversations endpoint first
    const response = await fetch(`${ELEVENLABS_API_BASE}/convai/conversations`, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid ElevenLabs API key");
      }
      if (response.status === 429) {
        throw new Error("ElevenLabs API rate limit exceeded");
      }
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data: ElevenLabsConversationsResponse | ElevenLabsConversationListItem[] = await response.json();
    
    // Handle different response formats
    const conversations: ElevenLabsConversationListItem[] = Array.isArray(data)
      ? data
      : data.conversations || [];

    // For list endpoint, we only have summary data, need to fetch full details for each
    // For now, map what we have and fetch full details on-demand when viewing
    // Sort by most recent first (newest calls at the top)
    const mappedCalls = conversations.map(mapElevenLabsListItemToCallRecord);
    return mappedCalls.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA; // Most recent first
    });
  } catch (error) {
    console.error("[ElevenLabs] Failed to fetch conversations:", error);
    throw error;
  }
}

/**
 * Fetch conversation audio as a blob URL (for use in audio elements)
 * This function fetches the audio with authentication and creates a blob URL
 */
export async function fetchConversationAudio(conversationId: string): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) {
    console.warn("[ElevenLabs] API key not found, cannot fetch audio");
    return null;
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_BASE}/convai/conversations/${conversationId}/audio`, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[ElevenLabs] Audio not available for conversation ${conversationId}`);
        return null;
      }
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    // Fetch audio as blob
    const audioBlob = await response.blob();
    
    // Create object URL from blob (this can be used in audio elements)
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error(`[ElevenLabs] Failed to fetch audio for conversation ${conversationId}:`, error);
    return null;
  }
}

/**
 * Fetch a single conversation by ID
 */
export async function fetchConversation(conversationId: string): Promise<CallRecord> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ElevenLabs API key not found");
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_BASE}/convai/conversations/${conversationId}`, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid ElevenLabs API key");
      }
      if (response.status === 404) {
        throw new Error(`Conversation ${conversationId} not found`);
      }
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const conversation: ElevenLabsConversationFull = await response.json();
    return mapElevenLabsFullToCallRecord(conversation);
  } catch (error) {
    console.error(`[ElevenLabs] Failed to fetch conversation ${conversationId}:`, error);
    throw error;
  }
}

/**
 * Map ElevenLabs conversation list item to CallRecord type (for list endpoint)
 */
function mapElevenLabsListItemToCallRecord(conv: ElevenLabsConversationListItem): CallRecord {
  // List endpoint doesn't include full transcript, so create empty array
  // Full transcript will be fetched when viewing the conversation
  const transcript: TranscriptTurn[] = [];

  // Map status
  // Check if transcript exists (indicates call is done)
  const hasTranscript = 
    (conv.transcript_summary && conv.transcript_summary.length > 0) ||
    conv.message_count > 0;
  
  let status: "completed" | "failed" | "in_progress" = "completed";
  // First check if actively processing - always mark as in_progress
  if (conv.status === "processing" || conv.status === "initiated") {
    status = "in_progress";
  } else if (conv.status === "done" || hasTranscript) {
    // Mark as completed if API says "done" OR transcript exists
    status = "completed";
  } else if (conv.status === "failed") {
    status = "failed";
  }

  // Extract customer name - use phone number or default
  const customerName = "Customer"; // Will be enhanced when fetching full conversation

  // Determine outcome from call summary or status
  let outcome: "replacement_accepted" | "credits_only" | "incomplete" = "incomplete";
  if (conv.status === "done" && conv.call_successful === "success") {
    const summaryText = (conv.transcript_summary || conv.call_summary_title || "").toLowerCase();
    if (summaryText.includes("refund") || summaryText.includes("credit")) {
      outcome = "credits_only";
    } else {
      outcome = "replacement_accepted"; // Default for successful calls
    }
  } else if (conv.status === "failed" || conv.status === "processing" || conv.status === "initiated") {
    outcome = "incomplete";
  }

  // Use summary from API response
  const summary = conv.call_summary_title || conv.transcript_summary || "Call conversation";

  // Extract related order ID and SKU - not available in list endpoint
  const relatedOrderId = null;
  const relatedSku = null;

  // Construct audio URL - assume available if call was successful
  let audioUrl: string | undefined;
  if (conv.status === "done" && conv.call_successful === "success") {
    audioUrl = `${ELEVENLABS_API_BASE}/convai/conversations/${conv.conversation_id}/audio`;
  }

  // Convert Unix timestamp to ISO string
  const time = conv.start_time_unix_secs
    ? new Date(conv.start_time_unix_secs * 1000).toISOString()
    : new Date().toISOString();

  // Determine language - not available in list endpoint, default to fi
  const language = "fi";

  // Determine direction
  const direction: "inbound" | "outbound" = conv.direction || "outbound";

  return {
    id: conv.conversation_id,
    time,
    customerName,
    direction,
    language,
    status,
    outcome,
    relatedOrderId,
    relatedSku,
    summary,
    transcript,
    durationSeconds: conv.metadata?.call_duration_secs || 0,
    audioUrl,
  };
}

/**
 * Determine call outcome from transcript content
 */
function determineOutcome(
  transcript: TranscriptTurn[],
  status: string
): "accepted" | "credits" | "incomplete" {
  if (status === "failed" || status === "processing" || status === "initiated") {
    return "incomplete";
  }

  const transcriptText = transcript.map((t) => t.text.toLowerCase()).join(" ");

  // Check for credits/refund keywords
  if (
    transcriptText.includes("krediitti") ||
    transcriptText.includes("credit") ||
    transcriptText.includes("raha") ||
    transcriptText.includes("refund")
  ) {
    return "credits";
  }

  // Check for acceptance keywords
  if (
    transcriptText.includes("sopii") ||
    transcriptText.includes("käy") ||
    transcriptText.includes("hyväksyn") ||
    transcriptText.includes("ok") ||
    transcriptText.includes("yes") ||
    transcriptText.includes("accept")
  ) {
    return "accepted";
  }

  // Default to incomplete if transcript is very short
  if (transcript.length <= 1) {
    return "incomplete";
  }

  // Default to accepted if conversation completed
  return "accepted";
}

/**
 * Generate summary from transcript
 */
function generateSummary(transcript: TranscriptTurn[], metadata: any): string {
  if (metadata?.summary) {
    return metadata.summary;
  }

  // Try to extract key information from transcript
  const agentMessages = transcript.filter((t) => t.speaker === "agent");
  if (agentMessages.length > 0) {
    const firstAgentMessage = agentMessages[0].text;
    // Extract product name or key info from first message
    if (firstAgentMessage.length > 100) {
      return firstAgentMessage.substring(0, 100) + "...";
    }
    return firstAgentMessage;
  }

  return "Call conversation";
}

/**
 * Map full ElevenLabs conversation response to CallRecord type (for single conversation endpoint)
 */
function mapElevenLabsFullToCallRecord(conv: ElevenLabsConversationFull): CallRecord {
  // Map transcript
  const transcript: TranscriptTurn[] = (conv.transcript || []).map((turn) => ({
    speaker: turn.role === "user" ? "customer" : "agent",
    text: turn.message || "",
  }));

  // Map status
  // Check if transcript exists (indicates call is done)
  const hasTranscript = 
    (conv.transcript && conv.transcript.length > 0) ||
    (conv.analysis?.transcript_summary && conv.analysis.transcript_summary.length > 0);
  
  let status: "completed" | "failed" | "in_progress" = "completed";
  // First check if actively processing - always mark as in_progress
  if (conv.status === "processing" || conv.status === "initiated") {
    status = "in_progress";
  } else if (conv.status === "done" || hasTranscript) {
    // Mark as completed if API says "done" OR transcript exists
    status = "completed";
  } else if (conv.status === "failed") {
    status = "failed";
  }

  // Extract customer name from phone number or metadata
  let customerName = "Customer";
  if (conv.metadata?.phone_call?.external_number) {
    customerName = conv.metadata.phone_call.external_number;
  }

  // Determine outcome from transcript content or analysis
  let outcome: "replacement_accepted" | "replacement_declined" | "credits_only" | "incomplete" = "incomplete";
  if (conv.analysis?.call_successful === "success") {
    const determinedOutcome = determineOutcome(transcript, conv.status);
    // Map the outcome from determineOutcome to the expected format
    if (determinedOutcome === "accepted") {
      outcome = "replacement_accepted";
    } else if (determinedOutcome === "credits") {
      outcome = "credits_only";
    } else {
      outcome = "incomplete";
    }
  }

  // Use summary from API response
  const summary = conv.analysis?.call_summary_title || conv.analysis?.transcript_summary || generateSummary(transcript, conv.metadata);

  // Extract related order ID and SKU from metadata (if available)
  const relatedOrderId = conv.metadata?.order_id || conv.metadata?.orderId || null;
  const relatedSku = conv.metadata?.sku || conv.metadata?.product_sku || null;

  // Construct audio URL if available
  let audioUrl: string | undefined;
  if (conv.has_audio || conv.has_user_audio || conv.has_response_audio) {
    audioUrl = `${ELEVENLABS_API_BASE}/convai/conversations/${conv.conversation_id}/audio`;
  }

  // Convert Unix timestamp to ISO string
  const time = conv.metadata?.start_time_unix_secs
    ? new Date(conv.metadata.start_time_unix_secs * 1000).toISOString()
    : new Date().toISOString();

  // Determine language from metadata
  const language = conv.metadata?.main_language || "fi";

  // Determine direction from phone call metadata
  const direction: "inbound" | "outbound" = conv.metadata?.phone_call?.direction || conv.metadata?.direction || "outbound";

  return {
    id: conv.conversation_id,
    time,
    customerName,
    direction,
    language,
    status,
    outcome,
    relatedOrderId,
    relatedSku,
    summary,
    transcript,
    durationSeconds: conv.metadata?.call_duration_secs || 0,
    audioUrl,
  };
}

