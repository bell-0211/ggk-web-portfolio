# Methodology

## AI-toolchain build lifecycle

```text
product intent → information architecture → interaction spec → prompt-driven build
→ runnable demo → defect diagnosis / refactor → validation → version record
```

## Design rules

1. **One product story before one feature** — features are framed inside a single IA and
   positioning; pricing ties the value to a monetization model.
2. **Runnable is the deliverable** — a committed, openable demo is stronger evidence than
   a described mock; interactions are implemented, not only drawn.
3. **State-machine over hard-coded sequence** — the phone ↔ terminal demo is a
   state-machine with declared build steps, so it is playable manually and by auto-demo.
4. **i18n and structure are contracts** — every user-facing string has a declared i18n
   key, and the section structure is declared in machine-readable form so it can be
   validated rather than eyeballed.
5. **Real defects are fixed, not papers-over** — browser issues are traced to root cause,
   fixed defensively, and verified with a concrete before/after.

## Interactivity and demo boundaries

Interactions illustrate product behavior and product design intent; they are not claims
about live-model accuracy, latency, or cost. The demo runs entirely in the browser and
performs no external side effects.

## Validation model

The committed demo is checked by offline, deterministic scripts and tests that verify:

- every asset path referenced by the HTML resolves to a committed file;
- every i18n key the HTML uses has a Chinese and an English translation;
- the demo does not carry real credentials, private keys, or unmasked personal identifiers;
- the declared interaction spec and landing-page contract are internally consistent.

These checks prove internal consistency and cleanliness of the demo; they are not a
product benchmark.
