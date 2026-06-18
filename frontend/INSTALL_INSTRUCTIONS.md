# Installation Instructions

## Fix for "react/jsx-runtime" Error

If you see the error:
```
This JSX tag requires the module path 'react/jsx-runtime' to exist
```

**This error occurs because dependencies haven't been installed yet.**

### Solution:

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **If the error persists after installation:**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again
   - Restart your IDE/TypeScript server

3. **Verify installation:**
   ```bash
   npm list react @types/react
   ```

### Why this happens:

TypeScript needs the React type definitions (`@types/react`) to understand JSX syntax. These are installed as part of `npm install`. The configuration is correct, but TypeScript can't find the types until dependencies are installed.

Once dependencies are installed, the error will disappear.
