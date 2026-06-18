# API Design Document

## Overview

RESTful API for medicine explanation system with clear separation between database-sourced clinical data and ML-based research predictions.

## Base URL

```
http://localhost:5000/api/v1
```

## Endpoints

### 1. Drug Lookup

**GET** `/drug/lookup?name={drug_name}`

Fetches drug information from authoritative databases.

**Response:**
```json
{
  "drug_id": "string",
  "standard_name": "string",
  "approved_uses": [
    {
      "indication": "string",
      "source": "RxNorm|DrugBank|OpenFDA"
    }
  ],
  "metadata": {
    "molecular_formula": "string",
    "molecular_weight": "float",
    "source": "string"
  },
  "disclaimer": "This information is sourced from authoritative databases and is for educational purposes only."
}
```

### 2. Molecular Structure

**GET** `/drug/structure?drug_id={drug_id}`

Fetches molecular structure data (SMILES, InChI).

**Response:**
```json
{
  "drug_id": "string",
  "smiles": "string",
  "inchi": "string",
  "inchi_key": "string",
  "source": "PubChem|ChEMBL",
  "2d_svg": "string (base64 encoded SVG)",
  "3d_coordinates": {
    "atoms": [...],
    "bonds": [...]
  }
}
```

### 3. Side-Effect Prediction (ML)

**POST** `/ml/predict-side-effects`

Predicts potential side-effect tendencies from molecular structure.

**Request:**
```json
{
  "smiles": "string",
  "mode": "patient|research"
}
```

**Response (Patient Mode):**
```json
{
  "predictions": [
    {
      "side_effect": "string",
      "tendency": "low|moderate|high",
      "category": "string"
    }
  ],
  "disclaimer": "These are research-oriented predictions based on molecular structure analysis. Not for clinical use.",
  "model_info": {
    "model_name": "string",
    "version": "string"
  }
}
```

**Response (Research Mode):**
```json
{
  "predictions": [
    {
      "side_effect": "string",
      "confidence_score": 0.0-1.0,
      "category": "string"
    }
  ],
  "model_info": {
    "model_name": "string",
    "version": "string",
    "training_date": "string"
  },
  "disclaimer": "Research model predictions. Not validated for clinical use."
}
```

### 4. Explainability

**POST** `/ml/explain`

Generates SHAP explanations for predictions.

**Request:**
```json
{
  "smiles": "string",
  "side_effect": "string (optional, if not provided explains all)"
}
```

**Response:**
```json
{
  "global_importance": {
    "features": ["string"],
    "importance_scores": [float]
  },
  "local_explanation": {
    "feature_contributions": [
      {
        "feature": "string",
        "contribution": float,
        "substructure_match": "string (SMILES fragment)"
      }
    ],
    "base_value": float,
    "prediction": float
  },
  "highlighted_substructures": [
    {
      "smiles_fragment": "string",
      "importance": float,
      "description": "string"
    }
  ]
}
```

### 5. Combined Drug Information

**GET** `/drug/info?name={drug_name}&mode={patient|research}`

Convenience endpoint that combines all information.

**Response:**
```json
{
  "drug_info": { /* from /drug/lookup */ },
  "structure": { /* from /drug/structure */ },
  "side_effect_predictions": { /* from /ml/predict-side-effects */ },
  "explanations": { /* from /ml/explain */ }
}
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": true,
  "message": "string",
  "code": "ERROR_CODE"
}
```

**Error Codes:**
- `DRUG_NOT_FOUND`: Drug name not found in databases
- `INVALID_SMILES`: Invalid SMILES string
- `MODEL_ERROR`: ML model prediction failed
- `API_ERROR`: External API error
- `VALIDATION_ERROR`: Request validation failed

## Rate Limiting

- 100 requests per minute per IP
- External API calls cached for 24 hours

## Data Flow

```
User Input (Drug Name)
    ↓
Drug Lookup API (RxNorm/DrugBank)
    ↓
Get Drug ID & Clinical Info (Database)
    ↓
Fetch SMILES from PubChem/ChEMBL
    ↓
Generate Fingerprints (ECFP/Morgan)
    ↓
ML Model Inference
    ↓
SHAP Explanation
    ↓
Combine & Return Response
```



