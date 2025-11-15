import { NextResponse } from "next/server";
import { getPredictions } from "@/lib/data-store";

// GET /api/predictions
// Returns all predictions from the data store
// Data is updated via webhooks from n8n at /api/webhooks/predictions
export async function GET() {
  try {
    const predictions = getPredictions();
    
    // Simulate slight API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}

