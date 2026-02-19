import type { PropertyDefinition, PredictionResult } from "./types";
import { getPropertyById } from "./constants";

/**
 * TxGemma prompt templates.
 * Based on the paper format (Section 2.1, Table S.7).
 */

const PROMPT_TEMPLATES: Record<string, (smiles: string, target?: string) => string> = {
  bbb: (smiles) =>
    `Given a drug SMILES string, predict whether it (A) does not cross the blood-brain barrier or (B) crosses the blood-brain barrier.\nDrug SMILES: ${smiles}\nAnswer:`,

  caco2: (smiles) =>
    `Given a drug SMILES string, predict its Caco-2 cell permeability (cm/s in log scale).\nDrug SMILES: ${smiles}\nAnswer:`,

  ppbr: (smiles) =>
    `Given a drug SMILES string, predict its plasma protein binding rate (%).\nDrug SMILES: ${smiles}\nAnswer:`,

  logp: (smiles) =>
    `Given a drug SMILES string, predict its lipophilicity (logP).\nDrug SMILES: ${smiles}\nAnswer:`,

  ames: (smiles) =>
    `Given a drug SMILES string, predict whether it is (A) not mutagenic or (B) mutagenic in the AMES test.\nDrug SMILES: ${smiles}\nAnswer:`,

  dili: (smiles) =>
    `Given a drug SMILES string, predict whether it (A) does not cause drug-induced liver injury or (B) causes drug-induced liver injury.\nDrug SMILES: ${smiles}\nAnswer:`,

  herg: (smiles) =>
    `Given a drug SMILES string, predict whether it (A) does not inhibit the hERG channel or (B) inhibits the hERG channel.\nDrug SMILES: ${smiles}\nAnswer:`,

  ld50: (smiles) =>
    `Given a drug SMILES string, predict its acute toxicity LD50 value (log mg/kg).\nDrug SMILES: ${smiles}\nAnswer:`,

  ic50: (smiles, target) =>
    `Given a drug SMILES string and a target protein, predict the binding affinity IC50 (nM in log scale).\nDrug SMILES: ${smiles}\nTarget: ${target || "Unknown"}\nAnswer:`,

  kd: (smiles, target) =>
    `Given a drug SMILES string and a target protein, predict the dissociation constant Kd (nM in log scale).\nDrug SMILES: ${smiles}\nTarget: ${target || "Unknown"}\nAnswer:`,

  clinical_phase1: (smiles) =>
    `Given a drug SMILES string, predict whether it will (A) fail or (B) pass Phase 1 clinical trial.\nDrug SMILES: ${smiles}\nAnswer:`,

  clinical_phase2: (smiles) =>
    `Given a drug SMILES string, predict whether it will (A) fail or (B) pass Phase 2 clinical trial.\nDrug SMILES: ${smiles}\nAnswer:`,

  clinical_phase3: (smiles) =>
    `Given a drug SMILES string, predict whether it will (A) fail or (B) pass Phase 3 clinical trial.\nDrug SMILES: ${smiles}\nAnswer:`,
};

export function buildPredictionPrompt(
  propertyId: string,
  smiles: string,
  target?: string
): string {
  const template = PROMPT_TEMPLATES[propertyId];
  if (!template) {
    throw new Error(`No prompt template for property: ${propertyId}`);
  }
  return template(smiles, target);
}

export function buildExplanationPrompt(
  property: PropertyDefinition,
  smiles: string,
  prediction: string
): string {
  return `You are TxGemma, a therapeutic AI model. A molecule with SMILES "${smiles}" was predicted to have the following result for ${property.name}: ${prediction}.

Please explain why this molecule shows this property based on its structural features. Cite specific functional groups, molecular weight considerations, hydrogen bonding capacity, lipophilicity, charge distribution, and any other relevant structural characteristics. Be concise but scientifically rigorous.`;
}

export function buildChatSystemPrompt(
  currentSmiles?: string,
  currentPredictions?: PredictionResult[]
): string {
  let prompt = `You are TxGemma, a therapeutic AI assistant specialized in drug discovery and molecular design. You help medicinal chemists design better drug candidates through conversational guidance.

You can:
- Suggest molecular modifications and design strategies
- Explain molecular properties and prediction results
- Recommend starting scaffolds and lead compounds
- Answer questions about ADMET, toxicity, binding affinity, and clinical trial outcomes

Be scientifically rigorous, cite specific structural features, and provide actionable insights. Keep responses concise but informative.

When suggesting molecules, include a JSON block in your response like this:
{"startingMolecules":[{"name":"Drug Name","smiles":"VALID_SMILES"}]}
Only include this JSON block when you are actively suggesting specific molecules. For general discussion, respond in plain text.`;

  if (currentSmiles) {
    prompt += `\n\nThe user is currently working with this molecule: ${currentSmiles}`;

    if (currentPredictions && currentPredictions.length > 0) {
      prompt += `\nCurrent predictions for this molecule:`;
      for (const pred of currentPredictions) {
        const prop = getPropertyById(pred.propertyId);
        if (prop) {
          prompt += `\n- ${prop.name}: ${pred.value}`;
        }
      }
    }
  }

  return prompt;
}

export function buildDesignGuidancePrompt(therapeuticGoal: string): string {
  return `You are TxGemma, a therapeutic AI model specialized in drug design. A medicinal chemist has the following therapeutic goal:

"${therapeuticGoal}"

Provide structured design guidance in the following JSON format. Be concise and scientifically rigorous.

{
  "summary": "A 2-3 sentence paragraph summarizing the recommended design strategy.",
  "suggestions": [
    {"text": "Specific actionable suggestion", "type": "modify|add|remove|general"}
  ],
  "startingMolecules": [
    {"name": "Human-readable name", "smiles": "Valid SMILES string"}
  ]
}

Rules:
- Include 3-5 actionable suggestions. Use type "modify" for structural changes, "add" for new groups, "remove" for groups to avoid, "general" for strategy advice.
- Include 1-3 starting molecules with valid SMILES strings and descriptive names.
- Focus on practical medicinal chemistry modifications.
- Return ONLY the JSON object, no other text.`;
}
