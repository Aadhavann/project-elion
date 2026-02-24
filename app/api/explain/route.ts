import { NextResponse } from "next/server";
import { explainProperty } from "@/lib/txgemma";
import { getCachedExplanation } from "@/lib/prediction-cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { smiles, propertyId, prediction } = body as {
      smiles: string;
      propertyId: string;
      prediction: string;
    };

    if (!smiles || !propertyId || !prediction) {
      return NextResponse.json(
        { error: "Missing required fields: smiles, propertyId, prediction" },
        { status: 400 }
      );
    }

    // Return pre-computed explanation instantly for known example molecules
    const cached = getCachedExplanation(smiles, propertyId);
    if (cached) {
      return NextResponse.json({ explanation: cached });
    }

    const explanation = await explainProperty(smiles, propertyId, prediction);
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Explain API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
