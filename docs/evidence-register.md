# Evidence register

This register defines what each portfolio claim is allowed to mean.

| Claim | Inspectable evidence | State | Not supported by this evidence |
|---|---|---|---|
| A coherent AI-native IA was designed | Positioning, IA, pricing rationale (case 01) | Designed | Production viability, business impact |
| The landing page is interactive | Committed demo `demo/web/index.html`, scene demos | Runs in browser | Live-model behavior or quality |
| Interactions are state-machine driven | `assets/js/scene2.js`, `scene1.js` in the demo | Runs in browser | Production telemetry |
| Asset paths resolve and i18n keys are covered | `scripts/validate_assets.py` | Executed offline | Visual correctness in all browsers |
| Real browser defects were diagnosed and fixed | Root-cause notes, fix list (case 03) | Executed offline | Systematic test coverage of the whole app |
| The demo is clean of credentials/identifiers | Redaction checks in `scripts/validate_assets.py` | Executed offline | Exhaustive security audit |
| Delivery was driven by an AI coding workflow | Build notes, engineering refactor (case 04) | Designed; reproducible | Reproducibility of a specific tool's output |
| Backend / live model / production | — | Not evidenced | — |

## Evidence hierarchy

1. **Designed** — an inspectable architecture or contract exists.
2. **Runs in browser** — the committed demo launches and its interactions work locally.
3. **Executed offline** — included code ran against declared fixtures.
4. **Production verified** — not claimed.

Asset counts are inventory information, not outcome metrics. Any future quality or
business claim must include a baseline, a real data source, measured parameters, and raw
evidence records — none of which the placeholder demo provides.
