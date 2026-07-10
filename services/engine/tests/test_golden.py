"""Golden-file test: known lab text in, expected protocol out.

This pins the full engine output for a fixed sample panel so any change in
parsing, normalization, detection, ranking, or recommendations shows up as an
explicit diff. The volatile `generated_at` field is excluded.

Regenerate the golden file after an intentional change:

    PYTHONPATH=src python -c "import json; from pathlib import Path; \
from laboptimal_engine.pipeline import analyze_text; \
d = analyze_text(Path('tests/fixtures/sample_panel.txt').read_text()).model_dump(mode='json'); \
d.pop('generated_at', None); \
Path('tests/fixtures/expected_protocol.json').write_text(json.dumps(d, indent=2) + chr(10))"
"""

from __future__ import annotations

import json
from pathlib import Path

from laboptimal_engine.pipeline import analyze_text

FIXTURES = Path(__file__).parent / "fixtures"


def _load_expected() -> dict:
    return json.loads((FIXTURES / "expected_protocol.json").read_text(encoding="utf-8"))


def _actual_without_timestamp() -> dict:
    text = (FIXTURES / "sample_panel.txt").read_text(encoding="utf-8")
    data = analyze_text(text).model_dump(mode="json")
    data.pop("generated_at", None)
    return data


def test_protocol_matches_golden_file():
    assert _actual_without_timestamp() == _load_expected()


def test_findings_are_ranked_most_actionable_first():
    findings = _actual_without_timestamp()["findings"]
    # Deficient/high (priority 0) must precede suboptimal/elevated (priority 1),
    # and within a tier severity is non-increasing.
    priority = {"deficient": 0, "high": 0, "suboptimal": 1, "elevated": 1, "optimal": 2}
    keys = [(priority[f["status"]], -f["severity"]) for f in findings]
    assert keys == sorted(keys)
