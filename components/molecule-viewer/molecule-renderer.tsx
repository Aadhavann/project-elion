"use client";

import { useRef, useEffect, useState } from "react";

interface MoleculeRendererProps {
  smiles: string;
  width?: number;
  height?: number;
  className?: string;
}

export function MoleculeRenderer({
  smiles,
  width = 280,
  height = 220,
  className = "",
}: MoleculeRendererProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!smiles || !svgRef.current) return;

    let cancelled = false;

    async function render() {
      try {
        // Dynamically import smiles-drawer
        const SmilesDrawer = await import("smiles-drawer");
        if (cancelled) return;

        setError(null);
        const container = svgRef.current;
        if (!container) return;

        // Clear previous render
        container.innerHTML = "";

        // Create SVG element
        const svgElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svgElement.setAttribute("width", width.toString());
        svgElement.setAttribute("height", height.toString());
        svgElement.id = `mol-svg-${Date.now()}`;
        container.appendChild(svgElement);

        const drawer = new SmilesDrawer.SvgDrawer({
          width,
          height,
          bondThickness: 1.5,
          bondLength: 20,
          shortBondLength: 0.8,
          bondSpacing: 4,
          atomVisualization: "default",
          isomeric: true,
          debug: false,
          terminalCarbons: false,
          explicitHydrogens: false,
          themes: {
            dark: {
              C: "#d4d4d8",
              O: "#ef4444",
              N: "#3b82f6",
              F: "#22c55e",
              CL: "#22c55e",
              BR: "#a855f7",
              I: "#a855f7",
              P: "#f97316",
              S: "#eab308",
              B: "#f97316",
              SI: "#f97316",
              H: "#d4d4d8",
              BACKGROUND: "transparent",
            },
          },
        });

        SmilesDrawer.parse(smiles, (tree: unknown) => {
          drawer.draw(tree, svgElement, "dark");
          setLoaded(true);
        }, () => {
          setError("Could not parse SMILES structure");
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Render failed");
        }
      }
    }

    const timer = setTimeout(render, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [smiles, width, height]);

  if (!smiles) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 ${className}`}
        style={{ width, height }}
      >
        <p className="text-xs text-muted-foreground">
          Enter a SMILES string to see the 2D structure
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={svgRef}
        className="flex items-center justify-center rounded-lg border border-border bg-background/50"
        style={{ width, height }}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-destructive/5">
          <p className="max-w-[200px] text-center text-xs text-destructive">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
