"""Regression checks for the fixed Movidesk HTML report."""
from copy import deepcopy
from html.parser import HTMLParser
from pathlib import Path
import runpy
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "skills/beta-anl-movidesk-relatorios/scripts/render_report.py"
render = runpy.run_path(str(SCRIPT))["render"]


def inputs():
    return {
        "quarter": {"start": "2031-01-01", "end": "2031-03-31", "categories": [4, 2, 1, 1, 1, 0], "statuses": [6, 1, 1, 0, 1, 0]},
        "previous_quarter": {"start": "2030-10-01", "end": "2030-12-31", "total": 6},
        "year": {"start": "2031-01-01", "end": "2031-04-15", "categories": [6, 3, 2, 1, 1, 1], "statuses": [8, 2, 2, 1, 1, 0]},
        "previous_year": {"start": "2030-01-01", "end": "2030-04-15", "categories": [3, 1, 1, 1, 5, 0]},
        "months": [3, 2, 4, 5],
        "occurrences": [[2, 3, 2, 3], [1, 1, 1, 1], [0, 1, 0, 1], [None] * 4, [0, 0, 0, 0]],
        "generated_label": "15/04/2031 America/Sao_Paulo",
        "partial_month": True,
        "month_note": "Corte em abril.",
        "category_note": "<script>texto da origem</script>",
        "coverage_note": "Consulta completa.",
    }


class Structure(HTMLParser):
    def __init__(self):
        super().__init__()
        self.headings = []
        self.heading = False
        self.cards = 0
        self.tables = 0

    def handle_starttag(self, tag, attrs):
        self.heading = tag == "h2"
        if tag == "table":
            self.tables += 1
        if "card" in dict(attrs).get("class", "").split():
            self.cards += 1

    def handle_data(self, data):
        if self.heading:
            self.headings.append(data)


class ReportTests(unittest.TestCase):
    def test_template_and_calculations(self):
        rendered = render(inputs())
        parser = Structure()
        parser.feed(rendered)
        self.assertEqual(parser.headings, [
            "Resumo executivo", "Chamados por categoria", "Comparativo anual", "Chamados por mês",
            "Ocorrências de sistema e máquina", "Situação dos chamados na data da consulta",
        ])
        self.assertEqual((parser.cards, parser.tables), (8, 4))
        self.assertIn("data:image/png;base64,", rendered)
        self.assertIn("+50,0%", rendered)
        self.assertIn("+27,3%", rendered)
        self.assertIn("Abr*", rendered)
        self.assertIn("&lt;script&gt;", rendered)
        self.assertNotIn("<script>", rendered)
        self.assertNotIn("Dados de teste", rendered)
        self.assertEqual(rendered, render(inputs()))

    def test_missing_and_test_data(self):
        data = deepcopy(inputs())
        data["previous_year"]["categories"] = None
        data["scenario"] = "Cenário de validação."
        rendered = render(data)
        self.assertIn("Dados de teste", rendered)
        self.assertIn("Cenário de validação.", rendered)
        self.assertIn('<div class="value">—</div>', rendered)
        self.assertIn('<div class="value">14</div>', rendered)

    def test_rejects_unreconciled_data(self):
        data = inputs()
        data["months"][-1] += 1
        with self.assertRaisesRegex(ValueError, "reconciliar"):
            render(data)
        data = inputs()
        data["year"]["statuses"][-1] += 1
        with self.assertRaisesRegex(ValueError, "situação"):
            render(data)


if __name__ == "__main__":
    unittest.main()
