# Prévisualisation isolée orIAna

Ce profil permet une recette temporaire de l’interface avec les données fictives de T-32. Il ne
doit pas être confondu avec la production et n’est jamais lancé automatiquement.

## Garanties et limites

- aucun accès à Grist, PostgreSQL ou n8n ;
- données chargées en mémoire depuis `backend/fixtures/sandbox/data.json` ;
- un seul compte fictif pouvant sélectionner les cinq rôles métier ;
- toutes les écritures métier et les opérations sur le mot de passe sont refusées côté serveur ;
- sessions en mémoire, donc perdues au redémarrage du backend ;
- noms de conteneurs gérés par un projet Compose distinct, sans volume de production.

Le profil ne doit pas être exposé avant création de deux noms DNS dédiés et validation de leur
isolement. Les identifiants de prévisualisation ne doivent jamais être réutilisés ailleurs.

## Configuration hors dépôt

Créer à la racine du dépôt un fichier `.env.preview`, déjà exclu par `.gitignore`, avec des valeurs
propres à cette prévisualisation :

```dotenv
PREVIEW_FRONTEND_HOST=
PREVIEW_API_HOST=
SESSION_SECRET=
SANDBOX_USER_EMAIL=
SANDBOX_PASSWORD_HASH=
VITE_ORGANIZATION_NAME=
```

`SESSION_SECRET` doit être long et aléatoire. `SANDBOX_PASSWORD_HASH` doit être un hash bcrypt ; le
mot de passe en clair ne doit apparaître ni dans ce fichier, ni dans la commande Compose, ni dans
les journaux. Protéger le fichier au niveau du système d’exploitation et ne jamais en afficher le
contenu lors d’un contrôle.

Ne pas renseigner les variables Grist, PostgreSQL ou n8n : le démarrage doit rester indépendant de
ces systèmes.

## Commandes manuelles, après autorisation explicite

Depuis la racine du dépôt sur l’hôte de prévisualisation :

```sh
docker compose --env-file .env.preview -p oriana-preview \
  -f deploy/docker-compose.preview.yml up -d --build
docker compose --env-file .env.preview -p oriana-preview \
  -f deploy/docker-compose.preview.yml ps
```

Contrôler ensuite le endpoint `/health` du sous-domaine API, puis ouvrir le sous-domaine frontend
avec `?sandbox=1`. La connexion doit d’abord proposer les cinq rôles. Les écrans métier sont
consultables selon le périmètre du rôle choisi ; toute tentative d’écriture doit répondre
`SANDBOX_READ_ONLY`.

L’arrêt ou la suppression du profil reste une action distincte à autoriser. Aucun workflow GitHub
Actions ne déploie ce fichier.
