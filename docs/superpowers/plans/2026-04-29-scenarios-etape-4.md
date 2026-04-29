# Scénarios interactifs étape 4 — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplir l'étape 4 (scénario interactif) actuellement vide dans les 9 modules SCORM, par une mécanique HTML/CSS/JS simple, identique sur tous les modules, avec contenu adapté à chacun.

**Architecture:** Pattern unique réutilisable. Chaque scénario = situation courte avec persona + 1 question à 3 choix + feedback différencié. CSS partagé dans `ia-responsable/css/style.css` (déjà chargé par les 9 modules ? Non — chaque module a son propre `css/style.css`). On centralise donc le CSS dans un nouveau fichier `_shared/scenario.css` que chaque module importe, et le JS dans `_shared/scenario.js`. Les photos personas (`Sophie.jpg`, `Karim.jpg`, etc.) sont copiées dans un dossier partagé `_shared/img/`.

**Tech Stack:** HTML5 + CSS3 (custom properties existantes) + JavaScript vanilla. Aucune dépendance externe. Compatible SCORM 1.2.

**Branche:** Travailler sur `main` directement (cycle court) OU créer `feat/scenarios-etape-4` si on préfère une PR séparée. Recommandation : branche dédiée + PR pour traçabilité.

**Décisions cadre :**
- Pas d'Arcade (chaque module aurait nécessité un Arcade créé manuellement, lourd) — on fait du HTML/CSS/JS natif
- Personas : Sophie (directrice), Karim (chef d'escale), Marc, Léa — photos déjà présentes dans `ia-responsable/img/`
- Format scénario : 1 situation + 3 choix + feedback contextualisé par choix
- Ton : pédagogique neutre, pas dramatique, conforme aux préférences cliente
- Mapping persona ↔ module : varier les personas pour ne pas tous mettre Sophie partout

**Mapping persona ↔ module proposé :**

| Module | Persona | Contexte |
|---|---|---|
| vision360 | Sophie (directrice) | Choix de gouvernance globale IA |
| ethique | Léa | Vérification d'un contenu généré par IA |
| juridique | Marc | Conformité d'un outil IA |
| rh | Sophie | Décision RH avec recommandation IA |
| changement | Karim | Adoption d'un outil dans l'équipe |
| data | Léa | Qualité d'un corpus IA |
| securite | Karim | Réflexe face à un usage IA suspect |
| ux | Marc | Choix d'interface IA inclusive |
| environnement | Sophie | Arbitrage SLM vs LLM |

---

## File Structure

### Fichiers à créer

| Path | Responsibility |
|---|---|
| `_shared/img/Sophie.jpg`, `Karim.jpg`, `Marc.jpg`, `Lea.jpg` | Photos personas accessibles à tous modules (copies de `ia-responsable/img/`) |
| `_shared/scenario.css` | Styles dédiés au composant scénario interactif (réutilisable) |
| `_shared/scenario.js` | Comportement JS du scénario (sélection choix, feedback, validation) |

### Fichiers à modifier (9 modules)

| Path | Modification |
|---|---|
| `vision360/index.html` à `environnement/index.html` (9 fichiers) | (a) Ajouter `<link>` vers `../_shared/scenario.css` ; (b) ajouter `<script src="../_shared/scenario.js">` ; (c) injecter le bloc HTML scénario dans le step `Étape 4 / Scénario` |

### Fichiers intacts

- `css/`, `js/`, `intro.mp4`, `imsmanifest.xml` de chaque module
- Tous les autres steps (1, 2, 3, 5, 6, 7) restent inchangés

---

## Notes d'exécution

- **Pas de tests automatisés** : c'est du contenu statique HTML. La validation = ouverture dans le navigateur + parcours du scénario.
- **Validation manuelle par module** : ouvrir le module, naviguer jusqu'à étape 4, cliquer chaque choix, vérifier que les 3 feedbacks s'affichent correctement.
- **Working directory** : `/tmp/git-scorm-cours-ia/`
- **Commits atomiques** : un par tâche.

---

## Task 1: Créer le dossier partagé `_shared/` avec les photos

**Files:**
- Create: `_shared/img/Sophie.jpg`, `Karim.jpg`, `Marc.jpg`, `Lea.jpg` (copies depuis `ia-responsable/img/`)

- [ ] **Step 1: Créer le dossier**

```bash
cd /tmp/git-scorm-cours-ia && mkdir -p _shared/img
```

- [ ] **Step 2: Copier les 4 photos**

```bash
cd /tmp/git-scorm-cours-ia && cp ia-responsable/img/{Sophie,Karim,Marc,Lea}.jpg _shared/img/
```

- [ ] **Step 3: Vérifier**

```bash
cd /tmp/git-scorm-cours-ia && ls -la _shared/img/
```

Expected output : 4 fichiers `.jpg` (Sophie, Karim, Marc, Lea).

- [ ] **Step 4: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add _shared/img/ && git commit -m "feat(scenario): photos personas partagées dans _shared/img/"
```

---

## Task 2: Créer `_shared/scenario.css` — styles du composant

**Files:**
- Create: `_shared/scenario.css`

- [ ] **Step 1: Créer le fichier avec ce contenu exact**

```css
/* =========================================================================
   SCENARIO.CSS — Composant scénario interactif (étape 4)
   Compatible avec le design system des modules SCORM
   ========================================================================= */

.scenario {
  max-width: 680px;
  margin: 24px auto 0;
  padding: 0;
}

.scenario-context {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 20px;
  align-items: flex-start;
  padding: 24px;
  background: #fff;
  border: .5px solid var(--border);
  border-radius: var(--r);
  margin-bottom: 28px;
}

.scenario-persona-photo {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 2px solid var(--brand);
}

.scenario-persona-meta {
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--brand);
  font-weight: 600;
  margin-bottom: 6px;
}

.scenario-context p {
  font-size: .92rem;
  line-height: 1.65;
  color: var(--text-secondary);
  margin: 0 0 8px;
}

.scenario-context p:last-child { margin-bottom: 0; }

.scenario-prompt {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
}

.scenario-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.scenario-choice {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  background: #fff;
  border: .5px solid var(--border);
  border-radius: var(--r);
  cursor: pointer;
  font-family: inherit;
  font-size: .9rem;
  line-height: 1.55;
  text-align: left;
  color: var(--text-primary);
  transition: all var(--tr);
}

.scenario-choice:hover:not(:disabled) {
  border-color: var(--brand);
  background: var(--brand-light);
}

.scenario-choice:disabled { cursor: default; }

.scenario-choice.correct {
  border-color: var(--success);
  background: rgba(52, 199, 89, .06);
}

.scenario-choice.incorrect {
  border-color: var(--warning);
  background: rgba(255, 159, 10, .06);
}

.scenario-choice-letter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, .15);
  border-radius: 50%;
  font-family: monospace;
  font-size: .8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.scenario-choice.correct .scenario-choice-letter {
  background: var(--success);
  border-color: var(--success);
  color: #fff;
}

.scenario-choice.incorrect .scenario-choice-letter {
  background: var(--warning);
  border-color: var(--warning);
  color: #fff;
}

.scenario-feedback {
  display: none;
  padding: 18px 20px;
  border-radius: var(--r);
  font-size: .87rem;
  line-height: 1.65;
  margin-top: 4px;
}

.scenario-feedback.visible {
  display: block;
  animation: fadeIn .35s ease;
}

.scenario-feedback.correct {
  background: rgba(52, 199, 89, .06);
  border-left: 2px solid var(--success);
  color: var(--text-primary);
}

.scenario-feedback.incorrect {
  background: rgba(255, 159, 10, .06);
  border-left: 2px solid var(--warning);
  color: var(--text-primary);
}

.scenario-feedback strong { color: var(--text-primary); }

@media (max-width: 560px) {
  .scenario-context {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .scenario-persona-photo {
    margin: 0 auto;
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add _shared/scenario.css && git commit -m "feat(scenario): styles partagés du composant scénario interactif"
```

---

## Task 3: Créer `_shared/scenario.js` — comportement du composant

**Files:**
- Create: `_shared/scenario.js`

- [ ] **Step 1: Créer le fichier avec ce contenu exact**

```javascript
/* =========================================================================
   SCENARIO.JS — Comportement du scénario interactif (étape 4)
   Sélectionne un choix → affiche le feedback associé.
   ========================================================================= */
(function() {
  'use strict';

  document.querySelectorAll('[data-scenario]').forEach(function(scenario) {
    var choices = scenario.querySelectorAll('.scenario-choice');
    var feedback = scenario.querySelector('.scenario-feedback');

    choices.forEach(function(choice) {
      choice.addEventListener('click', function() {
        // Reset state on all choices
        choices.forEach(function(c) {
          c.classList.remove('correct', 'incorrect');
        });

        var isCorrect = choice.dataset.correct === 'true';
        choice.classList.add(isCorrect ? 'correct' : 'incorrect');

        if (feedback) {
          feedback.innerHTML = choice.dataset.feedback || '';
          feedback.className = 'scenario-feedback visible ' + (isCorrect ? 'correct' : 'incorrect');
        }

        // If correct, mark step as done (compatible avec app.js de chaque module)
        if (isCorrect && typeof window.markStepDone === 'function') {
          window.markStepDone();
        }
      });
    });
  });
})();
```

- [ ] **Step 2: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add _shared/scenario.js && git commit -m "feat(scenario): comportement JS du composant scénario interactif"
```

---

## Task 4: Module **vision360** — injecter le scénario

**Files:**
- Modify: `vision360/index.html`

**Persona** : Sophie (directrice). **Sujet** : choix de gouvernance globale.

- [ ] **Step 1: Ajouter le link CSS dans `<head>`**

Dans `vision360/index.html`, après la ligne `<link rel="stylesheet" href="css/style.css">`, ajouter :

```html
<link rel="stylesheet" href="../_shared/scenario.css">
```

- [ ] **Step 2: Ajouter le script JS avant `</body>`**

Dans `vision360/index.html`, juste avant `</body>` (ou après `<script src="js/app.js"></script>`), ajouter :

```html
<script src="../_shared/scenario.js"></script>
```

- [ ] **Step 3: Localiser le step-3 (étape 4 Scénario) et remplacer son contenu**

Trouver le bloc :
```html
<div class="step-container" id="step-3">
  <div class="step-hero">...</div>
  <div class="content-section">...</div>
</div>
```

Remplacer **tout l'intérieur** du `step-container id="step-3"` par :

```html
  <div class="step-hero">
    <div class="step-number">Étape 4 sur 7</div>
    <h2>Scénario : choix de gouvernance IA</h2>
    <p class="hero-subtitle">Une décision concrète à prendre, plusieurs angles à pondérer.</p>
  </div>
  <div class="content-section">
    <div class="scenario" data-scenario>
      <div class="scenario-context">
        <div class="scenario-persona-photo" style="background-image:url('../_shared/img/Sophie.jpg')"></div>
        <div>
          <div class="scenario-persona-meta">Sophie · Directrice de la transformation numérique</div>
          <p>Votre comité de direction veut déployer un assistant IA pour aider les managers à préparer leurs réunions. Trois orientations sont sur la table. Vous devez recommander la priorité.</p>
        </div>
      </div>

      <p class="scenario-prompt">Quelle priorité recommandez-vous au CODIR ?</p>

      <div class="scenario-choices">
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Insuffisant.</strong> Choisir l'outil le plus performant sans cadrage de gouvernance, c'est prendre les enjeux Éthique, Juridique, Sécurité dans l'angle mort. Une vision 360° impose de poser la gouvernance avant l'outil.">
          <span class="scenario-choice-letter">A</span>
          <span>Choisir d'abord l'outil le plus performant disponible sur le marché.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="true"
          data-feedback="<strong>Bonne réponse.</strong> Une vision 360° démarre par la gouvernance : qui décide, comment on supervise, quels enjeux on protège. Cela conditionne ensuite le choix de l'outil et son déploiement.">
          <span class="scenario-choice-letter">B</span>
          <span>Définir d'abord la gouvernance (rôles, supervision, enjeux prioritaires) avant de choisir l'outil.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Trop tôt.</strong> Mesurer les gains de productivité a du sens, mais pas avant d'avoir cadré les risques. Sans gouvernance, on peut industrialiser un usage à risque sans s'en rendre compte.">
          <span class="scenario-choice-letter">C</span>
          <span>Lancer un pilote rapide pour mesurer les gains de productivité.</span>
        </button>
      </div>

      <div class="scenario-feedback"></div>
    </div>
  </div>
```

- [ ] **Step 4: Vérifier**

```bash
cd /tmp/git-scorm-cours-ia && open vision360/index.html
```

Naviguer jusqu'à étape 4. Vérifier : photo Sophie visible, 3 choix cliquables, feedback s'affiche après clic.

- [ ] **Step 5: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add vision360/index.html && git commit -m "feat(vision360): scénario étape 4 — gouvernance IA (Sophie)"
```

---

## Task 5: Module **ethique** — injecter le scénario

**Files:**
- Modify: `ethique/index.html`

**Persona** : Léa. **Sujet** : vérification d'un contenu généré par IA avant publication.

- [ ] **Step 1: Ajouter link CSS et script JS** (mêmes ajouts qu'à la Task 4 Step 1 et 2, en pointant vers `../_shared/scenario.css` et `../_shared/scenario.js`)

- [ ] **Step 2: Remplacer le contenu du step-3 (étape 4) par :**

```html
  <div class="step-hero">
    <div class="step-number">Étape 4 sur 7</div>
    <h2>Scénario : avant publication</h2>
    <p class="hero-subtitle">Un contenu généré par IA, à publier dans 30 minutes. Que faites-vous ?</p>
  </div>
  <div class="content-section">
    <div class="scenario" data-scenario>
      <div class="scenario-context">
        <div class="scenario-persona-photo" style="background-image:url('../_shared/img/Lea.jpg')"></div>
        <div>
          <div class="scenario-persona-meta">Léa · Chargée de communication</div>
          <p>Vous devez publier d'ici 30 minutes une note de cadrage interne sur un nouveau dispositif. Votre assistant IA vient de vous proposer une excellente version en 30 secondes — mieux écrite que la vôtre.</p>
        </div>
      </div>

      <p class="scenario-prompt">Que faites-vous avant de publier ?</p>

      <div class="scenario-choices">
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Risqué.</strong> Publier un contenu IA sans relecture humaine ni mention « assisté par IA » va à l'encontre du principe de transparence. En cas d'erreur ou de biais, votre responsabilité reste engagée.">
          <span class="scenario-choice-letter">A</span>
          <span>Publier directement, le texte est meilleur que ce que j'aurais écrit moi-même.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="true"
          data-feedback="<strong>Bonne réponse.</strong> Vérifier les faits, garder l'humain comme décideur final, et signaler que le contenu est assisté par IA — ce sont les trois réflexes éthiques de base. Cela vaut tous les gains de temps.">
          <span class="scenario-choice-letter">B</span>
          <span>Relire pour vérifier les faits, ajouter la mention « assisté par IA » et publier.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Trop défensif.</strong> Réécrire entièrement annule l'intérêt de l'outil. La bonne posture n'est pas de rejeter l'IA, c'est de la cadrer (vérification + transparence).">
          <span class="scenario-choice-letter">C</span>
          <span>Réécrire entièrement la note à la main pour ne pas dépendre de l'IA.</span>
        </button>
      </div>

      <div class="scenario-feedback"></div>
    </div>
  </div>
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add ethique/index.html && git commit -m "feat(ethique): scénario étape 4 — avant publication (Léa)"
```

---

## Task 6: Module **juridique** — injecter le scénario

**Files:**
- Modify: `juridique/index.html`

**Persona** : Marc. **Sujet** : conformité d'un outil IA (AI Act).

- [ ] **Step 1: Ajouter link CSS et script JS** (comme Task 4)

- [ ] **Step 2: Remplacer le contenu du step-3 par :**

```html
  <div class="step-hero">
    <div class="step-number">Étape 4 sur 7</div>
    <h2>Scénario : conformité AI Act</h2>
    <p class="hero-subtitle">Une équipe veut déployer un outil IA. Quelle est la première étape juridique ?</p>
  </div>
  <div class="content-section">
    <div class="scenario" data-scenario>
      <div class="scenario-context">
        <div class="scenario-persona-photo" style="background-image:url('../_shared/img/Marc.jpg')"></div>
        <div>
          <div class="scenario-persona-meta">Marc · Juriste interne</div>
          <p>Une équipe RH veut déployer un outil IA externe pour pré-trier des candidatures. Le fournisseur dit que son outil est « conforme à l'AI Act ». L'équipe vous demande de valider rapidement.</p>
        </div>
      </div>

      <p class="scenario-prompt">Que faites-vous en premier ?</p>

      <div class="scenario-choices">
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Insuffisant.</strong> La déclaration du fournisseur ne suffit pas : l'AI Act fait porter la responsabilité au déployeur (vous). En cas de plainte, vous devrez démontrer votre propre évaluation des risques, pas celle du fournisseur.">
          <span class="scenario-choice-letter">A</span>
          <span>Faire confiance à la déclaration du fournisseur et autoriser le déploiement.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="true"
          data-feedback="<strong>Bonne réponse.</strong> Le tri de CV est un usage à « haut risque » au sens de l'AI Act. Vous devez classer l'outil, demander la documentation technique, exiger une supervision humaine et organiser un canal de réclamation pour les candidats.">
          <span class="scenario-choice-letter">B</span>
          <span>Classer l'outil au regard de l'AI Act, exiger la documentation technique et organiser la supervision humaine.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Trop bloquant.</strong> Refuser tout outil IA externe n'est pas tenable. Le rôle juridique n'est pas d'interdire mais d'encadrer pour rendre l'usage conforme.">
          <span class="scenario-choice-letter">C</span>
          <span>Refuser tout outil IA externe pour limiter les risques juridiques.</span>
        </button>
      </div>

      <div class="scenario-feedback"></div>
    </div>
  </div>
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add juridique/index.html && git commit -m "feat(juridique): scénario étape 4 — conformité AI Act (Marc)"
```

---

## Task 7: Module **rh** — injecter le scénario

**Files:**
- Modify: `rh/index.html`

**Persona** : Sophie. **Sujet** : décision RH avec recommandation IA.

- [ ] **Step 1: Ajouter link CSS et script JS** (comme Task 4)

- [ ] **Step 2: Remplacer le contenu du step-3 par :**

```html
  <div class="step-hero">
    <div class="step-number">Étape 4 sur 7</div>
    <h2>Scénario : décision RH assistée par IA</h2>
    <p class="hero-subtitle">L'outil propose un classement, vous gardez la main. Que faites-vous ?</p>
  </div>
  <div class="content-section">
    <div class="scenario" data-scenario>
      <div class="scenario-context">
        <div class="scenario-persona-photo" style="background-image:url('../_shared/img/Sophie.jpg')"></div>
        <div>
          <div class="scenario-persona-meta">Sophie · Manager d'équipe</div>
          <p>Votre outil IA de mobilité interne propose un classement pour un poste à pourvoir. Le candidat n°1 a un profil très conforme aux titulaires précédents du poste. Le candidat n°4 a un parcours atypique mais des compétences solides.</p>
        </div>
      </div>

      <p class="scenario-prompt">Comment utilisez-vous la recommandation ?</p>

      <div class="scenario-choices">
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Risque d'automation complacency.</strong> Suivre l'outil sans questionner reproduit les schémas passés — y compris leurs biais. Le candidat n°1 « conforme aux titulaires précédents » est exactement le type de signal qui doit faire vérifier.">
          <span class="scenario-choice-letter">A</span>
          <span>Suivre la recommandation : l'outil est plus objectif que mon ressenti.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="true"
          data-feedback="<strong>Bonne réponse.</strong> Utiliser la recommandation comme une aide, pas comme une décision. Examiner aussi les profils atypiques et challenger les critères implicites de l'outil — c'est ainsi qu'on évite les biais de proxy et qu'on garde l'humain décideur.">
          <span class="scenario-choice-letter">B</span>
          <span>Examiner les 4 profils en gardant la décision, et m'interroger sur les critères que l'outil a privilégiés.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Trop radical.</strong> Ignorer l'outil annule son intérêt. La bonne posture est de l'utiliser comme un point de vue parmi d'autres, en restant maître de la décision finale.">
          <span class="scenario-choice-letter">C</span>
          <span>Ignorer la recommandation et décider uniquement sur entretien.</span>
        </button>
      </div>

      <div class="scenario-feedback"></div>
    </div>
  </div>
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add rh/index.html && git commit -m "feat(rh): scénario étape 4 — décision assistée par IA (Sophie)"
```

---

## Task 8: Module **changement** — injecter le scénario

**Files:**
- Modify: `changement/index.html`

**Persona** : Karim. **Sujet** : adoption d'un outil dans son équipe.

- [ ] **Step 1: Ajouter link CSS et script JS** (comme Task 4)

- [ ] **Step 2: Remplacer le contenu du step-3 par :**

```html
  <div class="step-hero">
    <div class="step-number">Étape 4 sur 7</div>
    <h2>Scénario : déployer un outil dans son équipe</h2>
    <p class="hero-subtitle">Six semaines après le lancement, l'usage chute. Que faites-vous ?</p>
  </div>
  <div class="content-section">
    <div class="scenario" data-scenario>
      <div class="scenario-context">
        <div class="scenario-persona-photo" style="background-image:url('../_shared/img/Karim.jpg')"></div>
        <div>
          <div class="scenario-persona-meta">Karim · Responsable d'équipe</div>
          <p>Six semaines après le déploiement d'un assistant IA dans votre équipe, le taux d'usage a chuté à 20 %. La formation initiale a bien eu lieu. Plusieurs collaborateurs disent « l'outil ne sert pas à mon métier ».</p>
        </div>
      </div>

      <p class="scenario-prompt">Quelle est votre première action ?</p>

      <div class="scenario-choices">
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Pas suffisant.</strong> Refaire la même formation alors qu'elle a déjà eu lieu ne résoudra rien. Le problème n'est pas la connaissance technique mais le sens : « à quoi ça me sert dans mon métier ? ». Sans réponse à cette question, l'usage ne reviendra pas.">
          <span class="scenario-choice-letter">A</span>
          <span>Reprogrammer une session de formation technique sur l'outil.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="true"
          data-feedback="<strong>Bonne réponse.</strong> Quand l'usage chute après une formation, c'est rarement la « Knowledge » qui manque (modèle ADKAR), c'est le « Desire ». Aller chercher 3 cas d'usage très concrets et les rendre visibles est la meilleure façon de relancer l'envie.">
          <span class="scenario-choice-letter">B</span>
          <span>Identifier 3 cas d'usage concrets dans le quotidien de l'équipe et les partager comme exemples vécus.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Contre-productif.</strong> Imposer l'usage par injonction sans avoir traité la cause (l'outil n'est pas perçu comme utile) crée de la résistance. La conduite du changement passe par la conviction, pas par la contrainte.">
          <span class="scenario-choice-letter">C</span>
          <span>Imposer un usage minimum hebdomadaire et suivre les statistiques.</span>
        </button>
      </div>

      <div class="scenario-feedback"></div>
    </div>
  </div>
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add changement/index.html && git commit -m "feat(changement): scénario étape 4 — adoption en équipe (Karim)"
```

---

## Task 9: Module **data** — injecter le scénario

**Files:**
- Modify: `data/index.html`

**Persona** : Léa. **Sujet** : qualité d'un corpus IA.

- [ ] **Step 1: Ajouter link CSS et script JS** (comme Task 4)

- [ ] **Step 2: Remplacer le contenu du step-3 par :**

```html
  <div class="step-hero">
    <div class="step-number">Étape 4 sur 7</div>
    <h2>Scénario : un corpus IA en dérive</h2>
    <p class="hero-subtitle">Le chatbot interne se trompe sur des questions courantes. D'où ça vient ?</p>
  </div>
  <div class="content-section">
    <div class="scenario" data-scenario>
      <div class="scenario-context">
        <div class="scenario-persona-photo" style="background-image:url('../_shared/img/Lea.jpg')"></div>
        <div>
          <div class="scenario-persona-meta">Léa · Référente données</div>
          <p>Votre chatbot interne s'appuie sur un corpus de procédures internes (RAG). Depuis 3 semaines, les utilisateurs signalent des réponses incohérentes sur des questions de congés. Aucun changement n'a eu lieu côté modèle.</p>
        </div>
      </div>

      <p class="scenario-prompt">Quelle hypothèse vérifiez-vous en priorité ?</p>

      <div class="scenario-choices">
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Pas le bon niveau.</strong> Le modèle n'a pas changé. Le problème est presque toujours dans les <em>données</em> récupérées par le RAG, pas dans le modèle lui-même.">
          <span class="scenario-choice-letter">A</span>
          <span>Le modèle IA a vieilli, il faudrait le remplacer par une version plus récente.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="true"
          data-feedback="<strong>Bonne réponse.</strong> Quand un chatbot RAG donne des réponses incohérentes alors que le modèle n'a pas changé, c'est le corpus qui a dérivé : nouvelle version de procédure mal indexée, ancienne version pas retirée, doublons. C'est la qualité des données, pas du modèle.">
          <span class="scenario-choice-letter">B</span>
          <span>Le corpus contient sans doute deux versions de la procédure congés, et le RAG renvoie tantôt l'une tantôt l'autre.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Pas la cause.</strong> Le bruit utilisateur est rarement la cause, surtout quand plusieurs personnes signalent la même incohérence. Le problème est en amont, dans le corpus.">
          <span class="scenario-choice-letter">C</span>
          <span>Les utilisateurs posent leurs questions de manière trop floue.</span>
        </button>
      </div>

      <div class="scenario-feedback"></div>
    </div>
  </div>
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add data/index.html && git commit -m "feat(data): scénario étape 4 — corpus en dérive (Léa)"
```

---

## Task 10: Module **securite** — injecter le scénario

**Files:**
- Modify: `securite/index.html`

**Persona** : Karim. **Sujet** : réflexe face à un usage IA suspect (volontairement non-opérationnel — pas de circulation, pas d'outil critique, pour respecter le feedback cliente).

- [ ] **Step 1: Ajouter link CSS et script JS** (comme Task 4)

- [ ] **Step 2: Remplacer le contenu du step-3 par :**

```html
  <div class="step-hero">
    <div class="step-number">Étape 4 sur 7</div>
    <h2>Scénario : un usage qui interroge</h2>
    <p class="hero-subtitle">Un collègue vous montre fièrement un gain de temps. Vous repérez un risque.</p>
  </div>
  <div class="content-section">
    <div class="scenario" data-scenario>
      <div class="scenario-context">
        <div class="scenario-persona-photo" style="background-image:url('../_shared/img/Karim.jpg')"></div>
        <div>
          <div class="scenario-persona-meta">Karim · Collaborateur</div>
          <p>Un collègue vous montre comment il prépare ses comptes-rendus de réunion : il copie le procès-verbal complet (avec noms, prises de parole, décisions internes) dans ChatGPT pour avoir un résumé en 10 secondes. Il est très satisfait du gain de temps.</p>
        </div>
      </div>

      <p class="scenario-prompt">Comment réagissez-vous ?</p>

      <div class="scenario-choices">
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Trop dur.</strong> Aller directement à la hiérarchie sans avoir parlé au collègue n'est pas la bonne posture. Il vous fait confiance en vous montrant son usage : c'est l'occasion de l'orienter, pas de le sanctionner.">
          <span class="scenario-choice-letter">A</span>
          <span>Signaler immédiatement à la hiérarchie pour faire sanctionner le comportement.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="true"
          data-feedback="<strong>Bonne réponse.</strong> Expliquer le risque (données nominatives, données internes envoyées hors du périmètre) puis orienter vers l'outil interne sécurisé est exactement le bon réflexe. C'est aussi ce qui permet de transformer un usage Shadow AI en usage maîtrisé.">
          <span class="scenario-choice-letter">B</span>
          <span>Lui expliquer le risque (données nominatives + internes hors périmètre) et lui montrer l'outil interne équivalent.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Insuffisant.</strong> Ne rien dire revient à valider l'usage. Si vous avez identifié le risque, vous avez aussi la responsabilité d'en parler — au moins au collègue.">
          <span class="scenario-choice-letter">C</span>
          <span>Ne rien dire — chacun est responsable de ses choix.</span>
        </button>
      </div>

      <div class="scenario-feedback"></div>
    </div>
  </div>
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add securite/index.html && git commit -m "feat(securite): scénario étape 4 — usage Shadow AI (Karim)"
```

---

## Task 11: Module **ux** — injecter le scénario

**Files:**
- Modify: `ux/index.html`

**Persona** : Marc. **Sujet** : choix d'interface IA inclusive.

- [ ] **Step 1: Ajouter link CSS et script JS** (comme Task 4)

- [ ] **Step 2: Remplacer le contenu du step-3 par :**

```html
  <div class="step-hero">
    <div class="step-number">Étape 4 sur 7</div>
    <h2>Scénario : valider une interface IA</h2>
    <p class="hero-subtitle">Le designer vous présente un chatbot. Que regardez-vous en priorité ?</p>
  </div>
  <div class="content-section">
    <div class="scenario" data-scenario>
      <div class="scenario-context">
        <div class="scenario-persona-photo" style="background-image:url('../_shared/img/Marc.jpg')"></div>
        <div>
          <div class="scenario-persona-meta">Marc · Chef de produit</div>
          <p>Le designer UX vous présente la maquette d'un chatbot d'aide IA pour les collaborateurs. L'interface est moderne, fluide, avec des animations soignées. Vous devez valider avant développement.</p>
        </div>
      </div>

      <p class="scenario-prompt">Quel point est le plus important à vérifier en priorité ?</p>

      <div class="scenario-choices">
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Trop tard.</strong> Le branding peut être ajusté plus tard, alors que l'accessibilité et la calibration de la confiance se conçoivent dès la maquette. Valider sur le branding seul, c'est rater l'essentiel.">
          <span class="scenario-choice-letter">A</span>
          <span>Que les couleurs et la typographie respectent la charte de marque interne.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="true"
          data-feedback="<strong>Bonne réponse.</strong> Conformité WCAG (contrastes, navigation clavier, lecteurs d'écran) + indicateurs de fiabilité (sources, mention « assisté par IA », niveaux de certitude) sont les fondations d'une UX IA inclusive et maîtrisée. Le reste s'ajuste après.">
          <span class="scenario-choice-letter">B</span>
          <span>L'accessibilité (WCAG : contraste, clavier, lecteurs d'écran) et la calibration de la confiance (sources citées, mention IA, niveau de certitude).</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Secondaire.</strong> Le temps de réponse est important mais c'est un sujet d'optimisation technique. L'enjeu UX prioritaire est ailleurs : que l'interface soit utilisable par tous et que la confiance soit calibrée.">
          <span class="scenario-choice-letter">C</span>
          <span>Que le temps de réponse de l'IA soit inférieur à 2 secondes.</span>
        </button>
      </div>

      <div class="scenario-feedback"></div>
    </div>
  </div>
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add ux/index.html && git commit -m "feat(ux): scénario étape 4 — validation interface IA (Marc)"
```

---

## Task 12: Module **environnement** — injecter le scénario

**Files:**
- Modify: `environnement/index.html`

**Persona** : Sophie. **Sujet** : arbitrage SLM vs LLM.

- [ ] **Step 1: Ajouter link CSS et script JS** (comme Task 4)

- [ ] **Step 2: Remplacer le contenu du step-3 par :**

```html
  <div class="step-hero">
    <div class="step-number">Étape 4 sur 7</div>
    <h2>Scénario : choix d'un modèle</h2>
    <p class="hero-subtitle">Pour résumer 10 emails par jour, quel modèle est le bon choix ?</p>
  </div>
  <div class="content-section">
    <div class="scenario" data-scenario>
      <div class="scenario-context">
        <div class="scenario-persona-photo" style="background-image:url('../_shared/img/Sophie.jpg')"></div>
        <div>
          <div class="scenario-persona-meta">Sophie · Responsable IA</div>
          <p>Une équipe veut déployer un assistant IA pour résumer des emails internes : tâche simple, ~10 emails par utilisateur et par jour, ~500 utilisateurs. Le fournisseur propose deux options : un grand modèle généraliste (LLM) ou un modèle spécialisé plus petit (SLM).</p>
        </div>
      </div>

      <p class="scenario-prompt">Que recommandez-vous ?</p>

      <div class="scenario-choices">
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Surdimensionné.</strong> Pour une tâche simple et répétitive, un grand modèle est plusieurs fois plus coûteux énergétiquement (et financièrement) qu'un modèle spécialisé — sans gain perceptible de qualité.">
          <span class="scenario-choice-letter">A</span>
          <span>Le LLM généraliste : la qualité sera meilleure et l'équipe sera plus à l'aise.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="true"
          data-feedback="<strong>Bonne réponse.</strong> Le bon réflexe est de dimensionner le modèle à la tâche. Un SLM bien calibré sur du résumé d'emails donne souvent une qualité équivalente, pour une fraction de l'empreinte carbone et du coût. La sobriété n'est pas une contrainte — c'est un choix d'ingénierie.">
          <span class="scenario-choice-letter">B</span>
          <span>Le SLM spécialisé : tâche simple = modèle dimensionné en conséquence, c'est plus sobre et souvent suffisant.</span>
        </button>
        <button type="button" class="scenario-choice" data-correct="false"
          data-feedback="<strong>Pas le bon arbitrage.</strong> Choisir l'outil interne par défaut est sain en sécurité, mais pas en environnement. Pour un usage à 500 utilisateurs × 10 fois par jour, l'impact énergétique du modèle compte autant que la sécurité de l'outil.">
          <span class="scenario-choice-letter">C</span>
          <span>L'outil interne par défaut, sans regarder le type de modèle.</span>
        </button>
      </div>

      <div class="scenario-feedback"></div>
    </div>
  </div>
```

- [ ] **Step 3: Commit**

```bash
cd /tmp/git-scorm-cours-ia && git add environnement/index.html && git commit -m "feat(environnement): scénario étape 4 — SLM vs LLM (Sophie)"
```

---

## Task 13: Régénérer les packages SCORM zip + push + PR

**Files:**
- Modify: `scorm-vision360.zip` à `scorm-environnement.zip`

- [ ] **Step 1: Regénérer les 9 zips**

```bash
cd /tmp/git-scorm-cours-ia && for m in vision360 ethique juridique rh changement data securite ux environnement; do
  rm -f scorm-$m.zip
  (cd $m && zip -qr ../scorm-$m.zip . -x "*.DS_Store")
done && ls -lh scorm-*.zip | head -11
```

- [ ] **Step 2: Vérifier qu'un module fonctionne en local**

```bash
cd /tmp/git-scorm-cours-ia && open vision360/index.html
```

Naviguer jusqu'à étape 4. Vérifier le scénario : photo Sophie + 3 choix + feedback.

- [ ] **Step 3: Commit zips + push branche + PR**

```bash
cd /tmp/git-scorm-cours-ia
git add scorm-*.zip
git commit -m "build: régénérer les 9 packages SCORM avec scénarios étape 4"
git push -u origin feat/scenarios-etape-4
gh pr create --title "Scénarios interactifs étape 4 — 9 modules SCORM" --body "$(cat <<'EOF'
## Summary
Remplit l'étape 4 (scénario interactif) précédemment vide dans les 9 modules SCORM, avec une mécanique HTML/CSS/JS simple et homogène.

## Approche
- Composant scénario partagé dans `_shared/scenario.css` + `_shared/scenario.js`
- Photos personas (Sophie, Karim, Marc, Léa) centralisées dans `_shared/img/`
- 1 scénario par module : situation + persona + 3 choix + feedback différencié

## Mapping personas
- Sophie : vision360, rh, environnement (rôles décisionnels)
- Karim : changement, securite (terrain, équipe)
- Léa : ethique, data (qualité contenu / corpus)
- Marc : juridique, ux (cadrage, validation)

## Test plan
- [ ] Ouvrir chaque module en local et vérifier le scénario étape 4
- [ ] Tester chaque package SCORM dans SCORM Cloud
- [ ] Vérifier que les 3 choix donnent un feedback distinct

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

Spec coverage check:

| Section spec | Tâche couvrante |
|---|---|
| Composant CSS partagé | Task 2 |
| Composant JS partagé | Task 3 |
| Photos partagées | Task 1 |
| 9 modules avec scénario propre | Tasks 4-12 (1 par module) |
| Mapping persona ↔ module | Tâches 4-12 (chaque task spécifie son persona) |
| Régénération zips + livraison | Task 13 |
| Pas de scénario à risque | Respecté : aucun deepfake, aucun scénario opérationnel critique, aucun outil réel SNCF cité |
| Réutilisation personas existants | Respecté : Sophie/Karim/Marc/Léa réutilisés |
| Ton pédagogique neutre | Respecté dans toutes les tâches (feedbacks clairs, pas dramatiques) |

Placeholder scan : aucun "TBD", aucun "TODO", aucun "implement later". Chaque tâche montre le code complet.

Type consistency :
- Classes CSS : `.scenario`, `.scenario-context`, `.scenario-persona-photo`, `.scenario-persona-meta`, `.scenario-prompt`, `.scenario-choices`, `.scenario-choice`, `.scenario-choice-letter`, `.scenario-feedback` — utilisées de façon identique dans le CSS et dans tous les HTML modules.
- Attributs JS : `[data-scenario]`, `[data-correct]`, `[data-feedback]` — même nomenclature partout.
- Chemin photos : `../_shared/img/<Persona>.jpg` — uniforme dans tous les modules.

Tout est cohérent. Pas d'ajustement à faire.
