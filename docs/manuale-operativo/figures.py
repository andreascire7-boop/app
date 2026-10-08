"""Figure SVG del manuale (generate in codice, nessun file esterno)."""

BLUE = "#1e3a8f"
BLUE2 = "#3f5bb8"
SKY = "#6b86d6"
PALE = "#a3b4e0"
INK = "#15171c"
GREY = "#8a8f99"
LINE = "#d4d7dd"
GREEN = "#2e7d4f"
RED = "#b3261e"
AMBER = "#c8801a"
F = 'font-family="DejaVu Sans"'


def svg(w, h, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">{body}</svg>'


def t(x, y, s, size=11, fill=INK, anchor="start", weight="normal"):
    return (f'<text x="{x}" y="{y}" {F} font-size="{size}" fill="{fill}" '
            f'text-anchor="{anchor}" font-weight="{weight}">{s}</text>')


def rect(x, y, w, h, fill, rx=0, stroke="none"):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" rx="{rx}" stroke="{stroke}"/>'


def line(x1, y1, x2, y2, c=LINE, w=1, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"{d}/>'


def arrow(x1, y1, x2, y2, c=GREY):
    return (f'<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">'
            f'<path d="M0,0 L8,4 L0,8 z" fill="{c}"/></marker></defs>'
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="1.4" marker-end="url(#ah)"/>')


def residui():
    data = [("Resistenza aerobica", 30, 5, BLUE), ("Forza massima", 30, 5, BLUE),
            ("Resistenza anaerobica", 18, 4, BLUE2), ("Forza resistente", 15, 5, SKY),
            ("Velocità massima", 5, 3, RED)]
    b = ""
    x0, sc = 190, 13
    for i, (n, v, e, c) in enumerate(data):
        y = 20 + i * 36
        b += t(x0 - 10, y + 17, n, 11, INK, "end")
        b += rect(x0, y + 4, v * sc, 20, c)
        b += line(x0 + (v - e) * sc, y + 14, x0 + (v + e) * sc, y + 14, INK, 1.2)
        b += t(x0 + (v + e) * sc + 8, y + 18, f"~{v} ± {e} gg", 10, GREY)
    b += line(x0, 200, x0 + 35 * sc, 200, LINE)
    for d in range(0, 36, 5):
        b += line(x0 + d * sc, 198, x0 + d * sc, 203, GREY)
        b += t(x0 + d * sc, 216, str(d), 9, GREY, "middle")
    b += t(x0 + 35 * sc, 232, "giorni di ritenzione dopo lo stop", 9, GREY, "end")
    return svg(680, 240, b)


def macro():
    blocks = [("ACCUMULO", "4-6 sett.", "#2c3d73", 190), ("TRASMUTAZIONE", "3-4 sett.", "#3a52a4", 150),
              ("REALIZZAZIONE", "2-3 sett.", "#4560b8", 110), ("TAPER", "1-3 sett.", SKY, 80)]
    b, x = "", 10
    for n, d, c, w in blocks:
        b += rect(x, 70, w - 6, 46, c)
        b += t(x + (w - 6) / 2, 92, n, 10, "#fff", "middle", "bold")
        b += t(x + (w - 6) / 2, 107, d, 9, "#dfe4f5", "middle")
        x += w
    b += rect(x, 70, 70, 46, INK)
    b += t(x + 35, 98, "GARA", 11, "#fff", "middle", "bold")
    b += f'<polyline points="10,22 200,26 350,40 460,52 540,62" fill="none" stroke="{GREY}" stroke-width="2" stroke-dasharray="5 4"/>'
    b += f'<polyline points="10,58 200,44 350,30 460,22 540,22" fill="none" stroke="{RED}" stroke-width="2"/>'
    b += t(548, 66, "volume", 9, GREY) + t(548, 20, "intensità / specificità", 9, RED)
    b += arrow(600, 140, 20, 140, GREY)
    b += t(310, 158, "si costruisce all'indietro: gara → taper → realizzazione → trasmutazione → accumulo → oggi", 9.5, GREY, "middle")
    return svg(680, 168, b)


def onda():
    vals = [(1, 70, "carico"), (2, 82, "carico"), (3, 94, "carico"), (4, 48, "scarico"),
            (5, 76, "carico"), (6, 88, "carico"), (7, 100, "carico"), (8, 52, "scarico")]
    b = ""
    for i, (w, v, k) in enumerate(vals):
        x = 30 + i * 78
        c = BLUE2 if k == "carico" else PALE
        b += rect(x, 150 - v, 54, v, c)
        b += t(x + 27, 168, f"S{w}", 10, INK, "middle")
        if k == "scarico":
            b += t(x + 27, 145 - v, "scarico", 9, GREY, "middle")
    b += line(20, 150, 660, 150, GREY)
    b += t(330, 190, "onda 3+1: tre settimane di carico crescente, una di scarico; la seconda onda riparte più in alto", 9.5, GREY, "middle")
    return svg(680, 198, b)


def taper():
    weeks = ["−3", "−2", "−1", "gara"]
    vol = [100, 65, 45, 25]
    b = ""
    for i, (w, v) in enumerate(zip(weeks, vol)):
        x = 60 + i * 150
        b += rect(x, 150 - v, 70, v, BLUE2 if i < 3 else SKY)
        b += t(x + 35, 168, f"sett. {w}" if w != "gara" else "sett. di gara", 10, INK, "middle")
        b += t(x + 35, 144 - v, f"vol {v}%", 9, GREY, "middle")
    b += f'<polyline points="95,30 245,30 395,32 545,36" fill="none" stroke="{RED}" stroke-width="2.4"/>'
    b += t(560, 34, "intensità", 9, RED)
    b += line(40, 150, 660, 150, GREY)
    b += t(340, 192, "meno lavoro, stessa qualità: il volume scende per gradi, l'intensità resta alta, la frequenza quasi invariata", 9.5, GREY, "middle")
    return svg(680, 200, b)


def settimana():
    days = [("Lun", 25, "recupero"), ("Mar", 95, "forza"), ("Mer", 80, "tecnico"), ("Gio", 60, "forza mant."),
            ("Ven", 40, "velocità"), ("Sab", 25, "rifinitura"), ("Dom", 100, "GARA")]
    b = ""
    for i, (d, v, k) in enumerate(days):
        x = 30 + i * 90
        c = INK if k == "GARA" else (BLUE if v >= 80 else BLUE2 if v >= 50 else PALE)
        b += rect(x, 140 - v, 60, v, c)
        b += t(x + 30, 158, d, 10, INK, "middle", "bold")
        b += t(x + 30, 172, k, 8.5, GREY, "middle")
    b += line(20, 140, 660, 140, GREY)
    return svg(680, 182, b)


def fv():
    b = line(60, 20, 60, 190, GREY) + line(60, 190, 650, 190, GREY)
    b += f'<path d="M70,30 Q140,150 640,182" fill="none" stroke="{BLUE}" stroke-width="2.6"/>'
    zones = [(80, "FORZA MASSIMA", "≥85% 1RM · 1-6 rip"), (250, "FORZA-VELOCITÀ / POTENZA", "30-60% balistici · 80-90% forza"),
             (470, "VELOCITÀ-FORZA", "pliometria, lanci, sprint")]
    for x, n, d in zones:
        yy = {80: 34, 250: 98, 470: 140}[x]
        xx = 165 if x == 80 else x
        b += t(xx, yy, n, 9.5, BLUE, "start", "bold")
        b += t(xx, yy + 14, d, 8.5, GREY)
    b += t(30, 105, "forza", 9, GREY, "middle")
    b += t(640, 206, "velocità", 9, GREY, "end")
    return svg(680, 212, b)


def plio():
    lv = [(1, "Hop, skip, pogo", 18, GREEN), (2, "Salti sul posto", 36, PALE), (3, "Con spostamento", 54, SKY),
          (4, "Box jump", 72, BLUE2), (5, "Bounding, hop mono", 94, BLUE), (6, "Drop / depth jump", 120, RED)]
    b = ""
    for i, (n, name, h, c) in enumerate(lv):
        x = 30 + i * 106
        b += rect(x, 150 - h, 80, h, c)
        b += t(x + 40, 144 - h, str(n), 11, INK, "middle", "bold")
        b += t(x + 40, 166, name, 9, GREY, "middle")
    b += line(30, 150, 660, 150, LINE)
    b += t(40, 18, "carico articolare →", 9, GREY)
    b += t(660, 18, "solo su base di forza adeguata", 9, RED, "end")
    return svg(680, 176, b)


def olimpici():
    rows = [("Strappo / slancio completi", 100, BLUE), ("Power snatch / power clean", 85, BLUE),
            ("Hang (dal ginocchio o dall'anca)", 70, BLUE2), ("High pull", 60, BLUE2), ("Pull (snatch / clean pull)", 52, BLUE2),
            ("Push press / jerk", 46, PALE), ("Jump shrug", 32, PALE), ("Swing (manubrio o kettlebell)", 22, PALE)]
    b = t(600, 14, "complessità tecnica", 9, GREY, "end")
    for i, (n, v, c) in enumerate(rows):
        y = 24 + i * 22
        b += rect(20, y, v * 5.6, 16, c)
        b += t(28, y + 12, n, 9, "#fff" if c != PALE else INK, "start", "bold")
    b += arrow(560, 210, 90, 210, GREY)
    b += t(330, 226, "si scende finché velocità e posizioni restano pulite", 9, RED, "middle")
    return svg(680, 234, b)


def domande():
    b = rect(10, 30, 110, 56, INK) + t(65, 54, "ESERCIZIO", 9, "#fff", "middle", "bold") + t(65, 68, "da sostituire", 9, "#fff", "middle")
    b += arrow(122, 58, 150, 58)
    qs = ["1. Che pattern è?", "2. Zona della curva F-V?", "3. Che contrazione domina?", "4. Bilaterale o monolaterale?"]
    for i, q in enumerate(qs):
        x = 155 + i * 128
        c = BLUE if i < 2 else SKY
        b += rect(x, 30, 120, 56, c)
        words = q.split(" ", 2)
        b += t(x + 60, 54, " ".join(words[:2]), 9, "#fff", "middle", "bold")
        b += t(x + 60, 68, words[2] if len(words) > 2 else "", 9, "#fff", "middle", "bold")
    b += arrow(410, 90, 410, 112)
    b += rect(155, 116, 504, 40, GREEN) + t(407, 141, "L'alternativa deve conservare tutte e quattro le risposte", 10, "#fff", "middle", "bold")
    b += t(10, 130, "Stesso muscolo", 9, RED) + t(10, 143, "non significa", 9, RED) + t(10, 156, "stesso esercizio.", 9, RED)
    return svg(680, 166, b)


def phv():
    b = line(60, 15, 60, 180, GREY) + line(60, 180, 650, 180, GREY)
    for a in range(6, 19, 2):
        x = 60 + (a - 6) * 46
        b += line(x, 178, x, 184, GREY) + t(x, 198, str(a), 9, GREY, "middle")
    b += t(640, 214, "età (anni)", 9, GREY, "end")
    b += t(30, 100, "cm/anno", 9, GREY, "middle")
    b += f'<path d="M60,120 C150,135 230,140 290,128 C320,118 330,60 336,52 C344,60 360,130 420,165 L650,176" fill="none" stroke="{RED}" stroke-width="2.4"/>'
    b += f'<path d="M60,118 C200,140 300,145 370,132 C400,120 415,40 428,34 C440,42 460,130 520,168 L650,176" fill="none" stroke="{BLUE}" stroke-width="2.4"/>'
    b += t(336, 44, "PHV ~12 · ~8 cm/anno", 9, RED, "middle", "bold")
    b += t(452, 26, "PHV ~14 · ~10 cm/anno", 9, BLUE, "start", "bold")
    b += rect(300, 186 - 176, 0, 0, "none")
    b += t(80, 30, "ragazze", 9.5, RED, "start", "bold") + t(80, 44, "ragazzi", 9.5, BLUE, "start", "bold")
    b += f'<rect x="383" y="15" width="92" height="163" fill="{BLUE}" fill-opacity="0.07"/>'
    b += t(429, 172, "PHV −1/+1", 8, BLUE, "middle")
    return svg(680, 220, b)


def energia():
    cols = [("0-10 s", [80, 18, 2]), ("10-30 s", [50, 42, 8]), ("30 s-2 min", [15, 60, 25]),
            ("2-3 min", [6, 44, 50]), ("> 3 min", [3, 17, 80])]
    colors = [RED, AMBER, BLUE]
    b = ""
    for i, (n, v) in enumerate(cols):
        x, y = 50 + i * 120, 20
        for val, c in zip(v, colors):
            h = val * 1.4
            b += rect(x, y, 80, h, c)
            y += h
        b += t(x + 40, 178, n, 10, INK, "middle", "bold")
    leg = [("Fosfageni (ATP-PC)", RED), ("Glicolitico", AMBER), ("Ossidativo", BLUE)]
    for i, (n, c) in enumerate(leg):
        b += rect(50 + i * 200, 196, 12, 12, c) + t(68 + i * 200, 206, n, 9.5, INK)
    return svg(680, 214, b)


def rientro():
    ph = [("1", "PROTEZIONE", "dolore, edema, ROM"), ("2", "RESISTENZA", "3×15-25 · 30-45 s"),
          ("3", "FORZA", "3×8-10 → 3-5×3-6 · 2-3 min"), ("4", "POTENZA", "3-5×3-8 · 3 min · RFD"),
          ("5", "SPORT", "corsa, COD, gesto, gara")]
    b = ""
    for i, (n, name, d) in enumerate(ph):
        x = 10 + i * 133
        c = ["#2c3d73", "#344a96", "#3f59ae", "#4f68c0", GREEN][i]
        b += f'<polygon points="{x},20 {x+120},20 {x+132},48 {x+120},76 {x},76 {x+12},48" fill="{c}"/>'
        b += t(x + 66, 44, f"{n} · {name}", 9.5, "#fff", "middle", "bold")
        b += t(x + 66, 60, d, 7.6, "#dfe4f5", "middle")
    b += t(340, 102, "si passa alla fase successiva per CRITERI, non per calendario — dentro i tempi minimi del protocollo medico", 9.5, RED, "middle")
    return svg(680, 112, b)


def semaforo():
    rows = [(RED, "ROSSO · non modificabili", "infortunio precedente, crescita rapida", "monitorare"),
            (AMBER, "GIALLO · parzialmente modificabili", "specializzazione precoce, fatica", "gestire"),
            (GREEN, "VERDE · modificabili", "controllo neuromuscolare, volume", "intervenire")]
    b = ""
    for i, (c, a, d, act) in enumerate(rows):
        y = 10 + i * 46
        b += f'<circle cx="30" cy="{y+18}" r="15" fill="{c}"/>'
        b += t(58, y + 14, a, 10, INK, "start", "bold") + t(58, y + 30, d, 9.5, GREY)
        b += rect(520, y + 3, 140, 30, c) + t(590, y + 23, act.upper(), 9.5, "#fff", "middle", "bold")
    return svg(680, 150, b)


def processo():
    st = ["Needs analysis", "Obiettivi e priorità", "Macrociclo", "Mesocicli", "Microcicli", "Sedute"]
    b = ""
    for i, s in enumerate(st):
        x = 8 + i * 112
        b += rect(x, 20, 102, 48, [INK, "#2c3d73", "#344a96", "#3f59ae", "#4f68c0", SKY][i])
        b += t(x + 51, 40, str(i + 1), 10, "#fff", "middle", "bold") + t(x + 51, 56, s, 8.4, "#fff", "middle")
        if i < 5:
            b += t(x + 107, 49, "›", 14, GREY, "middle")
    b += f'<path d="M620,72 C600,110 80,110 60,72" fill="none" stroke="{GREEN}" stroke-width="1.6" stroke-dasharray="5 4"/>'
    b += t(340, 118, "monitoraggio e correzione: il piano è un'ipotesi con un meccanismo di correzione incorporato", 9.5, GREEN, "middle")
    return svg(680, 128, b)


def ltad():
    rows = [("Infanzia", "F 6-8 · M 6-9", "coordinazione, equilibrio, agilità; corpo libero e palla medica; pliometria come gioco", "#2c3d73"),
            ("Tarda infanzia (pre-PHV)", "F 9-11 · M 10-13", "+ pesi liberi con focus tecnico; meccanica di salto e atterraggio", "#344a96"),
            ("Adolescenza (mid-PHV)", "F 12-18 · M 14-18", "pesi liberi leggeri-moderati; cadute da altezze basse", "#3f59ae"),
            ("Post-PHV", "Tanner V", "ipertrofia, forza, potenza, lavoro specifico", "#4f68c0")]
    b = ""
    for i, (a, e, d, c) in enumerate(rows):
        y = 6 + i * 40
        b += rect(10, y, 190, 34, c) + t(18, y + 15, a, 9.5, "#fff", "start", "bold") + t(18, y + 28, e, 8.5, "#dfe4f5")
        b += t(212, y + 22, d, 9.2, INK)
    b += t(10, 182, "Si progredisce per COMPETENZA, non per età: chi inizia tardi parte comunque dall'inizio.", 9.5, RED)
    return svg(680, 190, b)


FIGS = {
    "residui": residui, "macro": macro, "onda": onda, "taper": taper, "settimana": settimana,
    "fv": fv, "plio": plio, "olimpici": olimpici, "domande": domande, "phv": phv,
    "energia": energia, "rientro": rientro, "semaforo": semaforo, "processo": processo, "ltad": ltad,
}
