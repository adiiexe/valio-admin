import { NextResponse } from "next/server";

// This endpoint proxies the n8n webhook from the server side so the client
// can call it without CORS issues.
// Defaults to your public tunnel; override with OUTBOUND_WEBHOOK_URL in .env.local if needed.
const OUTBOUND_WEBHOOK_URL =
  process.env.OUTBOUND_WEBHOOK_URL ||
  "https://n8n.veistera.com/webhook/fa5d1493-d0fa-4483-bf10-f04187e5c963";

export async function GET() {
  try {
    const res = await fetch(OUTBOUND_WEBHOOK_URL, {
      // Always fetch fresh data from n8n
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        "[OutboundShortages] Webhook returned non-OK status:",
        res.status,
        res.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch outbound shortages" },
        { status: res.status }
      );
    }

    // Some n8n webhooks can return an empty body; handle that gracefully
    const text = await res.text();
    console.log("[OutboundShortages] Raw webhook response text:", text);
    if (!text) {
      // Treat empty body as "no outbound shortages" instead of throwing
      return NextResponse.json([]);
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (parseError: any) {
      console.error(
        "[OutboundShortages] Failed to parse webhook JSON:",
        parseError?.message || parseError,
        "raw response:",
        text
      );
      return NextResponse.json(
        { error: "Invalid JSON from outbound webhook" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(
      "[OutboundShortages] Error calling outbound webhook:",
      error?.message || error
    );
    return NextResponse.json(
      { error: "Failed to fetch outbound shortages" },
      { status: 500 }
    );
  }
}


