# Déploiement orIAna

Pré-requis : `api.boreal.immo` et `oriana.boreal.immo` pointent vers l'adresse IPv4 du VPS,
le réseau Docker `root_default` existe et Traefik utilise le résolveur de certificats
`mytlschallenge`.

Dans la zone DNS Hostinger, créer si nécessaire un enregistrement `A` : nom `oriana`, cible
l'adresse IPv4 du VPS. Ne pas placer de clé ou de secret dans le DNS.

Créer à la racine du dépôt un fichier `.env` non commité à partir de `.env.example`. Pour ce
déploiement, renseigner notamment :

- `GRIST_API_URL`, `GRIST_API_KEY`, `GRIST_DOC_ID` ;
- `SESSION_SECRET` avec une valeur aléatoire longue ;
- `N8N_WEBHOOK_BASE_URL` avec l'URL HTTPS de n8n ;
- `N8N_SHARED_SECRET` avec une valeur aléatoire différente ;
- `BACKEND_PUBLIC_URL=https://api.boreal.immo` ;
- `FRONTEND_ORIGIN=https://oriana.boreal.immo` ;
- `FRONTEND_HOST=oriana.boreal.immo` ;
- `VITE_API_BASE_URL=https://api.boreal.immo` ;
- `VITE_ORGANIZATION_NAME` avec le nom affiché actuel, modifiable sans refonte du code.
- `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER` et `MAIL_FROM` avec l'adresse
  Google Workspace d'envoi ;
- `SMTP_APP_PASSWORD` avec un mot de passe d'application Google, jamais le mot de passe du compte ;
- `FRONTEND_PUBLIC_URL=https://oriana.boreal.immo`.

Depuis la racine du dépôt sur le VPS :

```sh
docker compose --env-file .env -f deploy/docker-compose.yml up -d --build
docker compose --env-file .env -f deploy/docker-compose.yml ps
```

Contrôle attendu : `https://api.boreal.immo/health` répond `{"status":"ok"}`.

Ouvrir ensuite `https://oriana.boreal.immo` dans un navigateur et contrôler :

1. la connexion avec un compte de test ;
2. le remplacement obligatoire d'un mot de passe créé par un administrateur ;
3. le changement entre les rôles attribués ;
4. la déconnexion puis le refus d'accès aux écrans protégés.

Le contrôle CORS peut être vérifié sans afficher de secret :

```sh
curl -i -H 'Origin: https://oriana.boreal.immo' https://api.boreal.immo/health
```

La réponse doit contenir `Access-Control-Allow-Origin: https://oriana.boreal.immo` et
`Access-Control-Allow-Credentials: true`.

Après activation du workflow n8n `oriana-demonstration`, valider le cycle réel depuis la
racine du dépôt sur le VPS. Le contrôle crée puis supprime son propre suivi technique :

```sh
docker run --rm --network root_default --env-file .env \
  -v "$PWD/backend/scripts:/app/scripts:ro" \
  deploy-backend node scripts/checkAgentsLive.js
```
