"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import type { PredictionResult, SAREntry, ExplanationResult } from "@/lib/types";
import { getPropertyById } from "@/lib/constants";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  smiles: string;
  predictions: PredictionResult[];
  sarEntries: SAREntry[];
  explanations: Record<string, ExplanationResult>;
}

export function ExportModal({
  open,
  onOpenChange,
  smiles,
  predictions,
  sarEntries,
  explanations,
}: ExportModalProps) {
  const [exportJson, setExportJson] = useState(true);
  const [exportCsv, setExportCsv] = useState(true);
  const [exportTxt, setExportTxt] = useState(false);

  const handleDownload = () => {
    if (exportJson) downloadJSON();
    if (exportCsv) downloadCSV();
    if (exportTxt) downloadTXT();
    onOpenChange(false);
  };

  const downloadJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      smiles,
      predictions: predictions.map((p) => ({
        ...p,
        propertyName: getPropertyById(p.propertyId)?.name,
      })),
      sarEntries: sarEntries.filter((e) => e.selected),
      explanations: Object.values(explanations),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    triggerDownload(blob, "txgemma-report.json");
  };

  const downloadCSV = () => {
    const headers = ["SMILES", "Property", "Value", "Confidence", "Status"];
    const rows = predictions.map((p) => [
      smiles,
      getPropertyById(p.propertyId)?.name || p.propertyId,
      p.value,
      p.confidence?.toString() || "",
      p.status,
    ]);

    // Add SAR entries
    sarEntries
      .filter((e) => e.selected)
      .forEach((entry) => {
        entry.predictions.forEach((p) => {
          rows.push([
            entry.smiles,
            getPropertyById(p.propertyId)?.name || p.propertyId,
            p.value,
            p.confidence?.toString() || "",
            p.status,
          ]);
        });
      });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    triggerDownload(blob, "txgemma-report.csv");
  };

  const downloadTXT = () => {
    let content = `Your Report\n${"=".repeat(40)}\n`;
    content += `Date: ${new Date().toISOString()}\n`;
    content += `SMILES: ${smiles}\n\n`;

    content += `Predictions\n${"-".repeat(30)}\n`;
    predictions.forEach((p) => {
      const prop = getPropertyById(p.propertyId);
      content += `${prop?.name}: ${p.value} (${p.status})\n`;
    });

    if (Object.keys(explanations).length > 0) {
      content += `\nExplanations\n${"-".repeat(30)}\n`;
      Object.values(explanations).forEach((exp) => {
        const prop = getPropertyById(exp.propertyId);
        content += `\n[${prop?.name}]\n${exp.explanation}\n`;
      });
    }

    const blob = new Blob([content], { type: "text/plain" });
    triggerDownload(blob, "txgemma-report.txt");
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Choose which formats to export your results in.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="export-json"
              checked={exportJson}
              onCheckedChange={(c) => setExportJson(c === true)}
            />
            <Label htmlFor="export-json" className="text-sm">
              JSON (full structured data)
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="export-csv"
              checked={exportCsv}
              onCheckedChange={(c) => setExportCsv(c === true)}
            />
            <Label htmlFor="export-csv" className="text-sm">
              CSV (tabular, for spreadsheets)
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="export-txt"
              checked={exportTxt}
              onCheckedChange={(c) => setExportTxt(c === true)}
            />
            <Label htmlFor="export-txt" className="text-sm">
              TXT (plain text report with explanations)
            </Label>
          </div>

          <div className="rounded-md bg-secondary p-3 text-xs text-muted-foreground">
            <p>
              <strong>{predictions.length}</strong> predictions
              {sarEntries.filter((e) => e.selected).length > 0 && (
                <>, <strong>{sarEntries.filter((e) => e.selected).length}</strong> SAR entries</>
              )}
              {Object.keys(explanations).length > 0 && (
                <>, <strong>{Object.keys(explanations).length}</strong> explanations</>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!exportJson && !exportCsv && !exportTxt}
          >
            <Download className="mr-1.5 size-3.5" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
