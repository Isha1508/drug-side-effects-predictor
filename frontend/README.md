# Medicine Explanation System - Frontend

Modern React-based frontend for the Medicine Explanation System with 3D visualizations and interactive UI.

## Features

- 🎨 **Modern Medical Dashboard Design** - Clean, professional interface with glassmorphism effects
- 🧬 **3D Molecular Structure Viewer** - Interactive 3D molecular visualization using React Three Fiber
- 💊 **3D Side Effect Pills** - Interactive 3D pill visualizations for side effects
- 📊 **Interactive Charts** - Side effect predictions with Recharts
- 🧠 **SHAP Explanations** - Visual AI model explanations with force-directed graphs
- 🌓 **Dark/Light Mode** - Theme toggle with smooth transitions
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ✨ **Smooth Animations** - Framer Motion animations throughout

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Three Fiber** - 3D graphics
- **Recharts** - Data visualization
- **Zustand** - State management
- **Axios** - API client

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API server running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL if your backend is not on localhost:8000
```

3. Start development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The production build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── HeroSection.tsx         # Main search interface
│   │   ├── DrugResults.tsx         # Results container
│   │   ├── DrugInfoCard.tsx        # Drug information display
│   │   ├── MolecularViewer.tsx     # 2D/3D molecular viewer
│   │   ├── Molecule3D.tsx          # 3D molecular structure
│   │   ├── Molecule2D.tsx          # 2D molecular structure
│   │   ├── SideEffectsVisualization.tsx  # Side effects display
│   │   ├── SideEffectPill3D.tsx    # 3D pill visualization
│   │   ├── SHAPExplanations.tsx    # AI explanations
│   │   ├── FloatingParticles.tsx   # Animated particles
│   │   ├── ModeToggle.tsx          # Patient/Research mode
│   │   └── ThemeToggle.tsx         # Dark/Light mode
│   ├── services/
│   │   └── api.ts                  # API client
│   ├── store/
│   │   └── useAppStore.ts          # Zustand state store
│   ├── types/
│   │   └── index.ts                # TypeScript types
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Configuration

### API Base URL

Set `VITE_API_BASE_URL` in `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

For production, set this to your deployed backend URL.

## Features in Detail

### 3D Molecular Viewer

Interactive 3D molecular structure visualization with:
- Orbit controls (rotate, zoom, pan)
- CPK coloring scheme for atoms
- Smooth animations
- 2D/3D view toggle

### Side Effects Visualization

- **Patient Mode**: Grouped by tendency (High/Moderate/Low) with 3D pill shapes
- **Research Mode**: Detailed charts and tables with confidence scores

### SHAP Explanations

- Feature contribution charts
- Highlighted molecular substructures
- Detailed feature contribution tables
- Only visible in Research Mode

## Deployment

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variable `VITE_API_BASE_URL` in Vercel dashboard

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variable `VITE_API_BASE_URL` in Netlify dashboard

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

See main project LICENSE file.
