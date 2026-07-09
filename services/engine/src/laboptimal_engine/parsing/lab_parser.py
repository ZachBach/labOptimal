"""Parse OCR text into raw analyte readings.

The parser scans each line for a known analyte alias, then pulls the numeric
value, unit, and (when present) a printed reference range. It is deliberately
conservative: a line only becomes a reading when an analyte alias and a numeric
value are both found. Confidence reflects how much of the expected structure
was recovered, and is carried forward into the finding.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from ..data.reference_ranges import build_alias_index

# A number like 22, 22.5, or 1,200
_NUMBER = r"[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?"
_UNIT = r"[a-zA-Z]+/[a-zA-Z]+|%|mIU/L|IU/L"

_VALUE_RE = re.compile(rf"(?P<value>{_NUMBER})\s*(?P<unit>{_UNIT})?")
_RANGE_RE = re.compile(
    rf"(?P<low>{_NUMBER})\s*[-–]\s*(?P<high>{_NUMBER})"
)


@dataclass
class RawReading:
    canonical: str
    value: float
    unit: str | None
    printed_low: float | None
    printed_high: float | None
    source_text: str
    confidence: float


def _to_float(token: str) -> float:
    return float(token.replace(",", ""))


class LabParser:
    def __init__(self) -> None:
        self._alias_index = build_alias_index()
        # Longest aliases first so "vitamin d, 25-hydroxy" beats "vitamin d".
        self._aliases = sorted(self._alias_index, key=len, reverse=True)

    def _match_analyte(self, line_lower: str) -> tuple[str, int] | None:
        """Return (canonical, end_index) of the longest alias found in the line."""
        for alias in self._aliases:
            idx = line_lower.find(alias)
            if idx != -1:
                return self._alias_index[alias], idx + len(alias)
        return None

    def parse(self, text: str) -> list[RawReading]:
        readings: list[RawReading] = []
        seen: set[str] = set()

        for line in text.splitlines():
            stripped = line.strip()
            if not stripped:
                continue

            match = self._match_analyte(stripped.lower())
            if match is None:
                continue
            canonical, name_end = match
            if canonical in seen:
                continue

            # Search only the text after the analyte name so digits embedded in
            # the name itself (e.g. "B12", "25-Hydroxy") are never read as the
            # result value.
            remainder = stripped[name_end:]

            # Strip the printed reference range first so it is not mistaken
            # for the result value.
            range_match = _RANGE_RE.search(remainder)
            printed_low = printed_high = None
            value_search_text = remainder
            if range_match:
                printed_low = _to_float(range_match.group("low"))
                printed_high = _to_float(range_match.group("high"))
                value_search_text = (
                    remainder[: range_match.start()] + remainder[range_match.end() :]
                )

            value_match = _VALUE_RE.search(value_search_text)
            if value_match is None:
                continue

            value = _to_float(value_match.group("value"))
            unit = value_match.group("unit")

            confidence = 0.6
            if unit is not None:
                confidence += 0.2
            if range_match is not None:
                confidence += 0.2

            readings.append(
                RawReading(
                    canonical=canonical,
                    value=value,
                    unit=unit,
                    printed_low=printed_low,
                    printed_high=printed_high,
                    source_text=stripped,
                    confidence=round(confidence, 2),
                )
            )
            seen.add(canonical)

        return readings
