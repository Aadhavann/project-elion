"use client";

import { useReducer, useState, useCallback } from "react";
import type {
  AppState,
  AppAction,
  InputMode,
  PredictionResult,
  SAREntry,
  ExplanationResult,
  ChatMessage,
} from "@/lib/types";
import { EVAL_MODE_PROPERTIES } from "@/lib/constants";
import { validateSmiles } from "@/lib/smiles-utils";

import { TopNav } from "@/components/layout/top-nav";
import { SmilesInput } from "@/components/molecule-input/smiles-input";
import { ModeSelector } from "@/components/molecule-input/mode-selector";
import { ScaffoldSelector } from "@/components/molecule-input/scaffold-selector";
import { KetcherDialog } from "@/components/molecule-input/ketcher-dialog";
import { MoleculeRenderer } from "@/components/molecule-viewer/molecule-renderer";
import { PredictionCards } from "@/components/prediction/prediction-cards";
import { SARTable } from "@/components/sar/sar-table";
import { ExportModal } from "@/components/export/export-modal";
import { MoleculeChat } from "@/components/chat/molecule-chat";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Play,
  RotateCcw,
  FlaskConical,
  TestTubes,
  Dna,
} from "lucide-react";

// ─── State ───────────────────────────────────────────────────

const initialState: AppState = {
  smiles: "",
  inputMode: "smiles",
  evalMode: "admet",
  predictions: [],
  sarEntries: [],
  explanations: {},
  chatMessages: [],
  isChatLoading: false,
  isLoading: false,
  status: "idle",
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_SMILES":
      return { ...state, smiles: action.payload };
    case "SET_INPUT_MODE":
      return { ...state, inputMode: action.payload };
    case "SET_EVAL_MODE":
      return { ...state, evalMode: action.payload };
    case "SET_PREDICTIONS":
      return { ...state, predictions: action.payload };
    case "ADD_SAR_ENTRIES":
      return { ...state, sarEntries: [...state.sarEntries, ...action.payload] };
    case "TOGGLE_SAR_ENTRY":
      return {
        ...state,
        sarEntries: state.sarEntries.map((e) =>
          e.id === action.payload ? { ...e, selected: !e.selected } : e
        ),
      };
    case "SELECT_ALL_SAR":
      return {
        ...state,
        sarEntries: state.sarEntries.map((e) => ({
          ...e,
          selected: action.payload,
        })),
      };
    case "CLEAR_SAR":
      return { ...state, sarEntries: [] };
    case "SET_EXPLANATION":
      return {
        ...state,
        explanations: {
          ...state.explanations,
          [action.payload.propertyId]: action.payload,
        },
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_ERROR":
      return { ...state, status: "error", errorMessage: action.payload };
    case "ADD_CHAT_MESSAGE":
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case "SET_CHAT_LOADING":
      return { ...state, isChatLoading: action.payload };
    case "CLEAR_CHAT":
      return { ...state, chatMessages: [], isChatLoading: false };
    case "CLEAR_ALL":
      return { ...initialState };
    default:
      return state;
  }
}

// ─── Page ────────────────────────────────────────────────────

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ketcherOpen, setKetcherOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [explainingIds, setExplainingIds] = useState<Set<string>>(new Set());

  const isValid = state.smiles.trim() && validateSmiles(state.smiles).valid;
  const hasResults = state.predictions.length > 0;

  // ─── Handlers ────────────────────────────────────────────

  const handleEvaluate = useCallback(async () => {
    if (!isValid) return;

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_STATUS", payload: "predicting" });

    try {
      const propertyIds = EVAL_MODE_PROPERTIES[state.evalMode];
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smiles: state.smiles.trim(),
          properties: propertyIds,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Prediction failed");
      }

      const data = await res.json();
      dispatch({
        type: "SET_PREDICTIONS",
        payload: data.predictions as PredictionResult[],
      });
      dispatch({ type: "SET_STATUS", payload: "complete" });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Prediction failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.smiles, state.evalMode, isValid]);

  const handleExplain = useCallback(
    async (propertyId: string) => {
      if (state.explanations[propertyId]) return;

      setExplainingIds((prev) => new Set(prev).add(propertyId));

      try {
        const pred = state.predictions.find((p) => p.propertyId === propertyId);
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            smiles: state.smiles.trim(),
            propertyId,
            prediction: pred?.value || "",
          }),
        });

        if (!res.ok) throw new Error("Explanation request failed");

        const data = await res.json();
        dispatch({
          type: "SET_EXPLANATION",
          payload: {
            propertyId,
            smiles: state.smiles,
            explanation: data.explanation,
          } as ExplanationResult,
        });
      } catch {
        dispatch({
          type: "SET_EXPLANATION",
          payload: {
            propertyId,
            smiles: state.smiles,
            explanation:
              "Unable to generate explanation. Please check your Vertex AI endpoint configuration.",
          } as ExplanationResult,
        });
      } finally {
        setExplainingIds((prev) => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
      }
    },
    [state.smiles, state.predictions, state.explanations]
  );

  const handleSARGenerate = useCallback(
    async (
      library: Array<{
        smiles: string;
        rGroups: Record<string, string>;
        scaffoldName: string;
      }>
    ) => {
      dispatch({ type: "CLEAR_SAR" });
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_STATUS", payload: "predicting" });

      try {
        const propertyIds = EVAL_MODE_PROPERTIES[state.evalMode];
        const entries: SAREntry[] = [];

        // Process in batches of 5
        for (let i = 0; i < library.length; i += 5) {
          const batch = library.slice(i, i + 5);
          const results = await Promise.all(
            batch.map(async (item) => {
              const res = await fetch("/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  smiles: item.smiles,
                  properties: propertyIds,
                }),
              });

              if (!res.ok) return [];
              const data = await res.json();
              return data.predictions as PredictionResult[];
            })
          );

          results.forEach((preds, j) => {
            entries.push({
              id: `sar-${Date.now()}-${i + j}`,
              smiles: batch[j].smiles,
              scaffoldName: batch[j].scaffoldName,
              rGroups: batch[j].rGroups,
              predictions: preds,
              selected: true,
            });
          });
        }

        dispatch({ type: "ADD_SAR_ENTRIES", payload: entries });

        // Also set the first entry as the active SMILES
        if (entries.length > 0) {
          dispatch({ type: "SET_SMILES", payload: entries[0].smiles });
          dispatch({
            type: "SET_PREDICTIONS",
            payload: entries[0].predictions,
          });
        }

        dispatch({ type: "SET_STATUS", payload: "complete" });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload:
            err instanceof Error ? err.message : "SAR generation failed",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.evalMode]
  );

  const handleChatMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content,
        timestamp: Date.now(),
      };
      dispatch({ type: "ADD_CHAT_MESSAGE", payload: userMsg });
      dispatch({ type: "SET_CHAT_LOADING", payload: true });

      try {
        const history = state.chatMessages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));
        history.push({ role: "user", content });

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            currentSmiles: state.smiles || undefined,
            currentPredictions:
              state.predictions.length > 0 ? state.predictions : undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Chat request failed");
        }

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: data.text,
          timestamp: Date.now(),
          structuredContent: data.structured || undefined,
        };
        dispatch({ type: "ADD_CHAT_MESSAGE", payload: assistantMsg });
      } catch (err) {
        const detail = err instanceof Error ? err.message : "Unknown error";
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now()}-error`,
          role: "assistant",
          content: `Error: ${detail}`,
          timestamp: Date.now(),
        };
        dispatch({ type: "ADD_CHAT_MESSAGE", payload: errorMsg });
      } finally {
        dispatch({ type: "SET_CHAT_LOADING", payload: false });
      }
    },
    [state.chatMessages, state.smiles, state.predictions]
  );

  // ─── Render ──────────────────────────────────────────────

  const statusLabel = {
    idle: "Ready",
    validating: "Validating...",
    predicting: "TxGemma processing...",
    explaining: "Generating explanation...",
    complete: "Complete",
    error: state.errorMessage || "Error",
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNav onExport={() => setExportOpen(true)} hasResults={hasResults} />

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left Panel: Input ─── */}
        <aside className="flex w-full flex-col overflow-y-auto border-r border-border bg-card p-4 lg:w-[630px] lg:min-w-[570px]">
          <div className="flex flex-col gap-5">
            {/* TxGemma Chat */}
            <MoleculeChat
              messages={state.chatMessages}
              isLoading={state.isChatLoading}
              onSendMessage={handleChatMessage}
              onApplyMolecule={(smiles) => {
                dispatch({ type: "SET_SMILES", payload: smiles });
                dispatch({ type: "SET_INPUT_MODE", payload: "smiles" });
              }}
              onClear={() => dispatch({ type: "CLEAR_CHAT" })}
            />

            {/* Input Mode */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Input Method
              </span>
              <Tabs
                value={state.inputMode}
                onValueChange={(v) =>
                  dispatch({
                    type: "SET_INPUT_MODE",
                    payload: v as InputMode,
                  })
                }
              >
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="smiles" className="text-xs gap-1">
                    <FlaskConical className="size-3" />
                    SMILES
                  </TabsTrigger>
                  <TabsTrigger value="sketch" className="text-xs gap-1">
                    <TestTubes className="size-3" />
                    Sketch
                  </TabsTrigger>
                  <TabsTrigger value="rgroup" className="text-xs gap-1">
                    <Dna className="size-3" />
                    R-Group
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* SMILES / Sketch / R-Group mode */}
            {(state.inputMode === "smiles" ||
              state.inputMode === "sketch") && (
              <SmilesInput
                value={state.smiles}
                onChange={(s) =>
                  dispatch({ type: "SET_SMILES", payload: s })
                }
                onOpenKetcher={() => setKetcherOpen(true)}
              />
            )}

            {state.inputMode === "rgroup" && (
              <ScaffoldSelector onGenerate={handleSARGenerate} />
            )}

            {/* Eval Mode */}
            <ModeSelector
              value={state.evalMode}
              onChange={(m) =>
                dispatch({ type: "SET_EVAL_MODE", payload: m })
              }
            />

            {/* Molecule Preview */}
            {state.smiles && state.inputMode !== "rgroup" && (
              <Card className="overflow-hidden bg-background/50 p-0">
                <CardContent className="flex items-center justify-center p-4">
                  <MoleculeRenderer smiles={state.smiles} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4 mt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`size-2 rounded-full ${
                    state.status === "idle"
                      ? "bg-muted-foreground"
                      : state.status === "predicting" ||
                        state.status === "explaining"
                        ? "bg-warning animate-pulse"
                        : state.status === "complete"
                          ? "bg-success"
                          : state.status === "error"
                            ? "bg-destructive"
                            : "bg-muted-foreground"
                  }`}
                />
                <span className="text-[11px] text-muted-foreground">
                  {statusLabel[state.status]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => dispatch({ type: "CLEAR_ALL" })}
              >
                <RotateCcw className="mr-1 size-3" />
                Clear
              </Button>
            </div>

            {state.inputMode !== "rgroup" && (
              <Button
                onClick={handleEvaluate}
                disabled={!isValid || state.isLoading}
                className="w-full gap-2"
                size="lg"
              >
                {state.isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )}
                Evaluate with TxGemma
              </Button>
            )}
          </div>
        </aside>

        {/* ─── Right Panel: Results ─── */}
        <main className="flex flex-1 flex-col overflow-y-auto p-6">
          {!hasResults && state.sarEntries.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <svg viewBox="0 0 200 200" className="size-16 text-primary">
                <defs>
                  <radialGradient id="esg" cx="40%" cy="35%" r="60%">
                    <stop offset="0%" stopColor="oklch(0.85 0.14 328)" />
                    <stop offset="100%" style={{ stopColor: "var(--primary)" }} />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <line x1="100" y1="100" x2="100" y2="50"  stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <line x1="100" y1="100" x2="50"  y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <line x1="100" y1="100" x2="150" y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <line x1="100" y1="100" x2="135" y2="145" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <circle cx="100" cy="100" r="22" fill="url(#esg)" />
                <circle cx="100" cy="50"  r="12" fill="url(#esg)" />
                <circle cx="50"  cy="100" r="14" fill="url(#esg)" />
                <circle cx="150" cy="100" r="14" fill="url(#esg)" />
                <circle cx="135" cy="145" r="14" fill="url(#esg)" />
              </svg>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-semibold text-foreground">
                  Ready to explore
                </h2>
                <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
                  Enter a SMILES string or draw a molecule, then click{" "}
                  <span className="font-medium text-foreground">
                    Evaluate with TxGemma
                  </span>{" "}
                  to predict therapeutic properties using Google{"'"}s TxGemma
                  model via Vertex AI Model Garden.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px]">
                  BBB Penetration
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Toxicity Panel
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Lipophilicity
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  ADMET
                </Badge>
              </div>
            </div>
          )}

          {(hasResults || state.isLoading) && (
            <div className="flex flex-col gap-6">
              <PredictionCards
                evalMode={state.evalMode}
                predictions={state.predictions}
                explanations={state.explanations}
                isLoading={state.isLoading}
                explainingIds={explainingIds}
                onExplain={handleExplain}
              />
            </div>
          )}

          {state.sarEntries.length > 0 && (
            <div className="mt-6">
              <SARTable
                entries={state.sarEntries}
                onToggleEntry={(id) =>
                  dispatch({ type: "TOGGLE_SAR_ENTRY", payload: id })
                }
                onSelectAll={(selected) =>
                  dispatch({ type: "SELECT_ALL_SAR", payload: selected })
                }
              />
            </div>
          )}
        </main>
      </div>

      {/* ─── Modals ─── */}
      <KetcherDialog
        open={ketcherOpen}
        onOpenChange={setKetcherOpen}
        onApply={(smiles) => {
          dispatch({ type: "SET_SMILES", payload: smiles });
          dispatch({ type: "SET_INPUT_MODE", payload: "smiles" });
        }}
      />
      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        smiles={state.smiles}
        predictions={state.predictions}
        sarEntries={state.sarEntries}
        explanations={state.explanations}
      />
    </div>
  );
}
