# Déploiement du backend orIAna

Pré-requis : `api.boreal.immo` pointe vers le VPS, le réseau Docker `root_default` existe et
Traefik utilise le résolveur de certificats `mytlschallenge`.

Créer à la racine du dépôt un fichier `.env` non commité à partir de `.env.example`. Pour ce
déploiement, renseigner notamment :

- `GRIST_API_URL`, `GRIST_API_KEY`, `GRIST_DOC_ID` ;
- `SESSION_SECRET` avec une valeur aléatoire longue ;
- `N8N_WEBHOOK_BASE_URL` avec l'URL HTTPS de n8n ;
- `N8N_SHARED_SECRET` avec une valeur aléatoire différente ;
- `BACKEND_PUBLIC_URL=https://api.boreal.immo` ;
- `FRONTEND_ORIGIN` avec l'URL du frontend lorsqu'elle sera disponible.

Depuis la racine du dépôt sur le VPS :

```sh
docker compose -f deploy/docker-compose.yml up -d --build
docker compose -f deploy/docker-compose.yml ps
```

Contrôle attendu : `https://api.boreal.immo/health` répond `{"status":"ok"}`.

Après activation du workflow n8n `oriana-demonstration`, valider le cycle réel depuis la
racine du dépôt sur le VPS. Le contrôle crée puis supprime son propre suivi technique :

```sh
docker run --rm --network root_default --env-file .env \
  -v "$PWD/backend/scripts:/app/scripts:ro" \
  deploy-backend node scripts/checkAgentsLive.js
```
