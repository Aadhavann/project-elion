import { GoogleAuth } from "google-auth-library";
import type { PropertyDefinition, PredictionResult } from "./types";
import { buildPredictionPrompt, buildExplanationPrompt, buildDesignGuidancePrompt, buildChatSystemPrompt } from "./prompts";
import { getPropertyById } from "./constants";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID!;
const REGION = process.env.GOOGLE_CLOUD_REGION || "us-central1";
const CHAT_REGION = process.env.GOOGLE_CLOUD_CHAT_REGION || REGION;
const PREDICT_ENDPOINT_ID = process.env.VERTEX_AI_PREDICT_ENDPOINT_ID!;
const CHAT_ENDPOINT_ID = process.env.VERTEX_AI_CHAT_ENDPOINT_ID || PREDICT_ENDPOINT_ID;

console.log("[txgemma] Config loaded:", {
  REGION,
  CHAT_REGION,
  PREDICT_ENDPOINT_ID,
  CHAT_ENDPOINT_ID,
});

function getCredentials() {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (json) {
    try {
      return JSON.parse(json);
    } catch {
      // Try base64
      return JSON.parse(Buffer.from(json, "base64").toString("utf-8"));
    }
  }
  return undefined;
}

let authClient: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
  if (!authClient) {
    const credentials = getCredentials();
    authClient = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
  }
  return authClient;
}

async function getAccessToken(): Promise<string> {
  const auth = getAuth();
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token || "";
}

/**
 * Call TxGemma-Predict via rawPredict (vLLM endpoint).
 */
async function rawPredict(prompt: string): Promise<string> {
  console.log("[rawPredict] Starting request...");
  let token: string;
  try {
    token = await getAccessToken();
    console.log("[rawPredict] Got access token:", token ? `${token.slice(0, 20)}...` : "(empty)");
  } catch (err) {
    console.log("[rawPredict] Auth failed:", err);
    throw err;
  }
  const url = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/endpoints/${PREDICT_ENDPOINT_ID}:rawPredict`;

  console.log("[rawPredict] Fetching URL:", url);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [{ prompt, max_tokens: 64, temperature: 0.0 }],
      }),
    });
  } catch (fetchErr) {
    console.log("[rawPredict] Fetch NETWORK error:", fetchErr);
    throw fetchErr;
  }

  console.log("[rawPredict] Status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.log("[rawPredict] ERROR body:", errorText.slice(0, 1000));
    throw new Error(`Vertex AI rawPredict error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  console.log("[rawPredict] Full response:", JSON.stringify(data, null, 2));

  // Handle vLLM response format
  let rawText = "";
  if (data.predictions && data.predictions.length > 0) {
    const pred = data.predictions[0];
    console.log("[rawPredict] predictions[0] type:", typeof pred);
    if (typeof pred === "string") {
      rawText = pred;
    } else if (typeof pred === "object" && pred !== null) {
      rawText = String(pred.output || pred.text || pred.generated_text || pred.content || JSON.stringify(pred));
    } else {
      rawText = String(pred);
    }
  } else if (data.text) {
    rawText = data.text;
  } else if (typeof data === "string") {
    rawText = data;
  } else {
    rawText = JSON.stringify(data);
  }

  // Strip echoed prompt — model returns "Prompt:\n...\nOutput:\n<actual answer>"
  const outputMarker = rawText.lastIndexOf("Output:\n");
  if (outputMarker !== -1) {
    rawText = rawText.substring(outputMarker + "Output:\n".length);
  }

  rawText = rawText.replace(/<end_of_turn>/g, "").trim();
  console.log("[rawPredict] Cleaned output:", rawText);
  return rawText;
}

/**
 * Format messages into Gemma chat template for rawPredict.
 */
function formatGemmaChatPrompt(messages: Array<{ role: string; content: string }>): string {
  let prompt = "";
  for (const msg of messages) {
    const role = msg.role === "assistant" ? "model" : msg.role;
    prompt += `<start_of_turn>${role}\n${msg.content}<end_of_turn>\n`;
  }
  // Add model turn start to prompt generation
  prompt += `<start_of_turn>model\n`;
  return prompt;
}

/**
 * Call TxGemma-Chat via rawPredict (same as predict but with chat endpoint).
 */
async function chatPredict(messages: Array<{ role: string; content: string }>): Promise<string> {
  const token = await getAccessToken();
  const url = `https://${CHAT_REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${CHAT_REGION}/endpoints/${CHAT_ENDPOINT_ID}:rawPredict`;

  const prompt = formatGemmaChatPrompt(messages);
  console.log("[chatPredict] Prompt char length:", prompt.length, "~approx tokens:", Math.ceil(prompt.length / 4));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // For vLLM on Vertex AI rawPredict, generation parameters must be inside
      // the instances object — the top-level "parameters" field is for Vertex AI's
      // own API and is NOT forwarded to the vLLM server, causing it to be ignored
      // and fall back to the deployment default (~15-20 tokens), causing truncation.
      instances: [{
        prompt,
        max_tokens: 2048,
        temperature: 0.3,
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vertex AI chat error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  console.log("[chatPredict] Full response:", JSON.stringify(data, null, 2).slice(0, 5000));

  let rawText = "";
  if (data.predictions && data.predictions.length > 0) {
    const pred = data.predictions[0];
    console.log("[chatPredict] predictions[0] type:", typeof pred);
    if (typeof pred === "string") {
      rawText = pred;
    } else if (typeof pred === "object" && pred !== null) {
      rawText = String(pred.output || pred.text || pred.generated_text || pred.content || JSON.stringify(pred));
    } else {
      rawText = String(pred);
    }
  } else if (data.text) {
    rawText = data.text;
  } else if (typeof data === "string") {
    rawText = data;
  } else {
    rawText = JSON.stringify(data);
  }

  // Strip echoed prompt — model returns "Prompt:\n<start_of_turn>...<start_of_turn>model\nOutput:\n<actual answer>"
  // Extract only the generated text after the last model turn marker
  const outputMarker = rawText.lastIndexOf("Output:\n");
  if (outputMarker !== -1) {
    rawText = rawText.substring(outputMarker + "Output:\n".length);
  } else {
    const modelMarker = rawText.lastIndexOf("<start_of_turn>model\n");
    if (modelMarker !== -1) {
      rawText = rawText.substring(modelMarker + "<start_of_turn>model\n".length);
    }
  }

  // Remove any trailing end-of-turn tags
  rawText = rawText.replace(/<end_of_turn>/g, "").trim();

  console.log("[chatPredict] Cleaned output:", rawText.slice(0, 200));
  return rawText;
}

/**
 * Parse TxGemma classification response: extracts "(A)" or "(B)".
 */
function parseClassification(
  raw: string,
  property: PropertyDefinition
): { label: "A" | "B"; value: string; status: "positive" | "negative" | "neutral" } {
  const normalized = raw.toUpperCase().trim();

  let label: "A" | "B" = "A";
  if (normalized.includes("(B)") || normalized.startsWith("B")) {
    label = "B";
  }

  const value = property.labels?.[label] || label;

  // Determine status based on property semantics
  let status: "positive" | "negative" | "neutral" = "neutral";
  const positiveB = ["bbb", "clinical_phase1", "clinical_phase2", "clinical_phase3"];
  const negativeB = ["ames", "dili", "herg"];

  if (positiveB.includes(property.id)) {
    status = label === "B" ? "positive" : "negative";
  } else if (negativeB.includes(property.id)) {
    status = label === "B" ? "negative" : "positive";
  }

  return { label, value, status };
}

/**
 * Rescaling functions for each regression property.
 * TxGemma outputs integers 000–1000; these convert to real units.
 */
const REGRESSION_RESCALERS: Record<string, (raw: number) => number> = {
  logp:  (raw) => raw / 100 - 2,
  ppbr:  (raw) => raw / 10,
  caco2: (raw) => raw / 200 - 3,
  ld50:  (raw) => Math.pow(10, raw / 100 - 1),
};

/**
 * Parse TxGemma regression response: extracts the 0-1000 integer and rescales to real units.
 */
function parseRegression(
  raw: string,
  property: PropertyDefinition
): { numericValue: number; value: string; status: "neutral" } {
  const match = raw.match(/\d+/);
  const rawInt = match ? parseInt(match[0], 10) : 0;
  const rescaler = REGRESSION_RESCALERS[property.id];
  const numericValue = rescaler ? rescaler(rawInt) : rawInt;
  const unit = property.unit ? ` ${property.unit}` : "";
  return {
    numericValue,
    value: `${numericValue.toFixed(2)}${unit}`,
    status: "neutral",
  };
}

/**
 * Predict a single property for a given SMILES.
 */
export async function predictProperty(
  smiles: string,
  propertyId: string,
): Promise<PredictionResult> {
  const property = getPropertyById(propertyId);
  if (!property) {
    throw new Error(`Unknown property: ${propertyId}`);
  }

  const prompt = buildPredictionPrompt(propertyId, smiles);
  const raw = await rawPredict(prompt);

  if (property.type === "classification") {
    const parsed = parseClassification(raw, property);
    return {
      propertyId,
      value: parsed.value,
      label: parsed.label,
      confidence: 0.85, // TxGemma doesn't return confidence by default
      status: parsed.status,
    };
  } else {
    const parsed = parseRegression(raw, property);
    return {
      propertyId,
      value: parsed.value,
      numericValue: parsed.numericValue,
      confidence: 0.80,
      status: parsed.status,
    };
  }
}

/**
 * Get explanation for a prediction from TxGemma-Chat.
 */
export async function explainProperty(
  smiles: string,
  propertyId: string,
  prediction: string
): Promise<string> {
  const property = getPropertyById(propertyId);
  if (!property) {
    throw new Error(`Unknown property: ${propertyId}`);
  }

  const prompt = buildExplanationPrompt(property, smiles, prediction);
  const explanation = await chatPredict([
    { role: "user", content: prompt },
  ]);

  return explanation;
}

/**
 * Multi-turn chat with automatic molecule context injection.
 */
export async function chatWithContext(
  conversationHistory: Array<{ role: string; content: string }>,
  currentSmiles?: string,
  currentPredictions?: PredictionResult[]
): Promise<string> {
  const systemMessage = buildChatSystemPrompt(currentSmiles, currentPredictions);
  const messages = [
    { role: "system", content: systemMessage },
    ...conversationHistory,
  ];
  const response = await chatPredict(messages);
  
  // Extract only the model's response part, removing system prompt and tags
  // Look for the last <start_of_turn>model\nOutput:\n and return everything after it
  let modelResponseStart = response.lastIndexOf('<start_of_turn>model\nOutput:\n');
  if (modelResponseStart !== -1) {
    return response.substring(modelResponseStart + '<start_of_turn>model\nOutput:\n'.length).trim();
  }
  
  // Alternative: look for <start_of_turn>model\n and return everything after it
  modelResponseStart = response.lastIndexOf('<start_of_turn>model\n');
  if (modelResponseStart !== -1) {
    return response.substring(modelResponseStart + '<start_of_turn>model\n'.length).trim();
  }
  
  // If the tag isn't found, return the full response
  return response.trim();
}

/**
 * Parse a chat response for structured content (molecules, suggestions).
 */
export function parseChatResponse(response: string): {
  text: string;
  structured: {
    suggestions?: Array<{ text: string; type: string }>;
    molecules?: Array<{ name: string; smiles: string }>;
  } | null;
} {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const hasStructured =
        Array.isArray(parsed.suggestions) ||
        Array.isArray(parsed.startingMolecules) ||
        Array.isArray(parsed.molecules);
      if (hasStructured) {
        return {
          text: response.replace(jsonMatch[0], "").trim(),
          structured: {
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : undefined,
            molecules: Array.isArray(parsed.startingMolecules || parsed.molecules)
              ? (parsed.startingMolecules || parsed.molecules)
              : undefined,
          },
        };
      }
    } catch {
      // JSON parse failed, treat as plain text
    }
  }
  return { text: response, structured: null };
}

/**
 * Get design guidance from TxGemma-Chat for a therapeutic goal.
 */
export async function getDesignGuidance(
  therapeuticGoal: string
): Promise<{ summary: string; suggestions: Array<{ text: string; type: string }>; startingMolecules: Array<{ name: string; smiles: string }> }> {
  const prompt = buildDesignGuidancePrompt(therapeuticGoal);
  const response = await chatPredict([
    { role: "user", content: prompt },
  ]);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: parsed.summary || "No summary available.",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      startingMolecules: Array.isArray(parsed.startingMolecules) ? parsed.startingMolecules : [],
    };
  } catch {
    return {
      summary: response,
      suggestions: [],
      startingMolecules: [],
    };
  }
}
