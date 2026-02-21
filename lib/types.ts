export type PredictionType = "classification" | "regression";

export type PropertyCategory = "pharmacokinetics" | "toxicity";

export interface PropertyDefinition {
  id: string;
  name: string;
  shortName: string;
  category: PropertyCategory;
  type: PredictionType;
  unit?: string;
  description: string;
  labels?: { A: string; B: string };
}

export interface PredictionResult {
  propertyId: string;
  value: string;
  numericValue?: number;
  label?: "A" | "B";
  confidence?: number;
  status: "positive" | "negative" | "neutral";
}

export interface ExplanationResult {
  propertyId: string;
  smiles: string;
  explanation: string;
}

export interface SAREntry {
  id: string;
  smiles: string;
  scaffoldName?: string;
  rGroups?: Record<string, string>;
  predictions: PredictionResult[];
  selected: boolean;
}

export interface DesignSuggestion {
  text: string;
  type: "modify" | "add" | "remove" | "general";
}

export interface StartingMolecule {
  name: string;
  smiles: string;
}

export interface DesignGuidance {
  summary: string;
  suggestions: DesignSuggestion[];
  startingMolecules: StartingMolecule[];
  query: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  structuredContent?: {
    suggestions?: DesignSuggestion[];
    molecules?: StartingMolecule[];
  };
}

export type InputMode = "smiles" | "sketch" | "rgroup";

export type EvalMode = "admet" | "bbb" | "toxicity";

export interface AppState {
  smiles: string;
  inputMode: InputMode;
  evalMode: EvalMode;
  predictions: PredictionResult[];
  sarEntries: SAREntry[];
  explanations: Record<string, ExplanationResult>;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  isLoading: boolean;
  status: "idle" | "validating" | "predicting" | "explaining" | "complete" | "error";
  errorMessage?: string;
}

export type AppAction =
  | { type: "SET_SMILES"; payload: string }
  | { type: "SET_INPUT_MODE"; payload: InputMode }
  | { type: "SET_EVAL_MODE"; payload: EvalMode }
  | { type: "SET_PREDICTIONS"; payload: PredictionResult[] }
  | { type: "ADD_SAR_ENTRIES"; payload: SAREntry[] }
  | { type: "TOGGLE_SAR_ENTRY"; payload: string }
  | { type: "SELECT_ALL_SAR"; payload: boolean }
  | { type: "CLEAR_SAR" }
  | { type: "SET_EXPLANATION"; payload: ExplanationResult }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_STATUS"; payload: AppState["status"] }
  | { type: "SET_ERROR"; payload: string }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "SET_CHAT_LOADING"; payload: boolean }
  | { type: "CLEAR_CHAT" }
  | { type: "CLEAR_ALL" };
