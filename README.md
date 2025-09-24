# ClubDuty Pulse

Anonieme peer-feedback voor sportteams. Spelers geven elkaar **2 sterke punten** en **1 verbeterpunt**.  
Coaches krijgen directe **teamthema’s** en **per-speler bullets** (zonder namen).

## ✨ Waarom
Snelle, eerlijke input uit het team, zonder drama. Coach ziet patronen, team krijgt duidelijke thema’s.

## 🧱 Tech Stack (uitgelijnd met ClubDuty)
- Frontend: **React 19**, **TypeScript 5.8.2**, **Vite 6.2.2**
- Styling: **Tailwind CSS 4.0.14**, **DaisyUI v5**
- State: **Zustand 5.0.3**
- Forms: **React Hook Form 7.54.2** + **Zod 3.24.2**
- Backend: **Express 4.21.2**
- Database: **MongoDB 7.0.5** (Mongoose)
- Optioneel (later): TanStack Table, ApexCharts/D3, Socket.io, i18next, PWA
- Tooling: Yarn, ESLint + Prettier, Husky + lint-staged, Jest + Cypress

> Stack en versies zijn afgestemd op ClubDuty voor naadloze koppeling. 

## 📁 Structuur
```text
apps/
pulse-web/              # Vite + React + DaisyUI
src/
pages/              # Login / Feedback / Dashboard
components/
forms/            # FeedbackForm, StrengthField, ImproveField
dashboard/        # TeamSummary, PlayerList, ExportButtons
ui/               # DaisyUI wrappers (Button, Card, Badge…)
store/              # Zustand stores (session, round, feedback)
lib/                # api.ts, assign.ts, validators.ts
index.css           # @import "tailwindcss";
main.tsx, App.tsx   # routes
pulse-api/              # Express + Mongoose
src/
models/             # Team, Player, Round, Assignment, Feedback
routes/             # /auth, /rounds, /feedback, /export
services/           # assignment, summary, export
middleware/         # auth, rate-limit, validation
server.ts
shared/
config/               # ESLint/TS configs
utils/                # nanoid, date-fns helpers
```

## ⚙️ Installatie (dev)
```bash
# Monorepo (Yarn workspaces)
yarn install
yarn dev        # start web en api in parallel (concurrently)
```

🔐 Env (voorbeeld)

apps/pulse-api/.env
```env
PORT=5011
MONGODB_URI=mongodb://localhost:27017/clubduty-pulse
JWT_SECRET=change-me
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```


🧪 Scripts
```bash
yarn dev            # web + api
yarn dev:web        # alleen frontend
yarn dev:api        # alleen backend
yarn build          # build web
yarn test           # unit tests (Jest)
yarn cy:open        # e2e (Cypress)
yarn lint           # eslint + prettier
```

🖥️ Frontend (pages)
	-	/login (teamcode + token)
	-	/feedback Invullen 2× sterk, 1× beter voor toegewezen teamgenoten
	-	/dashboard Coachoverzicht: ruwe feedback, teamthema’s, export


🧩 API (schets)
```http
POST /auth/login                 {teamCode, token} -> {jwt}
POST /rounds                     {teamId, title} -> {roundId}
POST /rounds/:id/assign          -> maakt assignments (evenredig)
GET  /rounds/:id/progress        -> % ingevuld per speler
GET  /rounds/:id/my-assign       -> ratees voor ingelogde speler
POST /feedback                   {roundId, rateeId, strengths[2], improve}
POST /rounds/:id/summary         -> {teamBullets[], players[]}
GET  /rounds/:id/export.csv|pdf  -> download
```


🎨 DaisyUI
	-	Thema volgt ClubDuty (primary/secondary idem).
	-	Componenten via wrappers in src/components/ui:
```tsx
<button className="btn btn-primary btn-soft">Versturen</button>
<div className="card card-bordered">...</div>
```


✅ UX-richtlijnen
	-	Max 140 tekens per veld, met voorbeeld-placeholders.
	-	Geen namen in team-summary exports.
	-	Confetti op submit (laag­drempelig, high-five effect).

🔒 Security
	-	JWT + rate limiting + input validation (Zod server-side).
	-	Anonimiteit: coach-only raw; exports voor team = thema’s zonder namen.

🚀 Roadmap
	-	v1: Ronde → invullen → dashboard → export
	-	v1.1: Per-speler bullets + WhatsApp-generator
	-	v1.2: PWA + offline cache
	-	v2: Club-overzicht, i18n, Socket.io live voortgang
	-	v3: Integratie met ClubDuty (SSO light, trainingsplanner sync)



---

## Bonus: DaisyUI thema (matching ClubDuty)
Zet dit in `pulse-web/tailwind.config.js` of in DaisyUI theme config:
```js
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        clubduty: {
          "primary": "#25B964",
          "secondary": "#1F9D55",
          "accent": "#66CC88",
          "neutral": "#1f2937",
          "base-100": "#ffffff",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
    logs: false,
  },
}
```


Mini-package.json (kern)

Gebruik Yarn en versies die matchen:
```json
{
  "name": "@clubduty/pulse-web",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-router-dom": "^6.26.2",
    "zustand": "5.0.3",
    "react-hook-form": "7.54.2",
    "zod": "3.24.2",
    "axios": "^1.7.4"
  },
  "devDependencies": {
    "vite": "6.2.2",
    "typescript": "5.8.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "4.0.14",
    "daisyui": "^5.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "eslint": "^9.12.0",
    "prettier": "^3.3.3"
  }
}
```
