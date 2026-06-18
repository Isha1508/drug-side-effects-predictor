# Medicine Explanation System with ML-Based Side-Effect Prediction

## ⚠️ CRITICAL DISCLAIMER

**This is NOT a medical advice system. This application is for educational and research purposes only.**

- **DO NOT** use predictions for clinical decision-making
- **DO NOT** replace professional medical consultation
- All clinical information comes from authoritative databases (non-ML)
- ML predictions are research-oriented and indicate potential tendencies only
- Always consult healthcare professionals for medical decisions

## Project Overview

A patient-centric interactive web application that:
1. Explains medicines using trusted medical databases
2. Visualizes molecular structures (2D and 3D)
3. Predicts potential side-effect tendencies using ML (research model)
4. Provides explainable AI insights using SHAP

## Project Structure

```
.
├── backend/              # Backend API and ML pipeline
│   ├── api/             # API endpoints
│   ├── ml/              # ML models and inference
│   ├── data/            # Data processing modules
│   ├── utils/           # Utility functions
│   └── app.py           # Main Flask/FastAPI application
├── frontend/            # Web interface
├── data/                # Training data and cache
├── models/              # Trained ML models
├── notebooks/           # Jupyter notebooks for exploration
├── docs/                # Documentation
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## ML Pipeline Implementation Order

1. **Data Collection & Preprocessing**
   - Download SIDER dataset
   - Fetch ChEMBL drug data
   - Clean and standardize drug identifiers
   - Extract SMILES strings

2. **Feature Engineering**
   - Generate ECFP/Morgan fingerprints from SMILES
   - Calculate physicochemical descriptors
   - Create multi-label target matrix (side effects)

3. **Model Training**
   - Baseline: Logistic Regression (multi-label)
   - Optional: XGBoost
   - Optional: GNN (experimental)
   - Cross-validation and evaluation

4. **Model Persistence**
   - Save trained models
   - Save feature scalers/encoders
   - Document model metadata

5. **Inference Pipeline**
   - Drug name → SMILES lookup
   - SMILES → Fingerprint conversion
   - Model prediction
   - Confidence scoring

6. **Explainability**
   - SHAP integration
   - Feature importance mapping
   - Substructure highlighting

## Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download required data (see data/README.md)
```

## Usage

### Backend
```bash
cd backend
python app.py
```

### Frontend
```bash
cd frontend
streamlit run app.py  # If using Streamlit
# OR
npm start  # If using React
```

## API Endpoints

See `docs/API_DESIGN.md` for detailed API documentation.

## Edge Cases & Limitations

See `docs/EDGE_CASES.md` for comprehensive edge case handling.

## Ethical Considerations

- All outputs clearly labeled as research/educational
- Prominent disclaimers in UI
- No disease/indication prediction via ML
- Clinical data sourced only from authoritative databases
- Transparent about model limitations

## License

Educational/Research Use Only



