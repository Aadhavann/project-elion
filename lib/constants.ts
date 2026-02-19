import type { PropertyDefinition, EvalMode } from "./types";

export const PROPERTY_DEFINITIONS: PropertyDefinition[] = [
  {
    id: "bbb",
    name: "Blood-Brain Barrier Penetration",
    shortName: "BBB",
    category: "pharmacokinetics",
    type: "classification",
    description: "Whether the drug can cross the blood-brain barrier",
    labels: { A: "Does not cross", B: "Crosses BBB" },
  },
  {
    id: "caco2",
    name: "Caco-2 Permeability",
    shortName: "Caco-2",
    category: "pharmacokinetics",
    type: "regression",
    unit: "cm/s (log)",
    description: "Intestinal permeability measured via Caco-2 cell assay",
  },
  {
    id: "ppbr",
    name: "Plasma Protein Binding Rate",
    shortName: "PPBR",
    category: "pharmacokinetics",
    type: "regression",
    unit: "%",
    description: "Percentage of drug bound to plasma proteins",
  },
  {
    id: "logp",
    name: "Lipophilicity (logP)",
    shortName: "logP",
    category: "pharmacokinetics",
    type: "regression",
    unit: "",
    description: "Octanol-water partition coefficient measuring lipophilicity",
  },
  {
    id: "ames",
    name: "AMES Mutagenicity",
    shortName: "AMES",
    category: "toxicity",
    type: "classification",
    description: "Whether the drug is mutagenic in the Ames bacterial reverse mutation assay",
    labels: { A: "Not mutagenic", B: "Mutagenic" },
  },
  {
    id: "dili",
    name: "Drug-Induced Liver Injury",
    shortName: "DILI",
    category: "toxicity",
    type: "classification",
    description: "Risk of drug-induced hepatotoxicity",
    labels: { A: "No DILI risk", B: "DILI risk" },
  },
  {
    id: "herg",
    name: "hERG Channel Inhibition",
    shortName: "hERG",
    category: "toxicity",
    type: "classification",
    description: "Cardiotoxicity risk from hERG potassium channel blockade",
    labels: { A: "No inhibition", B: "Inhibits hERG" },
  },
  {
    id: "ld50",
    name: "Acute Toxicity (LD50)",
    shortName: "LD50",
    category: "toxicity",
    type: "regression",
    unit: "log(mg/kg)",
    description: "Lethal dose for 50% of test population",
  },
  {
    id: "ic50",
    name: "IC50 Binding Affinity",
    shortName: "IC50",
    category: "binding",
    type: "regression",
    unit: "nM (log)",
    description: "Half-maximal inhibitory concentration for target binding",
  },
  {
    id: "kd",
    name: "Dissociation Constant (Kd)",
    shortName: "Kd",
    category: "binding",
    type: "regression",
    unit: "nM (log)",
    description: "Equilibrium dissociation constant for drug-target binding",
  },
  {
    id: "clinical_phase1",
    name: "Phase 1 Trial Approval",
    shortName: "Phase 1",
    category: "clinical",
    type: "classification",
    description: "Predicted likelihood of passing Phase 1 clinical trial",
    labels: { A: "Fails", B: "Passes" },
  },
  {
    id: "clinical_phase2",
    name: "Phase 2 Trial Approval",
    shortName: "Phase 2",
    category: "clinical",
    type: "classification",
    description: "Predicted likelihood of passing Phase 2 clinical trial",
    labels: { A: "Fails", B: "Passes" },
  },
  {
    id: "clinical_phase3",
    name: "Phase 3 Trial Approval",
    shortName: "Phase 3",
    category: "clinical",
    type: "classification",
    description: "Predicted likelihood of passing Phase 3 clinical trial",
    labels: { A: "Fails", B: "Passes" },
  },
];

export const EVAL_MODE_PROPERTIES: Record<EvalMode, string[]> = {
  admet: ["bbb", "caco2", "ppbr", "logp", "ames", "dili", "herg", "ld50"],
  bbb: ["bbb", "logp", "caco2", "ppbr"],
  toxicity: ["ames", "dili", "herg", "ld50"],
  binding: ["ic50", "kd"],
  clinical: ["clinical_phase1", "clinical_phase2", "clinical_phase3"],
};

export const EVAL_MODE_LABELS: Record<EvalMode, string> = {
  admet: "General ADMET",
  bbb: "BBB Penetration",
  toxicity: "Toxicity Panel",
  binding: "Binding Affinity",
  clinical: "Clinical Trial",
};

export const SCAFFOLDS = [
  { name: "Benzene", smiles: "c1cc([R1])c([R2])cc1[R3]", rCount: 3 },
  { name: "Pyridine", smiles: "c1cc([R1])ncc1[R2]", rCount: 2 },
  { name: "Pyrimidine", smiles: "c1nc([R1])nc(c1)[R2]", rCount: 2 },
  { name: "Piperidine", smiles: "C1CC([R1])NCC1[R2]", rCount: 2 },
  { name: "Indole", smiles: "c1ccc2c(c1)[nH]c([R1])c2[R2]", rCount: 2 },
  { name: "Naphthalene", smiles: "c1cc2cc([R1])ccc2c([R2])c1", rCount: 2 },
  { name: "Thiophene", smiles: "c1cc([R1])sc1[R2]", rCount: 2 },
  { name: "Imidazole", smiles: "c1nc([R1])c[nH]1", rCount: 1 },
];

export const R_GROUPS = [
  { name: "H (none)", smiles: "[H]" },
  { name: "F", smiles: "F" },
  { name: "Cl", smiles: "Cl" },
  { name: "Br", smiles: "Br" },
  { name: "OH", smiles: "O" },
  { name: "NH2", smiles: "N" },
  { name: "CH3", smiles: "C" },
  { name: "CF3", smiles: "C(F)(F)F" },
  { name: "OCH3", smiles: "OC" },
  { name: "CN", smiles: "C#N" },
  { name: "NO2", smiles: "[N+](=O)[O-]" },
  { name: "COOH", smiles: "C(=O)O" },
  { name: "COMe", smiles: "C(=O)C" },
  { name: "SO2Me", smiles: "S(=O)(=O)C" },
  { name: "NHAc", smiles: "NC(=O)C" },
  { name: "tBu", smiles: "C(C)(C)C" },
  { name: "Phenyl", smiles: "c1ccccc1" },
];

export const EXAMPLE_MOLECULES = [
  { name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O" },
  { name: "Caffeine", smiles: "Cn1c(=O)c2c(ncn2C)n(c1=O)C" },
  { name: "Ibuprofen", smiles: "CC(C)Cc1ccc(cc1)[C@@H](C)C(=O)O" },
  { name: "Diazepam", smiles: "CN1C(=O)CN=C(c2ccccc21)c3ccccc3Cl" },
  { name: "Metformin", smiles: "CN(C)C(=N)NC(=N)N" },
  { name: "Penicillin G", smiles: "CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)Cc3ccccc3)C(=O)O)C" },
];

export function getPropertyById(id: string): PropertyDefinition | undefined {
  return PROPERTY_DEFINITIONS.find((p) => p.id === id);
}

export function getPropertiesForMode(mode: EvalMode): PropertyDefinition[] {
  const ids = EVAL_MODE_PROPERTIES[mode];
  return ids.map((id) => getPropertyById(id)).filter(Boolean) as PropertyDefinition[];
}
