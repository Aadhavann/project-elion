"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { validateSmiles } from "@/lib/smiles-utils";
import { EXAMPLE_MOLECULES } from "@/lib/constants";
import { CheckCircle2, XCircle, Beaker } from "lucide-react";

interface SmilesInputProps {
  value: string;
  onChange: (smiles: string) => void;
  onOpenKetcher: () => void;
}

export function SmilesInput({ value, onChange, onOpenKetcher }: SmilesInputProps) {
  const [touched, setTouched] = useState(false);
  const validation = value.trim() ? validateSmiles(value) : null;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTouched(true);
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">
          SMILES Input
        </Label>
        <div className="flex items-center gap-1.5">
          {touched && validation && (
            validation.valid ? (
              <Badge variant="outline" className="gap-1 border-success/30 bg-success/10 text-success text-[10px]">
                <CheckCircle2 className="size-3" />
                Valid
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 border-destructive/30 bg-destructive/10 text-destructive text-[10px]">
                <XCircle className="size-3" />
                {validation.error}
              </Badge>
            )
          )}
        </div>
      </div>

      <Textarea
        value={value}
        onChange={handleChange}
        placeholder="Paste SMILES string, e.g. CC(=O)Oc1ccccc1C(=O)O"
        className={`min-h-[72px] resize-none font-mono text-sm bg-background ${
          touched && validation && !validation.valid
            ? "border-destructive/50 focus-visible:ring-destructive/30"
            : touched && validation?.valid
              ? "border-success/50 focus-visible:ring-success/30"
              : ""
        }`}
        spellCheck={false}
      />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenKetcher}
          className="gap-1.5 text-xs"
        >
          <Beaker className="size-3.5" />
          Sketch Editor
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-muted-foreground">Try:</span>
          {EXAMPLE_MOLECULES.slice(0, 4).map((mol) => (
            <button
              key={mol.name}
              onClick={() => {
                setTouched(true);
                onChange(mol.smiles);
              }}
              className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground transition-colors hover:bg-accent"
            >
              {mol.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
