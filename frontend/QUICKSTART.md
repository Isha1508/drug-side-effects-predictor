# Quick Start Guide

## Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
   
   If your backend runs on a different URL, update this accordingly.

3. **Start Backend**
   
   Make sure your Flask backend is running:
   ```bash
   # In the project root
   python backend/app.py
   ```
   The backend should be running on `http://localhost:8000`

4. **Start Frontend**
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:3000`

## Using the Application

1. **Search for a Drug**
   - Enter a drug name in the search bar (e.g., "Paracetamol", "Aspirin", "Ibuprofen")
   - Click the "Search" button

2. **View Results**
   - **Drug Information**: Basic drug details from authoritative databases
   - **Molecular Structure**: Switch between 2D and 3D views of the molecule
   - **Side Effects**: View predicted side effects grouped by tendency (Patient Mode) or with confidence scores (Research Mode)
   - **SHAP Explanations**: Detailed AI model explanations (Research Mode only)

3. **Toggle Modes**
   - **Patient Mode**: Simplified view with tendency levels (High/Moderate/Low)
   - **Research Mode**: Detailed view with confidence scores and technical information

4. **Theme Toggle**
   - Click the moon/sun icon to switch between dark and light themes

## Troubleshooting

### Backend Connection Issues
- Ensure the backend is running on the correct port
- Check `VITE_API_BASE_URL` in `.env` matches your backend URL
- Check browser console for CORS errors (backend should have CORS enabled)

### 3D Visualizations Not Loading
- Ensure all dependencies are installed: `npm install`
- Check browser console for WebGL errors
- Try a different browser (Chrome, Firefox, or Edge recommended)

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist && npm run build`

## Development Tips

- Hot reload is enabled - changes will auto-refresh
- Check browser DevTools console for any errors
- Use React DevTools extension for debugging
- Network tab shows API requests/responses
