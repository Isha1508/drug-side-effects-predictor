# Streamlit Frontend - Quick Start Guide

## Prerequisites

1. **Python 3.8+** installed
2. **Backend API running** on `http://localhost:8000`
3. **Dependencies installed** from `requirements.txt`

## Installation

If you haven't installed dependencies yet:

```bash
# From project root
pip install -r requirements.txt
```

Or install Streamlit specifically:
```bash
pip install streamlit requests
```

## Running the App

### Step 1: Start the Backend API

First, make sure your Flask backend is running:

```bash
# From project root
cd backend
python app.py
```

The backend should be running on `http://localhost:8000`

### Step 2: Start the Streamlit Frontend

In a **new terminal window**:

```bash
# From project root
streamlit run frontend/streamlit_app.py
```

Or navigate to frontend directory first:
```bash
cd frontend
streamlit run streamlit_app.py
```

### Step 3: Open in Browser

Streamlit will automatically open your default browser at:
```
http://localhost:8501
```

If it doesn't open automatically, manually navigate to that URL.

## Using the App

1. **Select Mode**: Choose "Patient Mode" or "Research Mode" in the sidebar
2. **Enter Drug Name**: Type a drug name (e.g., "Paracetamol", "Aspirin", "Ibuprofen")
3. **Click Search**: Click the "🔍 Lookup Drug" button
4. **View Results**: 
   - Drug information from authoritative databases
   - 2D molecular structure visualization
   - Side-effect predictions (grouped by tendency in Patient Mode, or with scores in Research Mode)
   - SHAP explanations (Research Mode only)

## Features

- ✅ **Patient Mode**: Simplified view with tendency levels (High/Moderate/Low)
- ✅ **Research Mode**: Detailed view with confidence scores and technical information
- ✅ **2D Molecular Visualization**: SVG-based molecular structure display
- ✅ **Side-Effect Predictions**: ML-based predictions with clear disclaimers
- ✅ **SHAP Explanations**: AI model explainability (Research Mode)

## Troubleshooting

### Backend Connection Error

**Error**: "Cannot connect to API"

**Solution**: 
- Make sure backend is running: `python backend/app.py`
- Check backend is on port 8000
- Verify backend health: `http://localhost:8000/health`

### Streamlit Not Found

**Error**: `'streamlit' is not recognized`

**Solution**:
```bash
pip install streamlit
```

### Port Already in Use

**Error**: Port 8501 is already in use

**Solution**:
```bash
streamlit run frontend/streamlit_app.py --server.port 8502
```

Or change the port in Streamlit config.

### Module Not Found Errors

**Error**: Import errors when running

**Solution**:
```bash
# Make sure you're using the correct Python environment
# If using venv, activate it first
python -m pip install -r requirements.txt
```

## Configuration

To change the API base URL, set environment variable:
```bash
# Windows PowerShell
$env:API_BASE_URL="http://localhost:8000/api/v1"

# Windows CMD
set API_BASE_URL=http://localhost:8000/api/v1

# Linux/Mac
export API_BASE_URL=http://localhost:8000/api/v1
```

Or modify `API_BASE_URL` in `frontend/streamlit_app.py` (line 13).

## Stopping the App

Press `Ctrl+C` in the terminal where Streamlit is running.

## Next Steps

- The app will automatically reload when you save changes to `streamlit_app.py`
- Check the sidebar for settings and information
- Try different drugs to explore the system
- Switch between Patient and Research modes to see different views
