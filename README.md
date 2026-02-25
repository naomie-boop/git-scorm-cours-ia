# Cours SCORM - Les 8 enjeux de l'IA générative à 360°

9 modules e-learning au format SCORM 1.2, conçus pour les collaborateurs d'une grande entreprise de service public.

## Modules

| ZIP | Module | Contenu |
|-----|--------|---------|
| `scorm-vision360.zip` | Vision 360° | Introduction au parcours, vue d'ensemble des 8 enjeux |
| `scorm-ethique.zip` | Éthique | Biais, hallucinations, transparence, 5 principes |
| `scorm-juridique.zip` | Juridique | AI Act, RGPD, CNIL, responsabilité |
| `scorm-rh.zip` | Ressources Humaines | Automation complacency, skill atrophy, taxonomie des tâches |
| `scorm-changement.zip` | Conduite du changement | Modèle ADKAR, change fatigue, co-construction |
| `scorm-data.zip` | Données | RAG, data drift, corpus IA Ready |
| `scorm-securite.zip` | Sécurité | 3 règles d'or, Shadow AI, prompt injection |
| `scorm-ux.zip` | Design UX | WCAG 2.1, trust calibration, accessibilité |
| `scorm-environnement.zip` | Environnement | IEA 2025, SLM vs LLM, sobriété numérique |

## Déploiement

Uploader chaque fichier `.zip` dans votre LMS (Moodle, 360Learning, etc.) en tant que package SCORM 1.2.

## Structure de chaque module (8 étapes)

1. **Accroche** — Cover page interactive + chiffres-clés animés + Vrai/Faux
2. **Découverte** — Mécanisme IA + définition + usages + principes (onglets)
3. **Risques** — Accordéons détaillés + drag-and-drop
4. **Mesures** — Flip cards 3D + matching pairs + texte à trous
5. **Scénario** — Arbre de décisions + mini-débat
6. **Quiz** — Questions chronométrées + feedback différencié
7. **Synthèse** — Score circulaire + questions projet IA + checklist d'engagements
8. **Conclusion** — Badge de complétion

## Source

Les fichiers sources (Python + CSS + JS) sont dans le dossier `src/`.

Pour régénérer : `cd src && python3 generate.py`
