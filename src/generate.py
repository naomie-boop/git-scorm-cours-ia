import os, zipfile, shutil, hashlib, random
from gen_part1 import ENJEUX
from gen_part2 import ENJEUX2
ALL = ENJEUX + ENJEUX2
BASE = os.path.dirname(os.path.abspath(__file__))
CSS = open(os.path.join(BASE, "css", "style.css")).read()
SCORM_JS = open(os.path.join(BASE, "js", "scorm.js")).read()
APP_JS = open(os.path.join(BASE, "js", "app.js")).read()

def uid(s):
    return hashlib.md5(s.encode()).hexdigest()[:12]

def manifest(eid, title):
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{eid}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                       http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="org-{eid}">
    <organization identifier="org-{eid}">
      <title>{title}</title>
      <item identifier="item-1" identifierref="res-1"><title>{title}</title></item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res-1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/><file href="css/style.css"/><file href="js/scorm.js"/><file href="js/app.js"/>
    </resource>
  </resources>
</manifest>"""

def hero(step, total, title, subtitle, c1, c2):
    return f"""
  <div class="step-hero" >
    <div class="step-number">\u00c9tape {step} sur {total}</div>
    <h2>{title}</h2>
    <p class="hero-subtitle">{subtitle}</p>
  </div>"""

def counters(items):
    h = '  <div class="counter-row animate-in">\n'
    for val, suf, label in items:
        h += f'    <div class="counter-box"><span class="counter-num" data-target="{val}" data-suffix="{suf}">{val}{suf}</span><span class="counter-label">{label}</span></div>\n'
    return h + '  </div>\n'

def accordion(items):
    h = '  <div class="accordion">\n'
    for t, d in items:
        h += f"""    <div class="accordion-item">
      <div class="accordion-header" role="button" tabindex="0"><span>{t}</span><span class="icon">+</span></div>
      <div class="accordion-body"><div class="accordion-body-inner"><p>{d}</p></div></div>
    </div>\n"""
    return h + '  </div>\n'

def flipcards(items, c1):
    colors = [c1, "#6366f1", "#38bdf8", "#7B7BFF", "#3B3BFF", "#0006A8", "#4f46e5", "#059669"]
    h = '  <div class="flip-cards-grid animate-in">\n'
    for i, (t, d) in enumerate(items):
        c = colors[i % len(colors)]
        h += f"""    <div class="flip-card" role="button" tabindex="0">
      <div class="flip-card-inner">
        <div class="flip-card-front" ><h4>{t}</h4><div class="flip-hint">Cliquez pour retourner</div></div>
        <div class="flip-card-back"><h4>{t}</h4><p>{d}</p></div>
      </div>
    </div>\n"""
    return h + '  </div>\n'

def matching(pairs):
    h = '  <div class="matching-container animate-in">\n'
    h += '    <h4>Reliez chaque risque \u00e0 la mesure correspondante</h4>\n'
    h += '    <p style="font-size:.85rem;color:var(--text-muted)">Cliquez sur un \u00e9l\u00e9ment \u00e0 gauche, puis sur sa correspondance \u00e0 droite.</p>\n'
    h += '    <div class="matching-grid">\n      <div class="match-col match-left">\n'
    for i, (l, r) in enumerate(pairs):
        h += f'        <div class="match-item" role="button" tabindex="0" data-match="{i}">{l}</div>\n'
    h += '      </div>\n      <div class="match-lines">\n'
    for _ in pairs:
        h += '        <div class="match-line"></div>\n'
    shuffled = list(enumerate(pairs))
    random.seed(42)
    random.shuffle(shuffled)
    h += '      </div>\n      <div class="match-col match-right">\n'
    for i, (l, r) in shuffled:
        h += f'        <div class="match-item" role="button" tabindex="0" data-match="{i}">{r}</div>\n'
    h += '      </div>\n    </div>\n    <div class="dnd-feedback"></div>\n  </div>\n'
    return h

def dnd(risques, mesures):
    h = '  <div class="dnd-container animate-in">\n'
    h += '    <h4>Classez les \u00e9l\u00e9ments dans la bonne cat\u00e9gorie</h4>\n'
    h += '    <p style="font-size:.85rem;color:var(--text-muted)">Glissez chaque \u00e9l\u00e9ment dans la zone Risques ou Mesures.</p>\n'
    h += '    <div class="dnd-sources">\n'
    items = [(t, "risque") for t, _ in risques[:3]] + [(t, "mesure") for t, _ in mesures[:3]]
    random.seed(7)
    random.shuffle(items)
    for t, zone in items:
        did = uid(t)
        h += f'      <div class="dnd-item" draggable="true" role="button" tabindex="0" data-id="{did}" data-zone="{zone}">{t}</div>\n'
    h += '    </div>\n    <div class="dnd-targets">\n'
    h += '      <div class="dnd-zone" data-zone="risque"><h4>&#9888; Risques</h4></div>\n'
    h += '      <div class="dnd-zone" data-zone="mesure"><h4>&#10003; Mesures</h4></div>\n'
    h += '    </div>\n    <button class="quiz-validate-btn dnd-check-btn">V\u00e9rifier</button>\n'
    h += '    <div class="dnd-feedback"></div>\n  </div>\n'
    return h

def scenario_html(nodes):
    h = '  <div class="scenario-container animate-in">\n'
    for i, node in enumerate(nodes):
        disp = "block" if i == 0 else "none"
        h += f'    <div class="scenario-node" style="display:{disp}">\n      <div class="scenario-card">\n'
        h += f'        <div class="scenario-context">{node["context"]}</div>\n'
        h += f'        <h4>{node["question"]}</h4>\n        <div class="scenario-choices">\n'
        next_idx = i + 1 if i + 1 < len(nodes) else ""
        for label, pts, fb in node["choices"]:
            fb_safe = fb.replace('"', '&quot;')
            h += f'          <div class="scenario-choice" role="button" tabindex="0" data-points="{pts}" data-feedback="{fb_safe}" data-next="{next_idx}">{label}</div>\n'
        h += '        </div>\n        <div class="scenario-result" style="display:none"></div>\n      </div>\n    </div>\n'
    h += '  </div>\n'
    return h

def quiz_html(questions):
    letters = "ABCDEFGH"
    h = '  <div class="quiz-container">' + chr(10)
    h += '    <div class="quiz-score-bar animate-in"><span class="score-label">Score</span><div class="score-track"><div class="score-fill" style="width:0%"></div></div><span class="score-value" id="quizScoreVal">0%</span></div>' + chr(10)
    for i, q in enumerate(questions):
        h += '    <div class="quiz-question animate-in">' + chr(10)
        h += '      <div class="quiz-timer"><span>&#9201;</span><div class="quiz-timer-bar"><div class="quiz-timer-fill"></div></div></div>' + chr(10)
        h += '      <div class="question-number">Question ' + str(i+1) + ' / ' + str(len(questions)) + '</div>' + chr(10)
        h += '      <h4>' + q["q"] + '</h4>' + chr(10) + '      <div class="quiz-options">' + chr(10)
        for j, opt in enumerate(q["opts"]):
            c = "true" if j == q["correct"] else "false"
            h += '        <div class="quiz-option" role="button" tabindex="0" data-correct="' + c + '"><span class="option-letter">' + letters[j] + '</span><span>' + opt + '</span></div>' + chr(10)
        h += '      </div>' + chr(10)
        h += '      <button class="quiz-validate-btn" disabled>Valider</button>' + chr(10)
        eok = q["expl_ok"].replace('"', '&quot;')
        eko = q["expl_ko"].replace('"', '&quot;')
        h += '      <div class="quiz-feedback" data-correct-text="' + eok + '" data-incorrect-text="' + eko + '"></div>' + chr(10)
        h += '    </div>' + chr(10)
    h += '    <div class="quiz-retry-msg" style="display:none"><p>Score insuffisant.</p><button class="quiz-retry-btn quiz-validate-btn">Revoir les risques</button></div>' + chr(10)
    h += '  </div>' + chr(10)
    return h

def focus_html(title, items):
    NL = chr(10)
    h = '  <div class="highlight-box animate-in">' + NL + '    <strong>' + title + '</strong>' + NL + '    <ul class="numbered-list">' + NL
    for t, d in items:
        h += '      <li><span><strong>' + t + '</strong> \u2014 ' + d + '</span></li>' + NL
    h += '    </ul>' + NL + '  </div>' + NL
    return h

def vrai_faux_html(items):
    if not items: return ""
    h = '  <div class="vf-container animate-in">' + chr(10) + '    <h4>Vrai ou Faux ?</h4>' + chr(10)
    for stmt, correct, feedback in items:
        fb_safe = feedback.replace('"', '&quot;')
        h += '    <div class="vf-item" data-correct="' + correct + '">' + chr(10)
        h += '      <span>' + stmt + '</span>' + chr(10)
        h += '      <div class="vf-btns">' + chr(10)
        h += '        <button class="vf-btn" role="button" tabindex="0" data-answer="vrai">Vrai</button>' + chr(10)
        h += '        <button class="vf-btn" role="button" tabindex="0" data-answer="faux">Faux</button>' + chr(10)
        h += '      </div>' + chr(10)
        h += '      <div class="vf-feedback">' + feedback + '</div>' + chr(10)
        h += '    </div>' + chr(10)
    h += '  </div>' + chr(10)
    return h

def reveal_html(items):
    if not items: return ""
    h = '  <div class="animate-in"><h4>Le saviez-vous ? Cliquez pour decouvrir</h4></div>' + chr(10)
    h += '  <div class="reveal-grid animate-in">' + chr(10)
    for title, content in items:
        content_safe = content.replace('"', '&quot;')
        h += '    <div class="reveal-card" role="button" tabindex="0" data-content="' + content_safe + '">' + title + '<span class="reveal-label">Cliquez</span></div>' + chr(10)
    h += '  </div>' + chr(10)
    return h

def blanks_html(data):
    if not data: return ""
    h = '  <div class="blanks-container animate-in">' + chr(10)
    h += '    <h4>Completez la phrase</h4>' + chr(10)
    sentence = data["sentence"]
    for answer, _ in data["blanks"]:
        sentence = sentence.replace("_____", '<span class="blank-slot" role="button" tabindex="0" data-answer="' + answer + '">?</span>', 1)
    h += '    <div class="blanks-sentence">' + sentence + '</div>' + chr(10)
    h += '    <div class="blank-options">' + chr(10)
    import random
    opts = list(data["options"])
    random.seed(99)
    random.shuffle(opts)
    for opt in opts:
        h += '      <span class="blank-option" role="button" tabindex="0" data-value="' + opt + '">' + opt + '</span>' + chr(10)
    h += '    </div>' + chr(10)
    h += '  </div>' + chr(10)
    return h

def debate_html(data):
    if not data: return ""
    h = '  <div class="debate-container animate-in">' + chr(10)
    h += '    <div class="debate-question">' + data["question"] + '</div>' + chr(10)
    h += '    <div class="debate-sides">' + chr(10)
    h += '      <div class="debate-side" role="button" tabindex="0"><h4>' + data["side_a"][0] + '</h4><p>' + data["side_a"][1] + '</p></div>' + chr(10)
    h += '      <div class="debate-side" role="button" tabindex="0"><h4>' + data["side_b"][0] + '</h4><p>' + data["side_b"][1] + '</p></div>' + chr(10)
    h += '    </div>' + chr(10)
    h += '    <div class="debate-reveal"><h4>Synthese</h4><p>' + data["synthesis"] + '</p></div>' + chr(10)
    h += '  </div>' + chr(10)
    return h

def checklist_html(items):
    if not items: return ""
    h = '  <div class="checklist-container animate-in">' + chr(10)
    h += '    <h4>Vos engagements</h4><p style="font-size:.85rem;color:var(--text-muted)">Cochez les bonnes pratiques que vous vous engagez a appliquer.</p>' + chr(10)
    for item in items:
        h += '    <div class="checklist-item" role="button" tabindex="0"><span class="checklist-check">&#10003;</span><span>' + item + '</span></div>' + chr(10)
    h += '    <div class="checklist-progress">0/' + str(len(items)) + ' engagements pris</div>' + chr(10)
    h += '  </div>' + chr(10)
    return h


def build(e):
    T = 8
    title = e["title"]
    nav_labels = ["Accroche","Decouverte","Risques","Mesures","Scenario","Quiz","Synthese","Conclusion"]
    sidebar_items = ""
    for i, l in enumerate(nav_labels):
        a = " active" if i == 0 else ""
        sidebar_items += '      <div class="nav-item' + a + '"><span class="nav-number">' + str(i+1) + '</span><span class="nav-label">' + l + '</span></div>' + chr(10)
    risques_li = "".join("<li>" + t + "</li>" for t,_ in e["risques"])
    mesures_li = "".join("<li>" + t + "</li>" for t,_ in e["mesures"])
    icon = e["icon"]
    c1 = e["color1"]
    c2 = e["color2"]
    defn = e["definition"]
    hook = e["hook"]
    disc = e["discovery_text"]
    qr = e["question_risque"]

    parts = []
    parts.append("""<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Enjeu : """ + title + """</title>
<link rel="stylesheet" href="css/style.css">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Inter+Tight:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head><body>
<div class="cover-page" id="coverPage">
  <div class="cover-grid" id="coverGrid"></div>
  <div class="cover-content">
    <div class="cover-subtitle">Les enjeux de l'IA a 360</div>
    <h1>""" + icon + " " + title + """</h1>
    <p>""" + defn + """</p>
    <button class="cover-start-btn" id="coverStartBtn">Commencer le module &#8594;</button>
  </div>
</div>
<button class="mobile-toggle" id="mobileToggle" aria-label="Menu">&#9776;</button>
<div class="course-layout">
<aside class="sidebar" role="navigation">
  <div class="sidebar-header"><h1>""" + icon + " " + title + """</h1><div class="subtitle">Les enjeux de l’IA a 360</div></div>
  <div class="sidebar-progress"><div class="progress-bar-bg"><div class="progress-bar-fill"></div></div><div class="progress-text">0% termine</div></div>
  <div class="sidebar-score">Score : <span id="sidebarScore">—</span></div>
  <nav class="sidebar-nav">
""" + sidebar_items + """  </nav>
</aside>
<main class="main-content">""")

    # S1 ACCROCHE
    parts.append("""<div class="step-container active" id="step-0">""")
    parts.append(hero(1,T,icon+" "+title,defn,c1,c2))
    parts.append("""<div class="content-section">
  <div class="animate-in"><div class="highlight-box warning"><strong>""" + hook + """</strong></div></div>
""" + counters(e["counters"]) + """
  <div class="animate-in"><div class="highlight-box"><strong>Dans ce module, vous allez :</strong><ul>
    <li>Comprendre cet enjeu en profondeur avec des cas reels</li>
    <li>Identifier les risques avec des activites interactives</li>
    <li>Associer les bonnes mesures aux bons risques</li>
    <li>Vivre un scenario professionnel realiste</li>
    <li>Tester vos connaissances avec un quiz chronometre</li>
    <li>Obtenir votre synthese personnalisee</li>
  </ul></div></div>
""" + vrai_faux_html(e.get("vrai_faux", [])) + """
</div></div>""")

    # S2 DECOUVERTE (with tabs)
    parts.append("""<div class="step-container" id="step-1">""")
    parts.append(hero(2,T,"Decouverte : "+title,"Explorez les 4 dimensions de cet enjeu.",c1,c2))
    ai_mech = e.get("ai_mechanism", "")
    ai_use = e.get("ai_usages", "")
    focus_content = focus_html(e["focus_title"],e["focus_items"])
    reveal_content = reveal_html(e.get("reveal_facts", []))
    parts.append("""<div class="content-section">
  <div class="tabs-container animate-in">
    <div class="tabs-header">
      <button class="tab-btn active" role="tab" tabindex="0" data-tab="tab-mechanism">Comment ca marche</button>
      <button class="tab-btn" role="tab" tabindex="0" data-tab="tab-context">Definition et contexte</button>
      <button class="tab-btn" role="tab" tabindex="0" data-tab="tab-usages">Usages IA</button>
      <button class="tab-btn" role="tab" tabindex="0" data-tab="tab-principles">Principes cles</button>
    </div>
    <div class="tab-panel active" data-tab="tab-mechanism">
      """ + ai_mech + """
    </div>
    <div class="tab-panel" data-tab="tab-context">
      <h3>Definition et contexte</h3>""" + disc + """
    </div>
    <div class="tab-panel" data-tab="tab-usages">
      """ + ai_use + """
    </div>
    <div class="tab-panel" data-tab="tab-principles">
      """ + focus_content + """
    </div>
  </div>
  <div class="divider"></div>
  <div class="animate-in slider-container"><h4>Auto-evaluation : votre niveau sur cet enjeu ?</h4>
    <input type="range" min="1" max="5" value="3">
    <div class="slider-labels"><span>1 Debutant</span><span>5 Expert</span></div>
    <div class="slider-value">3/5 Intermediaire</div>
  </div>
""" + reveal_content + """
</div></div>""")

    # S3 RISQUES
    parts.append("""<div class="step-container" id="step-2">""")
    parts.append(hero(3,T,"Les risques identifies",qr,c1,c2))
    parts.append("""<div class="content-section">
  <div class="animate-in"><h3>Explorez chaque risque</h3><p>Cliquez sur chaque risque pour decouvrir l explication complete.</p>
""" + accordion(e["risques"]) + """</div>
  <div class="divider"></div>
""" + dnd(e["risques"],e["mesures"]) + """
</div></div>""")

    # S4 MESURES
    parts.append("""<div class="step-container" id="step-3">""")
    parts.append(hero(4,T,"Les mesures a appliquer","Associez chaque mesure au bon risque.",c1,c2))
    parts.append("""<div class="content-section">
  <div class="animate-in"><h3>Decouvrez les mesures</h3><p>Retournez chaque carte pour comprendre comment les mettre en oeuvre.</p>
""" + flipcards(e["mesures"],c1) + """</div>
  <div class="divider"></div>
""" + matching(e["matching"]) + """
""" + blanks_html(e.get("fill_blank")) + """
</div></div>""")

    # S5 SCENARIO
    parts.append("""<div class="step-container" id="step-4">""")
    parts.append(hero(5,T,"Scenario professionnel","Mettez vos connaissances en pratique.",c1,c2))
    parts.append("""<div class="content-section">
  <div class="animate-in"><h3>Mise en situation</h3><p>Faites un choix. Vos decisions impactent votre score.</p></div>
""" + scenario_html(e["scenario"]) + """
  <div class="divider"></div>
""" + debate_html(e.get("debate")) + """
</div></div>""")

    # S6 QUIZ
    parts.append("""<div class="step-container" id="step-5">""")
    parts.append(hero(6,T,"Quiz chronometre","30 secondes par question.",c1,c2))
    parts.append("""<div class="content-section">
""" + quiz_html(e["quiz"]) + """
</div></div>""")

    # S7 SYNTHESE
    parts.append("""<div class="step-container" id="step-6">""")
    parts.append(hero(7,T,"Votre synthese personnalisee","Basee sur vos reponses.",c1,c2))
    pq = e.get("project_questions", [])
    pq_html = ""
    if pq:
        pq_html = '<div class="animate-in"><h3>Questions a se poser dans un projet IA</h3><div class="highlight-box"><ul class="numbered-list">'
        for q in pq:
            pq_html += '<li><span>' + q + '</span></li>'
        pq_html += '</ul></div></div>'

    parts.append("""<div class="content-section">
  <div class="animate-in"><div class="progress-circle-wrap"><div class="progress-circle">
    <div class="top-line" style="top:142px"></div>
    <div class="bottom-line"></div>
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle class="bg" cx="80" cy="80" r="70"/>
      <circle class="fg-fill" cx="80" cy="140" r="0"/>
      <circle class="fg-stroke" cx="80" cy="80" r="70" stroke-dasharray="439.82" stroke-dashoffset="439.82"/>
    </svg>
    <div class="circle-text">—</div>
  </div></div></div>
  <div class="animate-in"><div class="two-columns">
    <div class="column-card"><h4 style="color:var(--danger)">Risques cles</h4><ul>""" + risques_li + """</ul></div>
    <div class="column-card"><h4 style="color:var(--success)">Mesures essentielles</h4><ul>""" + mesures_li + """</ul></div>
  </div></div>
  """ + pq_html + """
  """ + checklist_html(e.get("checklist", [])) + """
  <div class="animate-in"><h3>Points a revoir</h3><ul class="weak-areas-list"></ul></div>
</div></div>""")

    # S8 BADGE
    parts.append("""<div class="step-container" id="step-7">""")
    parts.append(hero(8,T,"Felicitations !","Module "+title+" termine.",c1,c2))
    parts.append("""<div class="content-section">
  <div class="badge-container animate-in">
    <div class="badge-icon">""" + icon + """</div>
    <h2>Module """ + title + """ termine !</h2>
    <p>Vous avez explore en profondeur les risques et les mesures.</p>
    <div class="badge-message"></div>
  </div>
  <div class="animate-in"><div class="highlight-box"><strong>Retenez l essentiel</strong>
    <p>Appliquez ces bonnes pratiques au quotidien et partagez-les avec vos collegues.</p>
  </div></div>
</div></div>""")

    bc = '<div class="breadcrumb" id="breadcrumb">'
    for i, l in enumerate(nav_labels):
        if i > 0:
            bc += '<span class="breadcrumb-chevron">&#8250;</span>'
        cls = 'breadcrumb-link'
        if i == 0:
            cls += ' active'
        bc += '<span class="breadcrumb-item"><span class="' + cls + '" data-step="' + str(i) + '"><span class="step-num">' + str(i+1) + '</span>' + l + '</span></span>'
    bc += '</div>'
    # NAV + CLOSE
    parts.append("""<div class="step-navigation"><div class="nav-progress"><div class="progress-bar-bg"><div class="progress-bar-fill"></div></div></div>
  <div class="nav-row"><button class="nav-btn" id="prevBtn" disabled>&#8592; Precedent</button>
  """ + bc + """
  <button class="nav-btn primary" id="nextBtn">Suivant &#8594;</button></div>
</div></main></div>
<div class="scroll-hint" id="scrollHint"><span>Scrollez</span><div class="scroll-arrow"></div></div>
<div class="scroll-hint" id="scrollHint"><span>Scrollez</span><div class="scroll-arrow"></div></div>
<script src="js/scorm.js"></script><script src="js/app.js"></script>
</body></html>""")

    return chr(10).join(parts)

# BUILD ALL
for e in ALL:
    folder = os.path.join(BASE, "out", e["id"])
    if os.path.exists(folder): shutil.rmtree(folder)
    os.makedirs(os.path.join(folder, "css"), exist_ok=True)
    os.makedirs(os.path.join(folder, "js"), exist_ok=True)
    with open(os.path.join(folder, "index.html"), "w", encoding="utf-8") as f: f.write(build(e))
    with open(os.path.join(folder, "css", "style.css"), "w", encoding="utf-8") as f: f.write(CSS)
    with open(os.path.join(folder, "js", "scorm.js"), "w", encoding="utf-8") as f: f.write(SCORM_JS)
    with open(os.path.join(folder, "js", "app.js"), "w", encoding="utf-8") as f: f.write(APP_JS)
    with open(os.path.join(folder, "imsmanifest.xml"), "w", encoding="utf-8") as f: f.write(manifest(e["id"], "Enjeu : " + e["title"]))
    zn = os.path.join(BASE, "out", "scorm-" + e["id"] + ".zip")
    with zipfile.ZipFile(zn, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(folder):
            for fn in files:
                fp = os.path.join(root, fn)
                z.write(fp, os.path.relpath(fp, folder))
    print("OK: scorm-" + e["id"] + ".zip")

# BUILD VISION 360
from gen_vision360 import VISION360
v = VISION360

def build_vision360():
    T = 6
    title = v["title"]
    icon = v["icon"]
    c1 = v["color1"]
    c2 = v["color2"]
    nav_labels = ["Accroche","Vision 360","Les 8 enjeux","Interdependances","Quiz","Orientation"]
    sidebar_items = ""
    for i, l in enumerate(nav_labels):
        a = " active" if i == 0 else ""
        sidebar_items += '      <div class="nav-item' + a + '"><span class="nav-number">' + str(i+1) + '</span><span class="nav-label">' + l + '</span></div>' + chr(10)

    cards_html = '<div class="flip-cards-grid animate-in">'
    for name, color, desc in v["enjeux_cards"]:
        cards_html += '<div class="flip-card" role="button" tabindex="0"><div class="flip-card-inner">'
        cards_html += '<div class="flip-card-front" ><h4>' + name + '</h4><div class="flip-hint">Cliquez pour retourner</div></div>'
        cards_html += '<div class="flip-card-back"><h4>' + name + '</h4><p>' + desc + '</p></div>'
        cards_html += '</div></div>'
    cards_html += '</div>'

    profils_html = '<div class="accordion">'
    for profil, desc in v["profils"]:
        profils_html += '<div class="accordion-item"><div class="accordion-header" role="button" tabindex="0"><span>' + profil + '</span><span class="icon">+</span></div>'
        profils_html += '<div class="accordion-body"><div class="accordion-body-inner"><p>' + desc + '</p></div></div></div>'
    profils_html += '</div>'

    parts = []
    parts.append("""<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>""" + title + """</title>
<link rel="stylesheet" href="css/style.css">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Inter+Tight:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head><body>
<button class="mobile-toggle" id="mobileToggle" aria-label="Menu">&#9776;</button>
<div class="course-layout">
<aside class="sidebar" role="navigation" style="display:none">
  <div class="sidebar-progress"><div class="progress-bar-bg"><div class="progress-bar-fill"></div></div><div class="progress-text">0% termine</div></div>
  <div class="sidebar-score">Score : <span id="sidebarScore">-</span></div>
</aside>
<main class="main-content">""")

    # S1 ACCROCHE
    parts.append('<div class="step-container active" id="step-0">')
    parts.append(hero(1,T, icon+" "+title, v["definition"], c1, c2))
    parts.append('<div class="content-section"><div class="animate-in"><div class="highlight-box warning"><strong>' + v["hook"] + '</strong></div></div>')
    parts.append(counters(v["counters"]))
    parts.append("""<div class="animate-in"><div class="highlight-box"><strong>Ce module vous prepare a :</strong><ul>
    <li>Comprendre les 8 dimensions a anticiper dans tout projet IA</li>
    <li>Voir les interdependances entre les enjeux</li>
    <li>Identifier les modules prioritaires selon votre profil</li>
    </ul></div></div></div></div>""")

    # S2 VISION 360
    parts.append('<div class="step-container" id="step-1">')
    parts.append(hero(2,T, "La vision 360", "8 enjeux, une seule vision.", c1, c2))
    parts.append("""<div class="content-section">
  <div class="animate-in"><h3>Deployer un projet IA : bien plus que de la technique</h3>
  <p>Quand une organisation deploie un outil d IA generative, les questions techniques (quel modele, quelle infrastructure) ne representent qu une partie du defi. Huit dimensions complementaires doivent etre anticipees pour garantir un deploiement responsable, maitrise et perenne.</p>
  <p>Ces 8 enjeux ne sont pas independants : ils interagissent et se renforcent mutuellement. Un defaut de qualite des donnees (enjeu Donnees) peut generer des biais (enjeu Ethique), qui exposent a des sanctions (enjeu Juridique). C est pourquoi une vision 360 est indispensable.</p>
  </div></div></div>""")

    # S3 LES 8 ENJEUX
    parts.append('<div class="step-container" id="step-2">')
    parts.append(hero(3,T, "Les 8 enjeux en bref", "Retournez chaque carte pour decouvrir l enjeu.", c1, c2))
    parts.append('<div class="content-section"><div class="animate-in"><p>Cliquez sur chaque carte pour decouvrir la definition de l enjeu et ses liens avec les autres.</p></div>')
    parts.append(cards_html)
    parts.append('</div></div>')

    # S4 INTERDEPENDANCES
    inter = v["interdependances"]
    match_html = matching(inter) if len(inter) > 0 else ""
    parts.append('<div class="step-container" id="step-3">')
    parts.append(hero(4,T, "Les interdependances", "Reliez les enjeux qui sont lies.", c1, c2))
    parts.append('<div class="content-section"><div class="animate-in"><h3>Les enjeux sont interconnectes</h3><p>Reliez les paires d enjeux qui s influencent mutuellement.</p></div>')
    parts.append(match_html)
    parts.append('</div></div>')

    # S5 QUIZ
    parts.append('<div class="step-container" id="step-4">')
    parts.append(hero(5,T, "Quiz : quel enjeu est concerne ?", "Testez votre comprehension des 8 dimensions.", c1, c2))
    parts.append('<div class="content-section">')
    parts.append(quiz_html(v["quiz"]))
    parts.append('</div></div>')

    # S6 ORIENTATION
    parts.append('<div class="step-container" id="step-5">')
    parts.append(hero(6,T, "Votre parcours personnalise", "Quels modules suivre selon votre profil ?", c1, c2))
    parts.append("""<div class="content-section">
  <div class="animate-in"><h3>Choisissez votre parcours</h3><p>Selon votre role, certains modules sont prioritaires. Retrouvez les recommandations ci-dessous.</p></div>
  <div class="animate-in">""" + profils_html + """</div>
  <div class="animate-in"><div class="badge-container">
    <div class="badge-icon">""" + icon + """</div>
    <h2>Pret a explorer les 8 enjeux !</h2>
    <p>Vous avez maintenant une vision d ensemble. Plongez dans les modules qui vous concernent.</p>
    <div class="badge-message"></div>
  </div></div>
</div></div>""")

    bc2 = '<div class="breadcrumb" id="breadcrumb">'
    for i, l in enumerate(nav_labels):
        if i > 0:
            bc2 += '<span class="breadcrumb-chevron">&#8250;</span>'
        cls = 'breadcrumb-link'
        if i == 0:
            cls += ' active'
        bc2 += '<span class="breadcrumb-item"><span class="' + cls + '" data-step="' + str(i) + '"><span class="step-num">' + str(i+1) + '</span>' + l + '</span></span>'
    bc2 += '</div>'

    # NAV + CLOSE
    parts.append("""<div class="step-navigation"><div class="nav-progress"><div class="progress-bar-bg"><div class="progress-bar-fill"></div></div></div>
  <div class="nav-row"><button class="nav-btn" id="prevBtn" disabled>&#8592; Precedent</button>
  """ + bc2 + """
  <button class="nav-btn primary" id="nextBtn">Suivant &#8594;</button></div>
</div></main></div>
<script src="js/scorm.js"></script><script src="js/app.js"></script>
</body></html>""")

    return chr(10).join(parts)

# Generate Vision 360
folder = os.path.join(BASE, "out", "vision360")
if os.path.exists(folder): shutil.rmtree(folder)
os.makedirs(os.path.join(folder, "css"), exist_ok=True)
os.makedirs(os.path.join(folder, "js"), exist_ok=True)
with open(os.path.join(folder, "index.html"), "w", encoding="utf-8") as f: f.write(build_vision360())
with open(os.path.join(folder, "css", "style.css"), "w", encoding="utf-8") as f: f.write(CSS)
with open(os.path.join(folder, "js", "scorm.js"), "w", encoding="utf-8") as f: f.write(SCORM_JS)
with open(os.path.join(folder, "js", "app.js"), "w", encoding="utf-8") as f: f.write(APP_JS)
with open(os.path.join(folder, "imsmanifest.xml"), "w", encoding="utf-8") as f: f.write(manifest("vision360", "Vision 360 : Les 8 enjeux de l IA"))
zn = os.path.join(BASE, "out", "scorm-vision360.zip")
with zipfile.ZipFile(zn, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(folder):
        for fn in files:
            fp = os.path.join(root, fn)
            z.write(fp, os.path.relpath(fp, folder))
print("OK: scorm-vision360.zip")

print("9 cours generes!")
