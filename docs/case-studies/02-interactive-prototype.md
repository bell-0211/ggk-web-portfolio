# Case study 02 — Interactive prototype engineering

## Situation

Static mockups do not communicate a product's flow. A reviewer cannot feel how an AI
assistant answers or how a phone ↔ terminal collaboration behaves just from a picture.

## Task

Deliver a runnable, high-fidelity landing page — no build step, no backend — whose key
scenarios are actually playable, so product intent can be experienced rather than read.

## Actions

- Built the entire page in vanilla HTML/CSS/JS (zero build step) and committed it to the
  repository as the primary evidence.
- Implemented a **state-machine** phone ↔ terminal collaboration demo (`scene2.js`):
  declared build steps, typed input, permission-mode and model settings sheets, keyboard
  control (`↑/↓`/`Enter`), and an auto-demo timeline with analytics hooks.
- Implemented a **mini-program auto-demo** (`scene1.js`): a Q&A flow, chat sidebar, agent
  status cards, and desktop card.
- Added a **Three.js hero** (particles, planet, parallax) and full-site **中文 / EN i18n**.
- Provided a self-contained demo under `demo/web/` that runs from a static server with no
  external runtime dependency (the 3D library is vendored locally).

## Result

The committed demo opens in any browser, and a reviewer (or interviewer) can play Scene 1
and Scene 2 directly. The demo is the artifact — no screenshot is required to believe it.

## Inspectable artifacts

- [`demo/web/index.html`](../../demo/web/index.html) — the full page
- [`demo/web/assets/js/scene1.js`](../../demo/web/assets/js/scene1.js) — mini-program demo
- [`demo/web/assets/js/scene2.js`](../../demo/web/assets/js/scene2.js) — phone ↔ terminal state machine
- [`examples/runtime-demo/demo-map.json`](../../examples/runtime-demo/demo-map.json) — declared interaction anchors
- [`examples/interaction-spec/scene-interactions.json`](../../examples/interaction-spec/scene-interactions.json)

## Design discussion

The most valuable engineering decision was to model the collaboration demo as a
state-machine rather than a one-shot animation. The same declared build steps drive the
auto-demo, the keyboard path, and the settings interactions — making the demo both
watchable and playable, and keeping the logic inspectable.
