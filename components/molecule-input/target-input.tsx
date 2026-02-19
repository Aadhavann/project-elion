"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TargetInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function TargetInput({ value, onChange }: TargetInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        Target Protein (UniProt ID or amino acid sequence)
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., P00533 or MTEYKLVV..."
        className="min-h-[48px] resize-none font-mono text-xs bg-background"
        spellCheck={false}
      />
    </div>
  );
}
