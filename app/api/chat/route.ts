import { NextResponse } from "next/server";
import { chatWithContext, parseChatResponse } from "@/lib/txgemma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, currentSmiles, currentPredictions } = body as {
      messages: Array<{ role: string; content: string }>;
      currentSmiles?: string;
      currentPredictions?: Array<{ propertyId: string; value: string; status: string }>;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: messages" },
        { status: 400 }
      );
    }

    const raw = await chatWithContext(messages, currentSmiles, currentPredictions);
    const parsed = parseChatResponse(raw);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
