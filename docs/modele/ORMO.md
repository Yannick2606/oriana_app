# ORMO — Modèle organisationnel d’orIAna

> Cadre conceptuel initial — version 2.0 — 19 juillet 2026 — statut : à spécifier.

ORMO formalise les **concepts, objets, relations et référentiels** sur lesquels l’organisation
raisonne. Il se situe entre la Méthode BORÉAL et la Plateforme : BORÉAL décrit le cycle ; ORMO
décrit ce qui circule dans ce cycle ; la Plateforme l’implémente.

Les sources historiques disponibles valident ce rôle, mais pas un métamodèle complet. Ce document
fixe donc le noyau minimal sans inventer de cardinalités ni de règles non arbitrées.

## Noyau conceptuel validé

| Concept | Rôle dans ORMO | État |
|---|---|---|
| Organisation | périmètre de responsabilité et de patrimoine | à détailler |
| Acteur | humain, équipe ou rôle autorisé | partiellement implémenté |
| Objet métier | entité sur laquelle l’organisation agit | partiellement implémenté |
| Signal | observation à qualifier avant usage | cible validée |
| Source | origine vérifiable d’une information | cible validée |
| Connaissance | information contextualisée, sourcée et gouvernée | à spécifier |
| Capacité | aptitude organisationnelle indépendante de la technologie | cible validée |
| Mission | objectif confié avec contexte, responsabilité et résultat | exploratoire à spécifier |
| Décision | arbitrage daté, attribué et justifié | documentairement implémenté |
| Action | exécution autorisée et mesurable | partiellement implémenté |
| Résultat | effet observé d’une action ou mission | à spécifier |
| Retour d’expérience | écart et apprentissage capitalisable | cible validée |
| Référentiel | vocabulaire et règles partagés | partiellement implémenté |

## Relations minimales

- un signal **provient de** source(s) et **concerne** un ou plusieurs objets ;
- un acteur ou Expert **qualifie/analyse** un signal selon des capacités et référentiels ;
- une proposition **alimente** une décision ;
- une décision **autorise, refuse ou diffère** une action ;
- une action **produit** un résultat mesuré ;
- un résultat **alimente** un retour d’expérience ;
- une connaissance validée **rejoint** le Knowledge Center avec ses droits et sa provenance.

## Frontières

ORMO ne contient pas les tables SQL, écrans, endpoints ou workflows : ils appartiennent à la
Plateforme et sont reliés par SPEC et les référentiels. ORMO ne définit pas non plus une ontologie
complète tant que les objets, règles de validation, temporalité, confidentialité et cycle de vie
n’ont pas été arbitrés.

## Travaux requis avant implémentation ORMO

1. valider le vocabulaire canonique et les identifiants ;
2. définir cycles de vie, relations et règles d’intégrité ;
3. définir provenance, confiance, temporalité et niveaux de validation ;
4. définir droits, confidentialité, conservation et audit ;
5. mapper ORMO aux objets PostgreSQL, API, capacités et Experts ;
6. fournir exemples et tests de conformité.
