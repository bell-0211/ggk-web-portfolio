#!/usr/bin/env python3
"""Validate the public GGK web portfolio's committed demo and declared contracts.

Checks (all offline and deterministic):
  1. Landing-page contract  - declared sections exist in the expected order, with the
     expected count, closing CTA section, scene demos, and pricing tiers.
  2. Interaction spec        - every declared interaction anchor exists in the HTML.
  3. i18n contract           - every required key has both a zh and an en translation.
  4. Demo asset map          - every asset path referenced by the HTML resolves to a
     committed file, and the declared demo map matches the referenced assets.
  5. Redaction               - no real credentials, private keys, absolute paths with a
     real username, or unmasked personal identifiers appear in the committed demo.

These checks prove internal consistency and cleanliness of the demo; they are not a
product or live-model benchmark.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEMO = ROOT / "demo" / "web"
HTML = DEMO / "index.html"
I18N = DEMO / "assets" / "js" / "ggk-i18n.js"


def load_json(relative: str):
    with (ROOT / relative).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def extract_dict_keys(text: str, needle: str) -> list[str]:
    """Return the key names in the i18n dictionary block that starts with needle."""
    lines = text.split("\n")
    start = next((i for i, l in enumerate(lines) if needle in l), None)
    if start is None:
        return []
    keys: list[str] = []
    j = start + 1
    while j < len(lines):
        l = lines[j]
        m = re.match(r"^ {6}([A-Za-z0-9_]+):", l)
        if m:
            keys.append(m.group(1))
            j += 1
            continue
        # leave when we hit a closing brace at dict/object level
        if re.match(r"^\s{4}\}", l) or l.strip() == "}" or re.match(r"^\s{2}\}", l):
            break
        if l.strip() and not l.startswith("      ") and not m:
            break
        j += 1
    return keys


def validate_demo_contract(html: str, errors: list[str]) -> None:
    contract = load_json("examples/landing-contract/sections.json")
    sections = contract["sections"]
    ids = [s["id"] for s in sections]
    # order + presence
    positions = [html.find(f'id="{sid}"') for sid in ids]
    require(all(p >= 0 for p in positions), "not all declared sections exist in the HTML", errors)
    require(positions == sorted(positions) and len(set(positions)) == len(positions),
            "declared sections are not present in the declared order", errors)
    require(html.count("data-nav=") >= contract["expected_nav_count"],
            "expected nav count not met in the HTML", errors)
    require(contract["closing_section"] in html, "missing closing CTA section", errors)
    for scene in contract["scene_demos"]:
        require(f'id="{scene}"' in html, f"missing scene demo anchor {scene}", errors)
    for tier in contract["pricing_tiers"]:
        require(tier in html, f"missing pricing tier {tier}", errors)


def validate_interaction_spec(html: str, errors: list[str]) -> None:
    spec = load_json("examples/interaction-spec/scene-interactions.json")
    for scene in spec["scenes"]:
        script = scene["script"]
        require(script in html, f"scene script {script} not referenced in HTML", errors)
        for anchor in scene["anchors"]:
            require(anchor in html, f"declared anchor '{anchor}' missing in HTML", errors)
    for ctrl in spec["shared_controls"]:
        # controls may be referenced by class or id
        require(ctrl in html, f"declared shared control '{ctrl}' missing in HTML", errors)


def validate_i18n(html: str, errors: list[str]) -> None:
    i18n = load_json("examples/landing-contract/i18n-keys.json")
    required = set(i18n["required_keys"])
    if not I18N.exists():
        errors.append("i18n file missing")
        return
    text = I18N.read_text(encoding="utf-8")
    zh = set(extract_dict_keys(text, "zh: {"))
    en = set(extract_dict_keys(text, "en: {"))
    require(required <= zh, "some required i18n keys are missing the zh translation", errors)
    require(required <= en, "some required i18n keys are missing the en translation", errors)
    require(zh == en, "zh and en i18n key sets are not identical", errors)
    require(len(zh) == i18n["zh_key_count"], "zh key count changed since the contract was frozen", errors)
    require(len(en) == i18n["en_key_count"], "en key count changed since the contract was frozen", errors)
    # every data-i18n key used by the HTML must be in the dictionary
    used = set(re.findall(r'data-i18n="([A-Za-z0-9_]+)"', html))
    require(used <= zh, "HTML references i18n keys that are not in the dictionary", errors)


def validate_asset_map(html: str, errors: list[str]) -> None:
    # 1) every relative asset referenced by the HTML must resolve to a committed file
    refs = re.findall(r'(?:href|src)="([^"#][^"]*)"', html)
    rel_refs = [
        r for r in refs
        if not r.startswith(("http", "data:", "//", "mailto:", "tel:")) and not r.startswith("#")
    ]
    for ref in rel_refs:
        require((DEMO / ref).is_file(), f"referenced asset does not exist: {ref}", errors)
    # 2) the declared demo map must match what the HTML actually references
    dmap = load_json("examples/runtime-demo/demo-map.json")
    declared = dmap["stylesheets"] + dmap["scripts"] + dmap["vendored_runtime"]
    html_assets = [r for r in rel_refs if r.startswith("assets/")]
    require(set(declared) <= set(html_assets), "declared demo-map assets are not all referenced by the HTML", errors)
    for img in dmap["images"]:
        require((DEMO / img).is_file(), f"declared image missing: {img}", errors)


def validate_redaction(html: str, errors: list[str]) -> None:
    # real Windows absolute path with a non-'demo' username
    path_with_user = re.compile(r"[A-Za-z]:\\Users\\(?!demo\b)[^\\\"'<>\s]+")
    # unmasked 11-digit CN mobile
    unmasked_phone = re.compile(r"(?<!\d)1[3-9]\d{9}(?!\d)")
    # private key
    private_key = re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")
    # credential assignments
    credential = re.compile(r"(?i)(password|passwd|secret|api[_-]?key)\s*[:=]\s*['\"][^'\"]+")
    # real-looking email (placeholder product emails like support@guguke.app are allowed
    # if declared; treat generic addresses as acceptable, but flag others) -- here we only
    # flag credentials/keys/paths/phones.
    for label, pattern in {
        "real Windows path (non-demo user)": path_with_user,
        "unmasked phone number": unmasked_phone,
        "private key": private_key,
        "credential assignment": credential,
    }.items():
        require(not pattern.search(html), f"{label} found in {HTML.relative_to(ROOT)}", errors)


def validate() -> list[str]:
    errors: list[str] = []
    if not HTML.exists():
        return ["demo/index.html is missing"]
    html = HTML.read_text(encoding="utf-8")
    validate_demo_contract(html, errors)
    validate_interaction_spec(html, errors)
    validate_i18n(html, errors)
    validate_asset_map(html, errors)
    validate_redaction(html, errors)
    return errors


def main() -> int:
    try:
        errors = validate()
    except (OSError, json.JSONDecodeError) as exc:
        print(f"VALIDATION ERROR: {exc}")
        return 1
    if errors:
        for error in errors:
            print(f"FAIL: {error}")
        return 1
    print("PASS: demo contract, interaction spec, i18n coverage, asset map, and redaction checks")
    return 0


if __name__ == "__main__":
    sys.exit(main())
