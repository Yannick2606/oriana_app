# orIAna

orIAna est une **plateforme d’organisation augmentée**, initialement construite pour BORÉAL dans
l’immobilier d’affaires. Le CRM et l’immobilier sont des modules du produit ; ils ne définissent
pas seuls sa finalité. La référence intellectuelle commence dans
[`docs/vision/README_DOCUMENTATION.md`](docs/vision/README_DOCUMENTATION.md).

Le monorepo contient :

- `backend/` : API Node.js/Express, sessions et contrôle des autorisations ;
- `frontend/` : interface React/Vite/Tailwind ;
- PostgreSQL : source de vérité métier cible, préparée mais non basculée ;
- Grist : source opérationnelle historique pendant la transition T-30 ;
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

## Transition PostgreSQL

La source métier reste Grist tant que `PERSISTENCE_PROVIDER=grist`. Après application des
migrations PostgreSQL, le contrôle à blanc et l'import se lancent séparément :

```bash
npm run migrate:postgres --prefix backend
npm run validate:import:grist --prefix backend
npm run import:grist:postgres --prefix backend
```

Le contrôle à blanc n'écrit pas dans Grist. L'import est idempotent et transactionnel : tout
rejet annule les écritures métier. `PERSISTENCE_PROVIDER=postgres` ne doit être activé qu'après
sauvegarde, rapprochement complet, test de restauration et validation explicite de la bascule.

## Vérifications

```bash
npm run lint --prefix backend
npm test --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
npm test --prefix frontend
```

## Déploiement Docker

La procédure VPS, le DNS, les variables attendues et les contrôles après publication sont
documentés dans `deploy/README.md`. Le frontend public prévu est
`https://oriana.boreal.immo` ; son libellé d'organisation reste configurable.

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

- [`README_DOCUMENTATION.md`](docs/vision/README_DOCUMENTATION.md) : index, ordre de lecture et
  autorité documentaire ;
- [`CDC.md`](CDC.md) : capacités et exigences métier ;
- [`SPEC.md`](SPEC.md) : contrats techniques et données ;
- [`PLAN.md`](PLAN.md) : séquence des tâches ;
- [`STATUS.md`](STATUS.md) : état, décisions et preuves ;
- [`SECURITY_REVIEW.md`](SECURITY_REVIEW.md) : revue historique de la phase 1 ;
- [`AGENTS.md`](AGENTS.md) : règles d’exécution dans le dépôt.
