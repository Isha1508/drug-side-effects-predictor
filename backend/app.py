"""
Main Flask application for Medicine Explanation System API.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import sys
import os

# Add parent directory to path for imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from backend.data.drug_lookup import DrugLookup
from backend.data.molecular_structure import MolecularStructureHandler
from backend.ml.model_inference import SideEffectPredictor
from backend.ml.explainability import ModelExplainer
from backend.utils.config import (
    API_HOST,
    API_PORT,
    DEBUG,
    DISCLAIMER_CLINICAL,
    DISCLAIMER_ML
)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Initialize components
drug_lookup = DrugLookup()
structure_handler = MolecularStructureHandler()
predictor = SideEffectPredictor()
explainer = ModelExplainer()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "Medicine Explanation System API"
    })


@app.route('/api/v1/drug/lookup', methods=['GET'])
def lookup_drug():
    """
    Lookup drug information from authoritative databases.
    
    Query params:
        name: Drug name (required)
    """
    try:
        drug_name = request.args.get('name')
        if not drug_name:
            return jsonify({
                "error": True,
                "message": "Drug name is required",
                "code": "VALIDATION_ERROR"
            }), 400
        
        result = drug_lookup.get_drug_info(drug_name)
        
        if "error" in result:
            return jsonify({
                "error": True,
                "message": result["error"],
                "code": "DRUG_NOT_FOUND"
            }), 404
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "error": True,
            "message": str(e),
            "code": "API_ERROR"
        }), 500


@app.route('/api/v1/drug/structure', methods=['GET'])
def get_structure():
    """
    Get molecular structure data.
    
    Query params:
        drug_id: Drug identifier (required)
        drug_name: Optional drug name for lookup
    """
    try:
        drug_id = request.args.get('drug_id')
        drug_name = request.args.get('drug_name')
        
        if not drug_id and not drug_name:
            return jsonify({
                "error": True,
                "message": "Either drug_id or drug_name is required",
                "code": "VALIDATION_ERROR"
            }), 400
        
        if not drug_id:
            # Try to get drug_id from name
            drug_info = drug_lookup.get_drug_info(drug_name)
            if "drug_id" in drug_info:
                drug_id = drug_info["drug_id"]
            else:
                return jsonify({
                    "error": True,
                    "message": "Could not resolve drug ID from name",
                    "code": "DRUG_NOT_FOUND"
                }), 404
        
        result = structure_handler.get_structure_data(drug_id, drug_name)
        
        if result.get("error"):
            return jsonify({
                "error": True,
                "message": result["error"],
                "code": "INVALID_SMILES"
            }), 400
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "error": True,
            "message": str(e),
            "code": "API_ERROR"
        }), 500


@app.route('/api/v1/ml/predict-side-effects', methods=['POST'])
def predict_side_effects():
    """
    Predict potential side-effect tendencies from molecular structure.
    
    Request body:
        {
            "smiles": "string (required)",
            "mode": "patient|research (default: patient)",
            "top_k": "int (default: 10)"
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'smiles' not in data:
            return jsonify({
                "error": True,
                "message": "SMILES string is required",
                "code": "VALIDATION_ERROR"
            }), 400
        
        smiles = data.get('smiles')
        mode = data.get('mode', 'patient')
        top_k = data.get('top_k', 10)
        
        if mode not in ['patient', 'research']:
            mode = 'patient'
        
        result = predictor.predict(smiles, mode=mode, top_k=top_k)
        
        if result.get("error"):
            return jsonify({
                "error": True,
                "message": result["error"],
                "code": "MODEL_ERROR"
            }), 500
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "error": True,
            "message": str(e),
            "code": "API_ERROR"
        }), 500


@app.route('/api/v1/ml/explain', methods=['POST'])
def explain_prediction():
    """
    Generate SHAP explanation for a prediction.
    
    Request body:
        {
            "smiles": "string (required)",
            "side_effect": "string (optional)"
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'smiles' not in data:
            return jsonify({
                "error": True,
                "message": "SMILES string is required",
                "code": "VALIDATION_ERROR"
            }), 400
        
        smiles = data.get('smiles')
        side_effect = data.get('side_effect')
        
        result = explainer.explain(smiles, side_effect)
        
        if result.get("error"):
            return jsonify({
                "error": True,
                "message": result["error"],
                "code": "MODEL_ERROR"
            }), 500
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "error": True,
            "message": str(e),
            "code": "API_ERROR"
        }), 500


@app.route('/api/v1/drug/info', methods=['GET'])
def get_complete_info():
    """
    Get complete drug information (combined endpoint).
    
    Query params:
        name: Drug name (required)
        mode: patient|research (default: patient)
    """
    try:
        drug_name = request.args.get('name')
        mode = request.args.get('mode', 'patient')
        
        if not drug_name:
            return jsonify({
                "error": True,
                "message": "Drug name is required",
                "code": "VALIDATION_ERROR"
            }), 400
        
        # Get drug info (already includes structure with 3d_coordinates and 2d_svg)
        drug_info = drug_lookup.get_drug_info(drug_name)
        
        if drug_info.get("error") and not drug_info.get("drug_id"):
            return jsonify({
                "error": True,
                "message": drug_info["error"],
                "code": "DRUG_NOT_FOUND"
            }), 404
        
        # Use structure already built inside drug_lookup
        structure = drug_info.get("structure", {})
        smiles = structure.get("smiles")

        # Get predictions if SMILES available
        predictions = None
        explanations = None
        
        if smiles:
            predictions = predictor.predict(smiles, mode=mode)
            if mode == "research":
                explanations = explainer.explain(smiles)
        
        return jsonify({
            "drug_info": {
                "drug_id": drug_info.get("drug_id"),
                "standard_name": drug_info.get("standard_name", drug_name),
                "approved_uses": drug_info.get("approved_uses", []),
                "metadata": drug_info.get("metadata", {}),
                "disclaimer": drug_info.get("disclaimer", ""),
            },
            "structure": structure,
            "side_effect_predictions": predictions,
            "explanations": explanations
        })
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": True,
            "message": str(e),
            "code": "API_ERROR"
        }), 500


if __name__ == '__main__':
    print(f"Starting Medicine Explanation System API on {API_HOST}:{API_PORT}")
    print(f"Debug mode: {DEBUG}")
    print(f"\n⚠️  IMPORTANT DISCLAIMERS:")
    print(f"   {DISCLAIMER_CLINICAL}")
    print(f"   {DISCLAIMER_ML}")
    print("\nAPI Endpoints:")
    print("  GET  /health")
    print("  GET  /api/v1/drug/lookup?name=<drug_name>")
    print("  GET  /api/v1/drug/structure?drug_id=<id>&drug_name=<name>")
    print("  POST /api/v1/ml/predict-side-effects")
    print("  POST /api/v1/ml/explain")
    print("  GET  /api/v1/drug/info?name=<drug_name>&mode=<patient|research>")
    
    app.run(host=API_HOST, port=API_PORT, debug=DEBUG)