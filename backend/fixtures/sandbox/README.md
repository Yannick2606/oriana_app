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
est demandé avec `NODE_ENV=production`. L’authentification et les contrôles de rôle restent ceux du
backend ; le jeu ne contient aucun mot de passe et n’est jamais utilisé comme autorité d’accès.
Une fois le frontend local démarré, ajouter `?sandbox=1` à son URL active l’affichage de ces données
dans la fiche Offre. Sans ce paramètre, l’application continue d’utiliser les routes métier réelles.
Le mode utilise une session mémoire locale et ne requiert pas PostgreSQL, mais une configuration
d’authentification valide reste indispensable pour se connecter ; elle n’est jamais fournie par le
jeu de démonstration.

Les photographies associées sont stockées sous `frontend/public/demo/offres`. Elles ont été
générées pour le bac à sable, ne comportent ni logo, ni enseigne, ni personne identifiable, et ne
représentent pas un bâtiment réel déterminé.
