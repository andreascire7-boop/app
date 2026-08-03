#!/usr/bin/env python3
"""Convert PRD markdown to a styled PDF using reportlab (no external system deps)."""
import re
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, HRFlowable, NextPageTemplate,
)
from reportlab.platypus.tableofcontents import TableOfContents

SRC = "docs/product-design/PRD-strength-conditioning-tennis-padel.md"
OUT = "docs/product-design/PRD-strength-conditioning-tennis-padel.pdf"

NAVY = colors.HexColor("#0B2E4F")
ACCENT = colors.HexColor("#1F7A6C")
LIGHT = colors.HexColor("#EEF3F6")
GREY = colors.HexColor("#5A6B76")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", fontSize=26, leading=32, textColor=NAVY,
                           alignment=TA_CENTER, fontName="Helvetica-Bold", spaceAfter=14))
styles.add(ParagraphStyle(name="CoverSub", fontSize=13, leading=18, textColor=GREY,
                           alignment=TA_CENTER, fontName="Helvetica", spaceAfter=6))
styles.add(ParagraphStyle(name="H1", fontSize=19, leading=24, textColor=NAVY,
                           fontName="Helvetica-Bold", spaceBefore=4, spaceAfter=12))
styles.add(ParagraphStyle(name="H2", fontSize=14, leading=18, textColor=ACCENT,
                           fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=8))
styles.add(ParagraphStyle(name="H3", fontSize=11.5, leading=15, textColor=NAVY,
                           fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=5))
styles.add(ParagraphStyle(name="BodyText2", fontSize=9.6, leading=14, spaceAfter=6,
                           fontName="Helvetica", alignment=TA_LEFT))
styles.add(ParagraphStyle(name="Bullet2", fontSize=9.6, leading=13.5, fontName="Helvetica",
                           leftIndent=12))
styles.add(ParagraphStyle(name="CellHead", fontSize=8.6, leading=11, textColor=colors.white,
                           fontName="Helvetica-Bold"))
styles.add(ParagraphStyle(name="Cell", fontSize=8.6, leading=11.5, fontName="Helvetica"))
styles.add(ParagraphStyle(name="TOCH1", fontSize=12, leading=16, fontName="Helvetica-Bold",
                           textColor=NAVY))


def inline(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r"<i>\1</i>", text)
    text = re.sub(r"`([^`]+?)`", r"<font face='Courier'>\1</font>", text)
    return text


def parse_table(lines):
    rows = [l for l in lines if not re.match(r"^\|?\s*:?-{2,}", l.split("|")[1] if "|" in l else "")]
    data = []
    for l in lines:
        cells = [c.strip() for c in l.strip().strip("|").split("|")]
        if all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
            continue
        data.append(cells)
    return data


def build_story():
    story = []
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(name="TOCL1", fontSize=11, leading=16, fontName="Helvetica-Bold", textColor=NAVY),
        ParagraphStyle(name="TOCL2", fontSize=9.5, leading=13, leftIndent=14, textColor=GREY),
    ]

    # Cover page
    story.append(Spacer(1, 6 * cm))
    story.append(Paragraph("Strength &amp; Conditioning Intelligence Platform", styles["CoverTitle"]))
    story.append(Paragraph("per Tennis e Padel", styles["CoverTitle"]))
    story.append(Spacer(1, 0.6 * cm))
    story.append(Paragraph("Documento di Progettazione di Prodotto", styles["CoverSub"]))
    story.append(Paragraph("Analisi di Mercato · Prodotto · PRD · Architettura · Database · UX · Sistema AI · Business Model · Roadmap", styles["CoverSub"]))
    story.append(Spacer(1, 1.5 * cm))
    story.append(Paragraph("Preparato da: CTO · Senior Product Manager · UX/UI Designer · Software Architect · "
                            "Flutter Expert · Backend Engineer · AI Engineer · Database Architect · "
                            "Esperto Cybersecurity · QA Engineer · Esperto Tennis/Padel/S&amp;C", styles["CoverSub"]))
    story.append(PageBreak())

    story.append(Paragraph("Indice", styles["H1"]))
    story.append(toc)
    story.append(NextPageTemplate("content"))
    story.append(PageBreak())

    with open(SRC, encoding="utf-8") as f:
        lines = f.read().splitlines()

    i = 0
    buf_table = []
    in_table = False
    list_buf = []
    list_ordered = False

    def flush_list():
        nonlocal list_buf, list_ordered
        if list_buf:
            items = [ListItem(Paragraph(inline(t), styles["Bullet2"]), leftIndent=12) for t in list_buf]
            kwargs = dict(bulletFontSize=8, leftIndent=14, spaceAfter=6)
            if list_ordered:
                kwargs["bulletType"] = "1"
                kwargs["start"] = "1"
            else:
                kwargs["bulletType"] = "bullet"
            story.append(ListFlowable(items, **kwargs))
            list_buf = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("|"):
            in_table = True
            buf_table.append(stripped)
            i += 1
            continue
        elif in_table:
            data = parse_table(buf_table)
            if data:
                ncols = len(data[0])
                col_width = (17.2 * cm) / ncols
                tbl_data = [[Paragraph(inline(c), styles["CellHead"] if r == 0 else styles["Cell"]) for c in row]
                            for r, row in enumerate(data)]
                t = Table(tbl_data, colWidths=[col_width] * ncols, repeatRows=1)
                t.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C9D3D8")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 5),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ]))
                story.append(t)
                story.append(Spacer(1, 8))
            buf_table = []
            in_table = False
            continue

        if stripped == "":
            flush_list()
            i += 1
            continue

        if stripped == "---":
            story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#C9D3D8"),
                                     spaceBefore=6, spaceAfter=10))
            i += 1
            continue

        m1 = re.match(r"^# (.+)", stripped)
        m2 = re.match(r"^## (.+)", stripped)
        m3 = re.match(r"^### (.+)", stripped)
        mbul = re.match(r"^[-*] (.+)", stripped)
        mnum = re.match(r"^\d+\.\s+(.+)", stripped)

        if m1:
            flush_list()
            story.append(Paragraph(inline(m1.group(1)), styles["H1"]))
        elif m2:
            flush_list()
            title = m2.group(1)
            story.append(Paragraph(inline(title), styles["H2"]))
            story.append(Paragraph(f'<a name="{title}"/>', styles["BodyText2"]))
            story[-2].__dict__.setdefault("_bookmark", title)
            # register TOC entry via afterFlowable mechanism (see MyDocTemplate)
            story[-2]._toc_entry = (0, title)
            if title.startswith("FASE"):
                story.insert(len(story) - 2, PageBreak())
        elif m3:
            flush_list()
            title = m3.group(1)
            p = Paragraph(inline(title), styles["H3"])
            p._toc_entry = (1, title)
            story.append(p)
        elif mbul:
            list_ordered = False
            list_buf.append(mbul.group(1))
        elif mnum:
            list_ordered = True
            list_buf.append(mnum.group(1))
        else:
            flush_list()
            story.append(Paragraph(inline(stripped), styles["BodyText2"]))
        i += 1

    flush_list()
    return story


class NumberedCanvas:
    pass


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawString(2 * cm, 1.2 * cm, "S&C Intelligence Platform — Tennis & Padel · Documento di progettazione")
    canvas.drawRightString(19.2 * cm, 1.2 * cm, f"Pagina {doc.page}")
    canvas.setStrokeColor(colors.HexColor("#C9D3D8"))
    canvas.line(2 * cm, 1.5 * cm, 19.2 * cm, 1.5 * cm)
    canvas.restoreState()


def cover_footer(canvas, doc):
    pass


class DocTemplateWithTOC(BaseDocTemplate):
    def afterFlowable(self, flowable):
        entry = getattr(flowable, "_toc_entry", None)
        if entry:
            level, text = entry
            self.notify("TOCEntry", (level, text, self.page))


def main():
    doc = DocTemplateWithTOC(OUT, pagesize=A4,
                             leftMargin=2 * cm, rightMargin=2 * cm,
                             topMargin=2 * cm, bottomMargin=2 * cm,
                             title="S&C Intelligence Platform — Tennis & Padel")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    cover_tpl = PageTemplate(id="cover", frames=[frame], onPage=cover_footer)
    content_tpl = PageTemplate(id="content", frames=[frame], onPage=header_footer)
    doc.addPageTemplates([cover_tpl, content_tpl])

    story = build_story()
    doc.multiBuild(story)
    print(f"Written {OUT}")


if __name__ == "__main__":
    main()
