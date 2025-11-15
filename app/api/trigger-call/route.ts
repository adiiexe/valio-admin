import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shortageId } = body;

    console.log(`[Trigger Call API] Received request for shortage ID: ${shortageId}`);

    // Simulate API processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // TODO: Trigger n8n webhook to start ElevenLabs call
    // const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     shortageId,
    //     action: 'trigger_call'
    //   })
    // });

    console.log(`[Trigger Call API] Call triggered successfully for shortage: ${shortageId}`);

    return NextResponse.json({ 
      success: true,
      message: `AI call triggered for shortage ${shortageId}`
    });
  } catch (error) {
    console.error("[Trigger Call API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to trigger call" },
      { status: 500 }
    );
  }
}

