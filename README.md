# orIAna

Application web d’intelligence pour l’immobilier d’entreprise. Le nom de l’organisation est
configurable et l’identité de l’application est centralisée pour permettre le futur changement
de nom de la société.

Le monorepo contient :

- `backend/` : API Node.js/Express, sessions et contrôle des autorisations ;
- `frontend/` : interface React/Vite/Tailwind ;
- Grist : source de vérité externe ;
- n8n : exécution externe des agents asynchrones.

Le frontend n’accède jamais directement à Grist ou à n8n.

## Prérequis

- Node.js 20 ou version ultérieure ;
- npm ;
- un document Grist conforme à `SPEC.md` et une clé de service ;
- une instance n8n pour utiliser les agents IA.

## Configuration

Créer les deux fichiers locaux ignorés par Git :

```bash
cp .env.example backend/.env
cp .env.example frontend/.env
```

Renseigner au minimum dans `backend/.env` :

- `GRIST_API_URL`, `GRIST_API_KEY`, `GRIST_DOC_ID` ;
- `SESSION_SECRET` avec une valeur longue et aléatoire ;
- `PORT` et `FRONTEND_ORIGIN` ;
- les variables `N8N_*` et `BACKEND_PUBLIC_URL` pour les agents ;
- `SUPER_ADMIN_EMAIL` uniquement pour la promotion initiale explicite.

Renseigner dans `frontend/.env` :

- `VITE_API_BASE_URL`, par exemple `http://localhost:3000` ;
- `VITE_ORGANIZATION_NAME` pour le nom affiché de l’organisation.

Ne jamais committer ces deux fichiers ni partager leurs valeurs dans les journaux.

## Installation

```bash
npm install --prefix backend
npm install --prefix frontend
```

## Lancement local

Dans un premier terminal :

```bash
npm run dev --prefix backend
```

Dans un second terminal :

```bash
npm run dev --prefix frontend
```

Ouvrir ensuite l’adresse indiquée par Vite. L’API de santé est disponible sur `GET /health`.

## Préparation de Grist

Les migrations utilisateurs sont versionnées, idempotentes et sauvegardent la structure avant
modification. En environnement connecté et après vérification des variables :

```bash
npm run prepare:utilisateurs --prefix backend
```

Les autres commandes `prepare:*` et `check:*` sont destinées à la préparation ou à la validation
des modules correspondants. Les workflows GitHub Actions exécutent les mêmes contrôles avec des
secrets configurés dans GitHub et conservent les sauvegardes comme artefacts.

## Vérifications

```bash
npm run lint --prefix backend
npm test --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
npm test --prefix frontend
```

## Rôles et sécurité

- consultant : ses propres données ;
- master consultant : ses données et la lecture de son équipe ;
- directeur d’agence : données et organisation de son agence ;
- administrateur d’agence : comptes et habilitations des niveaux inférieurs de son agence ;
- super administrateur : administration globale, sans accès métier implicite.

Les autorisations sont recalculées côté backend. Un mot de passe créé ou réinitialisé par un
administrateur doit être remplacé à la première connexion. La progression Auto-formation est
enregistrée dans Grist séparément pour chaque rôle actif.

## Documents du projet

- `SPEC.md` : exigences fonctionnelles et schéma ;
- `PLAN.md` : séquence des tâches ;
- `STATUS.md` : décisions et validations ;
- `SECURITY_REVIEW.md` : revue de sécurité de la phase 1 ;
- `AGENTS.md` : règles de contribution automatisée.
