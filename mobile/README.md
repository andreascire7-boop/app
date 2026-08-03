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
widgets (`core/widgets` — the FASE 6 "pattern trasversali"), routing skeleton, and
three screens: Splash (S1), Login (S2), Home with bottom nav and a rest-day empty
state (S6). Everything else in FASE 6 (onboarding assessment, session execution,
calendar, risk center, nutrition hub, etc.) is scheduled per the FASE 9 roadmap and
not yet built.

## Tests

```bash
flutter test
```
