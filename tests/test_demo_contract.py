"""Regression tests for the committed GGK landing-page demo.

The tests exercise the same deterministic contract checks that CI runs. They verify the
page structure, the i18n parity, the asset map, and the redaction policy without opening
a browser or contacting a service.
"""

from __future__ import annotations

import json
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import validate_assets as va  # noqa: E402

DEMO = ROOT / "demo" / "web"
HTML = DEMO / "index.html"
I18N = DEMO / "assets" / "js" / "ggk-i18n.js"


def html() -> str:
    return HTML.read_text(encoding="utf-8")


class DemoContractTest(unittest.TestCase):
    def test_demo_contract_passes(self):
        # The canonical gate: the committed demo must pass all declared checks.
        self.assertEqual(va.validate(), [], "committed demo must satisfy the declared contracts")

    def test_declared_sections_in_order(self):
        text = html()
        contract = va.load_json("examples/landing-contract/sections.json")
        ids = [s["id"] for s in contract["sections"]]
        positions = [text.find(f'id="{sid}"') for sid in ids]
        self.assertTrue(all(p >= 0 for p in positions), "all sections present")
        self.assertEqual(positions, sorted(positions), "sections in declared order")


class I18nParityTest(unittest.TestCase):
    def test_zh_en_key_sets_identical(self):
        text = I18N.read_text(encoding="utf-8")
        zh = set(va.extract_dict_keys(text, "zh: {"))
        en = set(va.extract_dict_keys(text, "en: {"))
        self.assertTrue(zh and en, "both dictionaries must be non-empty")
        self.assertEqual(zh, en, "zh and en must define the same keys")

    def test_every_html_i18n_key_is_translated(self):
        text = html()
        i18n = I18N.read_text(encoding="utf-8")
        zh = set(va.extract_dict_keys(i18n, "zh: {"))
        used = set(re.findall(r'data-i18n="([A-Za-z0-9_]+)"', text))
        self.assertTrue(used, "HTML must use i18n keys")
        self.assertTrue(used <= zh, "every HTML i18n key must exist in the dictionary")

    def test_contract_frozen_key_count(self):
        contract = va.load_json("examples/landing-contract/i18n-keys.json")
        text = I18N.read_text(encoding="utf-8")
        self.assertEqual(len(va.extract_dict_keys(text, "zh: {")), contract["zh_key_count"])
        self.assertEqual(len(va.extract_dict_keys(text, "en: {")), contract["en_key_count"])


class AssetMapTest(unittest.TestCase):
    def test_all_html_asset_refs_exist(self):
        refs = re.findall(r'(?:href|src)="([^"#][^"]*)"', html())
        rel = [r for r in refs
               if not r.startswith(("http", "data:", "//", "mailto:", "tel:")) and not r.startswith("#")]
        for ref in rel:
            self.assertTrue((DEMO / ref).is_file(), f"missing asset {ref}")

    def test_declared_map_matches(self):
        dmap = json.loads((ROOT / "examples" / "runtime-demo" / "demo-map.json").read_text(encoding="utf-8"))
        declared = set(dmap["stylesheets"] + dmap["scripts"] + dmap["vendored_runtime"])
        refs = set(re.findall(r'(?:href|src)="(assets/[^"]+)"', html()))
        self.assertTrue(declared <= refs, "declared map assets must all be referenced")


class RedactionTest(unittest.TestCase):
    def test_no_unmasked_phone(self):
        self.assertIsNone(re.search(r"(?<!\d)1[3-9]\d{9}(?!\d)", html()))

    def test_no_real_windows_user_path(self):
        # only the synthetic demo path (C:\Users\demo) is allowed
        self.assertIsNone(re.search(r"[A-Za-z]:\\Users\\(?!demo\b)[^\\\"'<>\s]+", html()))

    def test_no_private_key_or_credential(self):
        text = html()
        self.assertIsNone(re.search(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----", text))
        self.assertIsNone(re.search(r"(?i)(password|passwd|secret|api[_-]?key)\s*[:=]\s*['\"][^'\"]+", text))


if __name__ == "__main__":
    unittest.main(verbosity=2)
