"use client";

import type { EvalMode } from "@/lib/types";
import { EVAL_MODE_LABELS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ModeSelectorProps {
  value: EvalMode;
  onChange: (mode: EvalMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        Prediction Panel
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as EvalMode)}>
        <SelectTrigger className="h-9 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(EVAL_MODE_LABELS) as [EvalMode, string][]).map(
            ([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
