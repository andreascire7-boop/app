#!/usr/bin/env python3
"""One-page teaser (not the full PRD) for outside outreach — reportlab, no deps
beyond what build_pdf.py already uses."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, ListFlowable, ListItem,
)

OUT = "docs/product-design/S&C-Intelligence-one-pager.pdf"

NAVY = colors.HexColor("#0B2E4F")
ACCENT = colors.HexColor("#1F7A6C")
LIGHT = colors.HexColor("#EEF3F6")
GREY = colors.HexColor("#5A6B76")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Title2", fontSize=24, leading=28, textColor=NAVY,
                          fontName="Helvetica-Bold", spaceAfter=4, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="Subtitle2", fontSize=12.5, leading=16, textColor=ACCENT,
                          fontName="Helvetica-Bold", spaceAfter=14, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="H2b", fontSize=12, leading=15, textColor=NAVY,
                          fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=6))
styles.add(ParagraphStyle(name="Body2", fontSize=9.8, leading=14, fontName="Helvetica"))
styles.add(ParagraphStyle(name="Bullet3", fontSize=9.8, leading=13.5, fontName="Helvetica", leftIndent=10))
styles.add(ParagraphStyle(name="CellHead2", fontSize=9, leading=11, textColor=colors.white,
                          fontName="Helvetica-Bold"))
styles.add(ParagraphStyle(name="Cell2", fontSize=9, leading=12, fontName="Helvetica"))
styles.add(ParagraphStyle(name="Footer2", fontSize=9.5, leading=13, textColor=GREY, alignment=TA_CENTER))


def inline(text):
    return text


def build():
    story = []

    story.append(Paragraph("S&amp;C Intelligence Platform", styles["Title2"]))
    story.append(Paragraph(
        "The AI-native strength &amp; conditioning system for competitive tennis and padel players",
        styles["Subtitle2"]))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=10))

    story.append(Paragraph("The Opportunity", styles["H2b"]))
    story.append(Paragraph(
        "Padel is one of the fastest-growing sports worldwide (19M+ players, court count growing "
        "~16% year-on-year), and tennis has a large, mature competitive base — yet neither has a "
        "digital S&amp;C product that reasons like a real athletic trainer. Existing apps are either "
        "generic fitness templates or elite/team-sport tools priced out of reach for the individual "
        "competitive player.", styles["Body2"]))

    story.append(Paragraph("What We've Built", styles["H2b"]))
    story.append(Paragraph(
        "A working technical prototype — mobile app, AI decision engine, and backend — validated "
        "end to end, not just a deck:", styles["Body2"]))
    story.append(ListFlowable([
        ListItem(Paragraph("Adaptive periodization that generates and adjusts training blocks automatically, "
                           "not static templates", styles["Bullet3"])),
        ListItem(Paragraph("Injury-risk detection (load history + injury record + pain signals) with plain-"
                           "language explanations", styles["Bullet3"])),
        ListItem(Paragraph("Calendar-aware tapering: adding a tournament automatically reduces training load "
                           "in the right window — and restores it if the event is cancelled", styles["Bullet3"])),
        ListItem(Paragraph("Automatic exercise substitution on pain signals, with safety guardrails for minors "
                           "and disordered-eating signals", styles["Bullet3"])),
    ], bulletType="bullet", leftIndent=14, spaceAfter=6))

    story.append(Paragraph("Why It's Different", styles["H2b"]))
    data = [
        ["Capability", "Generalist fitness apps", "Elite/team-sport tools", "Us"],
        ["Sport-specific programming", "No", "Yes", "Yes"],
        ["Adapts to competition calendar", "No", "Partial", "Yes"],
        ["Injury-risk detection", "No", "Yes (enterprise-priced)", "Yes (consumer-priced)"],
        ["Accessible to individual players", "Yes", "No", "Yes"],
    ]
    table = Table(data, colWidths=[4.6 * cm, 4.0 * cm, 4.2 * cm, 3.0 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C9D3D8")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(table)

    story.append(Paragraph("Business Model", styles["H2b"]))
    story.append(Paragraph(
        "Freemium → Premium/Pro subscription (B2C), plus per-athlete licensing for academies, clubs "
        "and coaches (B2B) — sequenced padel-first, then tennis, consistent with where the growth "
        "and the whitespace both are today.", styles["Body2"]))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor("#C9D3D8"), spaceAfter=10))
    story.append(Paragraph("Andrea Scirè · andreascire7@gmail.com", styles["Footer2"]))
    story.append(Paragraph("Full product design (market analysis, architecture, roadmap) available on request.",
                           styles["Footer2"]))

    doc = SimpleDocTemplate(OUT, pagesize=A4,
                            leftMargin=2.2 * cm, rightMargin=2.2 * cm,
                            topMargin=1.8 * cm, bottomMargin=1.8 * cm,
                            title="S&C Intelligence Platform — One Pager")
    doc.build(story)
    print(f"Written {OUT}")


if __name__ == "__main__":
    build()
