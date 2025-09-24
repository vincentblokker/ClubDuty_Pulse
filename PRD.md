PRD – ClubDuty Pulse

Doel
Anonieme peer-feedback (2× sterk, 1× beter) per speler, geclusterd naar teamthema’s voor coaches. Losse micro-app, later koppelbaar aan ClubDuty.

Probleem
Feedback is vaak ad-hoc en persoonsgebonden; coaches missen snelle, bruikbare patronen zonder drama.

Oplossing
	- Random toewijzing van 2–3 teamgenoten per speler.
	- Korte DaisyUI-forms (max 140 tekens per input).
	- Coach-dashboard met: ruwe input, teamsamenvatting, per-speler bullets, exports (CSV/PDF/WhatsApp).
	- Optie om 1 speler door iedereen te laten beoordelen.

Scope v1
	- Login met teamcode + 6-cijferige token.
	- Ronde aanmaken/sluiten, voortgang per speler.
	- Teamthema’s (AI-ready) + exports.
	- Alleen coach ziet ruwe feedback; team krijgt thema’s (geen namen).

Niet in v1
	- Clubbrede overzichten, i18n-flows, notificatiekanalen (wel voorbereid in de stack).

Tech/Stack (gematcht met ClubDuty)
	- Frontend: React 19, TypeScript 5.8.2, Vite 6.2.2
	- Styling: Tailwind CSS 4.0.14, DaisyUI v5
	- State: Zustand 5.0.3
	- Forms: React Hook Form 7.54.2 + Zod 3.24.2
	- Data grid (later): TanStack Table
	- Charts (later): ApexCharts / D3
	- Realtime (optioneel): Socket.io 4.8.1
	- Backend: Express 4.21.2
	- DB: MongoDB 7.0.5 (Mongoose)
	- PWA: Vite PWA plugin
	- Tooling: Yarn, ESLint/Prettier, Husky/lint-staged, Jest/Cypress (klaarzetten)

Deze versies en libraries komen overeen met de hoofd-README van ClubDuty, zodat latere integratie frictieloos verloopt. 


Datamodel (v1)
	Team { _id, name, joinCode }
	Player { _id, teamId, firstName, token, isCoach?:bool }
	Round { _id, teamId, title, status: 'open'|'closed', createdAt }
	Assignment { _id, roundId, raterId, rateeId }
	Feedback { _id, roundId, raterId, rateeId, strengths:[string,string], improve:string, createdAt }
	SummaryTeam { _id, roundId, bullets:[string], generatedAt }
	SummaryPlayer { _id, roundId, playerId, strengths:[string], improvements:[string] }


Kernregels random toewijzing
	- Geen self-ratings.
	- 2–3 ratees per speler, evenredige spreiding (Δ ≤ 1).
	- Optionele “pin”: iedereen beoordeelt [speler X].

Succescriteria
	- ≥80% respons binnen 7 dagen.
	- Coach markeert 2–3 teamthema’s als “trainingsfocus”.
	- Geen negatieve incidenten rond “namen” → alleen teamthema’s gecommuniceerd.

Risico’s & mitigatie
	- Pubers schrijven onzin → UI met voorbeelden + validatie (minimale lengte, check op verboden woorden).
	- Anonimiteit → coach-only ruwe data; geen namen in exports voor team.