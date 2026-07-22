# PLAN.md — Feuille de route orIAna

> Version 2.0 — 19 juillet 2026. Séquence de tâches, chacune un checkpoint vérifiable. Traiter **dans l'ordre**. Ne pas démarrer
> une tâche tant que la précédente n'est pas vérifiée, commitée, et STATUS.md à jour.
> Chaque tâche liste ses **critères d'acceptation** : la tâche n'est finie que si TOUS sont vrais.
> `[ ]` à faire · `[~]` en cours · `[x]` fait (mettre à jour au fil de l'eau, aussi dans STATUS.md).
> Les tâches antérieures à T-22A conservent les noms historiques `manager` et `admin` ; T-22A les
> remplace par `master_consultant` et `admin_agence` et ajoute les rôles canoniques actuels.

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
- DEC-041 précise la matrice actuelle : les administrateurs d'agence et de plateforme voient
  Accueil, Auto-formation et Administration sans modules métier ; le sélecteur de rôle est unique
  dans l'en-tête et le rappel latéral reste non interactif.
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

### [~] T-30A : Rendre l'application réellement utilisable avant bascule
- **Epics** : EPIC 1 — Plateforme & Infrastructure, avec EPIC 2 — Identité & Sécurité,
  EPIC 3 — CRM, EPIC 4 — Immobilier d'affaires, EPIC 10 — Administration et
  EPIC 11 — API & Intégrations.
- Auditer sur desktop et smartphone chaque bouton, formulaire, navigation et retour d'erreur des
  parcours connexion, patrimoine, offres, CRM, matching, agents et administration.
- Corriger les actions non cliquables et vérifier les parcours réels avec chacun des cinq rôles,
  sans déplacer les autorisations hors du backend.
- Ajouter les tests frontend de non-régression couvrant les actions principales, puis réaliser une
  recette humaine guidée sur le bac à sable.
- La [couverture automatisée T-30A](docs/audit/AUDIT_COUVERTURE_AUTOMATISEE_T30A_2026-07-20.md)
  est verte et ferme les commandes d’écriture trompeuses de Patrimoine, Administration et Agents
  IA en prévisualisation. Elle ne remplace pas la recette humaine.
- Exécuter la [matrice de recette T-30A](docs/audit/MATRICE_RECETTE_T30A.md). La prévisualisation
  T-32 reste strictement en lecture seule ; les scénarios d’écriture exigent un environnement de
  recette distinct, réinitialisable et explicitement autorisé avant sa création, conformément à
  DEC-037 et à la composition progressive DEC-038. L’admissibilité du VPS actuel doit être établie
  par le [protocole de capacité et d’isolation](docs/architecture/PROTOCOLE_CAPACITE_ISOLATION_VPS_T30A.md)
  avant toute préparation de R1.
- **Acceptation** : aucun bouton sans effet, les parcours prioritaires sont réalisables de bout en
  bout au clavier, à la souris et sur smartphone, lint/build/tests sont verts et la recette humaine
  autorise explicitement la préparation de T-30.

### [ ] T-30 : Tester et basculer en production
- Tester les cinq rôles, les cloisonnements, tous les parcours métier et les agents asynchrones.
- Effectuer une répétition de bascule, une sauvegarde finale et un test de retour arrière.
- Passer Grist en lecture seule, migrer le delta final puis basculer le backend.
- **Acceptation** : rapprochement complet, tests verts, supervision active et décision Go/No-Go
  explicitement validée avant la bascule réelle.

## Jalon 6 — Socle modulaire et bac à sable

### [x] T-31 : Reprioriser la suite métier et arrêter la vision modulaire
- Organiser orIAna autour d'un socle commun réutilisable et de modules indépendants : CRM,
  immobilier d'entreprise, fonds de commerce, marketing/site, todolist et veille.
- Faire de la fiche relation à 360°, de la boîte de réception universelle et du « prochain geste
  recommandé » les principes directeurs de l'expérience utilisateur.
- Maintenir PostgreSQL comme future source de vérité métier ; après T-30, Grist devient un outil
  éditorial transitoire et optionnel, jamais une dépendance fonctionnelle obligatoire.
- **Acceptation** : vision, ordre de réalisation et exigences transverses consignés avant tout
  développement du nouveau périmètre. Décision validée lors des échanges produit de juillet 2026.

### [x] T-31A : Consolider le patrimoine documentaire v2.0
- Établir la hiérarchie Vision → BORÉAL → ORMO → Plateforme → Patrimoine et le registre des
  décisions, sans transformer les idées historiques en exigences validées.
- Réaligner AGENTS, CDC, SPEC, PLAN et STATUS ; créer uniquement les référentiels nécessaires à
  la compréhension autonome du projet.
- Vérifier les liens, la cohérence cible/réel, les doublons, le Markdown et l’absence de secrets.
- **Acceptation** : un nouvel arrivant comprend la philosophie, l’architecture, l’état réel et les
  règles sans conversation historique ; rapport présenté et commit documentaire unique autorisé.
- **État** : contenu contrôlé et validation humaine reçue le 19 juillet 2026.

### [x] T-32 : Enrichir le bac à sable
- Créer un jeu fictif cohérent couvrant les cinq rôles et les contrats existants de phase 1 :
  sociétés, contacts, demandes, bâtiments, lots, offres et rapprochements.
- Ajouter des photographies d'immeubles utilisables légalement et stockées par orIAna, sans URL
  externe fragile ni donnée personnelle réelle.
- Fournir un chargement idempotent, réinitialisable et strictement séparé de la production.
- Fournir un profil de prévisualisation isolé, sans connecteur externe ni écriture métier, dont les
  identifiants restent exclusivement dans l’environnement de l’hôte.
- Reproduire uniquement sous identités fictives les distributions et réaffectations utiles des
  sources décrites dans `docs/referentiels/SOURCES_METIER_ET_IMPORT.md` ; aucun profil réel n’est
  créé dans le bac à sable.
- Ne pas simuler les capacités dont les contrats restent à spécifier. Le socle des tâches relève de
  T-33, les tunnels de T-35, les interactions de T-36, la todolist de T-38 et les alertes de veille
  de T-41 ; leurs données fictives seront ajoutées avec leur implémentation respective.
- **Acceptation** : prévisualisation isolée et réaliste des contrats disponibles, cinq rôles
  accessibles sous identité fictive, relations cohérentes, médias visibles, aucune donnée réelle,
  écritures refusées et régénération documentée. Toute capacité non implémentée est signalée comme
  indisponible sans résultat simulé.
- **État** : prévisualisation déployée, contrôlée et validée humainement le 19 juillet 2026 ; tâche
  close après clarification de la répartition des capacités futures.

### [x] T-33 : Extraire le socle applicatif réutilisable
- Isoler identité, rôles, agences, fichiers, notifications, audit, préférences, consentements,
  tâches, capture et connecteurs externes derrière des contrats stables.
- Préserver un monolithe modulaire déployable simplement ; aucune multiplication prématurée des
  services ni dépendance directe d'un module métier à un fournisseur externe.
- **Acceptation** : frontières documentées, dépendances contrôlées et tests existants conservés.
- **État** : lots T-33A à T-33F terminés le 20 juillet 2026 ; frontières, ports, contrats et
  contrôle automatisé sont en place sans bascule de persistance ni fournisseur IA.

#### [x] T-33A : Cartographier et fixer les frontières du socle
- Inventorier les dépendances entre composition applicative, modules métier, persistance et
  connecteurs ; attribuer à chaque contrat une autorité et un propriétaire uniques.
- Documenter les ports internes sans créer de service autonome ni de nouvel objet métier.
- **Acceptation** : cartographie vérifiable, dépendances autorisées explicites et aucun changement
  de comportement applicatif.
- **État** : cartographie, ports internes, responsabilités, règles de dépendance et écarts consignés
  le 19 juillet 2026 sans modification du code.

#### [x] T-33B : Consolider identité, rôles et autorisations
- Regrouper normalisation des rôles, périmètres agence/équipe/utilisateur et politiques de lecture
  ou d'écriture derrière le socle, sans faire du frontend une autorité.
- Injecter l'accès aux utilisateurs et rattachements au lieu de prévoir un fournisseur implicite.
- **Acceptation** : appels directs testés pour les cinq rôles, absence d'accès métier implicite du
  super administrateur et comportement de session existant conservé.
- **État** : référentiel d'identité injecté, groupes de rôles centralisés et politiques de lecture,
  écriture, gestion d'agence et administration vérifiées le 19 juillet 2026.

#### [x] T-33C : Découpler la persistance métier de Grist
- Faire dépendre les modules d'un port de persistance injecté par la composition applicative ;
  conserver Grist comme fournisseur opérationnel actuel et PostgreSQL comme cible non basculée.
- Retirer les valeurs de repli vers Grist des services et middlewares exécutés par les modules.
- **Acceptation** : mêmes contrats exercés avec les doubles de test, le bac à sable et les
  fournisseurs existants, sans bascule T-30 ni régression fonctionnelle.
- **État** : port injecté explicitement, sélection du fournisseur limitée à la composition et
  vocabulaire interne neutralisé le 19 juillet 2026 ; Grist reste le fournisseur opérationnel.

#### [x] T-33D : Encapsuler les connecteurs externes
- Placer SMTP, n8n et les futurs fournisseurs derrière des ports internes configurés au démarrage,
  avec délais, erreurs explicites et secrets maintenus hors des données métier.
- Ne pas intégrer de fournisseur IA dans ce lot ; préparer seulement la frontière utilisée plus
  tard par T-34D, T-36 et T-42.
- **Acceptation** : aucun service métier ne construit directement une URL fournisseur ou un client
  réseau ; les indisponibilités restent testables sans appel externe.
- **État** : ports de messagerie et d’orchestration injectés, adaptateurs SMTP et n8n composés au
  démarrage, délais et erreurs vérifiés le 20 juillet 2026 ; aucun fournisseur IA intégré.

#### [x] T-33E : Spécifier les objets transverses encore absents
- Définir avant code l'autorité, le cycle de vie, les droits, la conservation et les contrats API
  d'Audit, Notification, Préférence, Consentement, Fichier, Tâche et Capture.
- Reporter leurs tables et interfaces tant que chaque contrat n'a pas été validé.
- **Acceptation** : arbitrages consignés dans les documents d'autorité, sans table, donnée ou
  capacité simulée créée prématurément.
- **État** : contrats du socle validés le 20 juillet 2026 ; leurs paramètres métier,
  réglementaires et de conservation restent à préciser dans chaque tâche d’implémentation.

#### [x] T-33F : Protéger et vérifier les frontières
- Ajouter des contrôles automatisés empêchant les imports interdits entre modules, persistance et
  connecteurs, puis exécuter l'ensemble des vérifications backend et frontend.
- **Acceptation** : contrôles de frontières reproductibles, lint, tests et build existants verts,
  avec limites restantes consignées.
- **État** : contrôle Node sans dépendance ajouté au lint backend, cinq imports inversés corrigés ;
  vérifications backend et frontend réussies le 20 juillet 2026.

## Jalon 7 — Usage mobile, CRM et pilotage commercial

### [~] T-34 : Capture mobile, voix, OCR et boîte de réception
- Proposer une PWA smartphone avec capture explicite « signal terrain », « article/document » et
  « carte de visite », import de photo, fonctionnement hors ligne et commentaire vocal.
- Extraire les données par OCR, conserver source/date/auteur/niveau de confiance, détecter les
  doublons et maintenir chaque capture en brouillon privé jusqu'à validation humaine.
- Prévoir masquage des données de tiers inutiles, rétention limitée des médias bruts et rattachement
  à un territoire, client, opportunité, tâche ou idée éditoriale.
- Permettre de conserver l'original signé d'un Mandat comme Fichier versionné du socle, sans champ
  binaire ni URL permanente dans l'objet métier.
- **Acceptation** : aucune donnée extraite n'est publiée ou versée définitivement sans validation ;
  les erreurs de faible confiance sont signalées et la source reste traçable.
- **Prérequis d’activation** : développement isolé autorisé, mais production interdite avant le Go
  T-30, la validation des droits et rétentions, et la restauration du stockage objet.
- **État** : cadrage et ordre T-34A à T-34E validés le 20 juillet 2026 ; aucun composant de capture,
  stockage, OCR ou IA n’est encore implémenté.

#### [~] T-34A : Socle documentaire
- Définir métadonnées, droits, versions, empreintes, quarantaine et stockage objet privé compatible
  S3 selon `docs/architecture/ARCHITECTURE_DOCUMENTAIRE.md`.
- **Acceptation** : originaux hors disque applicatif permanent, accès backend contrôlé, formats et
  limite de 20 Mo testés, restauration documentée.
- **État** : proposition de spécification et matrice de recommandations rédigées le 20 juillet
  2026 ; le profil audio, les quotas, la conservation et les rattachements initiaux sont acceptés
  par DEC-018 à DEC-021. DEC-040 ajoute Mandat comme cinquième cible future, avec un premier parcours
  PDF signé borné à 20 Mo. DEC-022 retient un adaptateur ClamAV isolé pour la preuve, avec POC avant
  activation. Le stockage reste reporté à la qualification Qaegis et constitue l’arbitrage restant.
  L’audit d’implémentation délimite un premier lot pur : catalogues, politiques, erreurs et contrats
  de ports, sans route, migration, fournisseur ou activation. Ce premier lot est implémenté et
  testé ; aucune capacité active n’en résulte.

#### [~] T-34B : Brouillons multi-appareil
- Synchroniser les brouillons smartphone et bureau avec versions et conflits explicites, sans
  écrasement silencieux ; la géolocalisation est absente du premier contrat.
- **Acceptation** : un dossier commencé sur smartphone est repris sur ordinateur et un conflit
  concurrent est détecté puis résolu explicitement.
- **État** : contrat et matrice d’arbitrage validés le 20 juillet 2026. Le premier lot est
  implémenté sous forme pure : validation de version, erreur de conflit et extension du port de
  lecture, sans migration, route, interface ou stockage local. DEC-023 fixe la version initiale à
  `1` et son incrément à `1` par mutation réussie ; DEC-024 impose `version_attendue` dans le JSON
  du `PATCH` ; DEC-025 fixe une réponse `409` sûre après contrôle des droits ; DEC-026 interdit le
  forçage et la fusion automatique ; DEC-027 permet une copie explicite en nouveau brouillon sans
  recopier les fichiers ; DEC-028 rend la création idempotente pendant 24 heures ; DEC-029 fixe
  `listByAuthor`, son cloisonnement, son tri et ses limites de pagination. DEC-030 borne les champs
  modifiables au type catalogué, au commentaire facultatif de 2 000 caractères et au rattachement
  proposé contrôlé. DEC-031 maintient le premier lot strictement en ligne, sans donnée métier
  persistée dans le navigateur avant validation d’un modèle de menace. DEC-032 exclut entièrement
  la géolocalisation du premier contrat. Les dix arbitrages et le lot pur sont validés ; toute
  persistance, route, interface ou activation reste soumise à une validation explicite distincte.
  L’audit statique du socle PostgreSQL est consigné : mécanismes de migration, CI et restauration
  réutilisables. DEC-033, étendue par DEC-040, retient cinq références facultatives avec une cible
  au maximum et détachement lors de sa suppression. DEC-034 retient un registre d’idempotence séparé, limité aux
  empreintes, borné par auteur et agence et expirant après 24 heures. DEC-035 fixe un curseur
  chiffré et authentifié valable 15 minutes, lié au périmètre et sans valeur sensible dans le dépôt.
  DEC-036 fixe une transaction courte et un verrou de ligne pour produire une mutation unique ou un
  conflit cohérent. Les quatre arbitrages de persistance sont clos ; toute préparation de migration
  ou d’adaptateur exige encore une autorisation distincte.

#### [ ] T-34C : Envoi résilient
- Permettre interruption, reprise et contrôle d’intégrité des envois sans retransmettre les parties
  déjà reçues ; isoler tout fichier incomplet ou refusé.
- **Acceptation** : coupure réseau simulée, reprise réussie, empreinte vérifiée et aucun fichier
  partiel exposé comme document valide.
- **Premier cas métier** : PDF signé de Mandat, 20 Mo maximum, envoyé sans doublon puis placé en
  quarantaine avant toute consultation.

#### [ ] T-34D : Analyse asynchrone
- Orchestrer antivirus, OCR et IA en arrière-plan avec états visibles, provenance, confiance,
  erreurs récupérables et contenu traité comme donnée non fiable.
- **Acceptation** : interface non bloquante, reprise après échec et aucune instruction issue d’un
  document exécutée comme consigne système.
- **Dépendance IA** : ports et OCR peuvent être développés ici ; l’analyse générative attend
  l’AI Gateway T-42 ou une décision d’architecture transitoire explicite.

#### [ ] T-34E : Validation et expérience mobile
- Présenter les propositions extraites, leurs sources et différences, puis exiger une validation
  humaine avant écriture métier ou publication.
- **Acceptation** : parcours tactile et clavier validé ; refus, correction et validation sont
  tracés ; test de capacité réalisé avec 30 utilisateurs simultanés.
- La fiche Offre/Mandat expose l'ajout, les états, la version courante et les versions antérieures
  uniquement lorsque la capacité documentaire réelle est disponible et autorisée.

### [ ] T-35 : CRM par tunnels configurables
- Permettre plusieurs tunnels de vente, leurs étapes, règles de passage, motifs de perte et KPI.
- Mesurer conversion, durée par étape, qualité de qualification, origine, relances, engagements et
  performance des processus et consultants sans produire de notation opaque.
- Réserver création/modification des tunnels au directeur d'agence, avec délégation explicite,
  révocable et auditée.
- **Acceptation** : droits serveur testés, historique des changements conservé et analyse possible
  par tunnel, agence, équipe et consultant.

### [ ] T-36 : Assistant d'interaction et prochain geste recommandé
- Après un échange, privilégier une dictée smartphone ; transcrire, structurer le compte rendu,
  détecter engagements, dates et tâches, puis faire confirmer toute écriture.
- Fournir au consultant et au manager des analyses, alertes et pistes d'amélioration expliquées,
  contestables et sans décision automatique engageante.
- **Acceptation** : texte brut conservé, modifications IA visibles, engagements confirmés et chaque
  recommandation accompagnée de ses éléments justificatifs.

### [ ] T-37 : Carte de visite et premier contact simple
- Scanner la carte, rechercher les doublons, rattacher le contexte dicté et proposer un message de
  bienvenue très court, dicté ou choisi dans un modèle validé.
- Parcours cible : scanner, dicter, vérifier le destinataire, envoyer ; aucun envoi automatique.
- Enregistrer la remise volontaire de la carte comme source du suivi relationnel attendu, sans la
  convertir automatiquement en consentement marketing général ; gérer séparément information,
  opposition et préférences par canal.
- **Acceptation** : message relu avant envoi, preuve du contexte conservée, absence d'inscription
  automatique à une campagne et désactivation simple de tout suivi ultérieur.

### [ ] T-38 : Todolist et agenda transversal
- Centraliser tâches manuelles et proposées par l'IA, échéances, responsables, rappels et liens vers
  les fiches CRM ou métier.
- **Acceptation** : aucune tâche IA n'est créée silencieusement et chaque engagement validé peut
  devenir une action suivie.

## Jalon 8 — Marketing, portail et veille

### [ ] T-39 : Marketing, site, blog et diffusion multicanale
- Construire le site institutionnel et un blog publiant des extraits d'annonces qui conduisent vers
  une connexion, une recherche enregistrée ou une prise de contact avec le consultant.
- Gérer charte éditoriale, calendrier, brouillons IA, validation humaine, réseaux sociaux, email et
  WhatsApp lorsque le cadre contractuel et réglementaire le permet.
- Cibler prospects/clients, communauté, futurs talents et futurs franchisés sans mélanger leurs
  finalités ni leurs préférences.
- Utiliser PostgreSQL pour les références et consentements ; Grist, Brevo et n8n restent des
  connecteurs remplaçables, non des sources métier obligatoires.
- **Acceptation** : désinscription et préférences fonctionnelles, provenance des contenus traçable,
  droits de publication vérifiés et aucune offre indisponible diffusée.

### [ ] T-40 : Portail prospect et client
- Permettre consultation des informations réservées, recherches sauvegardées, alertes, critères,
  documents, rendez-vous, retours et préférences de communication.
- **Acceptation** : cloisonnement client testé, exposition minimale des données et historique des
  consentements accessible.

### [ ] T-41 : Veille territoriale, portefeuille et signaux terrain
- Abonner consultant ou manager à des territoires, thèmes et clients ; agréger sources autorisées,
  photos de panneaux, articles photographiés et observations dictées.
- Séparer faits sourcés, résumé et interprétation IA ; dater, géolocaliser seulement avec accord,
  qualifier la confiance et proposer rattachements, alertes ou tâches.
- **Acceptation** : sources et droits conservés, article complet jamais republié sans autorisation,
  alerte personnalisable et aucune interprétation présentée comme un fait.

## Jalon 9 — Gouvernance de l'IA et sécurité renforcée

### [ ] T-42 : Passerelle IA indépendante et pilotage des consommations
- Faire appeler tous les fournisseurs par une interface orIAna unique ; conserver prompts, formats,
  évaluations et données dans notre socle, sans dépendre de la mémoire d'un fournisseur.
- Router selon usage, qualité, confidentialité, coût et disponibilité ; prévoir modèle principal,
  secours, mode économique, file d'attente et fonctionnement essentiel sans IA.
- Mesurer requêtes, tokens, audio, images, coût, latence, erreurs, quotas et budgets par agence,
  utilisateur, module, usage, fournisseur et modèle, avec alertes configurables.
- **Acceptation** : changement de fournisseur démontré par configuration, plafonds respectés et
  aucune fonction essentielle bloquée par l'indisponibilité d'un modèle.

### [ ] T-43 : Intégrer la future couche Epineon
- Réserver un connecteur de sécurité interchangeable entre la passerelle orIAna et les services
  externes, sans inventer le contrat Epineon avant réception de sa documentation.
- Évaluer alors hébergement, protocoles, filtrage, prévention d'exfiltration et d'injection,
  conservation, performances, reprise, journalisation et articulation RGPD.
- Conserver parallèlement chiffrement, segmentation, mises à jour, contrôle d'accès, sauvegardes et
  supervision : aucune couche unique n'est considérée comme une protection absolue.
- **Acceptation** : flux sensibles bloqués par défaut selon la politique validée, aucun secret ou
  contenu métier dans les journaux et tests de panne/contournement réussis.

## Jalon 10 — Modules métier enrichis

### [ ] T-44 : Immobilier d'entreprise
- Reprendre panneaux d'affichage, baux, diagnostics, documents, annonces, transactions,
  interactions et historique des négociations sur le socle commun.
- Développer les fiches Offre, Terrain et CRM selon les vues, adaptations vente/location,
  relations et champs consolidés dans
  `docs/referentiels/FICHES_METIER_A_DEVELOPPER.md`.
- Arbitrer avant code l'objet Terrain autonome, la relation Demande–Offre et les contrats des
  Actions, Visites, Transactions, Documents, Annonces, Publications et Panneaux.
- Appliquer `docs/ux/CHARTE_INTERFACE_ORIANA.md` sans reproduire le graphisme des sources
  historiques utilisées pour le contenu.
- **Acceptation** : critères métier et contrats techniques validés avant code ; huit vues Offre,
  cinq vues CRM et parcours Terrain testés avec données réelles autorisées, droits serveur,
  responsive et accessibilité.

### [ ] T-45 : Fonds de commerce
- Spécifier le vocabulaire, les données, documents, valorisations, mandats, confidentialité et
  parcours propres aux fonds de commerce sans dupliquer le CRM, le marketing ou les tâches.
- **Acceptation** : périmètre métier validé et composants communs effectivement réutilisés.

## Jalon 11 — Relation client augmentée

### [ ] T-46 : Messagerie relationnelle, notifications et bot client
- Implémenter après les développements déjà planifiés une messagerie humaine cloisonnée, ses
  compteurs de non-lus et ses notifications dans l'application.
- Ouvrir ensuite les conversations autorisées au portail prospect/client T-40, avec partage minimal,
  consentements applicables et reprise humaine explicite.
- N'activer le bot client supervisé qu'au travers de l'AI Gateway T-42. Il répond uniquement depuis
  les informations accessibles au client, s'identifie comme IA et ne réalise aucune action métier
  engageante.
- Suivre le séquencement et les frontières de
  `docs/architecture/CADRAGE_T46_MESSAGERIE_BOT_CLIENT.md` ; les pièces jointes et canaux externes
  restent hors du premier lot.
- **Acceptation** : droits serveur et isolement testés par appels directs, historique restaurable,
  non-lus cohérents, notifications non sensibles, reprise humaine sans perte de contexte et
  messagerie humaine disponible sans IA.

## Backlog d’architecture à planifier après arbitrage

Ces décisions sont validées mais ne reçoivent pas ici de numéro ni de priorité arbitraire :

- détailler ORMO et les contrats du Knowledge Center ;
- spécifier l’Organisation Virtuelle, le Chief Agent et l’inventaire canonique des Experts ;
- spécifier l’Expert de veille et d’évolution continue ;
- définir la mesure de maturité patrimoniale.

Leur ordonnancement sera décidé après T-30A/T-30 et les tâches déjà planifiées, puis inscrit dans
ce fichier avec des critères d’acceptation avant tout code.

---

## Rappels transverses (valables pour toutes les tâches)
- Après chaque tâche : lint + build + tests de la zone, puis commit `[T-xx] …`, puis STATUS.md.
- Ne jamais coder une cible ou un module avant sa tâche, ses contrats et ses validations.
- Ne jamais déplacer une décision de sécurité vers le frontend.
- Mettre à jour la décision et la documentation d’autorité avant ou avec le code.
- Tout blocage ou ambiguïté → STATUS.md, ne pas inventer.
