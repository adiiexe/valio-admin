import { NextResponse } from "next/server";
import { ShortagePrediction } from "@/lib/types";
import { updatePrediction } from "@/lib/data-store";

// POST /api/webhooks/prediction
// Accepts: ShortagePrediction (single prediction update)
// Updates or adds a single prediction by ID
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prediction = body as ShortagePrediction;

    // Basic validation
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

    // Update or add the prediction
    updatePrediction(prediction);

    return NextResponse.json({
      success: true,
      message: "Prediction updated/added successfully",
      predictionId: prediction.id,
    });
  } catch (error) {
    console.error("Error processing prediction webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook", details: String(error) },
      { status: 500 }
    );
  }
}

