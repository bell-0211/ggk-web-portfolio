# GGK SKY Web Portfolio — AI-Native Product × Independent Delivery

**Author:** 汪楠

**Target:** 2027 graduate recruitment · AI Product Manager / Prompt Engineering

**Public portfolio period:** June–August 2026

## Positioning

I combine AI-native product sense with the ability to independently ship a reviewable,
high-fidelity browser demo using AI coding tools. I turn product intent — an AI assistant,
a remote-collaboration workflow, a vertical knowledge base, a pricing model — into a
coherent information architecture and a runnable, interactive artifact. My public evidence
covers product architecture, interactive prototype engineering, defect diagnosis, and the
AI-toolchain build process. This repository does not claim a production deployment or any
live-business metric.

## Capability evidence

| Capability | Public evidence | Evidence state |
|---|---|---|
| AI-native product / IA design | Positioning, IA, pricing rationale, audience segments | Designed |
| Interactive front-end delivery | Committed runnable demo: scene demos, 3D hero, i18n | Runs in browser |
| Structural & i18n engineering | Validating scripts against the committed demo | Executed offline |
| Defect diagnosis & fix | Root-cause notes and verified fixes for real browser issues | Executed offline |
| AI-toolchain build process | Prompt-driven workflow, engineering refactor, 1:1 scene fidelity | Designed; reproducible |
| Backend / live model / production | No independent public implementation in this version | Not evidenced |

## Project summaries

### 1. Product & information-architecture design

**Problem:** many individual AI features (assistant, remote terminal, chip knowledge,
token billing) can feel disconnected and hard to monetize without a single product story.

**Design:** frame the product as a "portable AI workstation" and organize the page as
Hero → functional scenarios → product capabilities → audience → pricing → CTA. Define
three pricing tiers (free / monthly / yearly) with token quota, agent count, and API-key
management.

**Outcome:** a reviewable IA, a positioning statement, and an explicit monetization model
that tie the features into one product. [Read the case study](case-studies/01-product-architecture.md)

### 2. Interactive prototype engineering

**Problem:** static mockups do not communicate a product's flow, so reviewers cannot
feel how an AI assistant or a phone ↔ terminal collaboration actually behaves.

**Design:** build the whole page in vanilla HTML/CSS/JS (zero build step) with
interactions: a state-machine phone ↔ terminal collaboration demo, a mini-program
auto-demo, a Three.js hero, and full-site Chinese / English i18n.

**Outcome:** a committed, openable demo where a reviewer can play the scenarios
themselves. [Read the case study](case-studies/02-interactive-prototype.md)

### 3. Defect diagnosis & fix

**Problem:** real browser issues — the section-nav highlight not staying fixed, and the
language-switch button doing nothing — hurt a landing page.

**Design:** diagnose root causes (an anchor-crossing algorithm left a gap; three layered
i18n hazards), rewrite the navigation logic, and defensively harden the language switcher
so switching always responds.

**Outcome:** verified fixes with a concrete before/after: nav highlight stays stable at
section boundaries and language switching works even after clearing local storage.
[Read the case study](case-studies/03-defect-diagnosis.md)

### 4. AI-toolchain build process

**Problem:** a portfolio that only shows finished screenshots does not show *how* an
independent builder works.

**Design:** record the build as an AI-driven workflow: intent → architecture → prompt →
implementation → refactor → validation, and show how a single 188 KB page was split into
a maintainable project and then integrated with 1:1 scene fidelity.

**Outcome:** a reproducible demonstration that a PM can drive an AI coding tool to ship a
runnable product, not just write a PRD. [Read the case study](case-studies/04-ai-toolchain-build.md)

## Reviewer walkthrough

1. Open the committed demo (`demo/web/index.html`) and play Scene 1 and Scene 2 to feel
   the interactions rather than reading about them.
2. Read the product architecture case and decide whether the information architecture and
   pricing tell one coherent product story.
3. Inspect the defect case to see real root-cause reasoning, not just "I fixed it".
4. Review the AI-toolchain case to understand the build workflow and the engineering
   refactor from a single file to a maintainable project.
5. Read the limitations before drawing conclusions about production or business impact.

## Evidence policy

Claims in this repository use one of these states:

- **designed** — the architecture, IA, or contract exists;
- **runs in browser** — the committed demo launches and its interactions work locally;
- **executed offline** — the included deterministic scripts/tests completed;
- **production verified** — intentionally not claimed in this public version.

This distinction prevents a polished demo from being mistaken for live product evidence.
Demo counts, avatars, device names, and paths are explicitly synthetic placeholders. See
the [evidence register](evidence-register.md) for claim-by-claim boundaries.
