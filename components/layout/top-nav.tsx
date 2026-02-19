"use client";

import { FlaskConical, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  onExport: () => void;
  hasResults: boolean;
}

export function TopNav({ onExport, hasResults }: TopNavProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <FlaskConical className="size-5 text-primary" />
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          Project Elion
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {hasResults && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-1.5 size-3.5" />
            Export Report
          </Button>
        )}
      </div>
    </header>
  );
}
