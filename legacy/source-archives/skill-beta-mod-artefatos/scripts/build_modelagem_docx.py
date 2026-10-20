#!/usr/bin/env python3
"""Deterministic DOCX generator for Beta MOD Artefatos.

This script formats an already-consolidated JSON payload. It does not infer,
validate, or modify functional rules.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Iterable

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor


PAGE_W_CM = 21.001
PAGE_H_CM = 29.700
MARGIN_TOP_CM = 2.752
MARGIN_BOTTOM_CM = 0.501
MARGIN_LEFT_CM = 0.501
MARGIN_RIGHT_CM = 0.748
HEADER_DISTANCE_CM = 0.485
FOOTER_DISTANCE_CM = 0.0

LOGO_W_CM = 7.679

FONT_NAME = "Calibri"
FONT_SIZE_PT = 12
TABLE_DENSE_PT = 10.5

BODY_AFTER_PT = 4
HEADING_BEFORE_PT = 7
HEADING_AFTER_PT = 3

TABLE_CELL_TB_TWIPS = 60
TABLE_CELL_LR_TWIPS = 80


def _set_run_font(run, size: float = FONT_SIZE_PT, bold: bool | None = None,
                  italic: bool | None = None, color: str | None = None) -> None:
    run.font.name = FONT_NAME
    run.font.size = Pt(size)
    if bold is not None:
        run.bold = bool(bold)
    if italic is not None:
        run.italic = bool(italic)
    if color:
        hexv = color.lstrip("#").upper()
        if len(hexv) != 6:
            raise ValueError(f"Cor inválida: {color}")
        run.font.color.rgb = RGBColor.from_string(hexv)
    rpr = run._r.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    for attr in ("ascii", "hAnsi", "eastAsia", "cs"):
        rfonts.set(qn(f"w:{attr}"), FONT_NAME)


def _configure_paragraph(p, *, align=WD_ALIGN_PARAGRAPH.JUSTIFY,
                         before: float = 0, after: float = BODY_AFTER_PT,
                         line: float = 1.0, keep_next: bool = False,
                         left_cm: float | None = None,
                         first_cm: float | None = None) -> None:
    p.alignment = align
    pf = p.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = line
    pf.keep_with_next = keep_next
    if left_cm is not None:
        pf.left_indent = Cm(left_cm)
    if first_cm is not None:
        pf.first_line_indent = Cm(first_cm)


def _clear_paragraph(p) -> None:
    for child in list(p._p):
        if child.tag != qn("w:pPr"):
            p._p.remove(child)


def _remove_paragraph(p) -> None:
    parent = p._element.getparent()
    if parent is not None:
        parent.remove(p._element)


def _set_cell_margins(cell, top: int, start: int, bottom: int, end: int) -> None:
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = tcPr.find(qn("w:tcMar"))
    if tcMar is None:
        tcMar = OxmlElement("w:tcMar")
        tcPr.append(tcMar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        tag = f"w:{m}"
        node = tcMar.find(qn(tag))
        if node is None:
            node = OxmlElement(tag)
            tcMar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def _set_table_borders(table, size_eighth_pt: int = 4, color: str = "000000") -> None:
    tblPr = table._tbl.tblPr
    borders = tblPr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tblPr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = borders.find(qn(f"w:{edge}"))
        if el is None:
            el = OxmlElement(f"w:{edge}")
            borders.append(el)
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), str(size_eighth_pt))
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), color)


def _set_table_width_dxa(table, width_twips: int) -> None:
    tblPr = table._tbl.tblPr
    tblW = tblPr.find(qn("w:tblW"))
    if tblW is None:
        tblW = OxmlElement("w:tblW")
        tblPr.append(tblW)
    tblW.set(qn("w:w"), str(width_twips))
    tblW.set(qn("w:type"), "dxa")


def _set_table_fixed_layout(table) -> None:
    tblPr = table._tbl.tblPr
    layout = tblPr.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        tblPr.append(layout)
    layout.set(qn("w:type"), "fixed")


def _repeat_header(row) -> None:
    trPr = row._tr.get_or_add_trPr()
    header = trPr.find(qn("w:tblHeader"))
    if header is None:
        header = OxmlElement("w:tblHeader")
        trPr.append(header)
    header.set(qn("w:val"), "true")


def _cant_split(row) -> None:
    trPr = row._tr.get_or_add_trPr()
    el = trPr.find(qn("w:cantSplit"))
    if el is None:
        el = OxmlElement("w:cantSplit")
        trPr.append(el)


def _set_grid_widths(table, fractions: list[float], available_cm: float) -> None:
    if not fractions:
        return
    total = sum(fractions)
    if total <= 0:
        raise ValueError("As larguras da tabela devem somar valor positivo.")
    fractions = [x / total for x in fractions]
    total_twips = int(available_cm / 2.54 * 1440)
    widths = [max(1, int(total_twips * f)) for f in fractions]
    # compensate rounding in the last column
    widths[-1] += total_twips - sum(widths)

    grid = table._tbl.tblGrid
    if grid is not None:
        cols = list(grid.gridCol_lst)
        for idx, w in enumerate(widths):
            if idx < len(cols):
                cols[idx].set(qn("w:w"), str(w))

    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            if idx >= len(widths):
                continue
            tcPr = cell._tc.get_or_add_tcPr()
            tcW = tcPr.find(qn("w:tcW"))
            if tcW is None:
                tcW = OxmlElement("w:tcW")
                tcPr.append(tcW)
            tcW.set(qn("w:w"), str(widths[idx]))
            tcW.set(qn("w:type"), "dxa")


def _set_cell_text(cell, text: Any, *, bold: bool = False, size: float = FONT_SIZE_PT,
                   align: str = "left") -> None:
    text = "" if text is None else str(text)
    p = cell.paragraphs[0]
    _clear_paragraph(p)
    alignment = {
        "left": WD_ALIGN_PARAGRAPH.LEFT,
        "center": WD_ALIGN_PARAGRAPH.CENTER,
        "right": WD_ALIGN_PARAGRAPH.RIGHT,
    }.get(align, WD_ALIGN_PARAGRAPH.LEFT)
    _configure_paragraph(p, align=alignment, before=0, after=0, line=1.0)
    r = p.add_run(text)
    _set_run_font(r, size=size, bold=bold)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def _add_labeled_text(p, label: str, value: Any, *, label_bold: bool = True,
                      value_bold: bool = False, size: float = FONT_SIZE_PT) -> None:
    _clear_paragraph(p)
    _configure_paragraph(p, align=WD_ALIGN_PARAGRAPH.LEFT, before=0, after=0, line=1.0)
    r1 = p.add_run(f"{label}: ")
    _set_run_font(r1, size=size, bold=label_bold)
    r2 = p.add_run("" if value is None else str(value))
    _set_run_font(r2, size=size, bold=value_bold)


def _add_page_field(p) -> None:
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run()
    _set_run_font(run, size=10)

    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "1"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")

    for node in (fld_begin, instr, fld_sep, text, fld_end):
        run._r.append(node)


def _configure_document(doc: Document, logo_path: Path) -> None:
    sec = doc.sections[0]
    sec.orientation = WD_ORIENT.PORTRAIT
    sec.page_width = Cm(PAGE_W_CM)
    sec.page_height = Cm(PAGE_H_CM)
    sec.top_margin = Cm(MARGIN_TOP_CM)
    sec.bottom_margin = Cm(MARGIN_BOTTOM_CM)
    sec.left_margin = Cm(MARGIN_LEFT_CM)
    sec.right_margin = Cm(MARGIN_RIGHT_CM)
    sec.header_distance = Cm(HEADER_DISTANCE_CM)
    sec.footer_distance = Cm(FOOTER_DISTANCE_CM)

    normal = doc.styles["Normal"]
    normal.font.name = FONT_NAME
    normal.font.size = Pt(FONT_SIZE_PT)

    # Header
    hp = sec.header.paragraphs[0]
    _clear_paragraph(hp)
    _configure_paragraph(hp, align=WD_ALIGN_PARAGRAPH.LEFT, before=0, after=0, line=1.0)
    hr = hp.add_run()
    shape = hr.add_picture(str(logo_path), width=Cm(LOGO_W_CM))
    try:
        shape._inline.docPr.set("descr", "CENCIHUB — Tecnologia a serviço da segurança")
    except Exception:
        pass

    # Footer
    fp = sec.footer.paragraphs[0]
    _clear_paragraph(fp)
    _add_page_field(fp)


def _add_metadata(doc: Document, metadata: dict[str, Any], content_width_cm: float) -> None:
    table = doc.add_table(rows=3, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    table.autofit = False
    # Match the compact reference metadata block near the top of the page.
    tblPr = table._tbl.tblPr
    tblpPr = tblPr.find(qn("w:tblpPr"))
    if tblpPr is None:
        tblpPr = OxmlElement("w:tblpPr")
        tblPr.insert(1, tblpPr)
    tblpPr.set(qn("w:leftFromText"), "141")
    tblpPr.set(qn("w:rightFromText"), "141")
    tblpPr.set(qn("w:vertAnchor"), "page")
    tblpPr.set(qn("w:horzAnchor"), "margin")
    tblpPr.set(qn("w:tblpY"), "1517")
    _set_table_fixed_layout(table)
    _set_table_borders(table, 4)
    total_twips = int(content_width_cm / 2.54 * 1440)
    _set_table_width_dxa(table, total_twips)
    widths = [0.329, 0.114, 0.355, 0.202]
    _set_grid_widths(table, widths, content_width_cm)

    # Merge before filling.
    row0_a = table.cell(0, 0).merge(table.cell(0, 1))
    row1_b = table.cell(1, 1).merge(table.cell(1, 2)).merge(table.cell(1, 3))
    row2 = table.cell(2, 0).merge(table.cell(2, 1)).merge(table.cell(2, 2)).merge(table.cell(2, 3))

    cells = [
        row0_a, table.cell(0, 2), table.cell(0, 3),
        table.cell(1, 0), row1_b, row2
    ]
    for c in cells:
        _set_cell_margins(c, 45, 70, 45, 70)

    _add_labeled_text(row0_a.paragraphs[0], "Solicitante", metadata.get("solicitante", ""))
    _add_labeled_text(table.cell(0, 2).paragraphs[0], "Sistema", metadata.get("sistema", ""))
    _add_labeled_text(table.cell(0, 3).paragraphs[0], "Data", metadata.get("data", ""))
    _add_labeled_text(table.cell(1, 0).paragraphs[0], "Tipo Dev", metadata.get("tipo_dev", ""))
    _add_labeled_text(row1_b.paragraphs[0], "Título", metadata.get("titulo", ""))
    _add_labeled_text(row2.paragraphs[0], "Breve descritivo", metadata.get("breve_descritivo", ""))

    # Keep metadata compact.
    for row in table.rows:
        _cant_split(row)


def _add_document_label(doc: Document, text: str) -> None:
    p = doc.add_paragraph()
    _configure_paragraph(p, align=WD_ALIGN_PARAGRAPH.LEFT, before=3, after=2, line=1.0, keep_next=False)
    r = p.add_run(text)
    _set_run_font(r, bold=True)


def _add_heading(target, text: str, level: int) -> None:
    p = target.add_paragraph()
    _configure_paragraph(
        p,
        align=WD_ALIGN_PARAGRAPH.JUSTIFY,
        before=HEADING_BEFORE_PT,
        after=HEADING_AFTER_PT,
        line=1.0,
        keep_next=True,
    )
    if level == 1:
        text = text.upper()
    r = p.add_run(text)
    _set_run_font(r, bold=True)


def _add_paragraph(target, block: dict[str, Any]) -> None:
    p = target.add_paragraph()
    align = {
        "left": WD_ALIGN_PARAGRAPH.LEFT,
        "center": WD_ALIGN_PARAGRAPH.CENTER,
        "right": WD_ALIGN_PARAGRAPH.RIGHT,
        "justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
    }.get(block.get("align", "justify"), WD_ALIGN_PARAGRAPH.JUSTIFY)
    _configure_paragraph(
        p,
        align=align,
        before=float(block.get("before_pt", 0)),
        after=float(block.get("after_pt", BODY_AFTER_PT)),
        line=float(block.get("line_spacing", 1.0)),
    )
    if "segments" in block:
        for seg in block.get("segments") or []:
            r = p.add_run(str(seg.get("text", "")))
            _set_run_font(
                r,
                size=float(seg.get("size_pt", FONT_SIZE_PT)),
                bold=seg.get("bold"),
                italic=seg.get("italic"),
                color=seg.get("color"),
            )
    else:
        r = p.add_run(str(block.get("text", "")))
        _set_run_font(r)


def _add_bullets(target, items: Iterable[Any], numbered: bool = False) -> None:
    style_name = "List Number" if numbered else "List Bullet"
    for item in items:
        p = target.add_paragraph(style=style_name)
        _configure_paragraph(
            p,
            align=WD_ALIGN_PARAGRAPH.JUSTIFY,
            before=0,
            after=1.5,
            line=1.0,
            left_cm=0.65 if not numbered else None,
            first_cm=-0.30 if not numbered else None,
        )
        r = p.add_run(str(item))
        _set_run_font(r)


def _add_equation(target, text: str) -> None:
    p = target.add_paragraph()
    _configure_paragraph(p, align=WD_ALIGN_PARAGRAPH.LEFT, before=0, after=BODY_AFTER_PT, line=1.0)
    r = p.add_run(text)
    _set_run_font(r)


def _add_message(target, text: str) -> None:
    p = target.add_paragraph()
    _configure_paragraph(
        p,
        align=WD_ALIGN_PARAGRAPH.JUSTIFY,
        before=0,
        after=BODY_AFTER_PT,
        line=1.0,
        left_cm=0.25,
    )
    r = p.add_run(f"“{text}”" if not (text.startswith("“") or text.startswith('"')) else text)
    _set_run_font(r, italic=True)


def _add_view_reference(target, label: str, name: str) -> None:
    p = target.add_paragraph()
    _configure_paragraph(p, align=WD_ALIGN_PARAGRAPH.LEFT, before=0, after=2, line=1.0, keep_next=True)
    r1 = p.add_run(f"{label}: ")
    _set_run_font(r1, bold=True)
    r2 = p.add_run(name)
    _set_run_font(r2)


def _add_table(target, block: dict[str, Any], available_cm: float) -> None:
    headers = [str(x) for x in block.get("headers", [])]
    rows = block.get("rows", []) or []
    if not headers:
        raise ValueError("Bloco table exige 'headers'.")
    ncols = len(headers)
    for row in rows:
        if len(row) != ncols:
            raise ValueError("Todas as linhas da tabela devem ter a mesma quantidade de colunas do cabeçalho.")

    table = target.add_table(rows=1 + len(rows), cols=ncols)
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    table.autofit = False
    _set_table_fixed_layout(table)
    _set_table_borders(table, 4)
    _set_table_width_dxa(table, int(available_cm / 2.54 * 1440))

    widths = block.get("widths")
    if widths:
        if len(widths) != ncols:
            raise ValueError("'widths' precisa ter uma largura por coluna.")
        fractions = [float(x) for x in widths]
    else:
        fractions = [1 / ncols] * ncols
    _set_grid_widths(table, fractions, available_cm)

    alignments = block.get("align") or ["left"] * ncols
    if len(alignments) != ncols:
        alignments = ["left"] * ncols

    dense = bool(block.get("dense", False))
    size = float(block.get("font_size_pt", TABLE_DENSE_PT if dense else FONT_SIZE_PT))

    for ci, header in enumerate(headers):
        cell = table.rows[0].cells[ci]
        _set_cell_margins(cell, TABLE_CELL_TB_TWIPS, TABLE_CELL_LR_TWIPS,
                          TABLE_CELL_TB_TWIPS, TABLE_CELL_LR_TWIPS)
        _set_cell_text(cell, header, bold=True, size=size, align=alignments[ci])

    _repeat_header(table.rows[0])
    _cant_split(table.rows[0])

    for ri, raw_row in enumerate(rows, start=1):
        row = table.rows[ri]
        for ci, value in enumerate(raw_row):
            cell = row.cells[ci]
            _set_cell_margins(cell, TABLE_CELL_TB_TWIPS, TABLE_CELL_LR_TWIPS,
                              TABLE_CELL_TB_TWIPS, TABLE_CELL_LR_TWIPS)
            _set_cell_text(cell, value, bold=False, size=size, align=alignments[ci])

    # A nested table inside a table cell must be followed by a paragraph.
    # Keep that structural paragraph visually negligible.
    p = target.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = Pt(1)
    r = p.add_run("")
    _set_run_font(r, size=1)


def _add_image(target, block: dict[str, Any], available_cm: float, base_dir: Path) -> None:
    raw = block.get("path")
    if not raw:
        raise ValueError("Bloco image exige 'path'.")
    path = Path(str(raw))
    if not path.is_absolute():
        path = (base_dir / path).resolve()
    if not path.exists():
        raise FileNotFoundError(f"Imagem não encontrada: {path}")

    width_cm = float(block.get("width_cm", available_cm))
    width_cm = min(width_cm, available_cm)
    align = {
        "left": WD_ALIGN_PARAGRAPH.LEFT,
        "center": WD_ALIGN_PARAGRAPH.CENTER,
        "right": WD_ALIGN_PARAGRAPH.RIGHT,
    }.get(block.get("align", "left"), WD_ALIGN_PARAGRAPH.LEFT)

    p = target.add_paragraph()
    _configure_paragraph(p, align=align, before=0, after=BODY_AFTER_PT, line=1.0)
    r = p.add_run()
    shape = r.add_picture(str(path), width=Cm(width_cm))
    alt = block.get("alt")
    if alt:
        try:
            shape._inline.docPr.set("descr", str(alt))
        except Exception:
            pass


def _add_page_break(target) -> None:
    p = target.add_paragraph()
    _configure_paragraph(p, align=WD_ALIGN_PARAGRAPH.LEFT, before=0, after=0, line=1.0)
    p.add_run().add_break(WD_BREAK.PAGE)


def build(spec: dict[str, Any], output_path: Path, spec_dir: Path, logo_override: Path | None = None) -> None:
    doc = Document()

    logo = logo_override or (Path(__file__).resolve().parent.parent / "assets" / "logo-cencihub.png")
    if not logo.exists():
        raise FileNotFoundError(f"Logo do CENCIHUB não encontrado: {logo}")
    _configure_document(doc, logo)

    sec = doc.sections[0]
    content_width_cm = (sec.page_width - sec.left_margin - sec.right_margin) / 360000.0

    layout = spec.get("layout") or {}
    metadata = spec.get("metadata") or {}
    include_metadata = bool(layout.get("include_metadata", bool(metadata)))
    if include_metadata:
        _add_metadata(doc, metadata, content_width_cm)

    if bool(layout.get("show_document_label", False)):
        _add_document_label(doc, str(layout.get("document_label", "MODELAGEM")))

    # O arquétipo permanece disponível para a gramática documental, mas o corpo
    # é sempre inserido diretamente no fluxo normal do documento.
    _archetype = str(layout.get("archetype", "general")).lower()
    inner_width_cm = content_width_cm

    for block in spec.get("content", []) or []:
        if not isinstance(block, dict):
            raise ValueError("Cada bloco de content deve ser um objeto JSON.")
        kind = str(block.get("type", "")).strip().lower()

        target = doc
        if kind == "heading":
            _add_heading(target, str(block.get("text", "")), int(block.get("level", 1)))
        elif kind == "paragraph":
            _add_paragraph(target, block)
        elif kind == "bullets":
            _add_bullets(target, block.get("items", []) or [], numbered=False)
        elif kind == "numbered":
            # Keep a numbered sequence in one container so Word preserves the
            # numbering sequence. Numbered validation lists are normally short.
            _add_bullets(target, block.get("items", []) or [], numbered=True)
        elif kind == "table":
            _add_table(target, block, inner_width_cm)
        elif kind == "equation":
            _add_equation(target, str(block.get("text", "")))
        elif kind == "message":
            _add_message(target, str(block.get("text", "")))
        elif kind == "view_reference":
            _add_view_reference(target, str(block.get("label", "Arquivo")), str(block.get("name", "")))
        elif kind == "image":
            _add_image(target, block, inner_width_cm, spec_dir)
        elif kind == "page_break":
            _add_page_break(target)
        else:
            raise ValueError(f"Tipo de bloco não suportado: {kind!r}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(output_path)


def main() -> int:
    ap = argparse.ArgumentParser(description="Gerar DOCX Beta MOD a partir de JSON consolidado.")
    ap.add_argument("input_json", type=Path)
    ap.add_argument("output_docx", type=Path)
    ap.add_argument("--logo", type=Path, default=None, help="Sobrescrever logo documental.")
    args = ap.parse_args()

    try:
        spec = json.loads(args.input_json.read_text(encoding="utf-8"))
        if not isinstance(spec, dict):
            raise ValueError("O JSON raiz deve ser um objeto.")
        build(spec, args.output_docx, args.input_json.parent.resolve(), args.logo)
    except Exception as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 2

    print(f"DOCX gerado: {args.output_docx}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
