# Project Elion

**A virtual drug discovery laboratory powered by Google TxGemma.**

Named after **Gertrude B. Elion** — Nobel Prize–winning pharmacologist and pioneer of rational drug design. Where Elion used intuition and chemistry to design drugs molecule by molecule, this project applies AI to do the same in seconds.

---

## Table of Contents

1. [Scientific Context](#1-scientific-context-rational-drug-design)
2. [Technical Framework: TxGemma](#2-technical-framework-txgemma)
3. [Features](#3-features)
4. [The Elion Workflow](#4-the-elion-optimization-workflow)
5. [Problem Statement & Impact](#5-problem-statement--impact)
6. [Tech Stack](#6-tech-stack)
7. [Local Development](#7-local-development)
8. [Deploying on Vercel](#8-deploying-on-vercel)

---

## 1. Scientific Context: Rational Drug Design

Instead of brute-force trial and error, rational drug design focuses on deliberate, mechanism-driven molecular engineering.

### Targeted Synthesis

Designing molecules based on a known physiological or pathological pathway — choosing a scaffold because of where it binds, not what randomly survived a screen.

### Property Balancing

Simultaneously optimizing for therapeutic efficacy and safety. A drug that kills the target but also kills the liver is not a drug. ADMET properties — Absorption, Distribution, Metabolism, Excretion, and Toxicity — are the filters that separate candidates from failures.

Project Elion puts both of these practices in a browser.

---

## 2. Technical Framework: TxGemma

At its core, Project Elion uses **TxGemma**, a state-of-the-art open model from Google's Health AI Developer Foundations (HAI-DEF).

| Component | Detail |
|---|---|
| **Architecture** | Built on the Gemma 2 backbone, fine-tuned on 7 million therapeutic examples from the Therapeutics Data Commons (TDC) |
| **Predictive scope** | 60+ therapeutic tasks — classification (*Does it cross the BBB?*) and regression (*What is its logP?*) |
| **Explainability** | Provides structural reasoning behind every prediction, helping chemists understand *why* a molecule fails or succeeds |
| **Deployment** | Hosted on Google Cloud Vertex AI Model Garden via two vLLM-served endpoints: one for property prediction (TxGemma-Predict), one for conversational guidance (TxGemma-Chat) |

---

## 3. Features

### Molecule Input — three ways to enter a molecule

| Mode | Description |
|---|---|
| **SMILES** | Paste any SMILES string directly with real-time validation |
| **Sketch** | Draw a structure in the embedded Ketcher molecular editor; SMILES is auto-generated |
| **R-Group Explorer** | Pick a scaffold (benzene, indole, pyrimidine…) and up to three substituent positions with 17 R-groups each; the app builds and evaluates the full combinatorial library |

Six quick-load example molecules are always one click away: **Aspirin, Caffeine, Ibuprofen, Diazepam, Metformin, Penicillin G**.

---

### ADMET Property Prediction — 8 properties across 3 panels

**General ADMET** · **BBB Penetration** · **Toxicity Panel**

| Property | Type | What it measures |
|---|---|---|
| BBB Penetration | Classification | Can the drug cross the blood-brain barrier? |
| Caco-2 Permeability | Regression (log cm/s) | Intestinal absorption via Caco-2 cell assay |
| PPBR | Regression (%) | Plasma protein binding rate |
| logP | Regression | Octanol-water lipophilicity |
| AMES Mutagenicity | Classification | Ames bacterial reverse mutation test |
| DILI Risk | Classification | Drug-induced liver injury risk |
| hERG Inhibition | Classification | Cardiotoxicity via hERG channel blockade |
| LD50 | Regression (mg/kg) | Acute oral lethal dose in rodents |

---

### Ask Why — per-property structural explanations

Every prediction card has an **Ask Why** button. Clicking it calls TxGemma-Chat, which returns a 3–4 sentence structural explanation — describing exactly which atoms, groups, or physicochemical properties drive the predicted outcome.

---

### TxGemma Chat Assistant

A full conversational interface embedded in the left panel. It maintains multi-turn context and is aware of the currently loaded molecule and its predictions. Useful for:

- Requesting design modifications ("make this more BBB-permeable")
- Asking open-ended drug design questions
- Getting starting-point molecules for a therapeutic goal

Three starter prompts are shown when the chat is empty.

---

### SAR Table — structure-activity relationship explorer

When using R-Group mode, all generated library members are displayed in a sortable, selectable SAR table alongside their predicted property values. Entries can be individually selected for export.

---

### Export

Results can be exported as **CSV** or **JSON**, covering:

- The current molecule's SMILES and all predictions
- The full SAR library (when R-Group mode was used)
- Any explanations that were generated

---

### Smart Response Cache

Pre-computed, scientifically validated predictions and explanations are baked in for all six example molecules × all eight properties. The three suggested chat prompts also return instant pre-written responses. This means the app runs fully without any live AI endpoint for all standard demo interactions.

Any molecule outside the cache falls through to the live TxGemma endpoints transparently.

---

## 4. The Elion Optimization Workflow

A real medicinal chemistry workflow: systematically modify an existing drug to reduce side effects, using AI-predicted property feedback at each step.

### Step A: Molecular Modification

**Example — Cetirizine → Fexofenadine (sedating → non-sedating antihistamine)**

To transform Cetirizine into Fexofenadine, the tool guides the following structural changes:

#### Reduce Lipophilicity

Remove lipophilic atoms (e.g., chlorine) to reduce fat solubility, making it harder for the molecule to cross the Blood-Brain Barrier.

#### Increase Polarity

Add hydroxyl groups (−OH) to increase polarity and charge at physiological pH, keeping the molecule peripheral rather than central.

#### Increase Molecular Weight

Introduce bulkier groups (e.g., phenyl rings) to physically hinder passive transport through tight biological barriers.

---

### Step B: Verification & Benchmarking

Side-by-side comparison of the original and optimised molecules using predicted properties.

| Metric | Expected direction |
|---|---|
| **LogP** (Lipophilicity) | Decreases — lower fat solubility |
| **PPBR** (Plasma Protein Binding Rate) | Increases — more drug stays in circulation, less enters the brain |
| **BBB** | Flips from positive to negative — no CNS entry |
| **LD50** (Safety) | Increases — higher value = lower acute toxicity |

---

## 5. Problem Statement & Impact

### The Problem

Drug development has brutal attrition rates. Over **90% of candidates fail in clinical trials**, most due to unexpected toxicity or unfavourable distribution — problems that could have been screened computationally long before expensive synthesis.

### The Impact

Project Elion functions as a **virtual laboratory for early-stage filtering**. Researchers can fail fast and cheaply *in silico*, eliminating weak candidates before any bench chemistry begins.

Only optimized, high-confidence molecules move forward — which is how Gertrude Elion worked, and how modern drug discovery is increasingly done.

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI primitives) |
| Molecule rendering | smiles-drawer |
| Molecule sketcher | Ketcher (embedded) |
| AI backend | Google Vertex AI — TxGemma-Predict + TxGemma-Chat (vLLM) |
| Auth | google-auth-library (service account) |

---

## 7. Local Development

### Prerequisites

- Node.js 18+
- A Google Cloud project with Vertex AI enabled
- Two Vertex AI endpoints deployed from Model Garden:
  - **TxGemma-Predict** (27B or 9B)
  - **TxGemma-Chat** (27B or 9B)
- A service account with `roles/aiplatform.user` on the project

### Setup

```bash
# Install dependencies (the project uses pnpm)
pnpm install

# Configure environment
cp .env.example .env   # or create .env manually
```

Fill in `.env`:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_CLOUD_CHAT_REGION=us-central1
VERTEX_AI_PREDICT_ENDPOINT_ID=your-predict-endpoint-id
VERTEX_AI_CHAT_ENDPOINT_ID=your-chat-endpoint-id
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

```bash
pnpm dev
# → http://localhost:3000
```

> **Tip:** The six example molecules and the three suggested chat prompts work without any live endpoint — responses are served from the built-in cache.

---

## 8. Deploying on Vercel

### Prerequisites

- The project pushed to a GitHub (or GitLab / Bitbucket) repository
- The two Vertex AI endpoints must be **running and unpaused** in Google Cloud for non-cached molecules to work

---

### Step 1 — Import the project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** and select your repo
3. Vercel auto-detects Next.js — leave all build settings as default

---

### Step 2 — Set environment variables

In the Vercel project dashboard → **Settings → Environment Variables**, add the following for all environments (Production, Preview, Development):

| Variable | Value |
|---|---|
| `GOOGLE_CLOUD_PROJECT_ID` | Your GCP project ID |
| `GOOGLE_CLOUD_REGION` | `us-central1` (or your region) |
| `GOOGLE_CLOUD_CHAT_REGION` | `us-central1` (or your chat endpoint region) |
| `VERTEX_AI_PREDICT_ENDPOINT_ID` | Your predict endpoint ID |
| `VERTEX_AI_CHAT_ENDPOINT_ID` | Your chat endpoint ID |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | See note below |

#### Encoding the service account JSON

Vercel caps environment variable values at **4 KB**. If your service account JSON is large (or you just want to be safe), encode it as base64 — the app handles both formats automatically.

**macOS / Linux:**
```bash
base64 -i path/to/service-account.json | tr -d '\n'
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\service-account.json"))
```

Paste the resulting string as the value of `GOOGLE_APPLICATION_CREDENTIALS_JSON`. If the raw JSON is under ~3 KB you can paste it directly (with the curly braces); the app tries raw JSON first, then falls back to base64.

---

### Step 3 — Deploy

Click **Deploy**. The build takes ~1–2 minutes.

Once live, the **six example molecules, all three evaluation panels, all eight Ask Why explanations, and the three starter chat prompts** work immediately with zero AI cost — served from the built-in cache. Any molecule a user types manually will call the live Vertex AI endpoints.

---

### Keeping costs low

- **Pause endpoints** in the Google Cloud console when not in use. The full demo experience remains functional for cached molecules even with paused endpoints.
- **Cache hit rate:** All primary demo interactions hit the cache. Only novel user-typed molecules reach the live endpoint.

---

### Troubleshooting

| Issue | Fix |
|---|---|
| Build fails with missing env vars | Ensure all 6 variables are set in Vercel before deploying |
| Predictions fail for new molecules | Check that the Vertex AI endpoints are unpaused and the service account has `roles/aiplatform.user` |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` parse error | Try the base64-encoded version |
| Hot-reload issues locally | Delete the `.next` directory and restart `pnpm dev` |
