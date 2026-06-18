"""
ML model inference module for side-effect prediction.
"""

import numpy as np
import joblib
import os
import json
from typing import Dict, List, Optional
from backend.ml.feature_extraction import FeatureExtractor
from backend.utils.config import (
    MODELS_DIR,
    MODEL_NAME,
    DISCLAIMER_ML
)


class SideEffectPredictor:
    """
    Predicts potential side-effect tendencies from molecular structure.
    """
    
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.feature_extractor = FeatureExtractor()
        self.model_metadata = {}
        
        # Load model and metadata
        self._load_model()
    
    def _load_model(self):
        """Load trained model and associated files."""
        model_path = os.path.join(MODELS_DIR, f"{MODEL_NAME}.joblib")
        encoder_path = os.path.join(MODELS_DIR, f"{MODEL_NAME}_labels.json")
        metadata_path = os.path.join(MODELS_DIR, f"{MODEL_NAME}_metadata.json")
        
        # Load model
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                print(f"Loaded model from {model_path}")
            except Exception as e:
                print(f"Error loading model: {e}")
                self.model = None
        else:
            print(f"Model file not found: {model_path}")
            print("NOTE: You need to train the model first. See notebooks/train_model.ipynb")
        
        # Load label encoder
        if os.path.exists(encoder_path):
            try:
                with open(encoder_path, 'r') as f:
                    self.label_encoder = json.load(f)
                print(f"Loaded label encoder from {encoder_path}")
            except Exception as e:
                print(f"Error loading label encoder: {e}")
        
        # Load metadata
        if os.path.exists(metadata_path):
            try:
                with open(metadata_path, 'r') as f:
                    self.model_metadata = json.load(f)
            except Exception as e:
                print(f"Error loading metadata: {e}")
    
    def predict(self, smiles: str, mode: str = "patient", top_k: int = 10) -> Dict:
        """
        Predict side effects for a given SMILES string.
        
        Args:
            smiles: SMILES string of the molecule
            mode: "patient" or "research"
            top_k: Number of top predictions to return
            
        Returns:
            Dictionary with predictions and metadata
        """
        result = {
            "predictions": [],
            "disclaimer": DISCLAIMER_ML,
            "model_info": {
                "model_name": MODEL_NAME,
                "version": self.model_metadata.get("version", "1.0"),
                "training_date": self.model_metadata.get("training_date", "Unknown")
            },
            "error": None
        }
        
        # Check if model is loaded
        if self.model is None:
            result["error"] = "Model not loaded. Please train the model first."
            return result
        
        # Extract features
        feature_vector = self.feature_extractor.get_feature_vector(smiles, include_descriptors=False)
        if feature_vector is None:
            result["error"] = "Could not extract features from SMILES string"
            return result
        
        # Make prediction
        try:
            # Reshape for model input
            X = feature_vector.reshape(1, -1)
            
            # Predict probabilities
            if hasattr(self.model, 'predict_proba'):
                raw = self.model.predict_proba(X)
            # multi-label: each element is a (1,2) array, take positive class prob
                if isinstance(raw, list):
                    probabilities = [p[0][1] for p in raw]
                else:
                    probabilities = raw[0]
            
            # Get labels
            if self.label_encoder:
                labels = list(self.label_encoder.keys())
            else:
                # Fallback: use indices
                labels = [f"Side_Effect_{i}" for i in range(len(probabilities))]
            
            # Create predictions list
            predictions = []
            for label, prob in zip(labels, probabilities):
                predictions.append({
                    "side_effect": label,
                    "confidence_score": float(prob)
                })
            
            # Sort by confidence
            predictions.sort(key=lambda x: x["confidence_score"], reverse=True)
            
            # Take top k
            top_predictions = predictions[:top_k]
            
            # Format based on mode
            if mode == "patient":
                # Convert to simple tendency levels
                formatted_predictions = []
                for pred in top_predictions:
                    score = pred["confidence_score"]
                    if score >= 0.7:
                        tendency = "high"
                    elif score >= 0.4:
                        tendency = "moderate"
                    else:
                        tendency = "low"
                    
                    formatted_predictions.append({
                        "side_effect": pred["side_effect"],
                        "tendency": tendency,
                        "category": "General"  # Could be enhanced with category mapping
                    })
                
                result["predictions"] = formatted_predictions
            else:  # research mode
                result["predictions"] = top_predictions
            
        except Exception as e:
            result["error"] = f"Prediction error: {e}"
            print(f"Prediction error: {e}")
        
        return result
    
    def get_model_info(self) -> Dict:
        """Get model information and metadata."""
        return {
            "model_name": MODEL_NAME,
            "is_loaded": self.model is not None,
            "metadata": self.model_metadata,
            "label_count": len(self.label_encoder) if self.label_encoder else 0
        }
ModelInference = SideEffectPredictor

# Example usage
if __name__ == "__main__":
    predictor = SideEffectPredictor()
    
    # Test with Paracetamol
    test_smiles = "CC(=O)Nc1ccc(O)cc1"
    result = predictor.predict(test_smiles, mode="research")
    
    print(json.dumps(result, indent=2))



