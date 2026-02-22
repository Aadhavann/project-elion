"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, MessageSquare, Loader2 } from "lucide-react";
import type { PredictionResult, PropertyDefinition, ExplanationResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface PredictionCardProps {
  property: PropertyDefinition;
  result?: PredictionResult;
  explanation?: ExplanationResult;
  isLoading?: boolean;
  isExplaining?: boolean;
  onExplain: (propertyId: string) => void;
}

export function PredictionCard({
  property,
  result,
  explanation,
  isLoading,
  isExplaining,
  onExplain,
}: PredictionCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const statusTopBorder = {
    positive: "border-t-[3px] border-t-success",
    negative: "border-t-[3px] border-t-destructive",
    neutral:  "border-t-[3px] border-t-warning",
  };

  const statusBg = {
    positive: "bg-success/5",
    negative: "bg-destructive/5",
    neutral:  "bg-warning/5",
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden rounded-xl p-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card className={cn("overflow-hidden rounded-xl p-0", statusTopBorder[result.status])}>
      <div className={cn("p-4", statusBg[result.status])}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">
              {property.shortName}
            </p>
            <p className="font-mono text-lg font-semibold text-foreground leading-tight">
              {result.value}
            </p>
          </div>
          {result.confidence !== undefined && (
            <Badge
              variant="outline"
              className="shrink-0 text-[10px] font-mono"
            >
              {(result.confidence * 100).toFixed(0)}%
            </Badge>
          )}
        </div>

        <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">
          {property.description}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (!explanation) {
                onExplain(property.id);
              }
              setShowExplanation(!showExplanation);
            }}
            disabled={isExplaining}
          >
            {isExplaining ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <MessageSquare className="size-3" />
            )}
            Ask Why
            {showExplanation ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </Button>
        </div>

        {showExplanation && explanation && (
          <div className="mt-3 rounded-md border-l-2 border-primary bg-primary/5 p-3">
            <div className="prose prose-xs max-w-none text-xs leading-relaxed text-foreground/90 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mt-1 [&_ul]:space-y-0.5 [&_ul]:pl-4 [&_li]:list-disc [&_p]:m-0">
              <ReactMarkdown>{explanation.explanation}</ReactMarkdown>
            </div>
          </div>
        )}
        {showExplanation && isExplaining && (
          <div className="mt-3 rounded-md border-l-2 border-primary bg-primary/5 p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="size-3 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                TxGemma is analyzing the molecular structure...
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
