#!/usr/bin/env python3
"""Genera il Manuale operativo di preparazione fisica (PDF) dai sorgenti in src/.

Formato dei sorgenti (Markdown con poche estensioni):
  # PARTE A — Titolo            -> banner di parte (pagina nuova)
  ## Titolo                     -> sezione numerata automaticamente
  ### Titolo                    -> sottosezione numerata (n.m)
  ### ~Titolo                   -> sottosezione senza numero
  :::attenzione | :::nota | :::regola | :::perche  ... :::   -> riquadri
  @@FIG:nome|TITOLO|didascalia@@                              -> figura SVG
  <<<break>>>                   -> salto pagina

Uso: python3 build.py   (richiede weasyprint e markdown)
"""
import glob
import html
import os
import re

import markdown
from weasyprint import HTML

import figures

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")
OUT = os.path.join(HERE, "Manuale-operativo-preparazione-fisica.pdf")

AUTHOR = "Andrea Scirè"
TITLE_SHORT = "Manuale operativo"
UPDATED = "10.2026"

CALLOUTS = {
    "attenzione": "Attenzione",
    "nota": "Nota",
    "regola": "La regola",
    "perche": "Il perché",
    "operativo": "In pratica",
    "verifica": "Da verificare · contenuto fuori dalla skill",
}


def preprocess(text):
    out, in_box = [], False
    for line in text.splitlines():
        m = re.match(r"^:::(\w+)\s*(.*)$", line)
        if m and not in_box and m.group(1) in ("grid", "plain"):
            out.append(f'<div class="{m.group(1)}-wrap" markdown="1">')
            out.append("")
            in_box = True
            continue
        if m and not in_box:
            kind = m.group(1)
            label = m.group(2).strip() or CALLOUTS.get(kind, kind)
            out.append(f'<div class="callout {kind}" markdown="1">')
            out.append(f'<p class="kicker">{html.escape(label)}</p>')
            out.append("")
            in_box = True
            continue
        if line.strip() == ":::" and in_box:
            out.append("")
            out.append("</div>")
            out.append("")
            in_box = False
            continue
        fm = re.match(r"^@@FIG:([\w-]+)\|([^|]*)\|(.*)@@$", line.strip())
        if fm:
            name, cap_t, cap = fm.groups()
            svg = figures.FIGS[name]()
            out.append(
                f'<figure class="fig">{svg}<figcaption><b>{html.escape(cap_t)}</b>'
                f" · {html.escape(cap)}</figcaption></figure>"
            )
            continue
        if line.strip() == "<<<break>>>":
            out.append('<div class="pb"></div>')
            continue
        out.append(line)
    return "\n".join(out)


def build():
    files = sorted(glob.glob(os.path.join(SRC, "*.md")))
    body_parts = []
    for f in files:
        with open(f, encoding="utf-8") as fh:
            text = preprocess(fh.read())
        body_parts.append(
            markdown.markdown(text, extensions=["tables", "md_in_html", "sane_lists"])
        )
    body = "\n".join(body_parts)

    toc = []
    sec = sub = 0
    nparts = 0

    def h1(m):
        nonlocal nparts
        nparts += 1
        title = m.group(0)
        hid = f"p{nparts}"
        mm = re.match(r"(PARTE\s+\w+)\s*—\s*(.*)", title)
        kicker, name = (mm.group(1), mm.group(2)) if mm else ("", title)
        toc.append(("part", hid, title, ""))
        return (
            f'<div class="part-banner" id="{hid}"><p class="pk">{kicker}</p>'
            f'<h1 data-run="{html.escape(title, quote=True)}">{name}</h1></div>'
        )

    def h2(m):
        nonlocal sec, sub
        sec += 1
        sub = 0
        title = m.group(0)
        hid = f"s{sec}"
        toc.append(("sec", hid, title, str(sec)))
        plain = re.sub("<[^>]+>", "", title)
        run = f"{sec}. {plain}"
        return (
            f'<h2 id="{hid}" data-run="{html.escape(run, quote=True)}">'
            f'<span class="num">{sec}</span>{title}</h2>'
        )

    def h3(m):
        nonlocal sub
        title = m.group(0)
        if title.startswith("~"):
            return f"<h3>{title[1:]}</h3>"
        sub += 1
        return f"<h3>{sec}.{sub} {title}</h3>"

    def heading(m):
        level = m.group(1)
        inner = re.match(r".*", m.group(2), re.S)
        return {"1": h1, "2": h2, "3": h3}[level](inner)

    body = re.sub(r"<h([123])>(.*?)</h\1>", heading, body, flags=re.S)

    # rimandi interni: {{ref:Titolo della sezione}} -> "§ n, p. x"
    def ref(m):
        key = m.group(1).strip().lower()
        for kind, hid, title, num in toc:
            plain = re.sub("<[^>]+>", "", title).lower()
            if kind == "sec" and plain.startswith(key):
                return f'<a class="ref" href="#{hid}">§{num}</a>'
        raise SystemExit(f"Rimando non trovato: {m.group(1)}")

    body = re.sub(r"\{\{ref:(.*?)\}\}", ref, body)
    body = body.replace("[DV]", '<span class="dv">da verificare</span>')

    # indice
    rows = []
    for kind, hid, title, num in toc:
        if kind == "part":
            rows.append(
                f'<li class="tp"><a href="#{hid}"><span class="t">{title}</span></a></li>'
            )
        else:
            rows.append(
                f'<li class="ts"><a href="#{hid}"><span class="n">{num}</span>'
                f'<span class="t">{title}</span></a></li>'
            )
    toc_html = '<section class="toc"><h2 class="toch">Indice</h2><ul>' + "".join(rows) + "</ul></section>"

    letters = [re.match(r"PARTE\s+(\w+)", t).group(1) for k, _, t, _ in toc if k == "part" and t.startswith("PARTE")]
    chips = "".join(f'<span class="chip c{i % 6}">{l}</span>' for i, l in enumerate(letters))

    with open(os.path.join(HERE, "cover.html"), encoding="utf-8") as fh:
        cover = fh.read()
    cover = (
        cover.replace("{{CHIPS}}", chips)
        .replace("{{PARTI}}", str(len(letters)))
        .replace("{{SEZIONI}}", str(sec))
        .replace("{{UPDATED}}", UPDATED)
        .replace("{{AUTHOR}}", AUTHOR.upper())
    )

    with open(os.path.join(HERE, "style.css"), encoding="utf-8") as fh:
        css = fh.read()

    doc = f"""<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>Manuale operativo di preparazione fisica</title>
<meta name="author" content="{AUTHOR}">
<style>{css}</style></head><body>
{cover}
{toc_html}
<main>{body}</main>
</body></html>"""
    with open(os.path.join(HERE, "manuale.html"), "w", encoding="utf-8") as fh:
        fh.write(doc)
    HTML(string=doc, base_url=HERE).write_pdf(OUT)
    print(f"OK: {OUT} — parti {len(letters)}, sezioni {sec}")


if __name__ == "__main__":
    build()
