# Web Dashboard (Coach)

Coach-facing web app (docs/product-design FASE 4 §4.1 — a separate Next.js
codebase from the Flutter mobile app, not a second UI for the same app).

## Status

Implements S23 (login placeholder — enter a Coach user id, no real auth yet),
S24 (athlete list sorted by risk + pending link requests with an accept
action), and S25 (athlete detail drill-down — read-only sessions list + latest
risk assessment), wired to the Core API's F11 endpoints
(`backend/src/modules/coach`) plus the existing sessions/risk endpoints.

Not yet built: plan override from the drill-down, org/billing admin (S26) —
scheduled per the FASE 9 roadmap (M4.1). Note that `GET /athletes/:id/sessions`
and `/risk` don't yet enforce "only the linked coach can read this athlete's
data" — a known gap to close once real auth (Auth0/WorkOS, FASE 4 §4.4)
replaces the manual coach-id entry.

## Local dev

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at the Core API
npm run dev -- -p 3001             # the Core API also defaults to :3000
```

Then open http://localhost:3001 and enter the id of a user created with
`role: "COACH"` on the Core API.
