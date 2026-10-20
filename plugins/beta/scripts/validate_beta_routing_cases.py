"""Validate coverage and references in the Beta routing contract cases."""

from __future__ import annotations

import json
import sys
from pathlib import Path


VALID_MODES = {"ANL", "MOD"}
VALID_TRANSITIONS = {"ANL->MOD", "MOD->ANL"}


def skill_names(root: Path) -> set[str]:
    return {
        path.name
        for path in (root / "skills").iterdir()
        if path.is_dir() and (path / "SKILL.md").is_file()
    }


def main(root: Path) -> int:
    cases_path = root / "tests" / "beta-routing-cases.json"
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    available = skill_names(root)
    errors: list[str] = []
    ids: set[str] = set()
    primary_skills: set[str] = set()

    if not isinstance(cases, list) or not cases:
        errors.append("cases must be a non-empty list")
        cases = []

    for index, case in enumerate(cases):
        label = f"case[{index}]"
        if not isinstance(case, dict):
            errors.append(f"{label}: must be an object")
            continue
        case_id = case.get("id")
        if not isinstance(case_id, str) or not case_id:
            errors.append(f"{label}: missing id")
        elif case_id in ids:
            errors.append(f"{label}: duplicate id {case_id}")
        else:
            ids.add(case_id)

        for key in ("prompt", "primary_mode", "primary_skill", "allowed_helpers", "transitions", "assertions"):
            if key not in case:
                errors.append(f"{label}: missing {key}")

        mode = case.get("primary_mode")
        if mode not in VALID_MODES:
            errors.append(f"{label}: invalid primary_mode {mode!r}")
        primary = case.get("primary_skill")
        if primary not in available:
            errors.append(f"{label}: unknown primary_skill {primary!r}")
        else:
            primary_skills.add(primary)

        helpers = case.get("allowed_helpers", [])
        if not isinstance(helpers, list):
            errors.append(f"{label}: allowed_helpers must be a list")
        else:
            for helper in helpers:
                if helper not in available:
                    errors.append(f"{label}: unknown helper {helper!r}")
                if helper == primary:
                    errors.append(f"{label}: primary skill cannot be its own helper")

        transitions = case.get("transitions", [])
        if not isinstance(transitions, list):
            errors.append(f"{label}: transitions must be a list")
        else:
            for transition in transitions:
                if transition not in VALID_TRANSITIONS:
                    errors.append(f"{label}: invalid transition {transition!r}")

    required = {
        "beta-anl-duvidas-funcionais",
        "beta-anl-regras-negocio",
        "beta-anl-triagem-incidentes",
        "beta-anl-qa-testes",
        "beta-anl-qa-resultados",
        "beta-anl-gerador-cards-clickup",
        "beta-clk-checklist",
        "beta-anl-movidesk",
        "beta-mod-regras",
        "beta-mod-dossie",
        "beta-mod-fontes",
        "beta-mod-fluxos",
        "beta-mod-figma",
        "beta-mod-permissoes",
        "beta-mod-processamento",
        "beta-mod-relatorios",
        "beta-mod-qa",
        "beta-mod-artefatos",
        "beta-sites",
    }
    for skill in sorted(required - primary_skills):
        errors.append(f"missing primary coverage: {skill}")

    transitions = {transition for case in cases for transition in case.get("transitions", [])}
    for transition in sorted(VALID_TRANSITIONS - transitions):
        errors.append(f"missing transition coverage: {transition}")

    print(f"routing_cases={len(cases)}")
    print(f"primary_skills_covered={len(primary_skills)}")
    print(f"transitions_covered={len(transitions & VALID_TRANSITIONS)}")
    if errors:
        print(f"errors={len(errors)}")
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print("errors=0")
    print("beta-routing-validation=PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(Path(__file__).resolve().parents[1]))
