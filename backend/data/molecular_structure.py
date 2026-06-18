"""
Molecular structure handling module.
Fetches SMILES/InChI from PubChem/ChEMBL and generates visualizations.
"""

import requests
import os
import json
import time
from typing import Dict, Optional, Tuple
from rdkit import Chem
from rdkit.Chem import AllChem, Draw
from rdkit.Chem.Draw import rdMolDraw2D
import base64
from io import BytesIO

from backend.utils.config import (
    PUBCHEM_BASE_URL,
    CACHE_DIR,
    CACHE_TTL
)


class MolecularStructureHandler:
    """
    Handles molecular structure fetching, validation, and visualization.
    """
    
    def __init__(self):
        self.cache_dir = os.path.join(CACHE_DIR, "molecular_structure")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Medicine-Explanation-System/1.0 (Educational Research)"
        })
    
    def _get_cache_path(self, identifier: str) -> str:
        """Generate cache file path for a drug identifier."""
        safe_id = "".join(c for c in identifier if c.isalnum() or c in ('-', '_', ':'))
        return os.path.join(self.cache_dir, f"{safe_id}.json")
    
    def _load_cache(self, cache_path: str) -> Optional[Dict]:
        """Load cached data if still valid."""
        if not os.path.exists(cache_path):
            return None
        
        try:
            with open(cache_path, 'r') as f:
                cached = json.load(f)
            
            if time.time() - cached.get('timestamp', 0) < CACHE_TTL:
                return cached.get('data')
        except Exception as e:
            print(f"Cache load error: {e}")
        
        return None
    
    def _save_cache(self, cache_path: str, data: Dict):
        """Save data to cache."""
        try:
            with open(cache_path, 'w') as f:
                json.dump({
                    'timestamp': time.time(),
                    'data': data
                }, f, indent=2)
        except Exception as e:
            print(f"Cache save error: {e}")
    
    def fetch_smiles_from_pubchem(self, drug_name: str) -> Optional[str]:
        """
        Fetch SMILES string from PubChem by drug name.
        
        Args:
            drug_name: Name of the drug
            
        Returns:
            SMILES string or None
        """
        try:
            # First, get CID
            url = f"{PUBCHEM_BASE_URL}/compound/name/{drug_name}/cids/JSON"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                cids = data.get('IdentifierList', {}).get('CID', [])
                
                if cids:
                    cid = cids[0]
                    # Get SMILES
                    smiles_url = f"{PUBCHEM_BASE_URL}/compound/cid/{cid}/property/CanonicalSMILES/JSON"
                    smiles_response = self.session.get(smiles_url, timeout=10)
                    
                    if smiles_response.status_code == 200:
                        smiles_data = smiles_response.json()
                        props = smiles_data.get('PropertyTable', {}).get('Properties', [])
                        if props:
                            return props[0].get('CanonicalSMILES')
        except Exception as e:
            print(f"PubChem SMILES fetch error: {e}")
        
        return None
    
    def fetch_smiles_from_cid(self, cid: int) -> Optional[str]:
        """
        Fetch SMILES string from PubChem by CID.
        
        Args:
            cid: PubChem Compound ID
            
        Returns:
            SMILES string or None
        """
        try:
            url = f"{PUBCHEM_BASE_URL}/compound/cid/{cid}/property/CanonicalSMILES/JSON"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                props = data.get('PropertyTable', {}).get('Properties', [])
                if props:
                    return props[0].get('CanonicalSMILES')
        except Exception as e:
            print(f"PubChem CID SMILES fetch error: {e}")
        
        return None
    
    def validate_smiles(self, smiles: str) -> Tuple[bool, Optional[Chem.Mol]]:
        """
        Validate and canonicalize SMILES string.
        
        Args:
            smiles: SMILES string to validate
            
        Returns:
            Tuple of (is_valid, molecule_object)
        """
        try:
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                return False, None
            
            # Canonicalize
            canonical_smiles = Chem.MolToSmiles(mol)
            canonical_mol = Chem.MolFromSmiles(canonical_smiles)
            
            return True, canonical_mol
        except Exception as e:
            print(f"SMILES validation error: {e}")
            return False, None
    
    def generate_2d_svg(self, mol: Chem.Mol, highlight_atoms: Optional[list] = None) -> str:
        """
        Generate 2D molecular structure as SVG.
        
        Args:
            mol: RDKit molecule object
            highlight_atoms: List of atom indices to highlight (optional)
            
        Returns:
            Base64-encoded SVG string
        """
        try:
            drawer = rdMolDraw2D.MolDraw2DSVG(400, 400)
            
            if highlight_atoms:
                drawer.DrawMolecule(mol, highlightAtoms=highlight_atoms)
            else:
                drawer.DrawMolecule(mol)
            
            drawer.FinishDrawing()
            svg = drawer.GetDrawingText()
            
            # Encode to base64
            svg_bytes = svg.encode('utf-8')
            svg_b64 = base64.b64encode(svg_bytes).decode('utf-8')
            
            return svg_b64
        except Exception as e:
            print(f"2D SVG generation error: {e}")
            return ""
    
    def get_3d_coordinates(self, mol: Chem.Mol, smiles: Optional[str] = None) -> Dict:
        """
        Generate 3D coordinates for molecule.
        Uses a seed derived from SMILES so each drug gets unique 3D conformation.
        
        Args:
            mol: RDKit molecule object
            smiles: Optional SMILES string for seed (ensures different drugs get different 3D)
            
        Returns:
            Dictionary with atom and bond information
        """
        try:
            # Use SMILES-based seed so each drug gets a unique 3D conformation (fixes same molecule for all drugs)
            seed = 42
            if smiles:
                seed = abs(hash(smiles)) % (2 ** 31)
            # Generate 3D coordinates
            mol_3d = Chem.AddHs(mol)
            AllChem.EmbedMolecule(mol_3d, randomSeed=seed)
            AllChem.MMFFOptimizeMolecule(mol_3d)
            
            conf = mol_3d.GetConformer()
            
            atoms = []
            for atom in mol_3d.GetAtoms():
                idx = atom.GetIdx()
                pos = conf.GetAtomPosition(idx)
                atoms.append({
                    "element": atom.GetSymbol(),
                    "x": pos.x,
                    "y": pos.y,
                    "z": pos.z,
                    "index": idx
                })
            
            bonds = []
            for bond in mol_3d.GetBonds():
                bonds.append({
                    "begin": bond.GetBeginAtomIdx(),
                    "end": bond.GetEndAtomIdx(),
                    "order": bond.GetBondTypeAsDouble()
                })
            
            return {
                "atoms": atoms,
                "bonds": bonds
            }
        except Exception as e:
            print(f"3D coordinate generation error: {e}")
            return {"atoms": [], "bonds": []}
    
    def get_structure_data(self, drug_id: str, drug_name: Optional[str] = None) -> Dict:
        """
        Get complete molecular structure data for a drug.
        
        Args:
            drug_id: Drug identifier (e.g., "PUBCHEM:12345" or "RXCUI:123")
            drug_name: Optional drug name for lookup
            
        Returns:
            Dictionary with structure information
        """
        # Check cache
        cache_path = self._get_cache_path(drug_id)
        cached = self._load_cache(cache_path)
        if cached:
            return cached
        
        result = {
            "drug_id": drug_id,
            "smiles": None,
            "inchi": None,
            "inchi_key": None,
            "source": None,
            "2d_svg": None,
            "3d_coordinates": None,
            "error": None
        }
        
        # Extract CID if available
        cid = None
        if "PUBCHEM:" in drug_id:
            try:
                cid = int(drug_id.split(":")[1])
            except:
                pass
        
        # Fetch SMILES
        smiles = None
        if cid:
            smiles = self.fetch_smiles_from_cid(cid)
            result["source"] = "PubChem"
        elif drug_name:
            smiles = self.fetch_smiles_from_pubchem(drug_name)
            result["source"] = "PubChem"
        
        if not smiles:
            result["error"] = "Could not fetch SMILES from databases"
            return result
        
        # Validate SMILES
        is_valid, mol = self.validate_smiles(smiles)
        if not is_valid or mol is None:
            result["error"] = "Invalid SMILES string"
            return result
        
        result["smiles"] = Chem.MolToSmiles(mol)
        
        # Generate InChI
        try:
            result["inchi"] = Chem.MolToInchi(mol)
            result["inchi_key"] = Chem.MolToInchiKey(mol)
        except Exception as e:
            print(f"InChI generation error: {e}")
        
        # Generate 2D SVG
        result["2d_svg"] = self.generate_2d_svg(mol)
        
        # Generate 3D coordinates (pass SMILES so each drug gets unique 3D)
        result["3d_coordinates"] = self.get_3d_coordinates(mol, smiles=result["smiles"])
        
        # Cache result
        self._save_cache(cache_path, result)
        
        return result


# Example usage
if __name__ == "__main__":
    handler = MolecularStructureHandler()
    
    # Test
    result = handler.get_structure_data("PUBCHEM:1983", "Paracetamol")
    print(json.dumps(result, indent=2, default=str))



