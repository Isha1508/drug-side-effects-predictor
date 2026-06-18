# Quick Start Guide

## Prerequisites

- Python 3.8 or higher
- pip package manager
- Internet connection (for API calls and data downloads)

## Installation

### 1. Clone/Download Project

```bash
cd "AD Project"
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: RDKit installation may take a few minutes. If you encounter issues, see troubleshooting section.

### 4. Set Up Environment Variables

```bash
# Copy example env file
copy .env.example .env  # Windows
# OR
cp .env.example .env     # Linux/Mac
```

Edit `.env` if needed (defaults should work for basic setup).

### 5. Create Required Directories

```bash
mkdir -p data/raw data/processed data/cache
mkdir -p models
mkdir -p notebooks
```

## Running the System

### Option 1: Without Trained Model (Database Lookup Only)

You can run the system without a trained model to test database lookups and molecular structure visualization:

```bash
# Start backend API
cd backend
python app.py
```

In another terminal:

```bash
# Start frontend
cd frontend
streamlit run streamlit_app.py
```

**Note**: Side-effect predictions will show an error until you train the model.

### Option 2: With Trained Model

#### Step 1: Download Training Data

1. Download SIDER dataset from: http://sideeffects.embl.de/download/
2. Extract to `data/raw/` directory

#### Step 2: Train Model

```bash
# Open Jupyter notebook
jupyter notebook notebooks/train_model.ipynb
```

Follow the notebook steps to:
- Load and preprocess data
- Extract features
- Train model
- Save model files

#### Step 3: Run System

```bash
# Start backend
cd backend
python app.py

# Start frontend (in another terminal)
cd frontend
streamlit run streamlit_app.py
```

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:5000/health

# Drug lookup
curl "http://localhost:5000/api/v1/drug/lookup?name=Paracetamol"

# Complete info
curl "http://localhost:5000/api/v1/drug/info?name=Paracetamol&mode=patient"
```

### Using Python

```python
import requests

# Drug lookup
response = requests.get("http://localhost:5000/api/v1/drug/lookup", 
                       params={"name": "Paracetamol"})
print(response.json())

# Side-effect prediction (requires trained model)
response = requests.post("http://localhost:5000/api/v1/ml/predict-side-effects",
                        json={"smiles": "CC(=O)Nc1ccc(O)cc1", "mode": "research"})
print(response.json())
```

## Using the Frontend

1. Open browser to: http://localhost:8501
2. Enter a drug name (e.g., "Paracetamol", "Aspirin")
3. Select mode: Patient Mode or Research Mode
4. Click "Lookup Drug"
5. View results:
   - Drug information (database-sourced)
   - Molecular structure (2D visualization)
   - Side-effect predictions (if model trained)
   - SHAP explanations (Research Mode only)

## Troubleshooting

### RDKit Installation Issues

If `rdkit-pypi` fails to install:

```bash
# Try conda instead
conda install -c conda-forge rdkit
```

### Port Already in Use

If port 5000 is in use:

```bash
# Edit .env file
API_PORT=5001
```

### Model Not Found Errors

- Ensure model files are in `models/` directory
- Check model name matches `MODEL_NAME` in `.env`
- Train model using `notebooks/train_model.ipynb`

### API Connection Errors

- Ensure backend is running before starting frontend
- Check `API_BASE_URL` in `frontend/streamlit_app.py`
- Verify firewall/antivirus isn't blocking connections

### External API Rate Limits

- Responses are cached for 24 hours
- If rate limited, wait and retry
- Consider using API keys if available

## Next Steps

1. **Train Model**: Follow `notebooks/train_model.ipynb`
2. **Customize**: Modify config in `.env` and `backend/utils/config.py`
3. **Extend**: Add new features, models, or data sources
4. **Document**: Update documentation as you make changes

## Getting Help

- Check `docs/` directory for detailed documentation
- Review `docs/EDGE_CASES.md` for common issues
- See `docs/LIMITATIONS.md` for known limitations
- Check code comments for implementation details

## Important Reminders

⚠️ **This is NOT a medical advice system**
- Always include disclaimers
- Never use for clinical decisions
- Document all limitations
- Follow ethical guidelines



