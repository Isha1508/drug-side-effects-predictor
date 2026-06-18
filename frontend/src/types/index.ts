export interface DrugInfo {
  drug_id: string;
  standard_name: string;
  approved_uses: Array<{
    indication: string;
    source?: string;
    note?: string;
  }>;
  metadata: {
    molecular_formula?: string;
    molecular_weight?: number;
    source: string;
    is_generic?: boolean;
  };
  disclaimer?: string;
  error?: string;
}

export interface MolecularStructure {
  drug_id?: string;
  smiles: string;
  inchi?: string;
  inchi_key?: string;
  source?: string;
  '2d_svg'?: string;
  '3d_coordinates'?: {
    atoms: Array<{
      element: string;
      x: number;
      y: number;
      z: number;
      index: number;
    }>;
    bonds: Array<{
      begin: number;
      end: number;
      order: number | string;
    }>;
  };
  error?: string;
}

export interface SideEffectPrediction {
  side_effect: string;
  tendency?: 'low' | 'moderate' | 'high';
  confidence_score?: number;
  category?: string;
  /** Short description of what this side effect means (patient-friendly). */
  description?: string;
}

export interface SideEffectPredictions {
  predictions: SideEffectPrediction[];
  model_info?: {
    model_name: string;
    version: string;
    training_date?: string;
  };
  disclaimer?: string;
  error?: string;
}

export interface Explanation {
  local_explanation?: {
    feature_contributions: Array<{
      feature: string;
      contribution: number;
      substructure_match?: string;
    }>;
    base_value?: number;
    prediction?: number;
  };
  highlighted_substructures?: Array<{
    smiles_fragment: string;
    importance: number;
    description: string;
  }>;
  error?: string;
}

export interface CompleteDrugData {
  drug_info: DrugInfo;
  structure: MolecularStructure;
  side_effect_predictions: SideEffectPredictions | null;
  explanations: Explanation | null;
}

export type DisplayMode = 'patient' | 'research';