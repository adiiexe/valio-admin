import { NextResponse } from "next/server";
import { CallRecord } from "@/lib/types";
import { updateCalls, addCall } from "@/lib/data-store";

// POST /api/webhooks/calls
// Accepts: CallRecord[] (full array replacement) OR CallRecord (single call addition)
// If array: replaces all calls
// If single object: appends to calls array
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's an array (full replacement) or single object (add/update)
    if (Array.isArray(body)) {
      // Full array replacement
      // Basic validation
      for (const call of body) {
        if (
          !call.id ||
          !call.time ||
          !call.customerName ||
          !call.direction ||
          !call.language ||
          !call.status ||
          !call.outcome ||
          !call.summary ||
          typeof call.durationSeconds !== "number" ||
          !Array.isArray(call.transcript)
        ) {
          return NextResponse.json(
            { error: "Invalid call data structure in array" },
            { status: 400 }
          );
        }
      }

      updateCalls(body as CallRecord[]);

      return NextResponse.json({
        success: true,
        message: `Updated ${body.length} calls (full replacement)`,
        count: body.length,
      });
    } else {
      // Single call add/update
      const call = body as CallRecord;

      // Basic validation
      if (
        !call.id ||
        !call.time ||
        !call.customerName ||
        !call.direction ||
        !call.language ||
        !call.status ||
        !call.outcome ||
        !call.summary ||
        typeof call.durationSeconds !== "number" ||
        !Array.isArray(call.transcript)
      ) {
        return NextResponse.json(
          { error: "Invalid call data structure" },
          { status: 400 }
        );
      }

      addCall(call);

      return NextResponse.json({
        success: true,
        message: "Call added/updated successfully",
        callId: call.id,
      });
    }
  } catch (error) {
    console.error("Error processing calls webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook", details: String(error) },
      { status: 500 }
    );
  }
}

