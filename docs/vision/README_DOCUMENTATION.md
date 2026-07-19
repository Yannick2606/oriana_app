# Documentation orIAna v2.0

> Index officiel du patrimoine documentaire. Version : 2.0 — 19 juillet 2026.

orIAna est une **plateforme d’organisation augmentée**, initialement construite pour BORÉAL dans
l’immobilier d’affaires. Ce n’est pas un CRM : le CRM est un module parmi d’autres.

## Parcours de lecture

Un nouvel arrivant lit les documents dans cet ordre :

1. [ADN d’orIAna](ADN_ORIANA.md) — raison d’être, identité et promesse ;
2. [Constitution](CONSTITUTION_ORIANA.md) — invariants et limites non négociables ;
3. [Charte des dix principes](CHARTE_10_PRINCIPES_ORIANA.md) — principes de conception ;
4. [Méthode BORÉAL](../methode/METHODE_BOREAL.md) — cycle de transformation et d’apprentissage ;
5. [ORMO](../modele/ORMO.md) — cadre conceptuel de l’organisation ;
6. [Décisions d’architecture](ARCHITECTURE_DES_DECISIONS.md) — décisions traçables ;
7. [Cahier des charges](../../CDC.md) — capacités et exigences métier ;
8. [Spécification](../../SPEC.md) — contrats exécutables et architecture technique ;
9. [Plan](../../PLAN.md) — ordre de réalisation ;
10. [Statut](../../STATUS.md) — état réel et journal de preuve.

Le [guide de gouvernance documentaire](../gouvernance/GOUVERNANCE_DOCUMENTAIRE.md) définit les
responsabilités, statuts et règles de mise à jour. [AGENTS.md](../../AGENTS.md) traduit ces règles
pour les agents intervenant dans le dépôt.

## Familles documentaires

| Famille | Finalité | Documents de référence |
|---|---|---|
| Fondatrice | Pourquoi et jusqu’où | ADN, Constitution, Charte |
| Méthode et modèle | Comment raisonner et apprendre | BORÉAL, ORMO, Glossaire |
| Conception | Quelles capacités et quels choix | CDC, ADR, référentiels, UX/UI |
| Implémentation | Quels contrats construire | SPEC, tests, code |
| Pilotage | Dans quel ordre et avec quelles preuves | PLAN, STATUS, audits |

## Autorité en cas de divergence

La source la plus haute tranche uniquement dans son domaine :

1. Constitution et règles de sécurité ;
2. ADN et Charte pour la finalité ;
3. décisions acceptées dans le registre d’architecture ;
4. CDC pour les capacités et exigences métier ;
5. SPEC pour les contrats techniques ;
6. PLAN pour la séquence ;
7. STATUS pour l’état observé.

Une validation technique ne modifie jamais silencieusement une décision stratégique ou métier.
Une contradiction est enregistrée dans STATUS et résolue dans le document qui fait autorité.

## Statuts normalisés

- **Normatif** : règle en vigueur.
- **Implémenté** : présent et vérifié dans le code ou l’exploitation.
- **Transition** : état temporaire explicitement borné.
- **Cible validée** : décision acceptée, pas nécessairement implémentée.
- **À spécifier** : principe validé dont le contrat détaillé reste ouvert.
- **Exploratoire** : idée conservée, sans engagement de réalisation.
- **Historique** : preuve passée, non normative.

## Référentiels transverses

- [Glossaire](../referentiels/GLOSSAIRE.md)
- [Référentiel des modules](../referentiels/REFERENTIEL_MODULES.md)
- [Référentiel des objets métier](../referentiels/REFERENTIEL_OBJETS_METIER.md)
- [Guide UX/UI](../ux/GUIDE_UX_UI.md)
- [Charte d’interface](../ux/CHARTE_INTERFACE_ORIANA.md)
- [Fiches métier à développer](../referentiels/FICHES_METIER_A_DEVELOPPER.md)
- [Architecture du socle applicatif](../architecture/ARCHITECTURE_SOCLE_APPLICATIF.md)
- [Architecture documentaire](../architecture/ARCHITECTURE_DOCUMENTAIRE.md)
- [Sources métier et règles d’import](../referentiels/SOURCES_METIER_ET_IMPORT.md)
- [Audit stratégique du patrimoine](../audit/AUDIT_STRATEGIQUE_PATRIMOINE_ORIANA.md)
- [Audit interface / charte du 19 juillet 2026](../audit/AUDIT_INTERFACE_CHARTE_2026-07-19.md)
- [Audit PostgreSQL](../POSTGRESQL_AUDIT.md)
- [Revue de sécurité phase 1](../../SECURITY_REVIEW.md) — preuve historique au 14 juillet 2026
- [Guide de déploiement](../../deploy/README.md) — procédure d’exploitation, sans autorisation de déployer

## Principe de traçabilité

La chaîne cible est bidirectionnelle : Vision → principes → BORÉAL → ORMO → capacités → décisions
→ exigences → fonctionnalités → interfaces/API/agents/workflows → données → tests → code. Chaque
élément significatif doit expliquer son origine et permettre de retrouver sa réalisation.
