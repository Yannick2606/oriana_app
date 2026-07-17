# PLAN.md — Plan de construction orIAna (PHASE 1)

> Séquence de tâches, chacune un checkpoint vérifiable. Traiter **dans l'ordre**. Ne pas démarrer
> une tâche tant que la précédente n'est pas vérifiée, commitée, et STATUS.md à jour.
> Chaque tâche liste ses **critères d'acceptation** : la tâche n'est finie que si TOUS sont vrais.
> `[ ]` à faire · `[~]` en cours · `[x]` fait (mettre à jour au fil de l'eau, aussi dans STATUS.md).

## Jalon 0 — Fondations

### [x] T-00 : Initialiser le monorepo
- Créer l'arborescence : `/backend`, `/frontend`, et à la racine `.gitignore`, `.env.example`,
  `README.md`, `STATUS.md`.
- `.gitignore` exclut `.env`, `node_modules`, `dist`, `build`.
- `.env.example` liste (valeurs vides) : `GRIST_API_URL`, `GRIST_API_KEY`, `GRIST_DOC_ID`,
  `SESSION_SECRET`, `N8N_WEBHOOK_BASE_URL`, `N8N_SHARED_SECRET`, `PORT`, `FRONTEND_ORIGIN`.
- **Acceptation** : le dépôt s'installe (`npm install` dans chaque sous-dossier) sans erreur ;
  aucun secret réel n'est présent ; `.env` est bien ignoré.

### [x] T-01 : Préparer Grist (hors code — instruction humaine)
- Note dans STATUS.md : l'humain doit ajouter le champ `mot_de_passe_hash` (texte) à la table
  Utilisateurs dans Grist, et renseigner un hash bcrypt pour au moins un compte de test par rôle.
- **Acceptation** : STATUS.md contient la checklist Grist ; ne pas coder l'auth avant que
  l'humain ait confirmé l'ajout du champ.

## Jalon 1 — Backend : socle et accès Grist

### [x] T-02 : Squelette backend Express + client Grist
- Structure en couches : `src/routes`, `src/controllers`, `src/services`, `src/services/gristClient.js`.
- `gristClient.js` lit `GRIST_API_URL`, `GRIST_API_KEY`, `GRIST_DOC_ID` depuis l'environnement.
  Fonctions génériques : `list(table, filters)`, `getById(table, id)`, `create(table, data)`,
  `update(table, id, data)`. **La clé n'apparaît jamais ailleurs que dans ce module.**
- Endpoint santé `GET /health` → `{ status: 'ok' }`.
- **Acceptation** : `GET /health` répond ; `gristClient` lit une table de test ; lint + test passent ;
  aucune clé en dur.

### [x] T-03 : Authentification
- `POST /auth/login` : cherche l'utilisateur par email dans Grist, compare avec bcrypt, refuse si
  `actif=false`, permet le choix d'un rôle actif parmi les rôles attribués, puis émet la session
  (cookie httpOnly, signé avec `SESSION_SECRET`).
- `POST /auth/logout`, `GET /auth/me`.
- **Acceptation** : login OK avec bon mot de passe, 401 avec mauvais, 401 si inactif ; aucun mot
  de passe loggé ni renvoyé ; test unitaire sur les trois cas.

### [x] T-04 : Middlewares droits (le cœur sécurité)
- `requireAuth` (401 si pas de session).
- `scopeByRole` : consultant → filtre `gestionnaire = user.id` ; manager/admin → filtre
  `agence_id = user.agence_id`. Le rôle actif validé côté serveur fait foi. Appliqué à toutes
  les routes métier.
- **Acceptation** : test explicite — un consultant A ne récupère PAS une offre dont le
  gestionnaire est un consultant B, y compris en appelant `GET /offres/:id` directement (403).
  Ce test est obligatoire et doit passer.

## Jalon 2 — Backend : ressources métier

### [x] T-05 : CRUD patrimoine (Sites, Batiments, Cellules, Lots)
- Routes REST complètes pour les 4 entités, filtrées par `scopeByRole`, `agence_id` injecté à la
  création.
- **Acceptation** : on crée un Site→Bâtiment→Cellule→Lot liés ; un consultant ne voit que les
  siens ; lint + tests passent.

### [x] T-06 : Qualification EAV
- `GET /caracteristiques/dictionnaire?famille=&niveau=` (filtrage famille + niveau).
- `GET /caracteristiques-bien` et `POST /caracteristiques-bien`.
- **Acceptation** : le dictionnaire renvoie bien seulement les caractéristiques de la famille et
  du niveau demandés ; une valeur se saisit et se relit correctement.

### [x] T-07 : Offres + Conditions financières
- CRUD `offres` ; CRUD `conditions-financieres`. Gérer le cas `vente_et_location` = deux lignes
  de conditions liées à la même offre.
- **Acceptation** : on crée une offre double-nature avec deux jeux de conditions distincts,
  relus correctement.

### [x] T-08 : Mandats
- CRUD `mandats` avec les champs honoraires. Filtrage par rôle.
- **Acceptation** : création/lecture OK, périmètre respecté.

### [x] T-09 : CRM de base (Societes, Contacts, Demandes)
- CRUD des trois entités, liens Société↔Contacts, Demande↔Société/Contact.
- **Acceptation** : on crée une société, un contact rattaché, une demande ; filtrage par rôle OK.

### [x] T-10 : Lecture du matching
- `GET /matching?demande_id=` — lit les scores Grist, trie par `score_global` desc.
- **Acceptation** : renvoie une liste triée ; ne recalcule pas le score.

### [x] T-11 : Administration utilisateurs (admin)
- `GET|POST|PUT /utilisateurs` réservé admin. `POST` hache le mot de passe avant écriture.
- **Acceptation** : un non-admin reçoit 403 ; un admin crée un compte (mot de passe haché) et
  peut désactiver un compte.

### [x] T-12 : Contrat n8n (asynchrone)
- `POST /agents/:agent/declencher` (appelle le webhook n8n avec secret d'env, répond 202).
- `GET /agents/statut` (lit le statut dans Grist).
- Brancher **un** agent en démonstration (ex. le plus simple disponible).
- **Acceptation** : déclencher renvoie 202 sans bloquer ; le statut évolue et le résultat
  s'obtient une fois `termine` ; le secret n8n n'est jamais exposé.

## Jalon 3 — Frontend

### [x] T-13 : Squelette frontend (Vite + React + Tailwind + charte)
- Init Vite + React + Tailwind. Appliquer la charte (couleurs, logo orIAna, polices) via config
  Tailwind et un layout de base. Décor en CSS/SVG, aucune image externe.
- Client API centralisé (`src/api/`) qui parle au backend (jamais à Grist/n8n).
- **Acceptation** : `npm run build` passe ; l'écran affiche le logo et la charte ; aucune couleur
  interdite.

### [x] T-14 : Écran de connexion + gestion de session
- Page login, appel `POST /auth/login`, stockage de la session (via cookie httpOnly géré par le
  backend), redirection selon rôle. Garde de route (rediriger vers login si non authentifié).
- **Acceptation** : login fonctionne bout en bout ; un utilisateur non connecté ne peut pas
  atteindre les écrans protégés.

### [x] T-15 : Navigation par rôle
- Menu et écrans visibles selon le rôle (consultant / manager / admin). Rappel : le frontend
  masque par confort, la sécurité reste au backend.
- Un utilisateur multirôle peut changer de rôle actif depuis le profil sans se reconnecter ; le
  backend relit ses rôles actuels avant de mettre la session à jour.
- **Acceptation** : chaque rôle voit la navigation attendue ; aucun écran admin visible pour un
  consultant ; une bascule de rôle actualise immédiatement la navigation.

### [x] T-15A : Premier mot de passe obligatoire
- Ajouter par migration Grist versionnée, idempotente, sauvegardée et testée le booléen
  `doit_changer_mot_de_passe`, sans bloquer automatiquement les comptes existants.
- Toute création ou réinitialisation de mot de passe par un admin positionne ce champ à `true`.
- Après authentification, le backend bloque les routes métier tant que le mot de passe provisoire
  n'a pas été remplacé ; le frontend impose l'écran de changement avant tout accès à l'application.
- Le nouveau mot de passe est validé puis haché avec bcrypt ; aucune valeur en clair n'est stockée,
  journalisée ou renvoyée.
- **Acceptation** : un compte créé ou réinitialisé par l'admin ne peut accéder à aucune route
  métier avant le changement ; il y accède après modification et le drapeau repasse à `false`.

### [x] T-16 : Écran patrimoine (Site→Bâtiment→Cellule→Lot)
- Liste + fiche + création/édition de la hiérarchie.
- **Acceptation** : on parcourt et édite la hiérarchie complète depuis l'UI.

### [x] T-17 : Formulaire de qualification dynamique (EAV)
- Le formulaire lit `GET /caracteristiques/dictionnaire` selon la famille du bien et le niveau,
  et n'affiche que les caractéristiques pertinentes. Saisie → `POST /caracteristiques-bien`.
- **Acceptation** : un entrepôt et un plateau de bureaux affichent des champs différents, sans
  code en dur ; les valeurs se sauvegardent et se relisent.

### [x] T-18 : Écran offres (dont double nature) + conditions
- Fiche offre affichant les conditions selon la nature (vente / location / les deux).
- **Acceptation** : une offre double-nature affiche correctement ses deux jeux de conditions.

### [x] T-19 : Écrans CRM (Societes, Contacts, Demandes) + matching
- CRUD CRM + affichage des résultats de matching pour une demande.
- **Acceptation** : parcours complet société→contact→demande→matching visible.

### [x] T-20 : Déclenchement d'agent depuis l'UI (asynchrone)
- Un bouton déclenche un agent (`POST /agents/:agent/declencher`), l'UI affiche « traitement en
  cours », puis le résultat quand `statut=termine` (polling léger).
- **Acceptation** : l'UI ne fige jamais ; le résultat s'affiche à la fin.

## Jalon 4 — Consolidation

### [x] T-22A : Hiérarchie des rôles et rattachement d'équipe
- Migrer `manager` vers `master_consultant` et `admin` vers `admin_agence`, ajouter
  `directeur_agence` et `super_admin`, ainsi que `master_consultant_id` sur les utilisateurs.
- **Acceptation** : migration idempotente et sauvegardée ; rattachement uniquement entre un
  consultant et un master consultant actif de la même agence ; promotion super admin explicite.

### [x] T-22B : Autorisations équipe, agence et plateforme
- Consultant : ses données ; master consultant : son équipe ; directeur et admin d'agence :
  leur agence ; super admin : administration globale sans accès métier implicite.
- **Acceptation** : cloisonnements testés par appels API directs pour les cinq rôles.

### [x] T-22C : Organisation des équipes et blocage hiérarchique
- Le directeur organise les rattachements et bloque/réactive consultant et master consultant.
- L'admin d'agence gère les comptes de son agence ; seul le super admin gère les agences et
  attribue `super_admin`.
- **Acceptation** : aucun rôle ne peut administrer son niveau ou un niveau supérieur.

### [x] T-22D : Parcours adaptatif et espace Auto-formation
- Présentation à la première connexion, progression distincte par rôle, possibilité de passer,
  reprendre et relancer depuis l'espace Auto-formation.
- **Acceptation** : chacun des cinq rôles obtient un parcours adapté à ses droits réels.

### [x] T-21 : Revue de sécurité PHASE 1
- Vérifier chaque règle d'AGENTS.md §1. Rejouer le test de cloisonnement consultant.
- Vérifier qu'aucun secret n'est présent dans le dépôt (grep).
- **Acceptation** : toutes les règles de sécurité vérifiées ; test de cloisonnement vert ;
  aucun secret trouvé.

### [x] T-22 : README + STATUS final PHASE 1
- README : comment installer, configurer `.env`, lancer backend et frontend.
- STATUS.md : PHASE 1 close, liste de ce qui est prêt pour PHASE 2.
- **Acceptation** : un tiers peut installer et lancer le projet en suivant le README.

### [x] T-23 : Préparer le déploiement du frontend
- Autoriser strictement `FRONTEND_ORIGIN` sur l'API avec les cookies de session.
- Documenter le DNS, les variables publiques, le déploiement Docker et les contrôles réels.
- **Acceptation** : tests CORS verts et procédure reproductible pour publier
  `oriana.boreal.immo` sans exposer de secret.

### [x] T-24 : Corriger le contexte Docker de déploiement
- Inclure les sources frontend dans le contexte de build tout en excluant `frontend/dist`.
- Charger explicitement le `.env` racine lors des commandes Compose.
- **Acceptation** : les Dockerfiles disposent de tous leurs fichiers sources et Compose reçoit
  les variables publiques sans les inscrire dans le dépôt.

### [x] T-25 : Corriger les droits temporaires Nginx
- Attribuer les volumes temporaires du frontend à l'utilisateur non privilégié `nginx`.
- Conserver le système de fichiers en lecture seule et `no-new-privileges`.
- **Acceptation** : Nginx peut créer son cache et son PID sans exécution en root.

### [x] T-26 : Réinitialisation sécurisée par e-mail
- Ajouter « Mot de passe oublié », un lien unique valable 30 minutes et l'écran de remplacement.
- Envoyer via Google Workspace SMTP avec un mot de passe d'application uniquement dans `.env`.
- Stocker seulement le hash du jeton dans Grist et l'invalider après usage.
- **Acceptation** : aucune adresse n'est divulguée, le jeton est à usage unique et le nouveau
  mot de passe bcrypt permet la connexion.

## Jalon 5 — Migration vers PostgreSQL

### [x] T-27 : Auditer Grist et concevoir PostgreSQL
- Inventorier les tables, colonnes, références, formules, volumes et dépendances du backend.
- Produire le modèle relationnel cible, les règles de conversion et la stratégie d'identifiants.
- Définir les contrôles de rapprochement et le plan de retour arrière.
- **Acceptation** : chaque donnée Grist utile possède une cible ou une décision d'exclusion ;
  aucune formule métier n'est perdue ; le schéma et la stratégie de bascule sont documentés.

### [x] T-28 : Déployer PostgreSQL, migrations et sauvegardes
- Déployer PostgreSQL dans un réseau Docker privé, sans port public.
- Ajouter les migrations versionnées et une configuration exclusivement par variables d'environnement.
- Automatiser sauvegarde, rétention et contrôle d'intégrité, puis réussir un test de restauration.
- Remplacer le MemoryStore des sessions par un stockage PostgreSQL persistant.
- **Acceptation** : base inaccessible publiquement, migration reproductible, sauvegarde et
  restauration vérifiées, sessions persistantes et aucun secret dans le dépôt.

### [x] T-29 : Adapter le backend et migrer les données
- Introduire une couche de persistance PostgreSQL sans modifier les contrats API du frontend.
- Créer un import Grist idempotent avec journal des conversions et rejets.
- Invalider les sessions actives après réinitialisation d'un mot de passe.
- **Acceptation** : import rejouable, volumes et relations rapprochés, aucun appel Grist résiduel
  dans les parcours métier migrés et tests backend verts.
  - Validation réelle : 69 lignes issues des 19 tables Grist accessibles importées deux fois à
    volumes identiques, zéro rejet et zéro relation orpheline ; sauvegarde et restauration
    temporaire vérifiées ; backend PostgreSQL isolé et tests backend/CI verts.

### [ ] T-30 : Tester et basculer en production
- Tester les cinq rôles, les cloisonnements, tous les parcours métier et les agents asynchrones.
- Effectuer une répétition de bascule, une sauvegarde finale et un test de retour arrière.
- Passer Grist en lecture seule, migrer le delta final puis basculer le backend.
- **Acceptation** : rapprochement complet, tests verts, supervision active et décision Go/No-Go
  explicitement validée avant la bascule réelle.

## Jalon 6 — Reprise fonctionnelle

### [ ] T-31 : Reprioriser la suite métier
- Définir les critères d'acceptation des panneaux d'affichage, baux, diagnostics, documents,
  annonces, transactions, interactions et historique des négociations.
- **Acceptation** : ordre fonctionnel validé avant tout nouveau développement.

### [ ] T-32 : Marketing immobilier assisté par IA
- Utiliser Grist pour le calendrier éditorial, les brouillons et la validation humaine.
- Utiliser Brevo pour abonnements, segments, newsletters, préférences et désinscriptions.
- Utiliser n8n et l'IA pour proposer newsletters et publications adaptées aux réseaux sociaux.
- Conserver dans PostgreSQL la référence des consentements et vérifier la disponibilité des offres
  avant toute diffusion.
- **Acceptation** : consentement traçable, désinscription fonctionnelle, contenu validé par un
  humain et aucune offre indisponible publiée.

---

## Rappels transverses (valables pour toutes les tâches)
- Après chaque tâche : lint + build + tests de la zone, puis commit `[T-xx] …`, puis STATUS.md.
- Ne jamais coder PHASE 2/CIBLE.
- Ne jamais déplacer une décision de sécurité vers le frontend.
- Tout blocage ou ambiguïté → STATUS.md, ne pas inventer.
