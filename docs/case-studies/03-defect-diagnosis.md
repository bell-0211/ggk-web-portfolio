# Case study 03 — Defect diagnosis & fix

## Situation

Two real browser defects hurt the landing page's credibility: the section-nav highlight
did not stay fixed as the user scrolled, and the Chinese / English switch button did
nothing when clicked.

## Task

Diagnose root causes and fix them defensively, with a concrete before/after that an
interviewer can verify.

## Actions

- **Nav-highlight defect.** Root cause: the section-highlighting algorithm used a
  threshold that created an empty window at section boundaries, so the highlight flickered
  or vanished; a special-case block also forced the last pricing item to stay highlighted
  in the CTA area. Fix: rewrote the logic as an "anchor-crossing" algorithm — take the
  viewport's 40% point as the anchor line, highlight whichever section the anchor crosses
  (with a small tolerance for sub-pixel gaps), and remove the special case so the hero and
  CTA areas correctly highlight nothing.
- **Language-switch defect.** Root cause: three layered hazards — an i18n function
  silently returning on a dirty stored value, the button lacking `cursor:pointer` and an
  active state, and an inline `onclick` that could double-fire. Fix: validate the stored
  language with fallback to Chinese, force a fallback when the dictionary is empty, bind
  the toggle once with `addEventListener('click')`, add hover/active affordance in CSS, and
  remove the inline `onclick` to prevent double triggering.

## Result

Verified fixes: the nav highlight stays stable across every section boundary and correctly
turns off in the hero and CTA areas; the language switch always responds, including after
clearing local storage.

## Inspectable artifacts

- The fix is reflected in the committed demo's nav and i18n behavior;
  validate the i18n contract with [`scripts/validate_assets.py`](../../scripts/validate_assets.py).

## Design discussion

The edge cases revealed product-level judgment, not just code style: "highlight nothing"
is the correct behavior at the very top and very bottom of the page, and a language toggle
must be robust to a previously corrupted stored value. These are the small decisions that
determine whether a polished page feels reliable.
