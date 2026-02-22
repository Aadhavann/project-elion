import type { PropertyDefinition, PredictionResult } from "./types";
import { getPropertyById } from "./constants";

/**
 * TxGemma prompt templates.
 * Based on the paper format (Section 2.1, Table S.7).
 */

const PROMPT_TEMPLATES: Record<string, (smiles: string) => string> = {
  bbb: (smiles) =>
    `Instructions: Answer the following question about drug properties.\nContext: As a membrane separating circulating blood and brain extracellular fluid, the blood-brain barrier (BBB) is the protection layer that blocks most foreign drugs. Thus the ability of a drug to penetrate the barrier to deliver to the site of action forms a crucial challenge in development of drugs for central nervous system.\nQuestion: Given a drug SMILES string, predict whether it\n(A) does not cross the BBB (B) crosses the BBB\nDrug SMILES: ${smiles}\nAnswer:`,

  caco2: (smiles) =>
    `Instructions: Answer the following question about drug properties.\nContext: The human colon epithelial cancer cell line, Caco-2, is used as an in vitro model to simulate the human intestinal tissue. The experimental result on the rate of drug passing through the Caco-2 cells can approximate the rate at which the drug permeates through the human intestinal tissue.\nQuestion: Given a drug SMILES string, predict its normalized Caco-2 cell effective permeability from 000 to 1000, where 000 is minimum permeability and 1000 is maximum permeability.\nDrug SMILES: ${smiles}\nAnswer:`,

  ppbr: (smiles) =>
    `Instructions: Answer the following question about drug properties.\nContext: The human plasma protein binding rate (PPBR) is expressed as the percentage of a drug bound to plasma proteins in the blood. This rate strongly affect a drug's efficiency of delivery. The less bound a drug is, the more efficiently it can traverse and diffuse to the site of actions.\nQuestion: Given a drug SMILES string, predict its normalized rate of PPBR from 000 to 1000, where 000 is minimum PPBR rate and 1000 is maximum PPBR rate.\nDrug SMILES: ${smiles}\nAnswer:`,

  logp: (smiles) =>
    `Instructions: Answer the following question about drug properties.\nContext: Lipophilicity measures the ability of a drug to dissolve in a lipid (e.g. fats, oils) environment. High lipophilicity often leads to high rate of metabolism, poor solubility, high turn-over, and low absorption.\nQuestion: Given a drug SMILES string, predict its normalized lipophilicity from 000 to 1000, where 000 is minimum lipophilicity and 1000 is maximum lipophilicity.\nDrug SMILES: ${smiles}\nAnswer:`,

  ames: (smiles) =>
    `Instructions: Answer the following question about drug properties.\nContext: Mutagenicity means the ability of a drug to induce genetic alterations. Drugs that can cause damage to the DNA can result in cell death or other severe adverse effects. Nowadays, the most widely used assay for testing the mutagenicity of compounds is the Ames experiment which was invented by a professor named Ames. The Ames test is a short-term bacterial reverse mutation assay detecting a large number of compounds which can induce genetic damage and frameshift mutations.\nQuestion: Given a drug SMILES string, predict whether it\n(A) is not mutagenic (B) is mutagenic\nDrug SMILES: ${smiles}\nAnswer:`,

  dili: (smiles) =>
    `Instructions: Answer the following question about drug properties.\nContext: Drug-induced liver injury (DILI) is fatal liver disease caused by drugs and it has been the single most frequent cause of safety-related drug marketing withdrawals for the past 50 years (e.g. iproniazid, ticrynafen, benoxaprofen).\nQuestion: Given a drug SMILES string, predict whether it\n(A) cannot cause DILI (B) can cause DILI\nDrug SMILES: ${smiles}\nAnswer:`,

  herg: (smiles) =>
    `Instructions: Answer the following question about drug properties.\nContext: Human ether-à-go-go related gene (hERG) is crucial for the coordination of the heart's beating. Thus, if a drug blocks the hERG, it could lead to severe adverse effects. Therefore, reliable prediction of hERG liability in the early stages of drug design is quite important to reduce the risk of cardiotoxicity-related attritions in the later development stages.\nQuestion: Given a drug SMILES string, predict whether it\n(A) does not block hERG (B) blocks hERG\nDrug SMILES: ${smiles}\nAnswer:`,

  ld50: (smiles) =>
    `Instructions: Answer the following question about drug properties.\nContext: Acute toxicity LD50 measures the most conservative dose that can lead to lethal adverse effects. The lower the dose, the more lethal of a drug.\nQuestion: Given a drug SMILES string, predict its normalized LD50 from 000 to 1000, where 000 is minimum LD50 and 1000 is maximum LD50.\nDrug SMILES: ${smiles}\nAnswer:`,
};

export function buildPredictionPrompt(
  propertyId: string,
  smiles: string,
): string {
  const template = PROMPT_TEMPLATES[propertyId];
  if (!template) {
    throw new Error(`No prompt template for property: ${propertyId}`);
  }
  return template(smiles);
}

export function buildExplanationPrompt(
  property: PropertyDefinition,
  smiles: string,
  prediction: string
): string {
  return `You are TxGemma, a therapeutic AI model. A molecule with SMILES "${smiles}" was predicted to have the following result for ${property.name}: ${prediction}.

In 2-3 sentences, explain why this molecule shows this property. Focus on the most relevant structural features (e.g. functional groups, MW, H-bond donors/acceptors, logP, charge). Be direct and scientifically precise. Do not add caveats, disclaimers, or closing remarks.`;
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
