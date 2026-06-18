"""
Drug lookup module for fetching drug information from authoritative databases.
Uses RxNorm, DrugBank, and PubChem APIs.
"""
 
import requests
import time
import json
import os
from backend.ml.model_inference import SideEffectPredictor
from typing import Dict, List, Optional, Tuple
from urllib.parse import quote
from backend.utils.config import (
    PUBCHEM_BASE_URL,
    RXNORM_BASE_URL,
    CACHE_DIR,
    CACHE_TTL,
    DISCLAIMER_CLINICAL
)
 
 
class DrugLookup:
    """
    Handles drug name resolution and metadata fetching from authoritative databases.
    """
    
    def __init__(self):
        self.cache_dir = os.path.join(CACHE_DIR, "drug_lookup")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Medicine-Explanation-System/1.0 (Educational Research)"
        })
    
    def _get_cache_path(self, drug_name: str) -> str:
        """Generate cache file path for a drug name."""
        safe_name = "".join(c for c in drug_name if c.isalnum() or c in (' ', '-', '_')).strip()
        return os.path.join(self.cache_dir, f"{safe_name.lower()}.json")
    
    def _load_cache(self, cache_path: str) -> Optional[Dict]:
        """Load cached data if still valid."""
        if not os.path.exists(cache_path):
            return None
        
        try:
            with open(cache_path, 'r') as f:
                cached = json.load(f)
            
            # Check if cache is still valid
            import time
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
    
    def lookup_rxnorm(self, drug_name: str) -> Optional[Dict]:
        """
        Lookup drug in RxNorm database.
        
        Args:
            drug_name: Name of the drug
            
        Returns:
            Dictionary with drug information or None
        """
        try:
            # RxNorm approximate term search
            url = f"{RXNORM_BASE_URL}/approximateTerm.json"
            params = {"term": drug_name, "maxEntries": 5}
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if 'approximateGroup' in data and 'candidate' in data['approximateGroup']:
                candidates = data['approximateGroup']['candidate']
                if candidates:
                    # Use first candidate (most relevant)
                    rxcui = candidates[0].get('rxcui')
                    name = candidates[0].get('name', drug_name)
                    
                    # Get drug properties
                    props_url = f"{RXNORM_BASE_URL}/rxcui/{rxcui}/properties.json"
                    props_response = self.session.get(props_url, timeout=10)
                    
                    if props_response.status_code == 200:
                        props_data = props_response.json()
                        properties = props_data.get('properties', {})
                        
                        return {
                            "rxcui": rxcui,
                            "name": name,
                            "tty": properties.get('TTY', ''),
                            "is_generic": properties.get('TTY') == "IN",
                            "source": "RxNorm"
                        }
 
        except Exception as e:
            print(f"RxNorm lookup error: {e}")
        
        return None
    
    def lookup_pubchem(self, drug_name: str) -> Optional[Dict]:
        """
        Lookup drug in PubChem database.
        
        Args:
            drug_name: Name of the drug
            
        Returns:
            Dictionary with drug information or None
        """
        try:
            # Search by name
            url = f"{PUBCHEM_BASE_URL}/compound/name/{drug_name}/JSON"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                pc_compound = data.get('PC_Compounds', [])
                
                if pc_compound:
                    compound = pc_compound[0]
                    props = compound.get('props', [])
                    
                    # Extract CID
                    cid = None
                    for prop in props:
                        if prop.get('urn', {}).get('label') == 'CID':
                            cid = prop.get('value', {}).get('ival')
                            break
                    
                    if cid:
                        return {
                            "pubchem_cid": cid,
                            "source": "PubChem"
                        }
        except Exception as e:
            print(f"PubChem lookup error: {e}")
        
        return None
    
    from urllib.parse import quote
 
    def fetch_pubchem_smiles(self, drug_name: str) -> Optional[str]:
        print("🚀 fetch_pubchem_smiles CALLED with:", drug_name)
        try:
        # Clean and encode name for URL
            name = quote(drug_name.strip())
            print("🔎 Searching PubChem for:", drug_name)
 
        # Step 1: get CID
            cid_url = f"{PUBCHEM_BASE_URL}/compound/name/{name}/cids/JSON"
            r = self.session.get(cid_url, timeout=10)
            print("CID URL:", cid_url)
            print("CID status:", r.status_code)
            print("CID response:", r.text) 
            if r.status_code != 200:
                return None
 
            data = r.json()
            cids = data.get("IdentifierList", {}).get("CID", [])
            if not cids:
                print("❌ No CID found")
                return None
 
            cid = cids[0]
            print("✅ CID found:", cid)
 
        # Step 2: get SMILES using CID
            prop_url = f"{PUBCHEM_BASE_URL}/compound/cid/{cid}/property/IsomericSMILES/JSON"
            r2 = self.session.get(prop_url, timeout=10)
            print("SMILES URL:", prop_url)
            print("SMILES status:", r2.status_code)
            print("SMILES response:", r2.text)
            if r2.status_code != 200:
                return None
 
            prop_data = r2.json()
            props = prop_data.get("PropertyTable", {}).get("Properties", [])
            if not props:
                return None
 
            return props[0].get("IsomericSMILES") or props[0].get("SMILES")
 
 
 
        except Exception as e:
            print("PubChem SMILES error:", e)
            return None
 
    def fetch_pubchem_3d(self, smiles: str):
        try:
            url = f"{PUBCHEM_BASE_URL}/compound/smiles/{quote(smiles)}/SDF"
            r = self.session.get(url, timeout=10)
            if r.status_code != 200:
                return None
            return r.text
        except Exception as e:
            print("3D fetch error:", e)
            return None
 
 
    def fetch_clinical_side_effects(self, drug_name: str):
        try:
            url = f"https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:{quote(drug_name)}&limit=10"
            r = self.session.get(url, timeout=10)
            if r.status_code != 200:
                return []
            data = r.json()
            effects = set()
            for res in data.get("results", []):
                for reaction in res.get("patient", {}).get("reaction", []):
                    effects.add(reaction.get("reactionmeddrapt"))
        except Exception as e:
            print("Clinical effects error:", e)
        return list(effects)
 
    def get_drug_info(self, drug_name: str) -> Dict:
        print("🔥 get_drug_info called with:", drug_name)
        print("📂 Cache directory:", self.cache_dir)
 
        cache_path = self._get_cache_path(drug_name)
        cached = self._load_cache(cache_path)
        if cached:
            print("⚠️ Returning cached data!")
            return cached
 
        rxnorm_data = self.lookup_rxnorm(drug_name)
        resolved_name = rxnorm_data["name"] if rxnorm_data else drug_name
        print("🔹 Resolved name for structure:", resolved_name)
        smiles = self.fetch_pubchem_smiles(resolved_name)
        print("🧪 SMILES returned:", smiles)
        # ===== Side effect + structure integration =====
        predictor = SideEffectPredictor()
        try:
            ml_side_effects = predictor.predict(smiles) if smiles else []
        except Exception as e:
            print("ML prediction failed:", e)
            ml_side_effects = []
        clinical_side_effects = self.fetch_clinical_side_effects(resolved_name)
        structure_3d = self.fetch_pubchem_3d(smiles) if smiles else None
 
 
 
        from backend.data.molecular_structure import MolecularStructureHandler
        structure_handler = MolecularStructureHandler()
        structure_data = {}
        if smiles:
            is_valid, mol = structure_handler.validate_smiles(smiles)
            if is_valid and mol:
                structure_data["2d_svg"] = structure_handler.generate_2d_svg(mol)
                structure_data["3d_coordinates"] = structure_handler.get_3d_coordinates(mol, smiles=smiles)
                from rdkit import Chem
                structure_data["smiles"] = Chem.MolToSmiles(mol)
                try:
                    structure_data["inchi"] = Chem.MolToInchi(mol)
                    structure_data["inchi_key"] = Chem.MolToInchiKey(mol)
                except Exception:
                    pass
        structure_data["3d_sdf"] = structure_3d
        pubchem_data = None
        if not rxnorm_data:
            pubchem_data = self.lookup_pubchem(drug_name)
        print("DEBUG BACKEND SMILES:", smiles)
        result = {
            "drug_id": None,
            "standard_name": resolved_name,
            "approved_uses": [],
            "metadata": rxnorm_data or {},
            "structure": structure_data,
            "side_effects": {
                "clinical": clinical_side_effects,
                "ml_predicted": ml_side_effects
            },
            "disclaimer": DISCLAIMER_CLINICAL
        }
 
        if rxnorm_data:
            result["drug_id"] = f"RXCUI:{rxnorm_data['rxcui']}"
            result["metadata"]["source"] = "RxNorm"
            result["metadata"]["is_generic"] = rxnorm_data.get("is_generic", False)
            result["approved_uses"] = [{
                "indication": "See official prescribing information",
                "source": "RxNorm"
            }]
        elif pubchem_data:
            result["drug_id"] = f"PUBCHEM:{pubchem_data['pubchem_cid']}"
            result["metadata"]["source"] = "PubChem"
        else:
            result["error"] = "Drug not found in authoritative databases"
 
        cache_copy = result.copy()
        self._save_cache(cache_path, cache_copy)
 
        return result
 
    def fetch_inchikey_from_rxnorm(self, rxcui: str) -> Optional[str]:
        try:
            url = f"{RXNORM_BASE_URL}/rxcui/{rxcui}/property.json?propName=InChIKey"
            r = self.session.get(url, timeout=10)
            if r.status_code != 200:
                return None
 
            data = r.json()
            props = data.get("propConceptGroup", {}).get("propConcept", [])
            if not props:
                return None
 
            return props[0].get("propValue")
 
        except Exception as e:
            print("RxNorm InChIKey fetch error:", e)
            return None