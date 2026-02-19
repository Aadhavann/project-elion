import { NextResponse } from "next/server";
import { predictProperty } from "@/lib/txgemma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { smiles, properties, target } = body as {
      smiles: string;
      properties: string[];
      target?: string;
    };

    if (!smiles || !properties || properties.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: smiles, properties" },
        { status: 400 }
      );
    }

    // Run predictions in parallel for all requested properties
    const results = await Promise.allSettled(
      properties.map((propId) => predictProperty(smiles, propId, target))
    );

    const predictions = results.map((result, i) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      return {
        propertyId: properties[i],
        value: "Error",
        status: "neutral" as const,
        error: result.reason?.message || "Prediction failed",
      };
    });

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Predict API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
