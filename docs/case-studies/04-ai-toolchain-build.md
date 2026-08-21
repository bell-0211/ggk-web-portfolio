# Case study 04 — AI-toolchain build process

## Situation

A portfolio that shows only finished screenshots does not show *how* an independent
builder works — which is exactly what an AI-native role wants to evaluate.

## Task

Show the build as a **prompt-driven (vibe coding) workflow**: how a product PM drives an
AI coding tool from intent to a runnable, maintainable deliverable.

## Actions

- **Intent → architecture → prompt → implementation → refactor → validation.** Working
  from product intent, the implementation was driven through an AI coding tool, then
  refined through inspection, defect fixes, and iteration rather than by writing all code
  up front.
- **Engineering refactor.** A single ~188 KB page was split into a maintainable project
  (`index.html` + `css/style.css` + `js/main.js`), then further modularized, then
  integrated with 1:1-rendered scene fidelity — showing that vibe coding also involves
  code organization, not just generation.
- **Reproducible validation.** The committed demo is checked by offline scripts and tests
  (see quick start), so the deliverable is auditable rather than a one-off artifact.

## Result

A reproducible demonstration that an AI product manager can use AI coding tools to ship a
runnable, interactive product — transforming a PRD into something a stakeholder can open
and play. This documents the workflow; it is not a claim that any specific tool's output
is reproducible byte-for-byte.

## Inspectable artifacts

- The runnable output: [`demo/web/index.html`](../../demo/web/index.html)
- The declared build workflow contract:
  [`examples/landing-contract/build-workflow.json`](../../examples/landing-contract/build-workflow.json)

## Design discussion

The distinction that matters is between a PM who "owns a product story" and a PM who can
"make the product story runnable". This case argues the second capability is now
achievable without a large engineering team, and that the skill is precisely the same
reduction a PM already does — clarifying intent, sequencing requirements, and validating
outcomes — applied to an AI coding tool instead of a team.
