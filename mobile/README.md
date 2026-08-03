# Mobile (Flutter)

Athlete-facing app — iOS + Android from one codebase (docs/product-design FASE 4 §4.1).

## Status (M0.3 of the roadmap, FASE 9)

Most of this app was authored without a local Flutter SDK available in the dev
environment, so `android/` and `ios/` platform folders are **not** included
yet. `web/` was later generated and verified (`flutter build web` builds
clean and boots — this is how Andrea can try the real Flutter UI in a
browser without an Android/iOS toolchain; see `infra/DEPLOY.md`). Before
running natively:

```bash
flutter create . --platforms=android,ios   # generates the missing platform folders
flutter pub get
flutter run
```

Implemented so far: design tokens (`core/theme`), shared loading/empty/error state
widgets (`core/widgets` — the FASE 6 "pattern trasversali"), routing skeleton, an
`ApiClient` (`core/network`) wired to the Core API, and: Splash (S1), Login (S2),
the onboarding assessment flow (S3-S5 — sport/level, injury history,
availability/goal) which creates the athlete, submits the profile, and triggers the
first macrocycle generation, Home with a readiness check-in card (F7) and the next
real planned session (S6), the session flow (S8 detail → S9 execution, one exercise
at a time with per-set logging → S10 feedback, which triggers the backend's
autoregulation and shows the result if the next session got adjusted), the
calendar (S11 list/add torneo → S12 detail with cancel/restore), the risk center
(S13, semaforo + fattori + raccomandazione), the nutrition hub (S15 daily
guidance, S16 supplements, S17 folded in as the guardrail-suspended state rather
than a separate route), a paywall (S21) reachable from the Profilo tab, and the
Programma tab (S7 — mesocycle timeline with a tap-to-explain block detail, plus
the full list of planned sessions across the current macrocycle).

**The paywall is a scaffold, not a real payment integration**: `POST
/athletes/:id/subscriptions` on the Core API creates a `Subscription` row
directly — no RevenueCat/Stripe call happens, no card is ever charged. This
environment has no payment provider credentials. Wire in the real RevenueCat
SDK (docs/product-design FASE 4 §4.8) before shipping — the backend model
(plans, subscriptions, entitlements) is already in place to build on.

Not yet built: the coach dashboard (that's a separate Next.js web app per
FASE 4 §4.1, not part of this Flutter codebase).

`ApiClient.baseUrl` points at `http://localhost:3000` (`10.0.2.2` on the Android
emulator). There is no real auth yet (M1.1 is unfinished): the onboarding flow
creates a throwaway user on every run rather than signing in — replace this once
Firebase Auth is wired in.

## Tests

```bash
flutter test
```
