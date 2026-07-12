# orIAna

Application d'intelligence pour l'immobilier d'entreprise — agence BORÉAL.

Monorepo : `/backend` (proxy Node/Express) + `/frontend` (React/Vite/Tailwind).
Base de données : Grist (externe). Agents : n8n (externes).

## Documents de pilotage (à lire avant de coder)
- `AGENTS.md` — comment l'agent doit opérer (règles de sécurité en tête).
- `SPEC.md` — quoi construire (exigences, schéma, endpoints).
- `PLAN.md` — l'ordre des tâches.
- `STATUS.md` — l'état vivant du projet.

## Installation (une fois `.env` renseigné à partir de `.env.example`)
```
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## Règle d'or
Aucun secret dans le dépôt. Tout passe par variables d'environnement (`.env`, ignoré par git).
