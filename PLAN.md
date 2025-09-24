# Implementatieplan v1 – ClubDuty Pulse

## Doel en scope v1
- Anonieme peer-feedback: 2× sterk, 1× beter.
- Coach-dashboard: ruwe input, teamsamenvatting, per-speler bullets, export.
- V1-kaders: login met teamcode + token, ronde aanmaken/sluiten, toewijzing, invullen, dashboard, exports.

## Architectuur en repo
- Monorepo met Yarn workspaces: `apps/pulse-web` (Vite + React + DaisyUI) en `apps/pulse-api` (Express + Mongoose).
- CI: lint-only placeholder; uitbreiden met build/test zodra scaffolds er zijn.
- Repo: `https://github.com/vincentblokker/ClubDuty_Pulse`

## Fases (stap-voor-stap met logica)

### 1) Projectscaffolds en basis-setup
- Doel: Werkende skeletons.
- Acties:
  - Scaffold `pulse-web` (Vite + React 19 + TS + Tailwind + DaisyUI).
  - Scaffold `pulse-api` (Express + TS, nodemon/ts-node-dev, Mongoose).
  - Gezamenlijke scripts op root: `yarn dev`, `yarn build`, `yarn lint`.
- Definition of Done:
  - `yarn dev` start beide apps.
  - CI lint groen.
  - Basis README-secties per app aanwezig.

### 2) Datamodel en Mongoose-schema’s
- Doel: v1-datamodel in code.
- Acties:
  - Implementeer modellen: `Team`, `Player`, `Round`, `Assignment`, `Feedback`.
  - Indexen en referenties; simpele seed-scripts.
- Definition of Done:
  - Mongoose-schema’s en relaties werken.
  - Seed-data via script oproepbaar en zichtbaar in DB.

### 3) Auth light: teamcode + token
- Doel: Eenvoudige sessie zonder SSO.
- Acties:
  - Endpoint `POST /auth/login {teamCode, token} -> {jwt}`.
  - Middleware voor JWT-validatie (protect routes).
  - Web loginpagina; state in Zustand; route-guards.
- Definition of Done:
  - Succesvolle login-flow end-to-end met foutmeldingen.

### 4) Rondebeheer en voortgang
- Doel: Ronde lifecycle en progressie.
- Acties:
  - Endpoints: `POST /rounds`, `POST /rounds/:id/close`, `GET /rounds/:id/progress`.
  - Web UI: coach opent/sluit ronde; progressiebalk per speler.
- Definition of Done:
  - Coach kan ronde openen en sluiten; voortgang zichtbaar.

### 5) Toewijzingslogica
- Doel: Eerlijke random toewijzing (Δ ≤ 1), geen self-ratings; pin-optie.
- Acties:
  - Service `assignment`: verdeel 2–3 ratees per speler, optionele “pin”.
  - Endpoint `POST /rounds/:id/assign`.
- Definition of Done:
  - Unit-tests voor evenredigheid, geen self, pin-case.

### 6) Feedback invullen (formulier UX)
- Doel: Snel, valideerbaar formulier.
- Acties:
  - Web: React Hook Form + Zod, max 140 chars, voorbeeld-placeholders.
  - Endpoint `POST /feedback`.
- Definition of Done:
  - Client- en servervalidatie; success-state + confetti; dubbele submit voorkomen.

### 7) Coach-dashboard (ruw + samenvattingen)
- Doel: Overzichtelijk coachbeeld zonder namen naar team.
- Acties:
  - Endpoint: `POST /rounds/:id/summary` (teamBullets, players[]).
  - Web: tabs/secties voor ruwe feedback, teamsamenvatting, per-speler bullets.
- Definition of Done:
  - Coach ziet ruwe input; teamsamenvatting en per-speler weergave correct.

### 8) Exports en share
- Doel: Eenvoudig delen zonder privacylekken.
- Acties:
  - Endpoints: `GET /rounds/:id/export.csv|pdf` (teamversie zonder namen).
  - Web: Exportknoppen; WhatsApp-tekstgenerator (v1.1).
- Definition of Done:
  - Downloadbare CSV/PDF; teamversie zonder namen; voorbeeld-WhatsApp tekst.

### 9) Security/quality en PWA-basics
- Doel: Basis hardening + klaar voor PWA.
- Acties:
  - Rate limiting, input sanitization, audit van privacyregels.
  - PWA plugin en manifest; offline cache (v1.2).
- Definition of Done:
  - Security-checklist afgevinkt; Lighthouse PWA score ≥ baseline.

### 10) QA, demo en release
- Doel: Werkende demo; klaarzetten voor integratie met ClubDuty.
- Acties:
  - E2E smoke (Cypress): login → invullen → dashboard → export.
  - Demo-seed en scripts.
- Definition of Done:
  - Demo-scenario slaagt; CI draait lint + build + tests.

## Branching en CI
- Branching: feature branches → PR’s naar `main`, squash-merge.
- CI uitbreiden:
  - Stapsgewijs `lint`, `build:web`, `build:api`, daarna `test:unit`, `test:e2e`.
  - Minimale checks om regressie te beperken.

## Risico’s en mitigatie
- Onzininput door jongeren: strikte validatie + voorbeeldteksten.
- Privacy: coach-only ruwe data; teamexporten geanonimiseerd; logs scrubben.
- Adoptie: korte flows, duidelijke microcopy, lage frictie (confetti/motivatie).
- Evenredigheid toewijzing: unit-tests en visuele progress-check.

## Volgende 3 concrete stappen
1. Scaffold `pulse-web` + Tailwind/DaisyUI en `pulse-api` + Express/Mongoose (DoD: `yarn dev` werkt).
2. Mongoose-schema’s + seed-scripts (DoD: testdata zichtbaar via endpoint).
3. Auth light (teamcode + token) end-to-end (DoD: ingelogd tot protected route).
