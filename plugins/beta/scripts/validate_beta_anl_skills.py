"""Validate the structural invariants of the Beta ANL skills.

This intentionally uses only the Python standard library so it can run even
when the official YAML validator dependencies are unavailable.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ANL_REVIEW_SECTIONS = (
    "## Quando usar",
    "## Objetivo",
    "Guided prompting",
    "Modo de leitura da base",
    "## Saída",
    "## Limites",
)

ANL_REVIEW_SKILLS = {
    "beta-anl-regras-negocio",
    "beta-anl-duvidas-funcionais",
    "beta-anl-triagem-incidentes",
}


def frontmatter(text: str) -> tuple[str | None, str | None]:
    match = re.match(r"\A---\r?\n(.*?)\r?\n---\r?\n", text, re.DOTALL)
    if not match:
        return None, None
    name = re.search(r"^name:\s*([^\r\n]+)$", match.group(1), re.MULTILINE)
    description = re.search(r"^description:\s*(.+)$", match.group(1), re.MULTILINE)
    return (name.group(1).strip() if name else None,
            description.group(1).strip() if description else None)


def main(root: Path) -> int:
    skills_root = root / "skills"
    errors: list[str] = []
    checked = 0

    for skill_dir in sorted(p for p in skills_root.iterdir() if p.is_dir()):
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.is_file():
            errors.append(f"{skill_dir.name}: missing SKILL.md")
            continue

        checked += 1
        text = skill_file.read_text(encoding="utf-8")
        name, description = frontmatter(text)
        if name != skill_dir.name:
            errors.append(f"{skill_dir.name}: frontmatter name mismatch: {name!r}")
        if not description:
            errors.append(f"{skill_dir.name}: missing description")
        sections = ANL_REVIEW_SECTIONS if skill_dir.name in ANL_REVIEW_SKILLS else ()
        for section in sections:
            if section not in text:
                errors.append(f"{skill_dir.name}: missing {section!r}")
        if "TODO" in text or "<skill-name>" in text:
            errors.append(f"{skill_dir.name}: unfinished placeholder")

        metadata = skill_dir / "agents" / "openai.yaml"
        if not metadata.is_file():
            errors.append(f"{skill_dir.name}: missing agents/openai.yaml")

        for reference in skill_dir.glob("references/origem-*.md"):
            if reference.stat().st_size == 0:
                errors.append(f"{skill_dir.name}: empty source reference: {reference.name}")

    print(f"checked_skills={checked}")
    if errors:
        print(f"errors={len(errors)}")
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print("errors=0")
    print("beta-anl-validation=PASS")
    return 0


if __name__ == "__main__":
    project_root = Path(__file__).resolve().parents[1]
    raise SystemExit(main(project_root))
