# Référentiel des modules orIAna

> Cartographie produit — version 2.0 — 19 juillet 2026.

| Module | Responsabilité | État au 19/07/2026 | Prochaine référence |
|---|---|---|---|
| Socle plateforme | identité, rôles, agences, sessions, autorisations, audit, connecteurs | partiel | [architecture du socle](../architecture/ARCHITECTURE_SOCLE_APPLICATIF.md), T-33 |
| Patrimoine immobilier | sites, bâtiments, cellules, lots, qualification | implémenté phase 1 | T-30A, T-44 |
| Offres et mandats | commercialisation et conditions financières | implémenté phase 1 | T-30A, T-44 |
| CRM | sociétés, contacts, demandes, matching | implémenté de base | T-30A, T-35/T-36 |
| Agents IA | déclenchement, statut, callback asynchrone | démonstrateur implémenté | T-42 |
| Administration | utilisateurs, hiérarchie, agences et progression | partiel | T-30A/T-33 |
| Auto-formation | parcours adaptés aux rôles | implémenté | T-30A |
| Knowledge Center | connaissances, sources, décisions et apprentissages | à spécifier | plan futur à créer par arbitrage |
| Organisation Virtuelle | Experts, Chief Agent, missions et orchestration | à spécifier | plan futur à créer par arbitrage |
| Capture et boîte de réception | mobile, voix, OCR, validation | planifié | T-34 |
| Todolist et agenda | actions et engagements transverses | planifié | T-38 |
| Marketing et site | contenus, diffusion, consentements | planifié | T-39 |
| Portail prospect/client | espace externe cloisonné | planifié | T-40 |
| Veille | territoires, sources et signaux faibles | planifié | T-41 |
| AI Gateway | fournisseurs, coûts, quotas, secours | planifié | T-42 |
| Immobilier enrichi | baux, diagnostics, documents, transactions | planifié | T-44 |
| Fonds de commerce | objets et parcours spécifiques | planifié | T-45 |
| Messagerie relationnelle | conversations humaines, lectures et notifications | cible cadrée, après roadmap courante | T-46 |
| Bot client | assistance supervisée dans le portail et reprise humaine | cible cadrée, après T-40/T-42 | T-46 |

## Règles de modularité

- Les modules utilisent les services du socle et ne gèrent pas leur propre identité.
- Aucun module frontend n’appelle directement une base, n8n ou un fournisseur IA.
- Les connecteurs externes sont derrière des contrats internes.
- Un objet partagé possède une autorité et un cycle de vie uniques.
- Une extraction en service autonome exige une décision documentée ; le monolithe modulaire reste
  la valeur par défaut.
