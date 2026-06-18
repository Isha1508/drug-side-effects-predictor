# Node.js Installation Guide

## Problem
`npm is not recognized` - This means Node.js (which includes npm) is not installed on your system.

## Solution: Install Node.js

Node.js includes npm automatically. Follow these steps:

### Option 1: Official Installer (Recommended)

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version (recommended)
   - Choose the Windows Installer (.msi) for your system (64-bit or 32-bit)

2. **Install Node.js:**
   - Run the downloaded installer
   - Follow the installation wizard
   - **Important:** Make sure to check "Add to PATH" option during installation
   - Complete the installation

3. **Verify Installation:**
   - Close and reopen your terminal/command prompt
   - Run these commands:
     ```bash
     node --version
     npm --version
     ```
   - You should see version numbers for both

4. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

### Option 2: Using Chocolatey (Windows Package Manager)

If you have Chocolatey installed:
```powershell
choco install nodejs-lts
```

Then verify:
```bash
node --version
npm --version
```

### Option 3: Using Winget (Windows 11)

If you have Windows 11 with winget:
```powershell
winget install OpenJS.NodeJS.LTS
```

## After Installation

1. **Restart your terminal/IDE** (important - so PATH changes take effect)

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```
   This will install all required packages including React, TypeScript, etc.

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Troubleshooting

### If npm still not recognized after installation:

1. **Restart your computer** (sometimes needed for PATH updates)

2. **Manually add to PATH** (if needed):
   - Open System Properties → Environment Variables
   - Add Node.js installation path (usually `C:\Program Files\nodejs\`) to PATH
   - Restart terminal

3. **Check installation location:**
   ```powershell
   Get-Command node -ErrorAction SilentlyContinue
   ```

4. **Reinstall Node.js** if PATH wasn't set correctly

## Verify Installation

Run these commands to verify everything works:
```bash
node --version    # Should show v18.x.x or v20.x.x
npm --version     # Should show 9.x.x or 10.x.x
```

Once Node.js is installed, you can proceed with:
```bash
cd frontend
npm install
npm run dev
```

## Required Versions

- **Node.js**: 18.0.0 or higher (LTS recommended)
- **npm**: 9.0.0 or higher (comes with Node.js)

## Alternative: Use Python Backend Only

If you prefer not to install Node.js, you can continue using the Streamlit frontend:

```bash
# Use the existing Streamlit app
streamlit run frontend/streamlit_app.py
```

However, for the new React frontend with 3D effects, Node.js is required.
