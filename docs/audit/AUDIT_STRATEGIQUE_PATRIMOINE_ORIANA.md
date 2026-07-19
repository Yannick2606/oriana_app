# Audit stratégique du patrimoine orIAna

> Audit de couverture de la Documentation v2.0 — 19 juillet 2026.

## Sources contrôlées

- tous les Markdown présents dans la branche `agent/t30a-interactions` ;
- structure et contrats visibles du backend, du frontend et des migrations PostgreSQL ;
- trois exports historiques fournis le 19 juillet 2026 (`ORIANA1`, `ORIANA2`, `ORIANA3`) ;
- mission de consolidation Documentation v2.0.

| ID source | Source externe fournie | Apport utilisé |
|---|---|---|
| SRC-HIST-2026-07-19-01 | `ChatGPT - ORIANA1.pdf`, surtout p. 5–15 | couches, patrimoine, traçabilité, évolution continue |
| SRC-HIST-2026-07-19-02 | `ChatGPT - ORIANA2.pdf`, surtout p. 17–35 | idées à qualifier, audit annoncé et non retrouvé localement |
| SRC-HIST-2026-07-19-03 | `ChatGPT - ORIANA3.pdf`, surtout p. 2–10 | mission et architecture documentaire v2.0 |

Les historiques de conversation sont des sources contextuelles. Une formulation de conversation
ne vaut décision que si elle est explicitement qualifiée comme validée ou confirmée par le dépôt.
Le document d’audit et le commit évoqués dans ORIANA2 ne sont pas présents dans le clone local ;
leur contenu complet n’est donc pas présumé.

## Diagnostic avant consolidation

| Sujet | État observé | Traitement v2.0 |
|---|---|---|
| Identité produit | réduite à une application immobilière/CRM | plateforme d’organisation augmentée rétablie |
| Hiérarchie documentaire | quatre fichiers racine seulement | Vision → BORÉAL → ORMO → Plateforme → Patrimoine |
| PostgreSQL/Grist | formulations contradictoires | cible normative séparée de l’état opérationnel |
| Organisation Virtuelle | absente du dépôt | décision conservée, contrats marqués à spécifier |
| AI Gateway | présente uniquement dans PLAN T-42 | décision et frontière documentées |
| Traçabilité | journal riche mais sans registre d’architecture | registre DEC créé |
| Objets/modules | dispersés entre SPEC, PLAN et code | référentiels de navigation créés |
| UX/UI | Design System technique | guide d’expérience transverse ajouté |
| Gouvernance documentaire | règles partielles dans AGENTS | autorité et cycle formalisés |
| Maturité patrimoniale | absente | principe conservé, calcul non inventé |

## Couverture des principes validés

Les éléments suivants sont désormais représentés : cinq couches structurantes ; familles et
niveaux de validation ; capacités avant fonctionnalités ; patrimoine conceptuel et logiciel ;
documentation avant développement ; traçabilité bidirectionnelle ; Organisation Virtuelle ;
Expert de veille et d’évolution continue ; gouvernance humaine ; indépendance IA ; transition
PostgreSQL/Grist ; exploitation humaine et IA des documents ; maturité patrimoniale.

## Éléments conservés sans validation silencieuse

La méthode ANAMY, les principes attribués à Michael Aguilar, l’Agent « Valeur », le Dossier
Intelligent, les Missions détaillées, l’inventaire exhaustif des Experts et les métriques précises
de maturité apparaissent dans l’historique comme idées, orientations ou contenus externes non
disponibles intégralement dans le dépôt. Ils ne deviennent pas des exigences. Ils devront être
confrontés à leurs sources propriétaires avant intégration.

## Dette et arbitrages ouverts

1. définir les contrats du Knowledge Center, de l’Organisation Virtuelle et du Chief Agent ;
2. produire l’inventaire canonique des Experts/agents en préservant l’historique des « 23 » ;
3. compléter ORMO avec cycles de vie, provenance, confiance, droits et temporalité ;
4. définir la mesure de maturité patrimoniale ;
5. décider l’usage résiduel exact de Grist après T-30 ;
6. intégrer ou écarter explicitement ANAMY et les sources marketing après revue des documents ;
7. achever T-30A et la recette humaine avant toute bascule.

## Limite de l’audit

Cet audit établit la couverture du patrimoine disponible, pas l’exhaustivité de toutes les
conversations passées. Toute nouvelle source sera confrontée au présent référentiel selon le guide
de gouvernance, sans réécriture silencieuse des décisions.
