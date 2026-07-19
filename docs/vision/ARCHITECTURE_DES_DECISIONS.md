# Architecture des décisions orIAna

> Registre des décisions structurantes — version 2.0 — 19 juillet 2026.

Ce registre consigne les décisions acceptées. Une décision n’est jamais réécrite pour masquer son
historique : elle est remplacée par une nouvelle entrée qui la référence. Statuts : `acceptée`,
`transition`, `à spécifier`, `remplacée`.

| ID | Décision | Statut | Source | Conséquence principale |
|---|---|---|---|---|
| DEC-001 | orIAna est une plateforme d’organisation augmentée, pas un CRM | acceptée | vision validée, 2026-07-19 | le CRM devient un module |
| DEC-002 | Vision, BORÉAL, ORMO, Plateforme et Patrimoine sont cinq couches distinctes | acceptée | SRC-HIST-2026-07-19-01 | chaque évolution est qualifiée par couche |
| DEC-003 | Le patrimoine documentaire est un actif officiel | acceptée | mission Documentation v2.0 | documentation avant ou avec le code |
| DEC-004 | PostgreSQL est la source de vérité métier cible | transition | T-27 à T-30 | Grist reste autoritaire jusqu’au Go T-30 |
| DEC-005 | Grist n’est pas un référentiel métier cible | acceptée | T-27/T-31 | usage transitoire éditorial possible, connecteur remplaçable |
| DEC-006 | Le backend est l’unique porte d’accès du frontend | implémentée | T-02 à T-04 | secrets et autorisations côté serveur |
| DEC-007 | L’architecture reste un monolithe modulaire | acceptée | T-31 | pas de microservices prématurés |
| DEC-008 | n8n orchestre les traitements asynchrones | implémentée | T-12/T-20 | aucun appel IA bloquant depuis le frontend |
| DEC-009 | Une AI Gateway abstrait fournisseurs et modèles | cible validée | T-42 | routage, coût, confidentialité et secours centralisés |
| DEC-010 | L’Organisation Virtuelle comprend Experts Virtuels, Chief Agent et agents spécialisés | à spécifier | SRC-HIST-2026-07-19-01 | contrats et responsabilités avant code |
| DEC-011 | L’IA ne modifie ni patrimoine ni production sans gouvernance humaine | acceptée | Constitution | propositions séparées des validations |
| DEC-012 | Cinq rôles hiérarchiques structurent les droits actuels | implémentée | T-22A à T-22C | autorisations serveur testées |
| DEC-013 | Les connecteurs externes sont interchangeables | acceptée | T-31/T-42 | contrats internes stables |
| DEC-014 | La traçabilité est bidirectionnelle de la Vision au code | acceptée | SRC-HIST-2026-07-19-01 | référentiels et IDs de décision |
| DEC-015 | Un Expert de veille et d’évolution continue consolide les signaux sans agir seul | cible validée | SRC-HIST-2026-07-19-01 | propositions structurées, arbitrage humain |
| DEC-016 | La maturité patrimoniale doit être mesurée | à spécifier | SRC-HIST-2026-07-19-01 | nom, formule et seuils restent ouverts |

Les identifiants `SRC-HIST-*` sont décrits dans
[l’audit stratégique](../audit/AUDIT_STRATEGIQUE_PATRIMOINE_ORIANA.md).

## Fiches de décision

### DEC-004 — PostgreSQL et transition Grist

**Contexte.** T-27 à T-29 ont créé, sauvegardé, restauré et alimenté PostgreSQL. La production n’a
pas été basculée. **Décision.** PostgreSQL est la cible normative ; Grist demeure la source
opérationnelle tant que T-30 n’a pas reçu un Go humain. **Interdits.** Annoncer la bascule comme
faite, activer une double écriture durable ou retirer le retour arrière sans nouvelle décision.

### DEC-010 — Organisation Virtuelle

**Contexte.** L’historique conserve au moins 23 agents/Experts et plusieurs familles de veille,
métier, documentation et gouvernance. **Décision.** Préserver ce patrimoine sans imposer 23
workflows séparés. Le Chief Agent orchestre ; les Experts analysent un domaine ; les agents
techniques exécutent des tâches bornées. **Ouvert.** Inventaire canonique, contrats d’entrée/sortie,
mémoire, escalade, droits, coût et niveaux de service.

### DEC-015 — Expert de veille et d’évolution continue

Il surveille les évolutions technologiques, IA, cybersécurité, réglementaires, métier, concurrence,
coûts, usages, difficultés UX et incohérences documentaires. Il produit une proposition sourcée :
signal, confiance, impact, populations concernées, alignement, bénéfices, risques, coûts, documents
et composants touchés, arbitrages et priorité proposée. Il ne modifie rien automatiquement.

## Modèle pour une nouvelle décision

Une entrée comporte : identifiant, titre, contexte, options, décision, statut, autorité, date,
conséquences, documents touchés, preuves et décision remplacée le cas échéant.
