"use client";

import type { PredictionResult, EvalMode, ExplanationResult } from "@/lib/types";
import { getPropertiesForMode } from "@/lib/constants";
import { PredictionCard } from "./prediction-card";

interface PredictionCardsProps {
  evalMode: EvalMode;
  predictions: PredictionResult[];
  explanations: Record<string, ExplanationResult>;
  isLoading: boolean;
  explainingIds: Set<string>;
  onExplain: (propertyId: string) => void;
}

export function PredictionCards({
  evalMode,
  predictions,
  explanations,
  isLoading,
  explainingIds,
  onExplain,
}: PredictionCardsProps) {
  const properties = getPropertiesForMode(evalMode);

  if (!isLoading && predictions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Predictions
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {properties.map((prop) => {
          const result = predictions.find((p) => p.propertyId === prop.id);
          return (
            <PredictionCard
              key={prop.id}
              property={prop}
              result={result}
              explanation={explanations[prop.id]}
              isLoading={isLoading}
              isExplaining={explainingIds.has(prop.id)}
              onExplain={onExplain}
            />
          );
        })}
      </div>
    </div>
  );
}
