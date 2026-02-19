/**
 * SMILES validation and utility functions.
 * Basic client-side validation (not a full parser).
 */

const VALID_ATOMS = /^[A-Z][a-z]?$/;
const SMILES_CHARS = /^[A-Za-z0-9@+\-\[\]\(\)\\\/=#%\.\*:~{}|,;]+$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateSmiles(smiles: string): ValidationResult {
  if (!smiles || smiles.trim().length === 0) {
    return { valid: false, error: "SMILES string is empty" };
  }

  const trimmed = smiles.trim();

  if (!SMILES_CHARS.test(trimmed)) {
    return { valid: false, error: "Contains invalid characters" };
  }

  // Check balanced parentheses
  let parenCount = 0;
  for (const ch of trimmed) {
    if (ch === "(") parenCount++;
    if (ch === ")") parenCount--;
    if (parenCount < 0) {
      return { valid: false, error: "Unbalanced parentheses" };
    }
  }
  if (parenCount !== 0) {
    return { valid: false, error: "Unbalanced parentheses" };
  }

  // Check balanced brackets
  let bracketCount = 0;
  for (const ch of trimmed) {
    if (ch === "[") bracketCount++;
    if (ch === "]") bracketCount--;
    if (bracketCount < 0) {
      return { valid: false, error: "Unbalanced brackets" };
    }
  }
  if (bracketCount !== 0) {
    return { valid: false, error: "Unbalanced brackets" };
  }

  // Check ring closure digits are paired
  const ringDigits: Set<string> = new Set();
  const matched: Set<string> = new Set();
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "%" && i + 2 < trimmed.length) {
      const ring = trimmed.substring(i, i + 3);
      if (ringDigits.has(ring)) {
        ringDigits.delete(ring);
        matched.add(ring);
      } else {
        ringDigits.add(ring);
      }
      i += 2;
    } else if (/[0-9]/.test(ch) && (i === 0 || !/[0-9]/.test(trimmed[i - 1]) || trimmed[i - 1] === "%")) {
      if (ringDigits.has(ch)) {
        ringDigits.delete(ch);
        matched.add(ch);
      } else {
        ringDigits.add(ch);
      }
    }
  }

  if (trimmed.length < 1) {
    return { valid: false, error: "SMILES too short" };
  }

  return { valid: true };
}

/**
 * Generate SMILES from scaffold template + R-groups.
 */
export function generateSmilesFromScaffold(
  scaffoldSmiles: string,
  rGroups: Record<string, string>
): string {
  let result = scaffoldSmiles;
  for (const [key, value] of Object.entries(rGroups)) {
    const placeholder = `[${key}]`;
    if (value === "[H]") {
      // Replace [Rn] with nothing (hydrogen)
      result = result.replace(placeholder, "");
    } else {
      result = result.replace(placeholder, `(${value})`);
    }
  }
  return result;
}

/**
 * Generate combinatorial library from scaffold + R-group selections.
 */
export function generateLibrary(
  scaffoldSmiles: string,
  rGroupOptions: Record<string, string[]>
): Array<{ smiles: string; rGroups: Record<string, string> }> {
  const keys = Object.keys(rGroupOptions);
  const results: Array<{ smiles: string; rGroups: Record<string, string> }> = [];

  function recurse(index: number, current: Record<string, string>) {
    if (index === keys.length) {
      const smiles = generateSmilesFromScaffold(scaffoldSmiles, current);
      results.push({ smiles, rGroups: { ...current } });
      return;
    }
    const key = keys[index];
    for (const value of rGroupOptions[key]) {
      current[key] = value;
      recurse(index + 1, current);
    }
  }

  recurse(0, {});
  return results;
}
