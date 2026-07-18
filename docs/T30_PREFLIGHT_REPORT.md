# T-30 — Rapport de pré-contrôle

Généré le 2026-07-18T07:54:31.234Z. Ce rapport ne contient aucune valeur de secret et n'autorise pas une bascule.

## Résultat : **NO-GO**

## Contrôles automatisés

| Contrôle | État | Preuve |
|---|---|---|
| Backend — lint | VERT | commande réussie |
| Backend — tests | VERT | 96/97 réussis, 0 échec, 1 ignoré |
| Frontend — lint | VERT | commande réussie |
| Frontend — tests | VERT | 39 tests réussis |
| Frontend — build | VERT | commande réussie |

## Configuration

Seule la présence est contrôlée ; aucune valeur n’est lue dans le rapport.

| Variable | État |
|---|---|
| `POSTGRES_HOST` | manquante |
| `POSTGRES_PORT` | manquante |
| `POSTGRES_DB` | manquante |
| `POSTGRES_USER` | manquante |
| `POSTGRES_PASSWORD` | manquante |
| `SESSION_SECRET` | manquante |
| `FRONTEND_ORIGIN` | manquante |
| `BACKEND_PUBLIC_URL` | manquante |
| `FRONTEND_PUBLIC_URL` | manquante |
| `VITE_API_BASE_URL` | manquante |
| `N8N_WEBHOOK_BASE_URL` | manquante |
| `N8N_SHARED_SECRET` | manquante |

## Preuves externes

| Preuve | État |
|---|---|
| Copie chiffrée hors VPS vérifiée | manquante |
| Restauration chronométrée réussie | manquante |
| Recette réelle des cinq rôles signée | manquante |
| Agents asynchrones réels validés | manquante |
| Supervision et alertes testées | manquante |
| Retour arrière répété | manquante |

## Bloquants

- Configuration POSTGRES_HOST
- Configuration POSTGRES_PORT
- Configuration POSTGRES_DB
- Configuration POSTGRES_USER
- Configuration POSTGRES_PASSWORD
- Configuration SESSION_SECRET
- Configuration FRONTEND_ORIGIN
- Configuration BACKEND_PUBLIC_URL
- Configuration FRONTEND_PUBLIC_URL
- Configuration VITE_API_BASE_URL
- Configuration N8N_WEBHOOK_BASE_URL
- Configuration N8N_SHARED_SECRET
- Copie chiffrée hors VPS vérifiée
- Restauration chronométrée réussie
- Recette réelle des cinq rôles signée
- Agents asynchrones réels validés
- Supervision et alertes testées
- Retour arrière répété

## Rappel

Même sans bloquant, ce rapport signifie uniquement « prêt pour décision humaine ». Il ne vaut jamais autorisation de déployer, de geler Grist ou de basculer la production.
