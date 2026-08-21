# Case study 01 — Product & information-architecture design

## Situation

A product with several strong but disconnected AI capabilities — a WeChat-mini-program
assistant, a remote phone ↔ terminal collaboration workflow, a chip-datasheet vertical
knowledge assistant, and token-based billing — risked feeling like separate tools rather
than one product.

## Task

Frame the capabilities as a single, monetizable product and lay out a landing page whose
information architecture makes the value clear to a reviewer.

## Actions

- Established the positioning: a "portable AI workstation" that works with or without a
  connected terminal.
- Defined the page IA: Hero (value + trust) → 功能场景 (functional scenarios) → 产品特点
  (nine capability cards) → 适用人群 (audience) → 定价 (pricing) → CTA.
- Designed the pricing model: three tiers (free ¥0 / monthly ¥49 / yearly ¥411.6) with
  declared token quota, agent count, and API-key management.
- Defined six audience segments (firmware engineer, FAE, maker, test engineer, DevOps,
  hardware PM) to ground positioning in user value.

## Result

A reviewable IA, a coherent positioning statement, and an explicit monetization model that
tie the separate features into one product story. This is a design artifact; it does not
claim production viability or business impact.

## Inspectable artifacts

- The committed demo's section structure and pricing markup in
  [`demo/web/index.html`](../../demo/web/index.html)
- [Landing-page contract](../../examples/landing-contract/sections.json) — declared
  section order and anchors.

## Design discussion

The useful design question was not "which AI feature is best" but "what is the single
promise to the user, and how does each section earn its place under that promise". The
pricing tiers were chosen so that "one message / one command" value is visible even before
a user connects their machine — making the free tier a real first step, not a gimmick.
