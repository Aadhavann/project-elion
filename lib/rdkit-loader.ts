/**
 * Lazy-loads RDKit.js WASM for client-side MOL→SMILES conversion.
 * Only loaded when the Ketcher dialog is opened.
 *
 * Uses the CDN-hosted version from unpkg to avoid bundling the ~5MB WASM file.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rdkitInstance: any = null;
let loadingPromise: Promise<unknown> | null = null;

const RDKIT_CDN = "https://unpkg.com/@rdkit/rdkit@2024.3.5-1.0.0/dist/RDKit_minimal.js";

export async function loadRDKit() {
  if (rdkitInstance) return rdkitInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("RDKit.js can only be loaded in the browser"));
      return;
    }

    // Check if already loaded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).initRDKitModule) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)
        .initRDKitModule()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((RDKit: any) => {
          rdkitInstance = RDKit;
          resolve(RDKit);
        })
        .catch(reject);
      return;
    }

    const script = document.createElement("script");
    script.src = RDKIT_CDN;
    script.async = true;

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).initRDKitModule) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any)
          .initRDKitModule()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then((RDKit: any) => {
            rdkitInstance = RDKit;
            resolve(RDKit);
          })
          .catch(reject);
      } else {
        reject(new Error("RDKit module not found after loading script"));
      }
    };

    script.onerror = () => {
      loadingPromise = null;
      reject(new Error("Failed to load RDKit.js from CDN"));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
}

/**
 * Convert a MOL/Molfile string to a canonical SMILES string.
 */
export async function molToSmiles(molfile: string): Promise<string> {
  const RDKit = await loadRDKit();
  const mol = RDKit.get_mol(molfile);
  if (!mol || !mol.is_valid()) {
    if (mol) mol.delete();
    throw new Error("Invalid MOL file - could not parse molecule");
  }
  const smiles = mol.get_smiles();
  mol.delete(); // free WASM memory
  return smiles;
}
