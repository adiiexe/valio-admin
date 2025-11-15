import { NextResponse } from "next/server";
import { getCalls } from "@/lib/data-store";

// GET /api/calls
// Returns all calls from the data store
// Data is updated via webhooks from n8n at /api/webhooks/calls
export async function GET() {
  try {
    const calls = getCalls();
    
    // Simulate slight API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    return NextResponse.json(calls);
  } catch (error) {
    console.error("Error fetching calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}

