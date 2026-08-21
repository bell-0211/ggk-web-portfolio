# Limitations and next experiments

## What is not claimed

- No production traffic, conversion, retention, or revenue metric. The `12,000+` count,
  avatars, device names, paths, phone numbers, and weather results in the demo are
  synthetic placeholders.
- No live-model behavior, accuracy, latency, cost, or stability result.
- No backend or server-side implementation; the demo is intentionally front-end only and
  offline.
- No scalable architecture or load/performance engineering.
- No claim that the demo proves domain expertise (e.g. chip knowledge) beyond the
  illustrated product design.
- No A/B testing, analytics pipeline, or business-impact attribution.

## Planned evidence upgrades

1. Add a lightweight public backend/service layer (API contract + mock server) so the
   demo's remote-collaboration flow is exercised end-to-end rather than front-end only.
2. Add an accessibility and responsive audit of the committed demo (keyboard, contrast,
   breakpoints).
3. Add a component-based refactor of the demo (e.g. a small build tool) and record the
   before/after on maintainability without changing behavior.
4. Add a short written PRD + prototype iteration trace (idea → spec → implementation)
   as a reference for how product requirements map to shipped UI.

These items are deliberately separated from completed evidence so the portfolio remains
auditable.
