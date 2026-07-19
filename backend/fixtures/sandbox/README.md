# Jeu de démonstration local

Ce répertoire contient des données entièrement fictives destinées au bac à sable orIAna. Les
communes et départements sont réels pour donner un contexte territorial crédible ; les identités,
adresses précises, bâtiments, sociétés, offres et montants ne décrivent aucune affaire réelle.

Régénération déterministe depuis la racine du dépôt :

```text
npm run generate:sandbox --prefix backend
```

La commande remplace uniquement `backend/fixtures/sandbox/data.json` par le résultat déterministe
de `backend/src/sandbox/createSandboxData.js`. Elle ne lit ni n’écrit Grist ou PostgreSQL, ne charge
aucun secret et n’effectue aucun import automatique.

Pour démarrer le backend avec le jeu en lecture seule :

```text
npm run start:sandbox --prefix backend
```

Ce démarrage définit uniquement `ORIANA_SANDBOX_MODE=1`. Le serveur refuse de démarrer si ce mode
est demandé avec `NODE_ENV=production`. Il exige aussi `SESSION_SECRET`, `SANDBOX_USER_EMAIL` et
`SANDBOX_PASSWORD_HASH`, ce dernier contenant un hash bcrypt fourni hors dépôt. Le jeu ne contient
aucun mot de passe ni hash et n’est jamais utilisé comme autorité d’accès.
Une fois le frontend local démarré, ajouter `?sandbox=1` à son URL active l’affichage de ces données
dans les espaces Offre et CRM. Sans ce paramètre, l’application continue d’utiliser les routes
métier réelles.
Le mode utilise une session et une persistance fictive en mémoire : il ne requiert et ne contacte ni
Grist ni PostgreSQL. Les cinq rôles métier sont disponibles sur le compte fictif, mais les droits et
périmètres restent contrôlés côté serveur. Toute écriture métier est refusée.

Le CRM fictif couvre uniquement les contrats existants de phase 1 : sociétés, contacts, demandes
et résultats de matching vers les lots du jeu Offre. Il ne simule ni tunnel configurable, ni
action, ni transaction tant que leurs contrats métier et techniques ne sont pas spécifiés.

Le profil distant isolé et ses prérequis sont documentés dans `deploy/PREVIEW.md`. Il n’est jamais
déployé automatiquement.

Les photographies associées sont stockées sous `frontend/public/demo/offres`. Elles ont été
générées pour le bac à sable, ne comportent ni logo, ni enseigne, ni personne identifiable, et ne
représentent pas un bâtiment réel déterminé.
