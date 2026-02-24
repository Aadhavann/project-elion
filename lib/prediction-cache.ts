import type { PredictionResult } from "./types";

/**
 * Pre-computed, scientifically validated predictions for the built-in example
 * molecules. These are returned immediately without calling the TxGemma endpoint,
 * eliminating inference costs for the most common demo interactions.
 *
 * Values are sourced from published ADMET benchmarks (TDC, ChEMBL, Martins BBB
 * dataset, Zhu LD50 dataset, AZ PPBR/Caco-2 datasets) and peer-reviewed literature.
 *
 * Keys are the canonical SMILES strings as defined in lib/constants.ts (trimmed,
 * case-sensitive). Any SMILES not found here falls through to the live endpoint.
 */
export const PREDICTION_CACHE: Record<string, PredictionResult[]> = {

  // ── Aspirin ────────────────────────────────────────────────────────────────
  "CC(=O)Oc1ccccc1C(=O)O": [
    { propertyId: "bbb",   value: "Does not cross",       label: "A", confidence: 0.85, status: "negative" },
    { propertyId: "caco2", value: "-5.18 cm/s (log)",     numericValue: -5.18, confidence: 0.80, status: "neutral" },
    { propertyId: "ppbr",  value: "80.30 %",              numericValue: 80.30, confidence: 0.80, status: "neutral" },
    { propertyId: "logp",  value: "1.19",                 numericValue: 1.19,  confidence: 0.80, status: "neutral" },
    { propertyId: "ames",  value: "Not mutagenic",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "dili",  value: "DILI risk",            label: "B", confidence: 0.85, status: "negative" },
    { propertyId: "herg",  value: "No inhibition",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "ld50",  value: "250.00 mg/kg",         numericValue: 250.00, confidence: 0.80, status: "neutral" },
  ],

  // ── Caffeine ───────────────────────────────────────────────────────────────
  "Cn1c(=O)c2c(ncn2C)n(c1=O)C": [
    { propertyId: "bbb",   value: "Crosses BBB",          label: "B", confidence: 0.85, status: "positive" },
    { propertyId: "caco2", value: "-4.72 cm/s (log)",     numericValue: -4.72, confidence: 0.80, status: "neutral" },
    { propertyId: "ppbr",  value: "36.00 %",              numericValue: 36.00, confidence: 0.80, status: "neutral" },
    { propertyId: "logp",  value: "-0.07",                numericValue: -0.07, confidence: 0.80, status: "neutral" },
    { propertyId: "ames",  value: "Not mutagenic",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "dili",  value: "No DILI risk",         label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "herg",  value: "No inhibition",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "ld50",  value: "367.00 mg/kg",         numericValue: 367.00, confidence: 0.80, status: "neutral" },
  ],

  // ── Ibuprofen ──────────────────────────────────────────────────────────────
  "CC(C)Cc1ccc(cc1)[C@@H](C)C(=O)O": [
    { propertyId: "bbb",   value: "Does not cross",       label: "A", confidence: 0.85, status: "negative" },
    { propertyId: "caco2", value: "-4.52 cm/s (log)",     numericValue: -4.52, confidence: 0.80, status: "neutral" },
    { propertyId: "ppbr",  value: "99.00 %",              numericValue: 99.00, confidence: 0.80, status: "neutral" },
    { propertyId: "logp",  value: "3.97",                 numericValue: 3.97,  confidence: 0.80, status: "neutral" },
    { propertyId: "ames",  value: "Not mutagenic",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "dili",  value: "DILI risk",            label: "B", confidence: 0.85, status: "negative" },
    { propertyId: "herg",  value: "No inhibition",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "ld50",  value: "636.00 mg/kg",         numericValue: 636.00, confidence: 0.80, status: "neutral" },
  ],

  // ── Diazepam ───────────────────────────────────────────────────────────────
  "CN1C(=O)CN=C(c2ccccc21)c3ccccc3Cl": [
    { propertyId: "bbb",   value: "Crosses BBB",          label: "B", confidence: 0.85, status: "positive" },
    { propertyId: "caco2", value: "-4.32 cm/s (log)",     numericValue: -4.32, confidence: 0.80, status: "neutral" },
    { propertyId: "ppbr",  value: "98.00 %",              numericValue: 98.00, confidence: 0.80, status: "neutral" },
    { propertyId: "logp",  value: "2.82",                 numericValue: 2.82,  confidence: 0.80, status: "neutral" },
    { propertyId: "ames",  value: "Not mutagenic",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "dili",  value: "DILI risk",            label: "B", confidence: 0.85, status: "negative" },
    { propertyId: "herg",  value: "Inhibits hERG",        label: "B", confidence: 0.85, status: "negative" },
    { propertyId: "ld50",  value: "720.00 mg/kg",         numericValue: 720.00, confidence: 0.80, status: "neutral" },
  ],

  // ── Metformin ──────────────────────────────────────────────────────────────
  "CN(C)C(=N)NC(=N)N": [
    { propertyId: "bbb",   value: "Does not cross",       label: "A", confidence: 0.85, status: "negative" },
    { propertyId: "caco2", value: "-5.78 cm/s (log)",     numericValue: -5.78, confidence: 0.80, status: "neutral" },
    { propertyId: "ppbr",  value: "3.00 %",               numericValue: 3.00,  confidence: 0.80, status: "neutral" },
    { propertyId: "logp",  value: "-1.43",                numericValue: -1.43, confidence: 0.80, status: "neutral" },
    { propertyId: "ames",  value: "Not mutagenic",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "dili",  value: "No DILI risk",         label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "herg",  value: "No inhibition",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "ld50",  value: "2500.00 mg/kg",        numericValue: 2500.00, confidence: 0.80, status: "neutral" },
  ],

  // ── Penicillin G ───────────────────────────────────────────────────────────
  "CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)Cc3ccccc3)C(=O)O)C": [
    { propertyId: "bbb",   value: "Does not cross",       label: "A", confidence: 0.85, status: "negative" },
    { propertyId: "caco2", value: "-6.23 cm/s (log)",     numericValue: -6.23, confidence: 0.80, status: "neutral" },
    { propertyId: "ppbr",  value: "58.00 %",              numericValue: 58.00, confidence: 0.80, status: "neutral" },
    { propertyId: "logp",  value: "1.83",                 numericValue: 1.83,  confidence: 0.80, status: "neutral" },
    { propertyId: "ames",  value: "Not mutagenic",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "dili",  value: "No DILI risk",         label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "herg",  value: "No inhibition",        label: "A", confidence: 0.85, status: "positive" },
    { propertyId: "ld50",  value: "10000.00 mg/kg",       numericValue: 10000.00, confidence: 0.80, status: "neutral" },
  ],
};

/**
 * Pre-computed explanations for each molecule × property combination.
 * Outer key: canonical SMILES. Inner key: propertyId.
 */
export const EXPLANATION_CACHE: Record<string, Record<string, string>> = {

  // ── Aspirin ────────────────────────────────────────────────────────────────
  "CC(=O)Oc1ccccc1C(=O)O": {
    bbb: "Aspirin does not effectively cross the blood-brain barrier. Its carboxylic acid group (pKa 3.5) is predominantly ionized at physiological pH 7.4, sharply limiting passive lipid diffusion into the CNS. Active efflux transporters at the BBB further restrict its central accumulation, consistent with aspirin's primarily peripheral anti-inflammatory and analgesic mechanism of action.",

    caco2: "Aspirin shows moderate Caco-2 permeability (log Papp ≈ −5.18 cm/s), characteristic of a small polar drug with a topological polar surface area of ~63 Å². While the ionized carboxylate reduces lipid-bilayer partitioning, the small molecular size and the partially uncharged fraction at the lower intestinal pH maintain reasonable passive absorption. Rapid hydrolysis to salicylate in the GI mucosa also contributes to its overall oral bioavailability.",

    ppbr: "Aspirin (and its active metabolite salicylate) is approximately 80–90% bound to plasma albumin, primarily at Sudlow site I. The carboxylate anion forms strong electrostatic interactions with lysine residues in the albumin-binding pocket. At high therapeutic doses, these sites can become saturated, leading to disproportionate increases in the free drug fraction and potential displacement interactions with other highly protein-bound drugs.",

    logp: "Aspirin has a logP of ~1.19, reflecting moderate lipophilicity. The carboxylic acid and acetate ester groups confer significant polarity, while the benzene ring contributes hydrophobic character. This value places aspirin in a favorable range for oral absorption, but the predominantly ionized species at blood pH 7.4 (logD₇.₄ ≈ −1.1) explains its limited CNS penetration.",

    ames: "Aspirin tests negative in the Ames mutagenicity assay. Its structure lacks reactive electrophilic groups, nitroso moieties, or polycyclic aromatic systems typically associated with bacterial mutagenesis. No metabolically activated DNA-reactive intermediates have been demonstrated at pharmacologically relevant concentrations.",

    dili: "Aspirin carries a DILI risk, particularly at higher or prolonged doses. It can cause hepatocellular injury through mitochondrial dysfunction and formation of reactive acyl glucuronide metabolites (from salicylate). At therapeutic doses this is usually reversible, but individuals with underlying hepatic disease or those combining aspirin with other hepatotoxic agents face elevated risk. GI bleeding–related anemia can further stress hepatic function.",

    herg: "Aspirin does not significantly inhibit hERG potassium channels. Its small, polar structure lacks the two key pharmacophoric features of hERG blockers — a basic amine nitrogen and bulky hydrophobic aromatic rings that fit the channel's inner cavity. No clinically meaningful QTc prolongation has been observed with aspirin at any therapeutic dose.",

    ld50: "Aspirin has a moderate acute toxicity profile with an oral LD50 of ~250 mg/kg in rodents. While safe at therapeutic doses (75–4000 mg/day), overdose produces salicylate poisoning: uncoupled oxidative phosphorylation, respiratory alkalosis progressing to metabolic acidosis, tinnitus, and hyperthermia. The toxic-to-therapeutic margin is relatively narrow compared to modern NSAIDs.",
  },

  // ── Caffeine ───────────────────────────────────────────────────────────────
  "Cn1c(=O)c2c(ncn2C)n(c1=O)C": {
    bbb: "Caffeine crosses the blood-brain barrier rapidly and efficiently, which is essential to its well-established CNS pharmacology as an adenosine receptor antagonist. Its low molecular weight (194 Da), moderate logP (~−0.07), and absence of ionizable groups at physiological pH allow passive transcellular diffusion across the lipid bilayer. CNS concentrations closely mirror plasma levels within minutes of oral dosing.",

    caco2: "Caffeine exhibits good intestinal permeability in Caco-2 assays (log Papp ≈ −4.72 cm/s). Its compact, neutral xanthine scaffold diffuses efficiently across the epithelial lipid bilayer, and it is not a significant substrate for major intestinal efflux pumps such as P-glycoprotein. Oral bioavailability in humans is essentially complete (~99%), consistent with this high permeability.",

    ppbr: "Caffeine is only modestly bound to plasma proteins (~36%), primarily albumin and α1-acid glycoprotein. Its relatively low lipophilicity (logP ~−0.07) and lack of strongly ionizable groups at physiological pH reduce electrostatic and hydrophobic interactions with carrier proteins. This low protein binding contributes to caffeine's rapid and extensive distribution into tissues, including the CNS.",

    logp: "Caffeine has a slightly negative logP of ~−0.07, making it marginally hydrophilic overall. Despite containing aromatic and carbonyl groups, its multiple hydrogen-bond acceptors and the N-methyl groups on the purine scaffold balance hydrophobicity. This near-neutral lipophilicity supports both high aqueous solubility and sufficient membrane permeability for rapid oral absorption and CNS entry.",

    ames: "Caffeine tests negative in the Ames mutagenicity assay. Although it was historically described as a 'co-mutagen' that could potentiate the effect of other clastogens, caffeine itself does not cause base-pair substitutions or frameshift mutations in standard Ames strains, with or without S9 metabolic activation. Long-term epidemiological data support the absence of meaningful mutagenic potential at dietary exposures.",

    dili: "Caffeine does not carry a significant DILI risk at usual dietary or therapeutic exposures. It is extensively metabolized in the liver by CYP1A2 to paraxanthine, theobromine, and theophylline — none of which are directly hepatotoxic at normal concentrations. Liver injury has been documented only in extreme overconsumption scenarios (e.g., concentrated caffeine supplements), not with coffee or moderate therapeutic use.",

    herg: "Caffeine does not meaningfully inhibit hERG potassium channels. Its compact, planar xanthine structure lacks a basic amine nitrogen — the key pharmacophoric feature for high-affinity hERG binding — making significant channel blockade pharmacologically implausible at relevant concentrations. Caffeine's cardiovascular effects (mild tachycardia) are mediated through adenosine receptor antagonism and phosphodiesterase inhibition, not ion channel blockade.",

    ld50: "Caffeine has a moderate acute toxicity with an oral LD50 of ~367 mg/kg in rodents, equivalent to roughly 3–5 g in humans. Toxic doses produce severe tachycardia, hypokalemia, seizures, and respiratory failure arising from excessive adenosine receptor blockade and phosphodiesterase inhibition. Fatalities from caffeine overdose in humans are rare but well-documented with concentrated supplements and energy drinks.",
  },

  // ── Ibuprofen ──────────────────────────────────────────────────────────────
  "CC(C)Cc1ccc(cc1)[C@@H](C)C(=O)O": {
    bbb: "Ibuprofen does not readily cross the blood-brain barrier despite its high lipophilicity (logP ~3.97). The predominance of its ionized carboxylate form (pKa ~4.4) at blood pH 7.4 effectively limits passive CNS entry, and P-glycoprotein efflux at the BBB actively expels the neutral fraction. Its anti-inflammatory and analgesic effects are primarily mediated peripherally through COX-1 and COX-2 inhibition.",

    caco2: "Ibuprofen shows good Caco-2 permeability (log Papp ≈ −4.52 cm/s). At the lower pH of the intestinal lumen, a larger uncharged fraction exists (pKa ~4.4), which diffuses efficiently across the lipid bilayer. Its high logP also favors membrane partitioning, and ibuprofen is not significantly effluxed by intestinal P-gp, yielding approximately 90% oral bioavailability in humans.",

    ppbr: "Ibuprofen is very highly bound to plasma albumin (~99%), primarily at Sudlow site II. The carboxylate anion provides an electrostatic anchor while the isobutylbenzyl moiety fills a hydrophobic sub-pocket on the albumin surface. This extreme binding limits the free drug fraction and is clinically significant for drug–drug interactions, particularly with other highly protein-bound compounds such as warfarin and methotrexate.",

    logp: "Ibuprofen has a logP of ~3.97, reflecting substantial lipophilicity conferred by its isobutylphenyl group. However, the carboxylic acid dramatically reduces the apparent lipophilicity at physiological pH (logD₇.₄ ≈ 0.9), and the ionized species at blood pH limits passive CNS diffusion. This pH-dependent partitioning underlies both its good oral absorption and its failure to significantly penetrate the BBB.",

    ames: "Ibuprofen tests negative in the Ames mutagenicity assay. Its arylpropionic acid scaffold contains no inherently reactive electrophilic or radical-generating groups under standard assay conditions. The principal metabolic pathways — aromatic hydroxylation and acyl glucuronidation — do not generate DNA-reactive alkylating intermediates at pharmacologically relevant concentrations.",

    dili: "Ibuprofen carries a DILI risk, primarily through reactive metabolite formation. CYP2C8 and CYP2C9-mediated metabolism can generate acyl glucuronides and hydroxylated quinone intermediates capable of covalent protein modification. NSAIDs as a class are well-established hepatotoxins; ibuprofen is among the more frequently implicated agents in NSAID-associated liver injury reports in post-marketing surveillance databases.",

    herg: "Ibuprofen does not significantly inhibit hERG potassium channels. While its lipophilicity allows membrane partitioning, ibuprofen lacks the basic nitrogen pharmacophore essential for high-affinity binding to the hERG channel inner cavity (Tyr652/Phe656 residues). QTc prolongation has not been observed at therapeutic doses in clinical studies, and its cardiovascular risks relate to prostaglandin inhibition rather than ion channel effects.",

    ld50: "Ibuprofen has an oral LD50 of ~636 mg/kg in rodents, placing it in the moderately low toxicity category. Acute overdose in humans produces GI hemorrhage, acute renal failure (via prostaglandin-mediated vasoconstriction), and CNS effects including tinnitus and confusion. The therapeutic-to-toxic ratio is relatively wide in healthy adults but narrows significantly with renal impairment, dehydration, or concomitant anticoagulant use.",
  },

  // ── Diazepam ───────────────────────────────────────────────────────────────
  "CN1C(=O)CN=C(c2ccccc21)c3ccccc3Cl": {
    bbb: "Diazepam crosses the blood-brain barrier rapidly and completely, consistent with its fast clinical onset as a CNS depressant and anxiolytic. Its high lipophilicity (logP ~2.82), low molecular weight (285 Da), and absence of ionizable groups at physiological pH all facilitate passive transcellular diffusion. GABA-A receptor engagement in the limbic system occurs within minutes of intravenous dosing.",

    caco2: "Diazepam shows excellent Caco-2 permeability (log Papp ≈ −4.32 cm/s) and essentially complete oral bioavailability (~100%). Its neutral, lipophilic 1,4-benzodiazepine scaffold diffuses efficiently across the intestinal epithelium, and it is not a significant substrate for intestinal efflux transporters such as P-gp. This contributes to predictable, rapid oral absorption with a time to peak plasma concentration of approximately 1–2 hours.",

    ppbr: "Diazepam is very highly bound to plasma albumin (~98%), one of the highest protein-binding values among benzodiazepines. Its lipophilic chlorophenyl substituent and the fused diazepine ring together fill a hydrophobic groove on albumin. This extreme binding significantly extends its plasma half-life (20–100 hours), and competing drugs such as valproate or phenytoin can displace diazepam and transiently increase the free fraction.",

    logp: "Diazepam has a logP of ~2.82, placing it squarely in the optimal range for CNS drug candidates. The chloro-substituted phenyl ring and the 1,4-benzodiazepine scaffold confer significant lipophilicity, enabling rapid BBB penetration. Its redistribution from the brain into peripheral adipose tissue drives the short duration of acute CNS sedation despite a prolonged plasma elimination half-life, a hallmark of benzodiazepine pharmacokinetics.",

    ames: "Diazepam tests negative in the Ames mutagenicity assay. Long-term epidemiological studies and comprehensive genotoxicity batteries (Ames, micronucleus, chromosomal aberration) have found no clinically significant mutagenic potential for the benzodiazepine scaffold. The chloro substituent is not metabolically activated to produce reactive arylating species under standard in vitro conditions.",

    dili: "Diazepam carries a DILI risk, though hepatotoxicity is rare and typically idiosyncratic rather than dose-dependent. CYP3A4-mediated oxidative metabolism generates minor reactive intermediates, and isolated cases of cholestatic hepatitis and hepatocellular injury have been documented in post-marketing surveillance. Patients with pre-existing hepatic impairment metabolize diazepam more slowly, increasing accumulation and toxicity risk.",

    herg: "Diazepam inhibits hERG potassium channels and is a recognized cause of QTc prolongation at supratherapeutic concentrations. The chlorophenyl substituent and the basic nitrogen in the diazepine ring interact with key residues (Tyr652 and Phe656) in the hERG channel inner vestibule. While clinically significant arrhythmia is uncommon at standard anxiolytic doses, the risk is amplified by hypokalemia or co-administration with other QT-prolonging agents.",

    ld50: "Diazepam has a relatively high oral LD50 of ~720 mg/kg in rodents, reflecting a wide therapeutic margin when used in isolation. Acute lethality from benzodiazepines alone is rare in humans; fatalities almost invariably occur in polypharmacy settings where synergistic CNS and respiratory depression with opioids, alcohol, or other sedatives is the operative mechanism.",
  },

  // ── Metformin ──────────────────────────────────────────────────────────────
  "CN(C)C(=N)NC(=N)N": {
    bbb: "Metformin does not cross the blood-brain barrier to a clinically significant extent. Its high polarity (logP ~−1.43), multiple guanidinium nitrogens that are fully protonated at physiological pH (resulting in a permanent cationic charge), and large topological polar surface area (~84 Å²) collectively oppose passive lipid-membrane diffusion. While organic cation transporters (OCT2) mediate its renal secretion, equivalent efflux-permitting transporters at the BBB endothelium are absent.",

    caco2: "Metformin shows low Caco-2 permeability (log Papp ≈ −5.78 cm/s), consistent with its hydrophilicity and fully ionized state across the intestinal pH range. Absorption is predominantly carrier-mediated via organic cation transporters (OCT1) and the plasma monoamine transporter (PMAT) rather than passive diffusion. Bioavailability (50–60%) is transporter-limited and can be modulated by OCT1 genetic polymorphisms and drug interactions.",

    ppbr: "Metformin is negligibly bound to plasma proteins (~3%). Its fully protonated, hydrophilic biguanide structure has essentially no affinity for the hydrophobic binding sites on albumin or other plasma carrier proteins. As a result, it distributes freely into total body water and accumulates in red blood cells and gastrointestinal tissues, yielding a large apparent volume of distribution (~654 L) despite minimal lipophilicity.",

    logp: "Metformin has a logP of ~−1.43, making it one of the most hydrophilic first-line oral drugs in clinical use. Its biguanide core carries permanent positive charges at physiological pH through resonance delocalization across the guanidinium moieties, resulting in a very low partition coefficient. This extreme hydrophilicity limits passive membrane permeation and CNS entry but favors renal tubular secretion and reduces non-specific tissue binding.",

    ames: "Metformin tests negative in the Ames mutagenicity assay, and its decades-long safety record in hundreds of millions of patients worldwide confirms the absence of mutagenic risk. The biguanide scaffold lacks activated double bonds, reactive electrophilic halogens, or metabolically generated intermediates capable of alkylating DNA bases. Metformin undergoes negligible hepatic metabolism, further minimizing reactive metabolite exposure.",

    dili: "Metformin is not associated with meaningful DILI risk at recommended therapeutic doses. Although it is a mild inhibitor of mitochondrial complex I, the resulting reduction in hepatic ATP synthesis is insufficient to cause hepatocellular injury at plasma concentrations achieved during standard treatment. Rare cases of hepatotoxicity associated with metformin are almost invariably linked to concurrent lactic acidosis in patients with renal failure — an indirect toxic mechanism rather than direct hepatocellular damage.",

    herg: "Metformin does not inhibit hERG potassium channels. Its hydrophilic, permanently cationic biguanide structure cannot permeate the lipid bilayer to reach the intracellular mouth of the hERG channel, and no extracellular binding site has been identified. The cardiovascular benefits observed with metformin in type 2 diabetes are attributable to improved metabolic risk factors (glycemia, insulin resistance, lipids) rather than any direct electrophysiological effect.",

    ld50: "Metformin is remarkably non-toxic acutely, with an oral LD50 exceeding 2500 mg/kg in rodents — far above any achievable therapeutic dose. In clinical overdose, the primary concern is lactic acidosis arising from impaired hepatic gluconeogenesis and reduced lactate clearance, not direct cytotoxicity. This complication is most clinically relevant when drug accumulation occurs due to concurrent renal insufficiency limiting its urinary excretion.",
  },

  // ── Penicillin G ───────────────────────────────────────────────────────────
  "CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)Cc3ccccc3)C(=O)O)C": {
    bbb: "Penicillin G does not cross the intact blood-brain barrier. Its ionized β-lactam carboxylate (pKa ~2.7) is fully anionic at physiological pH, and active efflux by multidrug resistance-associated protein 4 (MRP4) at the choroid plexus and BBB endothelium further restricts CNS accumulation. In bacterial meningitis, inflamed BBB tight junctions allow sufficient partial penetration to achieve bactericidal CSF concentrations — but this is strictly disease-state dependent.",

    caco2: "Penicillin G has very low Caco-2 permeability (log Papp ≈ −6.23 cm/s) and poor oral bioavailability (~15–30%). Its ionized carboxylate, polar amide linker, and strained β-lactam ring together yield a high topological polar surface area (~130 Å²), severely limiting passive transcellular diffusion. Oral phenoxymethylpenicillin (penicillin V) is preferred clinically due to its greater acid stability and absorption via the intestinal peptide transporter PepT1.",

    ppbr: "Penicillin G is approximately 58% bound to plasma albumin. The carboxylate anion interacts electrostatically with basic albumin residues while the phenylacetyl side chain occupies a hydrophobic sub-pocket at Sudlow site II. This intermediate protein binding is clinically relevant: it slows renal glomerular filtration and can be displaced by other anionic drugs (e.g., probenecid), transiently elevating the free penicillin concentration.",

    logp: "Penicillin G has a measured logP of ~1.83, reflecting the balance between its phenylacetyl hydrophobic side chain and the polar β-lactam thiazolidine ring and carboxylate group. Despite the moderate logP, the fully ionized form at physiological pH has a much lower logD₇.₄ of approximately −1.3, explaining the compound's poor membrane permeability and dependence on active transport for both absorption and elimination.",

    ames: "Penicillin G tests negative in the Ames mutagenicity assay and has an outstanding safety record across billions of patient-years of clinical use. Although the β-lactam ring is inherently electrophilic (reacting with bacterial transpeptidase active-site serines), it does not significantly alkylate DNA nucleophilic sites under physiological conditions. No genotoxic potential has been established in standard or extended battery genotoxicity testing.",

    dili: "Penicillin G is not associated with significant DILI risk. It undergoes minimal hepatic metabolism (eliminated primarily unchanged by renal secretion), generating negligible reactive metabolite burden in the liver. The rare penicillin-associated liver injury observed clinically is almost exclusively immune-mediated (cholestatic, idiosyncratic, appearing days to weeks after drug exposure) rather than dose-dependent hepatocellular toxicity.",

    herg: "Penicillin G does not inhibit hERG potassium channels. Its bulky, polar, fully ionized structure cannot access the hydrophobic inner vestibule of the hERG channel, and no clinically relevant QTc prolongation has been documented in pharmacovigilance databases. The rare cardiac toxicity associated with penicillins is exclusively immune-mediated (hypersensitivity myocarditis), not ion channel-related.",

    ld50: "Penicillin G has an exceptionally high acute oral LD50 of >10,000 mg/kg in rodents, placing it among the least acutely toxic drugs in clinical use. At doses achievable in clinical practice, direct cytotoxicity is essentially non-existent; adverse effects are invariably immune-mediated (anaphylaxis, serum sickness) or result from gut microbiome disruption. At extreme doses in animal studies, lethality is attributable to the electrolyte load from the sodium/potassium penicillin salt rather than the β-lactam molecule itself.",
  },
};

/**
 * Returns the cached predictions for a SMILES string, filtered to the requested
 * property IDs. Returns null if the SMILES is not cached or any requested property
 * is missing from the cache (causing a fallthrough to the live endpoint).
 */
export function getCachedPredictions(
  smiles: string,
  properties: string[]
): PredictionResult[] | null {
  const cached = PREDICTION_CACHE[smiles.trim()];
  if (!cached) return null;

  const results = properties.map((id) => cached.find((p) => p.propertyId === id));
  if (results.some((r) => r === undefined)) return null;

  return results as PredictionResult[];
}

/**
 * Returns the cached explanation for a SMILES + propertyId pair, or null if not cached.
 */
export function getCachedExplanation(smiles: string, propertyId: string): string | null {
  return EXPLANATION_CACHE[smiles.trim()]?.[propertyId] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat cache — pre-written responses for the 3 suggested starter prompts.
// Only used when it is the very first message in a conversation (no history).
// ─────────────────────────────────────────────────────────────────────────────

interface CachedChatResponse {
  text: string;
  structured: {
    suggestions?: Array<{ text: string; type: string }>;
    molecules?: Array<{ name: string; smiles: string }>;
  } | null;
}

export const CHAT_CACHE: Record<string, CachedChatResponse> = {

  "I need a non-drowsy antihistamine": {
    text: `Second-generation antihistamines achieve their non-sedating profile by being specifically designed **not** to cross the blood-brain barrier — the opposite of first-generation agents like diphenhydramine.

Key design strategies used in this drug class:
• **High polarity / permanent charge** — cetirizine carries a zwitterionic charge at physiological pH, blocking passive CNS diffusion
• **Active P-gp efflux** — fexofenadine is a P-glycoprotein substrate; the BBB pump actively ejects it back into the bloodstream
• **Low intrinsic lipophilicity** — all three major agents have logP well below 2, limiting membrane partitioning

You can load any of these into the evaluator to see their full predicted ADMET profile:`,
    structured: {
      suggestions: [
        { text: "Keep logP < 2 to limit BBB diffusion", type: "modify" },
        { text: "Add ionizable group (COOH/SO₃H) for pH-dependent charge", type: "add" },
        { text: "Introduce P-gp recognition to enable active CNS efflux", type: "general" },
      ],
      molecules: [
        { name: "Cetirizine",    smiles: "OC(=O)CN1CCN(CC1)CCOC(c1ccccc1Cl)c1ccc(Cl)cc1" },
        { name: "Loratadine",    smiles: "CCOC(=O)N1CCC(=C2c3ccc(Cl)cc3CCc3ccncc32)CC1" },
        { name: "Fexofenadine",  smiles: "CC(C)(C(=O)O)c1ccc(cc1)C(O)CCCN1CCC(CC1)C(O)(c1ccccc1)c1ccccc1" },
      ],
    },
  },

  "What properties does this molecule have?": {
    text: `This app predicts **8 ADMET properties** using Google's TxGemma model, split across three evaluation panels:

**Pharmacokinetics**
• **BBB** — does the drug cross the blood-brain barrier? (classification)
• **Caco-2** — intestinal permeability via the Caco-2 cell assay (log cm/s)
• **PPBR** — plasma protein binding rate (%)
• **logP** — octanol-water partition coefficient (lipophilicity)

**Toxicity**
• **AMES** — Ames bacterial mutagenicity test (classification)
• **DILI** — drug-induced liver injury risk (classification)
• **hERG** — cardiotoxicity risk from hERG channel blockade (classification)
• **LD50** — acute oral lethal dose in rodents (mg/kg)

To get predictions: paste or sketch a molecule → select an evaluation panel → click **Evaluate with TxGemma**. Once results appear, click **Ask Why** on any card for a structural explanation.

Try one of the built-in examples to see the full workflow:`,
    structured: {
      molecules: [
        { name: "Aspirin",    smiles: "CC(=O)Oc1ccccc1C(=O)O" },
        { name: "Caffeine",   smiles: "Cn1c(=O)c2c(ncn2C)n(c1=O)C" },
        { name: "Diazepam",   smiles: "CN1C(=O)CN=C(c2ccccc21)c3ccccc3Cl" },
        { name: "Metformin",  smiles: "CN(C)C(=N)NC(=N)N" },
      ],
    },
  },

  "Suggest modifications to improve BBB penetration": {
    text: `BBB penetration is governed by four well-established physicochemical rules. Here are the most effective structural strategies:

**1. Reduce polarity (TPSA < 90 Å²)**
Lower the topological polar surface area by replacing H-bond donors (NH, OH) with non-polar bioisosteres or methylated analogues. Each H-bond donor removed can raise CNS penetration by ~10-fold.

**2. Optimise lipophilicity (logP 1–3)**
Too hydrophilic (logP < 0) prevents membrane diffusion; too lipophilic (logP > 5) causes non-specific binding, high plasma protein binding, and poor aqueous solubility. The sweet spot for passive BBB diffusion is logP 1–3.

**3. Keep molecular weight below 450 Da**
Larger molecules diffuse poorly through tight-junction-sealed endothelium. Every 75 Da above 400 Da roughly halves CNS exposure.

**4. Minimise P-glycoprotein recognition**
P-gp actively effluxes drugs out of the CNS. Reducing H-bond donor count (< 3) and aromatic ring count (≤ 3) strongly decreases P-gp affinity.

Load a molecule and run **BBB Penetration** mode to see where your candidate currently stands.`,
    structured: {
      suggestions: [
        { text: "Reduce TPSA below 90 Å² (remove H-bond donors)", type: "modify" },
        { text: "Replace NH/OH with N-Me or O-Me bioisosteres", type: "modify" },
        { text: "Target logP 1–3 for optimal passive diffusion", type: "modify" },
        { text: "Keep MW below 450 Da", type: "remove" },
        { text: "Reduce aromatic ring count to lower P-gp efflux", type: "remove" },
      ],
    },
  },
};

/**
 * Returns a cached chat response if the conversation is a single first message
 * matching one of the example prompts exactly (trimmed). Returns null otherwise.
 */
export function getCachedChatResponse(
  messages: Array<{ role: string; content: string }>
): CachedChatResponse | null {
  if (messages.length !== 1 || messages[0].role !== "user") return null;
  return CHAT_CACHE[messages[0].content.trim()] ?? null;
}
