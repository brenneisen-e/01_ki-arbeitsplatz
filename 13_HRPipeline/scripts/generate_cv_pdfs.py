#!/usr/bin/env python3
"""
Generate rxresu-inspired (Reactive Resume) style CV PDFs for the three
demo candidates in the HR Pipeline generic mode.

Output: 13_HRPipeline/public/cv/{laura,jonas,peter}-*-cv.pdf

Design language:
- Two-column layout (≈35% sidebar / 65% main)
- Sidebar with dark accent (slate-800) and white text
- Clean sans-serif typography (Helvetica)
- Section headers with a thin accent underline
- Generous whitespace, no borders, no visual clutter
"""

from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

# ---------- Design tokens (rxresu-inspired) ----------
SIDEBAR_BG = HexColor("#1E293B")      # slate-800
SIDEBAR_FG = HexColor("#F1F5F9")      # slate-100
SIDEBAR_MUTED = HexColor("#94A3B8")   # slate-400
SIDEBAR_ACCENT = HexColor("#38BDF8")  # sky-400
MAIN_FG = HexColor("#0F172A")         # slate-900
MAIN_MUTED = HexColor("#475569")      # slate-600
MAIN_RULE = HexColor("#CBD5E1")       # slate-300
MAIN_ACCENT = HexColor("#0369A1")     # sky-700

PAGE_W, PAGE_H = A4
MARGIN = 14 * mm
SIDEBAR_W = 68 * mm
MAIN_X = SIDEBAR_W + 10 * mm
MAIN_W = PAGE_W - MAIN_X - MARGIN


def draw_sidebar_bg(c: canvas.Canvas):
    c.setFillColor(SIDEBAR_BG)
    c.rect(0, 0, SIDEBAR_W, PAGE_H, stroke=0, fill=1)


def draw_page_frame(c: canvas.Canvas, page_num: int, candidate_name: str):
    draw_sidebar_bg(c)
    # Page footer (right side only)
    c.setFillColor(MAIN_MUTED)
    c.setFont("Helvetica", 7)
    c.drawRightString(PAGE_W - MARGIN, 10 * mm,
                      f"{candidate_name}  ·  Seite {page_num}")


# ---------- Text helpers ----------
def wrap_text(c: canvas.Canvas, text: str, font: str, size: float, max_w: float):
    """Simple word wrap returning a list of lines fitting max_w."""
    words = text.split()
    lines, current = [], ""
    for w in words:
        trial = (current + " " + w).strip()
        if c.stringWidth(trial, font, size) <= max_w:
            current = trial
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines


def draw_wrapped(c, text, x, y, font, size, max_w, leading, color):
    c.setFillColor(color)
    c.setFont(font, size)
    for line in wrap_text(c, text, font, size, max_w):
        c.drawString(x, y, line)
        y -= leading
    return y


# ---------- Sidebar drawing ----------
def draw_sidebar(c: canvas.Canvas, profile):
    x = MARGIN
    max_w = SIDEBAR_W - 2 * MARGIN
    y = PAGE_H - MARGIN - 6

    # Avatar (circle with initials)
    cx = SIDEBAR_W / 2
    avatar_r = 18 * mm
    avatar_cy = y - avatar_r
    c.setFillColor(SIDEBAR_ACCENT)
    c.circle(cx, avatar_cy, avatar_r, stroke=0, fill=1)
    c.setFillColor(SIDEBAR_BG)
    c.setFont("Helvetica-Bold", 22)
    init = profile["initials"]
    w = c.stringWidth(init, "Helvetica-Bold", 22)
    c.drawString(cx - w / 2, avatar_cy - 7, init)
    y = avatar_cy - avatar_r - 10 * mm

    def section(title):
        nonlocal y
        y -= 2
        c.setFillColor(SIDEBAR_ACCENT)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x, y, title.upper())
        y -= 3
        c.setStrokeColor(SIDEBAR_ACCENT)
        c.setLineWidth(0.6)
        c.line(x, y, x + max_w, y)
        y -= 5 * mm

    # KONTAKT
    section("Kontakt")
    c.setFillColor(SIDEBAR_FG)
    c.setFont("Helvetica", 8.5)
    for line in profile["contact"]:
        for l in wrap_text(c, line, "Helvetica", 8.5, max_w):
            c.drawString(x, y, l)
            y -= 4.2 * mm
    y -= 3 * mm

    # SKILLS
    section("Skills")
    c.setFillColor(SIDEBAR_FG)
    c.setFont("Helvetica", 8.5)
    for sk in profile["skills"]:
        # bullet with accent square
        c.setFillColor(SIDEBAR_ACCENT)
        c.rect(x, y + 1, 1.5, 1.5, stroke=0, fill=1)
        c.setFillColor(SIDEBAR_FG)
        for l in wrap_text(c, sk, "Helvetica", 8.5, max_w - 5 * mm):
            c.drawString(x + 5 * mm, y, l)
            y -= 4.2 * mm
    y -= 3 * mm

    # LANGUAGES
    section("Sprachen")
    c.setFillColor(SIDEBAR_FG)
    for lang, level in profile["languages"]:
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(x, y, lang)
        c.setFont("Helvetica", 8.2)
        c.setFillColor(SIDEBAR_MUTED)
        c.drawString(x, y - 3.5 * mm, level)
        c.setFillColor(SIDEBAR_FG)
        y -= 8 * mm

    # CERTIFICATES (optional)
    if profile.get("certifications"):
        section("Zertifikate")
        c.setFillColor(SIDEBAR_FG)
        c.setFont("Helvetica", 8.2)
        for cert in profile["certifications"]:
            for l in wrap_text(c, f"• {cert}", "Helvetica", 8.2, max_w):
                c.drawString(x, y, l)
                y -= 4.2 * mm
            y -= 1 * mm

    # INTERESTS (optional)
    if profile.get("interests"):
        y -= 2 * mm
        section("Interessen")
        c.setFillColor(SIDEBAR_FG)
        c.setFont("Helvetica", 8.2)
        for it in profile["interests"]:
            for l in wrap_text(c, f"• {it}", "Helvetica", 8.2, max_w):
                c.drawString(x, y, l)
                y -= 4.2 * mm


# ---------- Main area drawing ----------
def draw_main(c: canvas.Canvas, profile):
    x = MAIN_X
    max_w = MAIN_W
    y = PAGE_H - MARGIN - 2

    # Name
    c.setFillColor(MAIN_FG)
    c.setFont("Helvetica-Bold", 26)
    c.drawString(x, y - 7 * mm, profile["name"])
    y -= 13 * mm
    # Headline
    c.setFillColor(MAIN_ACCENT)
    c.setFont("Helvetica", 12)
    c.drawString(x, y, profile["headline"])
    y -= 6 * mm
    # Meta row (city · age · experience)
    c.setFillColor(MAIN_MUTED)
    c.setFont("Helvetica", 9)
    c.drawString(x, y, profile["meta"])
    y -= 8 * mm

    def section(title):
        nonlocal y
        y -= 2
        c.setFillColor(MAIN_ACCENT)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(x, y, title.upper())
        y -= 2 * mm
        c.setStrokeColor(MAIN_RULE)
        c.setLineWidth(0.5)
        c.line(x, y, x + max_w, y)
        y -= 5 * mm

    # SUMMARY
    section("Profil")
    y = draw_wrapped(c, profile["summary"], x, y,
                     "Helvetica", 9.5, max_w, 4.6 * mm, MAIN_FG)
    y -= 4 * mm

    # EXPERIENCE
    section("Berufserfahrung")
    for exp in profile["experience"]:
        # Title + Dates row
        c.setFillColor(MAIN_FG)
        c.setFont("Helvetica-Bold", 10.5)
        c.drawString(x, y, exp["role"])
        c.setFillColor(MAIN_MUTED)
        c.setFont("Helvetica", 9)
        c.drawRightString(x + max_w, y, exp["dates"])
        y -= 4.5 * mm
        # Company + location
        c.setFillColor(MAIN_ACCENT)
        c.setFont("Helvetica-Oblique", 9.5)
        c.drawString(x, y, exp["company"])
        y -= 5 * mm
        # Bullets
        for b in exp["bullets"]:
            # bullet dot
            c.setFillColor(MAIN_ACCENT)
            c.circle(x + 1.2, y + 1.4, 0.9, stroke=0, fill=1)
            c.setFillColor(MAIN_FG)
            lines = wrap_text(c, b, "Helvetica", 9, max_w - 5 * mm)
            c.setFont("Helvetica", 9)
            for i, l in enumerate(lines):
                c.drawString(x + 4 * mm, y, l)
                y -= 4.2 * mm
        y -= 3 * mm

    # EDUCATION
    section("Ausbildung")
    for ed in profile["education"]:
        c.setFillColor(MAIN_FG)
        c.setFont("Helvetica-Bold", 10.5)
        c.drawString(x, y, ed["degree"])
        c.setFillColor(MAIN_MUTED)
        c.setFont("Helvetica", 9)
        c.drawRightString(x + max_w, y, ed["dates"])
        y -= 4.5 * mm
        c.setFillColor(MAIN_ACCENT)
        c.setFont("Helvetica-Oblique", 9.5)
        c.drawString(x, y, ed["institution"])
        y -= 4.5 * mm
        if ed.get("detail"):
            c.setFillColor(MAIN_FG)
            c.setFont("Helvetica", 9)
            y = draw_wrapped(c, ed["detail"], x, y,
                             "Helvetica", 9, max_w, 4.2 * mm, MAIN_FG)
        y -= 3 * mm

    # PROJECTS / EXTRAS
    if profile.get("projects"):
        section("Projekte & Engagement")
        for pj in profile["projects"]:
            c.setFillColor(MAIN_FG)
            c.setFont("Helvetica-Bold", 10)
            c.drawString(x, y, pj["title"])
            y -= 4.2 * mm
            y = draw_wrapped(c, pj["detail"], x, y,
                             "Helvetica", 9, max_w, 4.2 * mm, MAIN_FG)
            y -= 2.5 * mm


# ---------- Compose ----------
def build_pdf(profile, out_path: Path):
    c = canvas.Canvas(str(out_path), pagesize=A4)
    c.setTitle(f"Lebenslauf — {profile['name']}")
    c.setAuthor(profile["name"])
    c.setSubject("Curriculum Vitae")
    draw_page_frame(c, 1, profile["name"])
    draw_sidebar(c, profile)
    draw_main(c, profile)
    c.showPage()
    c.save()


# ---------- Candidate data ----------
LAURA = {
    "name": "Laura Schneider",
    "initials": "LS",
    "headline": "Senior HR Business Partner",
    "meta": "Berlin  ·  34 Jahre  ·  8 Jahre Berufserfahrung",
    "contact": [
        "laura.schneider@mail.de",
        "+49 151 23 45 67 89",
        "Prenzlauer Berg, 10405 Berlin",
        "linkedin.com/in/laura-schneider",
    ],
    "skills": [
        "HR Business Partnering",
        "Change Management & Reorganisation",
        "Arbeitsrecht & Betriebsratsarbeit",
        "Talent Management",
        "Systemisches Coaching",
        "People Analytics (Workday, Personio)",
        "Stakeholder-Management",
    ],
    "languages": [
        ("Deutsch", "Muttersprache"),
        ("Englisch", "Verhandlungssicher (C1)"),
        ("Französisch", "Grundkenntnisse (A2)"),
    ],
    "certifications": [
        "SHRM-CP (2022)",
        "Systemischer Business-Coach (IHK)",
        "Agile Coach (ICAgile)",
    ],
    "interests": [
        "People Analytics & AI in HR",
        "Speakerin HR Tech Conference",
        "Ehrenamt: Mentoring Women in Tech",
    ],
    "summary": (
        "Erfahrene HR-Business-Partnerin mit 8 Jahren Track-Record in Tech-Scale-ups "
        "und Top-Managementberatung. Schwerpunkte: Change Management, Führungs­kräfte­beratung "
        "und der Aufbau skalierbarer HR-Strukturen. Akademischer Hintergrund in Arbeits- und "
        "Organisationspsychologie, kombiniert mit Systemischem Coaching. Begleitet Senior Leader "
        "bei komplexen Transformationen und Reorganisationen."
    ),
    "experience": [
        {
            "role": "Senior HR Business Partner",
            "company": "FinTechNova GmbH  ·  Tech Scale-up  ·  Berlin",
            "dates": "03/2021 – heute",
            "bullets": [
                "HR-Partner für drei Business Units (Engineering, Product, GTM) mit ~120 Führungskräften und 520 Mitarbeitenden.",
                "Lead-HR-BP bei drei Reorganisationen (inkl. Post-Merger-Integration), Verhandlung mit Betriebsrat und Umsetzung der neuen Zielstruktur.",
                "Aufbau eines Performance- und Compensation-Frameworks; Einführung strukturierter Salary Rounds und Karrierepfade.",
                "Coaching von 30+ Senior Leadern zu Führung, Konflikt und Change-Kommunikation.",
            ],
        },
        {
            "role": "HR Consultant",
            "company": "KPMG People & Change  ·  Frankfurt / Berlin",
            "dates": "01/2018 – 02/2021",
            "bullets": [
                "Beratungs- und Transformationsprojekte bei DAX- und Mittelstandskunden (HR Target Operating Model, HR-IT-Einführung, Organisationsdesign).",
                "Projektleitung Workday-Rollout bei einem Industriekunden (~4.500 Mitarbeitende, 8-köpfiges Projektteam).",
                "Co-Autorin Benchmark-Studie „HR of the Future“ (2020).",
            ],
        },
        {
            "role": "HR Junior Consultant",
            "company": "Mercer Deutschland  ·  Frankfurt",
            "dates": "08/2016 – 12/2017",
            "bullets": [
                "Unterstützung bei Vergütungs- und Performance-Management-Projekten für internationale Konzerne.",
                "Datenanalyse, Benchmark-Reports und Stakeholder-Präsentationen.",
            ],
        },
    ],
    "education": [
        {
            "degree": "M.Sc. Arbeits- und Organisationspsychologie",
            "institution": "Humboldt-Universität zu Berlin",
            "dates": "2014 – 2016",
            "detail": "Abschluss 1,4  ·  Schwerpunkt: Führung, Change & Diagnostik  ·  Masterarbeit zu psychologischer Sicherheit in agilen Teams.",
        },
        {
            "degree": "B.Sc. Psychologie",
            "institution": "Universität Heidelberg",
            "dates": "2010 – 2014",
            "detail": "Abschluss 1,7  ·  Auslandssemester: University of Edinburgh (2013).",
        },
    ],
    "projects": [
        {
            "title": "Speakerin — HR Tech Conference 2024 & 2025",
            "detail": "Vorträge „AI in HR – zwischen Hype und echter Wertschöpfung“ und „People Analytics für HR-BPs“.",
        },
        {
            "title": "Ehrenamt — Mentoring @ Women in Tech Berlin",
            "detail": "Mentorin für Career Switcher im Tech-/HR-Umfeld seit 2022.",
        },
    ],
}

JONAS = {
    "name": "Jonas Weber",
    "initials": "JW",
    "headline": "Business Analyst  ·  angehender Data Analyst",
    "meta": "Köln  ·  28 Jahre  ·  4 Jahre Berufserfahrung",
    "contact": [
        "jonas.weber@mail.de",
        "+49 176 55 44 33 22",
        "Ehrenfeld, 50825 Köln",
        "linkedin.com/in/jonas-weber-ba",
        "github.com/jweber-data",
    ],
    "skills": [
        "SQL (PostgreSQL, Snowflake)",
        "Power BI & DAX",
        "Excel (Advanced, VBA)",
        "Python (Grundlagen, pandas)",
        "Prozess- und Anforderungsanalyse",
        "Stakeholder-Kommunikation",
        "Agiles Arbeiten (Scrum)",
    ],
    "languages": [
        ("Deutsch", "Muttersprache"),
        ("Englisch", "Fließend (C1)"),
        ("Spanisch", "Grundkenntnisse (A2)"),
    ],
    "certifications": [
        "Microsoft PL-300 Power BI (2024)",
        "Datacamp Data Scientist Track (70 %)",
        "Scrum Fundamentals (2022)",
    ],
    "interests": [
        "Kaggle-Competitions (Top 25 %)",
        "Data-Viz Meetup Köln (Orga)",
        "Laufen & Radsport",
    ],
    "summary": (
        "Analytisch geprägter Business Analyst mit 4 Jahren Beratungserfahrung und klarem "
        "Fokus auf Data Analytics. Power-BI-zertifiziert (PL-300) und berufsbegleitend im "
        "Master Data Science. Starke Kombination aus strukturierter Beratungsmethodik, "
        "solider SQL-/BI-Basis und hoher Lernkurve in Python. Sucht den Einstieg in eine "
        "Linien-Data-Analyst-Rolle mit Wachstumsperspektive."
    ),
    "experience": [
        {
            "role": "Business Analyst",
            "company": "NorthStar Consulting GmbH  ·  Köln",
            "dates": "10/2021 – heute",
            "bullets": [
                "Datengetriebene Beratungsprojekte für Finance-, Retail- und Industrie­kunden: Prozessanalyse, Reporting und BI-Dashboards.",
                "Konzeption und Umsetzung von Power-BI-Reportings (10+ produktive Dashboards) mit Fokus auf Vertriebs- und Finanz-KPIs.",
                "SQL-basierte Datenmodelle in Snowflake; Migration von Legacy-Excel-Reports auf zentrale Data Marts.",
                "Lead-Analyst im Projekt „Sales Performance Cockpit“ für einen Konsumgüterhersteller (€1,8 Mio Projektvolumen).",
            ],
        },
        {
            "role": "Werkstudent Data Analytics",
            "company": "REWE Digital  ·  Köln",
            "dates": "04/2020 – 09/2021",
            "bullets": [
                "Mitarbeit im E-Commerce-Analytics-Team: Tracking-Implementation, Ad-hoc-Analysen, A/B-Test-Auswertung.",
                "Aufbau eines wöchentlichen KPI-Reports für das Produkt­management.",
            ],
        },
        {
            "role": "Praktikum Controlling",
            "company": "Bayer AG  ·  Leverkusen",
            "dates": "08/2019 – 01/2020",
            "bullets": [
                "Unterstützung im Financial-Planning-Team bei Forecast- und Abweichungs­analysen.",
            ],
        },
    ],
    "education": [
        {
            "degree": "M.Sc. Data Science (berufsbegleitend)",
            "institution": "IU Internationale Hochschule",
            "dates": "2023 – voraussichtlich 2026",
            "detail": "Schwerpunkt: Machine Learning, Statistik, Data Engineering  ·  Aktueller Notenschnitt 1,8.",
        },
        {
            "degree": "B.Sc. Wirtschaftsinformatik",
            "institution": "Technische Hochschule Köln",
            "dates": "2016 – 2019",
            "detail": "Abschluss 2,0  ·  Bachelorarbeit: „Data-Warehouse-Architekturen im Retail-Umfeld“.",
        },
    ],
    "projects": [
        {
            "title": "Kaggle — House-Prices & Titanic Baselines",
            "detail": "Eigenständig erarbeitete End-to-End-Pipelines mit pandas, scikit-learn und XGBoost. Platzierung Top 25 %.",
        },
        {
            "title": "Meetup-Co-Organisator „Data Viz Cologne“",
            "detail": "Planung und Moderation quartalsweiser Events (40–80 Teilnehmende) zu Dashboarding und Storytelling.",
        },
    ],
}

PETER = {
    "name": "Peter Schmitt",
    "initials": "PS",
    "headline": "Produktionsmitarbeiter  ·  angelernte Fachkraft",
    "meta": "Flensburg  ·  54 Jahre  ·  22 Jahre Berufserfahrung",
    "contact": [
        "p.schmitt54@mail.de",
        "+49 461 22 11 33",
        "Mürwik, 24944 Flensburg",
    ],
    "skills": [
        "Fertigungs- und Montageprozesse",
        "Maschinenbedienung",
        "Qualitätskontrolle (Sichtprüfung)",
        "Staplerschein (Klasse B)",
        "Zuverlässigkeit & Sorgfalt",
        "Teamarbeit",
    ],
    "languages": [
        ("Deutsch", "Muttersprache"),
    ],
    "certifications": [
        "Gabelstapler-Fahrerausweis (2005)",
        "Unterweisung Arbeitssicherheit (jährlich)",
    ],
    "interests": [
        "Schrebergarten & Heimwerken",
        "Vereinsmitglied TSB Flensburg",
    ],
    "summary": (
        "Zuverlässiger und erfahrener Produktionsmitarbeiter mit 22 Jahren Werks­erfahrung "
        "in der Metallverarbeitung. Langjähriges Team­mitglied, gewohnt an Schicht­arbeit, "
        "Qualitätskontrolle und das strukturierte Abarbeiten klar definierter Aufgaben. "
        "Aktuell auf der Suche nach einer neuen Anstellung nach Werksschließung."
    ),
    "experience": [
        {
            "role": "Produktionsmitarbeiter (angelernte Fachkraft)",
            "company": "Nordmetall GmbH  ·  Metallverarbeitung  ·  Flensburg",
            "dates": "06/2001 – 10/2023",
            "bullets": [
                "22 Jahre durchgehende Tätigkeit in der Serienfertigung (Dreh- und Frästeile).",
                "Bedienung von CNC-gestützten Maschinen nach Einweisung, Wechsel von Werkzeugen und Rohteilen.",
                "Sichtprüfung und Maßkontrolle fertiger Teile, Dokumentation auf Prüfprotokollen.",
                "Schichtarbeit im 3-Schicht-Modell, zuletzt als verlässlicher Springer in mehreren Werkhallen eingesetzt.",
                "Stelle im Rahmen einer Werksschließung im Oktober 2023 abgebaut.",
            ],
        },
        {
            "role": "Lagerhelfer",
            "company": "Nordfracht Spedition  ·  Flensburg",
            "dates": "01/1999 – 05/2001",
            "bullets": [
                "Wareneingang und Kommissionierung, Bedienung eines Gabelstaplers.",
            ],
        },
    ],
    "education": [
        {
            "degree": "Hauptschulabschluss",
            "institution": "Hauptschule Flensburg-Mürwik",
            "dates": "1982 – 1987",
            "detail": None,
        },
        {
            "degree": "Angelernte Fachkraft Metallverarbeitung",
            "institution": "betriebsinterne Einarbeitung  ·  Nordmetall GmbH",
            "dates": "2001 – 2002",
            "detail": "Sechsmonatige betriebliche Einarbeitung an CNC-gestützten Fertigungsanlagen.",
        },
    ],
    "projects": None,
}


def main():
    out_dir = Path(__file__).resolve().parents[1] / "public" / "cv"
    out_dir.mkdir(parents=True, exist_ok=True)
    targets = [
        (LAURA, out_dir / "laura-schneider-cv.pdf"),
        (JONAS, out_dir / "jonas-weber-cv.pdf"),
        (PETER, out_dir / "peter-schmitt-cv.pdf"),
    ]
    for profile, path in targets:
        build_pdf(profile, path)
        print(f"Wrote {path.relative_to(Path.cwd()) if str(Path.cwd()) in str(path) else path}")


if __name__ == "__main__":
    main()
