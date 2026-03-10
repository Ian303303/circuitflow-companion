# CircuitFlow Regulation Companion

Standalone field reference tool for electrical inspectors working to I.S. 10101.

## Tools
- **Zs Calculator** — Max Zs pass/fail (100% Irish rule)
- **Observation Lookup** — C1/C2/C3/FI code reference
- **RCD Test Times** — Trip time limits by type
- **Special Locations** — Part 7 zone guides
- **Checklists** — DB, Socket, Lighting, EICR pre-check
- **Regulation Search** — I.S. 10101 lookup

## Deploy to Vercel (3 steps)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial CircuitFlow Companion"
git remote add origin https://github.com/YOUR_USERNAME/circuitflow-companion.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your `circuitflow-companion` repo
4. Framework: **Vite** (auto-detected)
5. Click **Deploy**

### Step 3 — Wire dashboard tile
In your CircuitFlow dashboard, update the Companion tile URL to:
```
https://circuitflow-companion.vercel.app
```

## Local Development
```bash
npm install
npm run dev
```

## Integration with main CircuitFlow app
The `CompanionApp` component can also be dropped directly into your main app:
```jsx
import CompanionApp from './companion/CompanionApp'

// Pass Supabase auth state:
<CompanionApp
  isLoggedIn={session !== null}
  onLogin={() => navigate('/login')}
/>
```
