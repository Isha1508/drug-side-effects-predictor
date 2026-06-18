# Project Structure

```
AD Project/
│
├── backend/                    # Backend API and ML pipeline
│   ├── __init__.py
│   ├── app.py                  # Main Flask application
│   │
│   ├── api/                    # API endpoints (if separated)
│   │   └── __init__.py
│   │
│   ├── data/                   # Data processing modules
│   │   ├── __init__.py
│   │   ├── drug_lookup.py      # Drug lookup from RxNorm/DrugBank/PubChem
│   │   └── molecular_structure.py  # SMILES fetching, 2D/3D visualization
│   │
│   ├── ml/                     # Machine learning modules
│   │   ├── __init__.py
│   │   ├── feature_extraction.py   # ECFP/Morgan fingerprint generation
│   │   ├── model_inference.py      # Side-effect prediction
│   │   └── explainability.py       # SHAP explanations
│   │
│   └── utils/                  # Utility modules
│       ├── __init__.py
│       └── config.py           # Configuration settings
│
├── frontend/                   # Web interface
│   └── streamlit_app.py        # Streamlit frontend application
│
├── data/                       # Data storage
│   ├── raw/                    # Raw datasets (SIDER, etc.)
│   ├── processed/              # Processed/cleaned data
│   └── cache/                  # API response cache
│       ├── drug_lookup/
│       └── molecular_structure/
│
├── models/                     # Trained ML models
│   ├── side_effect_predictor_v1.joblib
│   ├── side_effect_predictor_v1_labels.json
│   └── side_effect_predictor_v1_metadata.json
│
├── notebooks/                  # Jupyter notebooks
│   └── train_model.ipynb       # Model training pipeline
│
├── docs/                       # Documentation
│   ├── API_DESIGN.md           # API endpoint documentation
│   ├── EDGE_CASES.md           # Edge case handling
│   ├── ML_PIPELINE_ORDER.md    # ML implementation order
│   ├── LIMITATIONS.md          # System limitations
│   └── QUICK_START.md          # Quick start guide
│
├── .env                        # Environment variables (create from .env.example)
├── .env.example                # Example environment configuration
├── .gitignore                  # Git ignore rules
├── requirements.txt            # Python dependencies
├── README.md                   # Main project README
└── PROJECT_STRUCTURE.md        # This file
```

## Directory Descriptions

### backend/
Contains all backend logic:
- **app.py**: Main Flask application with API endpoints
- **data/**: Modules for fetching drug information and molecular structures
- **ml/**: Machine learning pipeline (feature extraction, inference, explainability)
- **utils/**: Configuration and utility functions

### frontend/
Streamlit-based web interface for user interaction.

### data/
- **raw/**: Download SIDER and other datasets here
- **processed/**: Cleaned and preprocessed data
- **cache/**: Cached API responses (auto-managed)

### models/
Trained ML models and associated files (created after training).

### notebooks/
Jupyter notebooks for:
- Data exploration
- Model training
- Analysis and visualization

### docs/
Comprehensive documentation covering:
- API design
- Edge cases
- ML pipeline
- Limitations
- Quick start guide

## Key Files

### Configuration
- `.env`: Environment variables (create from `.env.example`)
- `backend/utils/config.py`: Application configuration

### Main Applications
- `backend/app.py`: Backend API server
- `frontend/streamlit_app.py`: Frontend web interface

### Core Modules
- `backend/data/drug_lookup.py`: Drug database lookups
- `backend/data/molecular_structure.py`: Molecular structure handling
- `backend/ml/feature_extraction.py`: Feature engineering
- `backend/ml/model_inference.py`: ML predictions
- `backend/ml/explainability.py`: SHAP explanations

## Data Flow

```
User Input (Drug Name)
    ↓
backend/app.py (API endpoint)
    ↓
backend/data/drug_lookup.py (Get drug ID)
    ↓
backend/data/molecular_structure.py (Get SMILES)
    ↓
backend/ml/feature_extraction.py (Generate fingerprints)
    ↓
backend/ml/model_inference.py (Predict side effects)
    ↓
backend/ml/explainability.py (SHAP explanations)
    ↓
Response to Frontend
```

## Adding New Features

### New API Endpoint
1. Add route in `backend/app.py`
2. Implement logic in appropriate module
3. Update `docs/API_DESIGN.md`

### New ML Model
1. Train in `notebooks/`
2. Save to `models/`
3. Update `backend/ml/model_inference.py` to load new model
4. Update metadata

### New Data Source
1. Add lookup method in `backend/data/drug_lookup.py` or create new module
2. Update caching logic
3. Document in README



