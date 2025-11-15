import { NextResponse } from "next/server";
import { ShortagePrediction } from "@/lib/types";
import { updatePredictions } from "@/lib/data-store";

// POST /api/webhooks/predictions
// Accepts: ShortagePrediction[] (full array replacement)
// Updates entire predictions array
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate that body is an array
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Expected an array of predictions" },
        { status: 400 }
      );
    }

    // Basic validation - check that each item has required fields
    for (const prediction of body) {
      if (
        !prediction.id ||
        !prediction.sku ||
        !prediction.productName ||
        !prediction.customerName ||
        typeof prediction.riskScore !== "number" ||
        !prediction.status ||
        !prediction.orderId ||
        !Array.isArray(prediction.suggestedReplacements)
      ) {
        return NextResponse.json(
          { error: "Invalid prediction data structure" },
          { status: 400 }
        );
      }
    }

    // Update the data store
    updatePredictions(body as ShortagePrediction[]);

    return NextResponse.json({
      success: true,
      message: `Updated ${body.length} predictions`,
      count: body.length,
    });
  } catch (error) {
    console.error("Error processing predictions webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook", details: String(error) },
      { status: 500 }
    );
  }
}

