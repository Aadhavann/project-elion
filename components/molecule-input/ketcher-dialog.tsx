"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { molToSmiles } from "@/lib/rdkit-loader";

interface KetcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (smiles: string) => void;
}

const KETCHER_URL = "/ketcher/index.html";

export function KetcherDialog({ open, onOpenChange, onApply }: KetcherDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleApply = useCallback(async () => {
    setError(null);
    setIsConverting(true);

    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) {
        throw new Error("Ketcher editor not loaded");
      }

      // Access Ketcher API from the iframe (same-origin required)
      let ketcher;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ketcher = (iframe.contentWindow as any).ketcher;
      } catch {
        throw new Error(
          "Cannot access Ketcher editor. Ensure it is served from the same origin."
        );
      }
      if (!ketcher) {
        throw new Error(
          "Ketcher editor is still initializing. Please wait a moment and try again."
        );
      }

      // Get MOL file (reliable) instead of SMILES (unreliable in standalone mode)
      let molfile: string;
      if (typeof ketcher.getMolfile === "function") {
        molfile = await ketcher.getMolfile();
      } else if (typeof ketcher.getKet === "function") {
        // Fallback: try to get SMILES directly
        const smiles = await ketcher.getSmiles();
        if (smiles && smiles.trim()) {
          onApply(smiles.trim());
          onOpenChange(false);
          return;
        }
        throw new Error("Could not extract molecule data from Ketcher");
      } else {
        throw new Error("Ketcher API methods not available");
      }

      if (!molfile || molfile.trim().length < 10) {
        throw new Error("No molecule drawn. Please draw a structure first.");
      }

      // Convert MOL to SMILES using RDKit.js WASM
      const smiles = await molToSmiles(molfile);
      if (!smiles) {
        throw new Error("Conversion produced empty SMILES");
      }

      onApply(smiles);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to extract molecule"
      );
    } finally {
      setIsConverting(false);
    }
  }, [onApply, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Molecule Sketch Editor</DialogTitle>
          <DialogDescription>
            Draw a molecule using the Ketcher editor below. Click Apply to convert to SMILES.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 mx-6">
          {!iframeLoaded && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading Ketcher editor...
              </p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={KETCHER_URL}
            className="size-full rounded-lg border border-border"
            title="Ketcher Molecule Editor"
            onLoad={() => setIframeLoaded(true)}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>

        {error && (
          <div className="mx-6 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2">
            <AlertTriangle className="size-4 text-destructive" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <DialogFooter className="px-6 pb-6 pt-2">
          <Badge variant="outline" className="mr-auto text-[10px]">
            MOL → SMILES via RDKit.js
          </Badge>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={isConverting || !iframeLoaded}
          >
            {isConverting && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
