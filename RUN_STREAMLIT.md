# Running the Streamlit Frontend

## ✅ Streamlit is Installed!

Streamlit 1.52.2 has been successfully installed.

## Quick Start

### Option 1: Using the Run Script (Windows)

Double-click `run_streamlit.bat` or run:
```bash
.\run_streamlit.bat
```

### Option 2: Using Command Line

```bash
streamlit run frontend/streamlit_app.py
```

### Option 3: Using Python Module

```bash
python -m streamlit run frontend/streamlit_app.py
```

## Important: Start Backend First!

**Before running Streamlit, make sure your backend API is running:**

```bash
# Terminal 1: Start Backend
cd backend
python app.py
```

The backend should be running on `http://localhost:8000`

Then in **Terminal 2** (keep Terminal 1 running):

```bash
# Terminal 2: Start Streamlit
streamlit run frontend/streamlit_app.py
```

## What to Expect

1. Streamlit will start and show:
   ```
   You can now view your Streamlit app in your browser.
   Local URL: http://localhost:8501
   Network URL: http://192.168.x.x:8501
   ```

2. Your browser should automatically open to `http://localhost:8501`

3. If it doesn't open automatically, manually go to that URL

## Using the App

1. **Select Mode** in the sidebar:
   - Patient Mode: Simple view with tendency levels
   - Research Mode: Detailed view with confidence scores

2. **Enter a drug name** (e.g., "Paracetamol", "Aspirin", "Ibuprofen")

3. **Click "🔍 Lookup Drug"**

4. **View Results**:
   - Drug information
   - 2D molecular structure
   - Side-effect predictions
   - SHAP explanations (Research Mode only)

## Troubleshooting

### Backend Connection Error

**Error**: "Cannot connect to API"

**Fix**: Start the backend API first:
```bash
cd backend
python app.py
```

### Port Already in Use

**Error**: Port 8501 is already in use

**Fix**: Use a different port:
```bash
streamlit run frontend/streamlit_app.py --server.port 8502
```

### Stop the App

Press `Ctrl+C` in the terminal where Streamlit is running.

## Features Available

✅ Patient Mode - Simplified view  
✅ Research Mode - Detailed technical view  
✅ 2D Molecular Structure Visualization  
✅ Side-Effect Predictions (ML-based)  
✅ SHAP Explanations (Research Mode)  
✅ Drug Information from Authoritative Databases  

## Need Help?

See `frontend/STREAMLIT_QUICKSTART.md` for detailed documentation.
