"""
Explainability module using SHAP for model interpretability.
"""

import numpy as np
import shap
import joblib
import os
import json
from typing import Dict, List, Optional
from rdkit import Chem
from rdkit.Chem import rdMolDescriptors
from backend.ml.feature_extraction import FeatureExtractor
from backend.utils.config import (
    MODELS_DIR,
    MODEL_NAME,
    SHAP_SAMPLE_SIZE,
    FINGERPRINT_SIZE
)


class ModelExplainer:
    """
    Provides SHAP-based explanations for model predictions.
    """
    
    def __init__(self):
        self.model = None
        self.feature_extractor = FeatureExtractor()
        self.explainer = None
        self.background_data = None
        
        # Load model
        self._load_model()
        
        # Initialize explainer
        self._initialize_explainer()
    
    def _load_model(self):
        """Load trained model."""
        model_path = os.path.join(MODELS_DIR, f"{MODEL_NAME}.joblib")
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
            except Exception as e:
                print(f"Error loading model: {e}")
    
    def _initialize_explainer(self):
        """Initialize SHAP explainer with background data."""
        if self.model is None:
            return
        
        try:
            # Create background dataset (sample from training data if available)
            # For now, use random background (in production, use actual training samples)
            background_size = min(SHAP_SAMPLE_SIZE, 100)
            self.background_data = np.random.rand(background_size, FINGERPRINT_SIZE)
            
            # Choose explainer based on model type
            model_type = type(self.model).__name__
            
            if "XGBoost" in model_type or "Tree" in model_type:
                self.explainer = shap.TreeExplainer(self.model)
            elif "Linear" in model_type or "Logistic" in model_type:
                self.explainer = shap.LinearExplainer(self.model, self.background_data)
            else:
                # Default to KernelExplainer (slower but more general)
                self.explainer = shap.KernelExplainer(
                    self.model.predict_proba if hasattr(self.model, 'predict_proba') else self.model.predict,
                    self.background_data
                )
        except Exception as e:
            print(f"Error initializing explainer: {e}")
    
    def map_fingerprint_to_substructures(self, smiles: str, important_bits: List[int]) -> List[Dict]:
        """
        Map important fingerprint bits to molecular substructures.
        
        Args:
            smiles: SMILES string
            important_bits: List of important fingerprint bit indices
            
        Returns:
            List of substructure information
        """
        substructures = []
        
        try:
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                return substructures
            
            # Generate fingerprint info
            info = {}
            fp = rdMolDescriptors.GetMorganFingerprint(
                mol,
                radius=2,
                bitInfo=info
            )
            
            # Map bits to substructures
            for bit_idx in important_bits[:10]:  # Limit to top 10
                if bit_idx in info:
                    atom_indices = info[bit_idx]
                    if atom_indices:
                        # Get the atoms involved
                        atoms = set()
                        for atom_idx, radius in atom_indices:
                            atoms.add(atom_idx)
                            # Include neighbors within radius
                            atom = mol.GetAtomWithIdx(atom_idx)
                            for neighbor in atom.GetNeighbors():
                                atoms.add(neighbor.GetIdx())
                        
                        # Create substructure SMILES
                        try:
                            # Extract substructure
                            atom_list = list(atoms)
                            if atom_list:
                                substructure_mol = Chem.PathToSubmol(mol, atom_list)
                                if substructure_mol:
                                    substructure_smiles = Chem.MolToSmiles(substructure_mol)
                                    substructures.append({
                                        "bit_index": int(bit_idx),
                                        "atom_indices": sorted(list(atoms)),
                                        "smiles_fragment": substructure_smiles,
                                        "description": f"Substructure at bit {bit_idx}"
                                    })
                        except Exception as e:
                            print(f"Substructure extraction error: {e}")
        except Exception as e:
            print(f"Substructure mapping error: {e}")
        
        return substructures
    
    def explain(self, smiles: str, side_effect: Optional[str] = None) -> Dict:
        """
        Generate SHAP explanation for a prediction.
        
        Args:
            smiles: SMILES string
            side_effect: Specific side effect to explain (optional)
            
        Returns:
            Dictionary with explanation data
        """
        result = {
            "global_importance": {
                "features": [],
                "importance_scores": []
            },
            "local_explanation": {
                "feature_contributions": [],
                "base_value": 0.0,
                "prediction": 0.0
            },
            "highlighted_substructures": [],
            "error": None
        }
        
        if self.model is None or self.explainer is None:
            result["error"] = "Model or explainer not initialized"
            return result
        
        # Extract features
        feature_vector = self.feature_extractor.get_feature_vector(smiles)
        if feature_vector is None:
            result["error"] = "Could not extract features from SMILES"
            return result
        
        try:
            # Calculate SHAP values
            X = feature_vector.reshape(1, -1)
            shap_values = self.explainer.shap_values(X)
            
            # Handle multi-output models
            if isinstance(shap_values, list):
                # Multi-label: use first output or aggregate
                shap_vals = shap_values[0] if len(shap_values) > 0 else shap_values
            else:
                shap_vals = shap_values
            
            # Flatten if needed
            if len(shap_vals.shape) > 1:
                shap_vals = shap_vals[0]
            
            # Get feature contributions
            feature_contributions = []
            for i, contribution in enumerate(shap_vals):
                feature_contributions.append({
                    "feature": f"Fingerprint_bit_{i}",
                    "contribution": float(contribution),
                    "substructure_match": None  # Will be filled if mapping succeeds
                })
            
            # Sort by absolute contribution
            feature_contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
            
            # Get top contributing features
            top_features = feature_contributions[:20]  # Top 20
            top_feature_indices = [int(f["feature"].split("_")[-1]) for f in top_features]
            
            # Map to substructures
            substructures = self.map_fingerprint_to_substructures(smiles, top_feature_indices)
            
            # Update feature contributions with substructure info
            substructure_map = {s["bit_index"]: s for s in substructures}
            for contrib in feature_contributions:
                bit_idx = int(contrib["feature"].split("_")[-1])
                if bit_idx in substructure_map:
                    contrib["substructure_match"] = substructure_map[bit_idx]["smiles_fragment"]
            
            result["local_explanation"]["feature_contributions"] = feature_contributions[:10]  # Top 10
            result["highlighted_substructures"] = substructures
            
            # Get base value and prediction
            if hasattr(self.explainer, 'expected_value'):
                if isinstance(self.explainer.expected_value, np.ndarray):
                    result["local_explanation"]["base_value"] = float(self.explainer.expected_value[0])
                else:
                    result["local_explanation"]["base_value"] = float(self.explainer.expected_value)
            
            # Get prediction
            if hasattr(self.model, 'predict_proba'):
                pred = self.model.predict_proba(X)[0]
                result["local_explanation"]["prediction"] = float(pred[0] if isinstance(pred, np.ndarray) else pred)
            else:
                pred = self.model.predict(X)[0]
                result["local_explanation"]["prediction"] = float(pred[0] if isinstance(pred, np.ndarray) else pred)
            
            # Global importance (mean absolute SHAP values)
            global_importance = np.abs(shap_vals)
            top_global_indices = np.argsort(global_importance)[-20:][::-1]
            
            result["global_importance"]["features"] = [f"Bit_{i}" for i in top_global_indices]
            result["global_importance"]["importance_scores"] = [float(global_importance[i]) for i in top_global_indices]
            
        except Exception as e:
            result["error"] = f"Explanation error: {e}"
            print(f"Explanation error: {e}")
        
        return result


# Example usage
if __name__ == "__main__":
    explainer = ModelExplainer()
    
    # Test with Paracetamol
    test_smiles = "CC(=O)Nc1ccc(O)cc1"
    explanation = explainer.explain(test_smiles)
    
    print(json.dumps(explanation, indent=2, default=str))



