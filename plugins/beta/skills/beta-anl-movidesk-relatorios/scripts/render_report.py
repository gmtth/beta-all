"""Render the Movidesk executive report from verified aggregates."""
import argparse
from base64 import b64encode
import json
from datetime import date
from html import escape
from pathlib import Path
from string import Template

ASSETS = Path(__file__).resolve().parents[1] / "assets"
CATEGORIES = ("Erros de sistema", "Máquina", "Treinamento", "Implantação", "Outros", "Sem categoria")
STATUSES = ("Fechado", "Resolvido", "Em atendimento", "Parado", "Cancelado", "Novo")
OCCURRENCES = ("Erro de sistema", "Erro de máquina", "Máquina inoperante", "API e integração", "Sistema inoperante")
MONTHS = ("Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez")


def number(value):
    return "—" if value is None else f"{value:,}".replace(",", ".")


def decimal(value):
    return f"{value:.1f}".replace(".", ",")


def percent(part, total):
    return "—" if part is None or not total else decimal(100 * part / total) + "%"


def change(old, new):
    if not old or new is None:
        return "—"
    return ("+" if new > old else "") + decimal(100 * (new - old) / old) + "%"


def total_group(values, size):
    if values is None:
        return None, [None] * size
    if len(values) != size or any(type(n) is not int or n < 0 for n in values):
        raise ValueError("Série de contagens inválida")
    return sum(values), values


def date_label(value):
    return value.strftime("%d/%m/%Y")


def period_label(period):
    return " a ".join(date_label(date.fromisoformat(period[key])) for key in ("start", "end"))


def days(period):
    return (date.fromisoformat(period["end"]) - date.fromisoformat(period["start"])).days + 1


def card(label, value, detail, feature=False):
    kind = "card feature" if feature else "card"
    return f'<div class="{kind}"><div class="label">{escape(label)}</div><div class="value">{escape(value)}</div><div class="detail">{escape(detail)}</div></div>'


def chart(label, names, counts, total, shares=True):
    rows = []
    for name, count in zip(names, counts):
        ratio = 100 * count / total if count is not None and total else 0
        value = number(count) + (" · " + percent(count, total) if shares else "")
        rows.append(f'<div class="chart-row"><span>{escape(name)}</span><strong>{value}</strong><div class="chart-track" aria-hidden="true"><span style="width:{ratio:.3f}%"></span></div></div>')
    return '<figure class="panel"><figcaption>' + escape(label) + '</figcaption>' + "".join(rows) + "</figure>"


def table(headers, rows, groups=None):
    heading = "".join(f'<th scope="col">{escape(h)}</th>' for h in headers)
    grouped = "" if groups is None else "<tr><th></th>" + "".join(f'<th colspan="2" scope="colgroup">{escape(g)}</th>' for g in groups) + "</tr>"
    contents = "".join("<tr>" + "".join(f"<td>{escape(v)}</td>" for v in row) + "</tr>" for row in rows)
    return '<div class="panel table-wrap"><table><thead>' + grouped + "<tr>" + heading + "</tr></thead><tbody>" + contents + "</tbody></table></div>"


def note(value):
    return '<p class="note">' + escape(value) + '</p>'


def paired(names, one, two, a, b):
    return [(name, number(x), percent(x, a), number(y), percent(y, b)) for name, x, y in zip(names, one, two)]


def group_status(values):
    if values[0] is None:
        return [None] * 4
    return [values[0] + values[1], values[2] + values[3], values[4], values[5]]


def render(data):
    quarter, year, old, preceding = (data[k] for k in ("quarter", "year", "previous_year", "previous_quarter"))
    cut = date.fromisoformat(year["end"])
    q, qc = total_group(quarter["categories"], len(CATEGORIES))
    y, yc = total_group(year["categories"], len(CATEGORIES))
    o, oc = total_group(old["categories"], len(CATEGORIES))
    p = preceding["total"]
    if p is not None and (type(p) is not int or p < 0):
        raise ValueError("Total do período anterior inválido")
    if any(days(period) <= 0 for period in (quarter, year, old, preceding)):
        raise ValueError("Intervalo inválido")
    month_total, monthly = total_group(data["months"], cut.month)
    if month_total != y:
        raise ValueError("Os meses devem reconciliar com o acumulado anual")
    qst, qs = total_group(quarter.get("statuses"), len(STATUSES))
    yst, ys = total_group(year.get("statuses"), len(STATUSES))
    if any(status_total is not None and status_total != volume for status_total, volume in ((qst, q), (yst, y))):
        raise ValueError("A situação dos chamados deve reconciliar com o volume")
    grouped_names = ("Fechados ou resolvidos", "Em atendimento ou parados", "Cancelados", "Novos")
    gsq, gsy = group_status(qs), group_status(ys)
    ql, yl = period_label(quarter), period_label(year)
    qfocus = None if q is None else sum(qc[:2])
    yfocus = None if y is None else sum(yc[:2])
    rate = lambda n, period: "—" if n is None else decimal(n / days(period))
    cards = "".join([
        card("Chamados abertos · três meses completos", number(q), ql, True),
        card("Chamados abertos · ano", number(y), yl),
        card("Variação do volume", change(p, q), f"{number(q)} no período · {number(p)} nos três meses anteriores"),
        card("Aberturas por dia corrido", rate(q, quarter), f"{rate(p, preceding)} nos três meses anteriores"),
        card("Sistema e máquina · três meses", percent(qfocus, q), f"{number(qfocus)} de {number(q)} chamados"),
        card("Sistema e máquina · ano", percent(yfocus, y), f"{number(yfocus)} de {number(y)} chamados"),
        card("Em atendimento ou parados · ano", number(gsy[1]), percent(gsy[1], y) + " do total"),
        card("Ano contra ano", change(o, y), f"{number(o)} no ano anterior · {number(y)} no ano atual"),
    ])
    categories = '<div class="chart-grid">' + chart(ql, CATEGORIES, qc, q) + chart(yl, CATEGORIES, yc, y) + "</div>"
    headers = ("Categoria", "Chamados", "% do total", "Chamados", "% do total")
    categories += table(headers, paired((*CATEGORIES, "Total"), [*qc, q], [*yc, y], q, y), (ql, yl))
    categories += note("Os três meses e o acumulado podem se sobrepor. Cada chamado conta uma vez por período.")
    year_names = (old["start"][:4], str(cut.year))
    comparison = []
    for name, a, b in zip((*CATEGORIES, "Total"), [*oc, o], [*yc, y]):
        difference = "—" if a is None or b is None else ("0" if a == b else f"{b-a:+,}".replace(",", "."))
        comparison.append((name, number(a), number(b), difference or "0", change(a, b)))
    annual = chart("Total de chamados abertos", year_names, [o, y], max(o or 0, y or 0), False)
    annual += table(("Categoria", *year_names, "Diferença", "Variação"), comparison)
    annual += note(data["category_note"])
    bars = []
    ceiling = max(1, *(n or 0 for n in monthly))
    for i, (month, count) in enumerate(zip(MONTHS, monthly)):
        partial = data["partial_month"] and i == len(monthly) - 1
        kind = "bar-item partial" if partial else "bar-item"
        bars.append(f'<div class="{kind}"><span class="bar-value">{number(count)}</span><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="--height:{100 * (count or 0) / ceiling:.3f}%"></div></div><span class="bar-label">{month}{"*" if partial else ""}</span></div>')
    month_note = "* Mês parcial. " if data["partial_month"] else ""
    monthly_html = '<figure class="panel month-chart"><div class="bars">' + "".join(bars) + "</div><figcaption>" + escape(month_note + data["month_note"]) + "</figcaption></figure>"
    occurrences = []
    for name, counts in zip(OCCURRENCES, data["occurrences"], strict=True):
        if len(counts) != 4 or any(n is not None and (type(n) is not int or n < 0) for n in counts):
            raise ValueError("Contagem de ocorrências inválida")
        a, b, aa, bb = counts
        if (a is not None and aa is not None and aa > a) or (b is not None and bb is not None and bb > b):
            raise ValueError("Correspondência excede a contagem de ocorrências")
        occurrences.append((name, number(a) if q is not None else "—", number(b) if y is not None else "—", percent(aa, a) if q is not None else "—", percent(bb, b) if y is not None else "—"))
    occurrences_html = table(("Ocorrência", "Três meses", "Ano", "Na categoria associada · três meses", "Na categoria associada · ano"), occurrences)
    occurrences_html += note("Um chamado pode aparecer em mais de uma linha. Os percentuais mostram a parcela das ocorrências na categoria oficial associada.")
    statuses = '<div class="chart-grid">' + chart(ql, grouped_names, gsq, qst) + chart(yl, grouped_names, gsy, yst) + "</div>"
    statuses += table(("Status", "Três meses", "Ano"), [(name, number(a), number(b)) for name, a, b in zip((*STATUSES, "Total"), [*qs, qst], [*ys, yst])])
    statuses += note("Situação na data da consulta para os chamados abertos em cada período.")
    stamp = f'<strong>Data de corte: {date_label(cut)}</strong><br>{escape(data["generated_label"])}'
    if data.get("scenario"):
        stamp = '<strong style="display:block;color:#922a29">Dados de teste</strong>' + stamp
    footer = "Fonte: Movidesk · Contagem pela data de abertura. " + data["coverage_note"]
    if data.get("scenario"):
        footer += " Dados de teste: " + data["scenario"]
    return Template((ASSETS / "relatorio-padrao.html").read_text(encoding="utf-8")).substitute(
        logo=b64encode((ASSETS / "fundo.png").read_bytes()).decode("ascii"),
        stamp=stamp, cards=cards, categories=categories, annual_period=escape(period_label(old) + " · " + yl),
        annual=annual, year=str(cut.year), monthly=monthly_html, occurrences=occurrences_html,
        statuses=statuses, footer=escape(footer),
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("data", type=Path, help="JSON de agregados verificados")
    parser.add_argument("output", type=Path, help="HTML de saída")
    args = parser.parse_args()
    args.output.write_text(render(json.loads(args.data.read_text(encoding="utf-8-sig"))), encoding="utf-8")


if __name__ == "__main__":
    main()
