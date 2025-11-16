import { NextResponse } from "next/server";

// This endpoint proxies the n8n webhook that returns observed shortages
// from inbound calls, so the client can call it without CORS issues.
// Defaults to your public tunnel; override with OBSERVED_WEBHOOK_URL in .env.local if needed.
const OBSERVED_WEBHOOK_URL =
  process.env.OBSERVED_WEBHOOK_URL ||
  "https://n8n.veistera.com/webhook/24415505-ba0d-46d7-956d-f07be4e28124";

export async function GET() {
  try {
    const res = await fetch(OBSERVED_WEBHOOK_URL, {
      // Always fetch fresh data from n8n
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        "[ObservedShortages] Webhook returned non-OK status:",
        res.status,
        res.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch observed shortages" },
        { status: res.status }
      );
    }

    // Some n8n webhooks can return an empty body; handle that gracefully
    const text = await res.text();
    console.log("[ObservedShortages] Raw webhook response text:", text);
    if (!text) {
      // Treat empty body as "no observed shortages" instead of throwing
      return NextResponse.json([]);
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (parseError: any) {
      console.error(
        "[ObservedShortages] Failed to parse webhook JSON:",
        parseError?.message || parseError,
        "raw response:",
        text
      );
      return NextResponse.json(
        { error: "Invalid JSON from observed shortages webhook" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(
      "[ObservedShortages] Error calling observed shortages webhook:",
      error?.message || error
    );
    return NextResponse.json(
      { error: "Failed to fetch observed shortages" },
      { status: 500 }
    );
  }
}


