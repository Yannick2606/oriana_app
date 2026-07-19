# Revue de sécurité PHASE 1

> Preuve historique au 14 juillet 2026. Les invariants actuels sont définis dans
> [`docs/vision/CONSTITUTION_ORIANA.md`](docs/vision/CONSTITUTION_ORIANA.md) et `AGENTS.md`.

Revue exécutée le 14 juillet 2026 sur T-00 à T-20.

| Règle | Contrôle | Résultat |
| --- | --- | --- |
| Aucun secret dans le dépôt | Recherche de clés, jetons, secrets, mots de passe et clés privées dans les fichiers suivis ; contrôle de `.gitignore` | Conforme |
| Clé Grist uniquement côté backend | Recherche de `grist`, `n8n`, `GRIST_*` et `N8N_*` dans `frontend/src` | Conforme |
| Droits appliqués côté serveur | Relecture des middlewares de routes et 17 tests ciblés consultant/hors périmètre/inter-agences | Conforme |
| Mots de passe protégés | bcrypt coût 12, hash omis des réponses, remplacement initial obligatoire, aucun stockage navigateur | Conforme |
| Webhooks n8n protégés | Secret d'environnement en en-tête, callback protégé et comparaison en temps constant | Conforme |
| Données externes non exécutées | Recherche d'`eval`, `Function`, `child_process`, `exec` et `spawn` dans les sources | Conforme |

Vérifications finales : 69 tests backend, 20 tests frontend, lint backend/frontend et build frontend réussis.
