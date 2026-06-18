// Lovable's Drug type — used by UI components
export type AppMode = "patient" | "research";

export interface Atom {
  id: number;
  element: string;
  x: number;
  y: number;
  z: number;
}

export interface Bond {
  atom1: number;
  atom2: number;
  order: number;
}

export interface SideEffect {
  name: string;
  tendency: "high" | "moderate" | "low";
  confidence: number;
  description: string;
}

export interface Drug {
  name: string;
  drugId: string;
  source: string;
  approvedUses: string[];
  smiles: string;
  inchiKey: string;
  atoms: Atom[];
  bonds: Bond[];
  sideEffects: SideEffect[];
}

// CPK color scheme
export const CPK_COLORS: Record<string, string> = {
  H: "#ffffff",
  C: "#909090",
  N: "#3050f8",
  O: "#ff0d0d",
  F: "#90e050",
  P: "#ff8000",
  S: "#ffff30",
  Cl: "#1ff01f",
  Br: "#a62929",
  I: "#940094",
};

export const ELEMENT_RADIUS: Record<string, number> = {
  H: 0.25,
  C: 0.38,
  N: 0.37,
  O: 0.36,
  F: 0.35,
  P: 0.55,
  S: 0.51,
  Cl: 0.49,
  Br: 0.57,
  I: 0.66,
};
