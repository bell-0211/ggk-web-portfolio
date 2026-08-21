# GGK SKY — 可运行 Web 落地页 Demo（Live evidence）

This folder contains a self-contained, sanitized build of the **GGK SKY** landing page
that can be opened directly in a browser. It is the runnable evidence behind the case
studies in this portfolio.

## What it is

A single-page product landing page and interactive prototype for a synthetic AI-assistant
product ("GGK SKY"): a WeChat-mini-program AI helper, a remote terminal collaboration
view, a chip-datasheet vertical knowledge assistant, and token-based pricing.

## Run it

The demo needs no build step and no backend. Two ways:

**Open directly**
```bash
open demo/web/index.html            # macOS
start demo/web/index.html           # Windows
```

**Or serve it locally (recommended)**
```bash
cd demo/web
python -m http.server 8000
# open http://localhost:8000
```

## Working interaction

- **Scene 1 · 微信小程序 AI 助手** — click 自动演示 to watch the phone UI animate a
  Q&A flow, chat sidebar, agent status cards, and desktop card.
- **Scene 2 · 移动端与终端交互协同** — click 立即演示 for the phone↔terminal
  collaboration timeline; or play it manually with `↑/↓` and `Enter`, open the gear
  settings sheet to switch permission mode and model.
- **Nav** — top navigation highlights the section in view; 中文 / EN toggles the whole
  page language.
- **Pricing** — free / monthly / yearly tiers with token and agent limits.

## Synthetic-content notice

All counts (`12,000+`), avatar images, terminal device names, paths, phone numbers, and
weather results are **placeholder demo content**. They exist only to demonstrate the UI
and must not be read as real user, traffic, retention, or business data.

## Validation

The repository checks this demo with `python scripts/validate_assets.py` (asset-path
resolution, i18n key coverage, and redaction of real credentials), plus
`python scripts/run_demo.py` for a deterministic structural smoke test. See
[`../README.md`](../README.md) quick start.
