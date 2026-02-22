"use client";

import { Download, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  onExport: () => void;
  hasResults: boolean;
}

function MoleculeIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={`text-primary ${className}`}>
      <defs>
        <radialGradient id="mg" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="oklch(0.85 0.14 328)" />
          <stop offset="100%" style={{ stopColor: "var(--primary)" }} />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <line x1="100" y1="100" x2="100" y2="50"  stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="100" x2="50"  y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="100" x2="150" y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="100" x2="135" y2="145" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="22" fill="url(#mg)" />
      <circle cx="100" cy="50"  r="12" fill="url(#mg)" />
      <circle cx="50"  cy="100" r="14" fill="url(#mg)" />
      <circle cx="150" cy="100" r="14" fill="url(#mg)" />
      <circle cx="135" cy="145" r="14" fill="url(#mg)" />
    </svg>
  );
}

export function TopNav({ onExport, hasResults }: TopNavProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-2.5">
        <MoleculeIcon />
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
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
    </header>
  );
}
