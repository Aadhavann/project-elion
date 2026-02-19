"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SCAFFOLDS, R_GROUPS } from "@/lib/constants";
import { generateLibrary } from "@/lib/smiles-utils";
import { FlaskConical } from "lucide-react";

interface ScaffoldSelectorProps {
  onGenerate: (
    library: Array<{
      smiles: string;
      rGroups: Record<string, string>;
      scaffoldName: string;
    }>
  ) => void;
}

export function ScaffoldSelector({ onGenerate }: ScaffoldSelectorProps) {
  const [scaffoldIdx, setScaffoldIdx] = useState<number>(0);
  const [rGroupSelections, setRGroupSelections] = useState<Record<string, string[]>>({});

  const scaffold = SCAFFOLDS[scaffoldIdx];

  const handleScaffoldChange = (val: string) => {
    const idx = parseInt(val, 10);
    setScaffoldIdx(idx);
    setRGroupSelections({});
  };

  const toggleRGroup = (rKey: string, rSmiles: string) => {
    setRGroupSelections((prev) => {
      const current = prev[rKey] || [];
      if (current.includes(rSmiles)) {
        return { ...prev, [rKey]: current.filter((s) => s !== rSmiles) };
      }
      return { ...prev, [rKey]: [...current, rSmiles] };
    });
  };

  const handleGenerate = () => {
    // Default to [H] if no selection for an R-group
    const rGroupOptions: Record<string, string[]> = {};
    for (let i = 1; i <= scaffold.rCount; i++) {
      const key = `R${i}`;
      const selected = rGroupSelections[key];
      rGroupOptions[key] = selected && selected.length > 0 ? selected : ["[H]"];
    }

    const library = generateLibrary(scaffold.smiles, rGroupOptions);
    onGenerate(
      library.map((entry) => ({
        ...entry,
        scaffoldName: scaffold.name,
      }))
    );
  };

  const totalCombinations = (() => {
    let count = 1;
    for (let i = 1; i <= scaffold.rCount; i++) {
      const key = `R${i}`;
      const selected = rGroupSelections[key];
      count *= selected && selected.length > 0 ? selected.length : 1;
    }
    return count;
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Core Scaffold
        </Label>
        <Select
          value={scaffoldIdx.toString()}
          onValueChange={handleScaffoldChange}
        >
          <SelectTrigger className="h-9 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCAFFOLDS.map((s, i) => (
              <SelectItem key={s.name} value={i.toString()}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <code className="mt-1 rounded-sm bg-secondary px-2 py-1 text-[11px] font-mono text-muted-foreground">
          {scaffold.smiles}
        </code>
      </div>

      {Array.from({ length: scaffold.rCount }, (_, i) => {
        const key = `R${i + 1}`;
        const selected = rGroupSelections[key] || [];
        return (
          <div key={key} className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {key} Substituents
            </Label>
            <div className="flex flex-wrap gap-1">
              {R_GROUPS.map((rg) => (
                <button
                  key={rg.smiles}
                  onClick={() => toggleRGroup(key, rg.smiles)}
                  className={`rounded-sm px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                    selected.includes(rg.smiles)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {rg.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} size="sm" className="gap-1.5">
          <FlaskConical className="size-3.5" />
          Generate Library
        </Button>
        <Badge variant="outline" className="text-[10px]">
          {totalCombinations} combination{totalCombinations !== 1 ? "s" : ""}
        </Badge>
      </div>
    </div>
  );
}
