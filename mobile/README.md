# Mobile (Flutter)

Athlete-facing app — iOS + Android from one codebase (docs/product-design FASE 4 §4.1).

## Status (M0.3 of the roadmap, FASE 9)

This scaffold was authored without a local Flutter SDK available in the dev
environment that generated it, so the native `android/` and `ios/` platform folders
are **not** included yet. Before running the app:

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
first macrocycle generation, Home with bottom nav showing the next real planned
session (S6), and the session flow (S8 detail → S9 execution, one exercise at a
time with per-set logging → S10 feedback, which triggers the backend's
autoregulation and shows the result if the next session got adjusted).
Calendar, risk center, and nutrition hub are scheduled per the FASE 9 roadmap and
not yet built.

`ApiClient.baseUrl` points at `http://localhost:3000` (`10.0.2.2` on the Android
emulator). There is no real auth yet (M1.1 is unfinished): the onboarding flow
creates a throwaway user on every run rather than signing in — replace this once
Firebase Auth is wired in.

## Tests

```bash
flutter test
```
