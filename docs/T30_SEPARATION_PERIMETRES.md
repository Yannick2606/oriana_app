# T30B / T-30 — Plan de séparation des périmètres

Ce document décrit uniquement une stratégie d'intégration. Il n'autorise aucune création de PR,
fusion, réécriture d'historique, suppression de branche ou mise en production.

## Résultat

La séparation est réalisée : T30B a été fusionnée dans `main` par la PR #2 avec un commit de fusion
standard (`509d37dfc2bccfd857d84f5e7634d75b47272d7f`). La branche T-30 a ensuite été
synchronisée par un commit de fusion (`a95b49638f81cf8f2d068c56454fee257f1a8466`). La comparaison
finale indique 16 commits devant, zéro derrière et les 17 fichiers T-30 prévus.

## Constat distant

La comparaison GitHub confirme que les branches sont déjà correctement empilées :

| Périmètre | Base | Tête | Commits | Fichiers |
|---|---|---|---:|---:|
| T30B UX/UI | `main` (`d5ad0934`) | `t30b-validation-visuelle` (`2a87ba97`) | 11 | 23 |
| Préparation T-30 auditée | `t30b-validation-visuelle` (`2a87ba97`) | `t30-preparation-go-no-go` (`67d23c5f`) | 14 | 16 |

La branche T-30 est zéro commit derrière sa base T30B. Son écart ne contient aucun fichier frontend
T30B : la séparation logique est donc déjà obtenue sans cherry-pick ni rebase. Le présent plan ajoute
ensuite un dix-septième fichier documentaire au périmètre T-30.

## Périmètre 1 — T30B UX/UI

La future PR T30B doit cibler `main` depuis `t30b-validation-visuelle`.

Fichiers exclusifs UX/UI :

- `.github/workflows/capture-t30b.yml`
- `frontend/public/assets/warehouse-goussainville.png`
- `frontend/scripts/captureT30B.mjs`
- `frontend/src/App.jsx`
- `frontend/src/App.test.jsx`
- `frontend/src/agents/AgentsPage.jsx`
- `frontend/src/auth/FirstPasswordPage.jsx`
- `frontend/src/auth/LoginPage.jsx`
- `frontend/src/auth/ResetPasswordPage.jsx`
- `frontend/src/components/AppShell.jsx`
- `frontend/src/components/Logo.jsx`
- `frontend/src/components/ui/index.jsx`
- `frontend/src/crm/CrmPage.jsx`
- `frontend/src/crm/CrmPage.test.jsx`
- `frontend/src/formation/FormationExperience.jsx`
- `frontend/src/offres/OffresPage.jsx`
- `frontend/src/offres/OffresPage.test.jsx`
- `frontend/src/patrimoine/PatrimoinePage.jsx`
- `frontend/src/patrimoine/QualificationPanel.jsx`
- `frontend/src/styles.css`
- `frontend/tailwind.config.js`

Fichiers de suivi partagés mais modifications T30B identifiables : `PLAN.md` et `STATUS.md`.

## Périmètre 2 — préparation T-30

Avant intégration de T30B, une éventuelle PR T-30 doit cibler `t30b-validation-visuelle`, jamais
`main`. Son écart exact contient :

- `.github/workflows/check-postgres.yml`
- `.github/workflows/preflight-t30.yml`
- `deploy/drop-t30-restore-db.sh`
- `deploy/rehearse-restore-postgres.sh`
- `docs/T30_AUDIT_GITHUB_PREREQUIS.md`
- `docs/T30_GO_NO_GO.md`
- `docs/T30_PREFLIGHT_REPORT.md`
- `docs/T30_RECETTE_5_ROLES.md`
- `docs/T30_REPETITION_SAUVEGARDE_RESTAURATION.md`
- `docs/T30_REVUE_FINALE_BRANCHE.md`
- `docs/T30_SEPARATION_PERIMETRES.md`
- `docs/T30_SUPERVISION_ALERTES.md`
- `scripts/preflightT30.mjs`
- `scripts/preflightT30Environment.mjs`
- `scripts/preflightT30Environment.test.mjs`
- `PLAN.md`
- `STATUS.md`

## Ordre appliqué

1. T30B a été revue puis intégrée séparément par fusion GitHub standard.
2. L'ascendance a été préservée sans squash, rebase ni force-push.
3. La branche T-30 a été synchronisée avec le nouveau `main`.
4. La comparaison finale ne présente que les 17 fichiers T-30 ci-dessus.
5. Les contrôles complets doivent être relancés avant l'ouverture de la PR brouillon T-30.

## Critères de validation de la séparation

- la PR T30B contient 23 fichiers et aucun document ou script de préparation T-30 ;
- la PR T-30 contient 17 fichiers et aucun composant, style, test ou actif frontend T30B ;
- `PLAN.md` et `STATUS.md` conservent les deux historiques sans doublon ni perte ;
- aucune capture locale de `frontend/captures/` n'est ajoutée ;
- aucune branche n'est forcée et aucun commit existant n'est réécrit.
