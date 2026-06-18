"""
FastAPI routes for the Medicine Explanation System.
Handles /api/v1/drug/info and related endpoints.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from backend.data.drug_lookup import DrugLookup
from backend.ml.model_inference import SideEffectPredictor
from backend.ml.explainability import ModelExplainer

app = FastAPI(title="Medicine Explanation System API", version="1.0.0")

# Allow all origins for local development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

drug_lookup = DrugLookup()
predictor = SideEffectPredictor()
explainer = ModelExplainer()


@app.get("/api/v1/drug/info")
def get_drug_info(
    name: str = Query(..., description="Drug name to look up"),
    mode: str = Query("patient", description="patient or research")
):
    """
    Combined endpoint: drug info + structure + side effects + explanations.
    This is what the frontend calls.
    """
    if not name or not name.strip():
        raise HTTPException(status_code=400, detail="Drug name is required")

    # Fetch drug info (includes structure with 3d_coordinates and 2d_svg)
    drug_data = drug_lookup.get_drug_info(name.strip())

    if drug_data.get("error") and not drug_data.get("drug_id"):
        raise HTTPException(status_code=404, detail=drug_data["error"])

    smiles = drug_data.get("structure", {}).get("smiles")

    # Side effect predictions
    side_effect_predictions = {"predictions": [], "error": "No SMILES available", "model_info": {}}
    if smiles:
        try:
            side_effect_predictions = predictor.predict(smiles, mode=mode)
        except Exception as e:
            side_effect_predictions = {"predictions": [], "error": str(e), "model_info": {}}

    # SHAP explanations (research mode only)
    explanations = {}
    if mode == "research" and smiles:
        try:
            explanations = explainer.explain(smiles)
        except Exception as e:
            explanations = {"error": str(e)}

    return {
        "drug_info": {
            "drug_id": drug_data.get("drug_id"),
            "standard_name": drug_data.get("standard_name", name),
            "approved_uses": drug_data.get("approved_uses", []),
            "metadata": drug_data.get("metadata", {}),
            "disclaimer": drug_data.get("disclaimer", ""),
        },
        "structure": drug_data.get("structure", {}),
        "side_effect_predictions": side_effect_predictions,
        "explanations": explanations,
    }


@app.get("/api/v1/drug/lookup")
def drug_lookup_endpoint(name: str = Query(...)):
    """Fetch drug info only."""
    result = drug_lookup.get_drug_info(name.strip())
    if result.get("error") and not result.get("drug_id"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.post("/api/v1/ml/predict-side-effects")
def predict_side_effects(payload: dict):
    smiles = payload.get("smiles")
    mode = payload.get("mode", "patient")
    if not smiles:
        raise HTTPException(status_code=400, detail="smiles is required")
    return predictor.predict(smiles, mode=mode)


@app.post("/api/v1/ml/explain")
def explain(payload: dict):
    smiles = payload.get("smiles")
    side_effect = payload.get("side_effect")
    if not smiles:
        raise HTTPException(status_code=400, detail="smiles is required")
    return explainer.explain(smiles, side_effect=side_effect)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("backend.api.routes:app", host="0.0.0.0", port=8000, reload=True)
