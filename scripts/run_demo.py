#!/usr/bin/env python3
"""Deterministic offline smoke test of the committed GGK landing-page demo.

This is not a browser or a live-model run. It performs static, deterministic checks
that the committed demo is internally self-consistent and can be expected to open and
interact in a browser:

  1. The page is a complete standalone HTML document with a <title> and <body>.
  2. The language toggle, its script binding, and the i18n apply path are all present
     and wired, so Chinese / English switching can respond.
  3. Both scene demos (scripts + controls) are referenced so the interactions are
     present in the bundle.
  4. The hero 3D canvas and its vendored runtime are referenced.
  5. The page is served root-relative (asset paths are relative), so it can be opened
     from a static server without modification.

Run with `--expect fail` (the default) to assert the positive path, and `--enforce` to
return a non-zero exit code when a check fails (used by CI).

The result is a statement about the committed demo's internal consistency; it is not a
browser render, a product benchmark, or a live-service test.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "demo" / "web" / "index.html"


def checks() -> list[tuple[str, callable]]:
    def html_exists():
        return HTML.is_file()

    text = HTML.read_text(encoding="utf-8") if HTML.is_file() else ""
    i18n_file = ROOT / "demo" / "web" / "assets" / "js" / "ggk-i18n.js"
    i18n_text = i18n_file.read_text(encoding="utf-8") if i18n_file.is_file() else ""

    def has_document():
        return all(x in text for x in ("<!DOCTYPE html>", "<html", "<body", "</html>"))

    def has_title():
        return "<title>" in text and "</title>" in text

    def lang_toggle_wired():
        # the page includes the i18n script, and the i18n script binds the `.lang-toggle`
        # control via a listener (not inline onclick double-fire) and exposes ggkToggleLang.
        return ("assets/js/ggk-i18n.js" in text
                and "lang-toggle" in i18n_text
                and "addEventListener('click'" in i18n_text
                and "ggkToggleLang" in i18n_text)

    def i18n_apply_present():
        # the i18n script applies translations and exposes the toggle API.
        return ("applyLang" in i18n_text and "window.ggkToggleLang" in i18n_text)

    def scene1_present():
        return all(x in text for x in ("scene1-demo", "assets/js/scene1.js", "s1-demo-btn"))

    def scene2_present():
        return all(x in text for x in ("scene2-demo", "assets/js/scene2.js", "s2-demo-btn"))

    def hero_3d_present():
        return all(x in text for x in ("hero-3d", "assets/js/hero-3d.js", "assets/js/vendor/three.global.js"))

    def relative_assets():
        # every referenced asset uses a relative path (no absolute /asset or CDN), so
        # the demo can run from a plain static server.
        abs_refs = re.findall(r'(?:href|src)="/[^"]+"', text)
        return not abs_refs

    return [
        ("demo HTML file exists", html_exists),
        ("well-formed standalone document", has_document),
        ("has a <title>", has_title),
        ("language toggle control is wired via listener", lang_toggle_wired),
        ("i18n apply path is present", i18n_apply_present),
        ("scene 1 (mini-program demo) is included", scene1_present),
        ("scene 2 (phone <-> terminal state machine) is included", scene2_present),
        ("hero 3D + vendored Three.js runtime is included", hero_3d_present),
        ("all assets are referenced with relative paths", relative_assets),
    ]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--expect", default="pass", choices=["pass", "fail"],
                    help="exit code convention: assert the positive path (default) or negative path")
    ap.add_argument("--enforce", action="store_true",
                    help="return a non-zero exit code when any check fails (for CI)")
    args = ap.parse_args()

    results = []
    failed = 0
    for name, check in checks():
        ok = bool(check())
        results.append((name, ok))
        failed += 0 if ok else 1

    for name, ok in results:
        print(f"{'OK  ' if ok else 'FAIL'} {name}")

    total = len(results)
    print(f"\nsummary: {total - failed}/{total} checks passed")

    if args.expect == "fail":
        # Prove the negative path: a problem must be surfaced.
        result = "PASS" if failed >= 1 else "FAIL (expected at least one problem)"
        print(f"result: {result}")
        return 0 if failed >= 1 else 1

    # default --expect pass: every check must pass.
    if failed:
        print("result: BLOCKED (demo is not internally consistent)")
        return 1
    print("result: PASS (demo is internally consistent and can be served)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
