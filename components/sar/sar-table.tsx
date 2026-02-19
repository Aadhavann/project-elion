"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { SAREntry, PredictionResult } from "@/lib/types";
import { getPropertyById } from "@/lib/constants";
import { MoleculeRenderer } from "@/components/molecule-viewer/molecule-renderer";

interface SARTableProps {
  entries: SAREntry[];
  onToggleEntry: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
}

type SortKey = "smiles" | string;

export function SARTable({ entries, onToggleEntry, onSelectAll }: SARTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("smiles");
  const [sortAsc, setSortAsc] = useState(true);

  if (entries.length === 0) return null;

  // Collect unique property IDs from all entries
  const propertyIds = new Set<string>();
  entries.forEach((e) =>
    e.predictions.forEach((p) => propertyIds.add(p.propertyId))
  );
  const propColumns = Array.from(propertyIds);

  const allSelected = entries.every((e) => e.selected);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const getPredValue = (entry: SAREntry, propId: string): number | string => {
    const pred = entry.predictions.find((p) => p.propertyId === propId);
    if (!pred) return "";
    return pred.numericValue ?? pred.value;
  };

  const sorted = [...entries].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    if (sortKey === "smiles") {
      aVal = a.smiles;
      bVal = b.smiles;
    } else {
      aVal = getPredValue(a, sortKey);
      bVal = getPredValue(b, sortKey);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    const strA = String(aVal);
    const strB = String(bVal);
    return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  const getStatusColor = (pred: PredictionResult) => {
    if (pred.status === "positive") return "text-success";
    if (pred.status === "negative") return "text-destructive";
    return "text-foreground";
  };

  const selectedCount = entries.filter((e) => e.selected).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          SAR Comparison
        </h3>
        <Badge variant="outline" className="text-[10px]">
          {selectedCount}/{entries.length} selected
        </Badge>
      </div>

      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) =>
                    onSelectAll(checked === true)
                  }
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-8 text-center">#</TableHead>
              <TableHead className="w-[100px]">Structure</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-1 text-xs"
                  onClick={() => handleSort("smiles")}
                >
                  SMILES
                  <ArrowUpDown className="size-3" />
                </Button>
              </TableHead>
              {propColumns.map((propId) => {
                const prop = getPropertyById(propId);
                return (
                  <TableHead key={propId}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 px-1 text-xs"
                      onClick={() => handleSort(propId)}
                    >
                      {prop?.shortName || propId}
                      <ArrowUpDown className="size-3" />
                    </Button>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((entry, idx) => (
              <TableRow
                key={entry.id}
                className={entry.selected ? "bg-primary/5" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={entry.selected}
                    onCheckedChange={() => onToggleEntry(entry.id)}
                    aria-label={`Select entry ${idx + 1}`}
                  />
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  <MoleculeRenderer
                    smiles={entry.smiles}
                    width={80}
                    height={60}
                    className="[&_div]:border-0 [&_div]:rounded-none [&_div]:bg-transparent"
                  />
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <code className="block truncate text-[11px] font-mono text-muted-foreground">
                    {entry.smiles}
                  </code>
                  {entry.rGroups && (
                    <div className="mt-0.5 flex flex-wrap gap-0.5">
                      {Object.entries(entry.rGroups).map(([k, v]) => (
                        <Badge
                          key={k}
                          variant="outline"
                          className="text-[9px] px-1 py-0"
                        >
                          {k}={v === "[H]" ? "H" : v}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                {propColumns.map((propId) => {
                  const pred = entry.predictions.find(
                    (p) => p.propertyId === propId
                  );
                  if (!pred)
                    return (
                      <TableCell key={propId} className="text-xs text-muted-foreground">
                        -
                      </TableCell>
                    );
                  return (
                    <TableCell key={propId}>
                      <span
                        className={`text-xs font-mono font-medium ${getStatusColor(pred)}`}
                      >
                        {pred.value}
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
