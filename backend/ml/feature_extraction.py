"""
Feature extraction module for molecular structures.
Generates ECFP/Morgan fingerprints and physicochemical descriptors.
"""

import numpy as np
from rdkit import Chem
from rdkit.Chem import Descriptors, rdMolDescriptors
from typing import Dict, Optional
import joblib
import os

from backend.utils.config import (
    FINGERPRINT_TYPE,
    FINGERPRINT_SIZE,
    FINGERPRINT_RADIUS,
    MODELS_DIR
)


class FeatureExtractor:
    """
    Extracts molecular features from SMILES strings for ML model input.
    """
    
    def __init__(self):
        self.fingerprint_type = FINGERPRINT_TYPE
        self.fingerprint_size = FINGERPRINT_SIZE
        self.radius = FINGERPRINT_RADIUS
        
        # Load feature scaler if available
        self.scaler = None
        scaler_path = os.path.join(MODELS_DIR, "feature_scaler.joblib")
        if os.path.exists(scaler_path):
            try:
                self.scaler = joblib.load(scaler_path)
            except Exception as e:
                print(f"Could not load feature scaler: {e}")
    
    def validate_smiles(self, smiles: str) -> Optional[Chem.Mol]:
        """
        Validate and return RDKit molecule object.
        
        Args:
            smiles: SMILES string
            
        Returns:
            RDKit molecule object or None
        """
        try:
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                return None
            return mol
        except Exception as e:
            print(f"SMILES validation error: {e}")
            return None
    
    def generate_fingerprint(self, mol: Chem.Mol) -> np.ndarray:
        """
        Generate molecular fingerprint.
        
        Args:
            mol: RDKit molecule object
            
        Returns:
            NumPy array of fingerprint bits
        """
        if self.fingerprint_type.upper() == "ECFP4":
            # Extended-Connectivity Fingerprints (ECFP4)
            fp = rdMolDescriptors.GetMorganFingerprintAsBitVect(
                mol, 
                radius=self.radius, 
                nBits=self.fingerprint_size
            )
        elif self.fingerprint_type.upper() == "MORGAN":
            # Morgan fingerprints (same as ECFP for radius=2)
            fp = rdMolDescriptors.GetMorganFingerprintAsBitVect(
                mol,
                radius=self.radius,
                nBits=self.fingerprint_size
            )
        else:
            # Default to ECFP4
            fp = rdMolDescriptors.GetMorganFingerprintAsBitVect(
                mol,
                radius=self.radius,
                nBits=self.fingerprint_size
            )
        
        # Convert to numpy array
        return np.array(fp)
    
    def calculate_physicochemical_descriptors(self, mol: Chem.Mol) -> Dict[str, float]:
        """
        Calculate physicochemical descriptors.
        
        Args:
            mol: RDKit molecule object
            
        Returns:
            Dictionary of descriptor names and values
        """
        descriptors = {}
        
        try:
            descriptors['molecular_weight'] = Descriptors.MolWt(mol)
            descriptors['logp'] = Descriptors.MolLogP(mol)
            descriptors['num_rotatable_bonds'] = Descriptors.NumRotatableBonds(mol)
            descriptors['num_hbd'] = Descriptors.NumHDonors(mol)
            descriptors['num_hba'] = Descriptors.NumHAcceptors(mol)
            descriptors['tpsa'] = Descriptors.TPSA(mol)
            descriptors['num_aromatic_rings'] = Descriptors.NumAromaticRings(mol)
            descriptors['num_saturated_rings'] = Descriptors.NumSaturatedRings(mol)
        except Exception as e:
            print(f"Descriptor calculation error: {e}")
        
        return descriptors
    
    def extract_features(self, smiles: str, include_descriptors: bool = False) -> Dict:
        """
        Extract all features from SMILES string.
        
        Args:
            smiles: SMILES string
            include_descriptors: Whether to include physicochemical descriptors
            
        Returns:
            Dictionary with:
            - fingerprint: NumPy array
            - descriptors: Dictionary (if include_descriptors=True)
            - is_valid: Boolean
            - error: Error message if any
        """
        result = {
            "fingerprint": None,
            "descriptors": {},
            "is_valid": False,
            "error": None
        }
        
        # Validate SMILES
        mol = self.validate_smiles(smiles)
        if mol is None:
            result["error"] = "Invalid SMILES string"
            return result
        
        result["is_valid"] = True
        
        # Generate fingerprint
        try:
            fingerprint = self.generate_fingerprint(mol)
            result["fingerprint"] = fingerprint
        except Exception as e:
            result["error"] = f"Fingerprint generation error: {e}"
            return result
        
        # Calculate descriptors if requested
        if include_descriptors:
            try:
                descriptors = self.calculate_physicochemical_descriptors(mol)
                result["descriptors"] = descriptors
            except Exception as e:
                print(f"Descriptor calculation error: {e}")
        
        return result
    
    def get_feature_vector(self, smiles, include_descriptors=True):
        """
        Get feature vector ready for model input.
        
        Args:
            smiles: SMILES string
            include_descriptors: Whether to include physicochemical descriptors
            
        Returns:
            NumPy array of features or None
        """
        features = self.extract_features(smiles, include_descriptors)
        
        if not features["is_valid"]:
            return None
        
        # Combine fingerprint and descriptors
        feature_list = [features["fingerprint"]]
        
        if include_descriptors and features["descriptors"]:
            descriptor_values = list(features["descriptors"].values())
            feature_list.append(np.array(descriptor_values))
        
        # Concatenate
        feature_vector = np.concatenate(feature_list)
        
        # Scale if scaler is available
        if self.scaler is not None:
            feature_vector = self.scaler.transform(feature_vector.reshape(1, -1))[0]
        
        return feature_vector


# Example usage
if __name__ == "__main__":
    extractor = FeatureExtractor()
    
    # Test with Paracetamol
    test_smiles = "CC(=O)Nc1ccc(O)cc1"
    features = extractor.extract_features(test_smiles, include_descriptors=True)
    
    print(f"Valid: {features['is_valid']}")
    print(f"Fingerprint shape: {features['fingerprint'].shape if features['fingerprint'] is not None else None}")
    print(f"Descriptors: {features['descriptors']}")