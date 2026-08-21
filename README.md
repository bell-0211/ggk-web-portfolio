# AI-Native Product × Independent Delivery — GGK SKY Web Portfolio

An AI product manager's evidence that a product idea can be turned into a runnable,
reviewable high-fidelity browser demo — independently, using AI coding tools.

[中文说明](README.zh-CN.md) · [Portfolio](docs/portfolio.md) · [Live-page source](docs/index.html)

**汪楠 · 2027 graduate candidate · AI Product Manager / Prompt Engineering**

Public portfolio period: June–August 2026 · GitHub: [@bell-0211](https://github.com/bell-0211)

## What this repository demonstrates

- **AI-native product thinking** — a WeChat mini-program AI assistant, a remote
  terminal-collaboration workflow, a chip-datasheet vertical knowledge assistant, and
  token-based pricing, all shaped into one information architecture and landing page.
- **Independent delivery via AI tooling** — a complete single-page product (HTML/CSS/JS,
  zero build step) specified and implemented with an AI coding workflow, from product
  intent to runnable demo.
- **Interactive prototype engineering** — a state-machine driven phone ↔ terminal
  collaboration demo, a mini-program auto-demo, a 3D hero, and full-site i18n (中文 / EN).
- **Executable evidence, not just screenshots** — the demo is committed to the repository
  and can be opened and validated locally; scripts and tests check asset paths, i18n key
  coverage, and redaction.

> This is a sanitized portfolio repository. The bundled landing-page demo is a synthetic,
> placeholder product for demonstration. It contains no production data, real user
> metrics, credentials, or employer-confidential material.

## Portfolio map

| Case study | Problem | Main artifacts |
|---|---|---|
| [Product & IA Design](docs/case-studies/01-product-architecture.md) | Turn scattered AI features into a coherent, monetizable product | Information architecture, positioning, pricing rationale |
| [Interactive Prototype Engineering](docs/case-studies/02-interactive-prototype.md) | Make a static mock interactive and tangible | State-machine demo, scene demos, 3D hero, i18n |
| [Defect Diagnosis & Fix](docs/case-studies/03-defect-diagnosis.md) | Real browser issues (nav highlight, lang switch) | Root-cause notes, fix verification, defensive hardening |
| [AI-Toolchain Build Process](docs/case-studies/04-ai-toolchain-build.md) | Ship an idea to a working demo with AI tools | Prompt-driven workflow, engineering refactor, 1:1 scene fidelity |

## Evidence status at a glance

| Claim | Status | What it means |
|---|---|---|
| Product / information architecture | Designed | A reviewable IA, positioning, and pricing rationale exist. |
| Interactive front-end demo | Runs in browser | The committed demo launches locally and its interactions work. |
| Structural asset & i18n checks | Executed offline | Scripts and tests validate the committed demo deterministically. |
| Live-model, latency, cost, stability | Not measured | No model providers or runtime service are claimed. |
| Production or business impact | Not verified | Demo figures are placeholders; no traffic/conversion/revenue claim. |

See the full [evidence register](docs/evidence-register.md).

## Quick start

Python 3.10+ is required for the validation scripts. The demo itself needs no dependency.

```bash
# 1) Inspect the runnable demo
cd demo/web && python -m http.server 8000    # open http://localhost:8000

# 2) Validate the committed demo (paths + i18n + redaction)
cd ../..
python scripts/validate_assets.py

# 3) Deterministic structural smoke test of the demo
python scripts/run_demo.py

# 4) Run the regression tests
python -m unittest discover -s tests -v
```

The checks are intentionally offline and deterministic. They verify that the committed
demo is internally consistent and clean; they are not a benchmark of any real product
or live model.

## Repository structure

```text
.
├── demo/web/               Self-contained runnable landing page (live evidence)
├── docs/                   Portfolio narrative and case studies
├── examples/               Declared interaction specs, landing-page contract, demo map
├── scripts/                Asset, i18n, and structural validation
├── tests/                  Regression tests for the committed demo
├── .github/workflows/      Continuous validation
├── SECURITY.md             Disclosure and redaction policy
└── CHANGELOG.md            Portfolio versions
```

## Evidence principles

1. **Demo placeholders are not metrics** — `12,000+` users, avatars, device names, paths,
   and phone numbers in the demo are synthetic and are never presented as real data.
2. **Runnable beats described** — the deliverable is a committed, openable artifact, not
   only a written claim.
3. **Traceability** — interactions, i18n keys, and section structure are declared in
   machine-readable contracts and validated by scripts.
4. **Reproducibility** — validation runs deterministically via scripts and tests.
5. **Honest boundaries** — no fabricated online metrics, user growth, model benchmark, or
   production-release claims.

## Current scope and limitations

This repository provides inspectable evidence of AI-native product design and independent
front-end delivery, and of a prompt-driven (vibe coding) build workflow. It does not prove
live-model behavior, scalability, or production/business impact. See
[limitations and next validation steps](docs/limitations.md).

## Suggested review path

Start with [docs/portfolio.md](docs/portfolio.md), read the four case studies, open the
bundled demo to see the interactions, then run the quick-start commands to verify the
asset, i18n, and redaction checks.

## License

No open-source license is granted at this stage. The repository is published for portfolio
review; all rights are reserved unless a license is added later.
