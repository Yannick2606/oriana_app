# SPEC.md — Spécification exécutable orIAna

> Version 2.0 — 19 juillet 2026. Ce fichier fait foi sur les contrats techniques, le schéma de
> données et les API. Le [CDC](CDC.md) fait foi sur les capacités métier ; la
> [Constitution](docs/vision/CONSTITUTION_ORIANA.md) sur les invariants ; `STATUS.md` sur l’état
> observé. Ne pas implémenter un comportement non spécifié.

---

## 1. Objectif et périmètre

orIAna est une plateforme d’organisation augmentée dont l’immobilier d’affaires constitue le
premier module. L’implémentation actuelle comporte :

1. **Backend** (Node.js/Express) — détient les secrets, authentifie, applique les droits et expose
   les contrats internes vers la persistance et les connecteurs.
2. **Frontend** (React + Vite + Tailwind) — interface, vues par rôle.
3. **PostgreSQL** — source de vérité métier cible, accessible uniquement par le backend.
4. **n8n** (externe, existant) — agents d'intelligence, appelés par webhook.

Pendant la transition, Grist reste la source de vérité de production. La bascule vers PostgreSQL
n'intervient qu'après migration contrôlée, rapprochement complet et validation du retour arrière.
Après la bascule, Grist est réservé au pilotage marketing et éditorial ; il ne porte plus les
données métier de référence.

La phase 1 est implémentée. T-30A audite actuellement son utilisabilité ; T-30 n’autorise pas encore
la bascule. Les piliers Knowledge Center, ORMO, Organisation Virtuelle, Chief Agent et AI Gateway
sont des cibles validées dont les contrats détaillés restent à spécifier avant code.

## 2. Contraintes techniques imposées

- Backend : Node.js 20+, Express. Structure en couches (routes → contrôleurs → services →
  persistance/connecteurs). Tests `node:test`, lint ESLint.
- Frontend : React (fonctionnel + hooks), Vite, Tailwind CSS. Pas de state manager externe en
  PHASE 1.
- Communication : le frontend appelle exclusivement le backend en HTTPS/JSON. Le backend utilise
  la couche de persistance et les connecteurs n8n/IA. Le frontend n’appelle jamais directement une
  base, Grist, n8n ou un fournisseur IA.
- Secrets : variables d'environnement uniquement (voir `.env.example`). Rien dans le dépôt.
- Architecture : monolithe modulaire ; connecteurs externes derrière des contrats internes.

## 3. Rôles et droits (exigence centrale)

Les cinq rôles canoniques actuels sont :

| Rôle | Type | Périmètre de visibilité |
|------|------|-------------------------|
| consultant | interne | ses données métier |
| master_consultant | interne | ses données et lecture de son équipe active |
| directeur_agence | interne | données métier et organisation de son agence |
| admin_agence | interne | comptes et habilitations des niveaux inférieurs de son agence |
| super_admin | interne | administration globale, sans accès métier implicite |

**Règle d'or** : le filtrage s'applique **côté serveur**, à chaque requête. Un `consultant`
n'obtient jamais, via l'API, une donnée dont il n'est pas gestionnaire, même s'il forge la requête.
Le `agence_id`, les rattachements et le rôle actif sont relus/appliqués côté serveur. Les alias
historiques `manager` et `admin` ne sont conservés que pour la migration. Le futur rôle externe du
portail T-40 sera spécifié séparément.

## 4. Modèle de données (PHASE 1)

> Modèle métier canonique de la phase 1. Les migrations `backend/sql` en portent l’implémentation
> PostgreSQL et `legacy_grist_id` conserve le rapprochement. Durant la transition, les tables Grist
> restent la référence de production ; aucune double écriture durable ne doit être introduite sans
> stratégie explicite.
> Convention : `PK` identifiant · `FK→` référence · `[]FK→` liste de références.
> **Toutes les tables métier portent `agence_id`.**

### Utilisateurs
`id` PK · `nom` · `prenom` · `email` (unique) · `mot_de_passe_hash` (bcrypt) · `roles` multiple
(consultant|master_consultant|directeur_agence|admin_agence|super_admin) · `agence_id` FK→Agences ·
`master_consultant_id` FK→Utilisateurs · `actif` bool · `progression_formation` ·
`derniere_connexion` · `doit_changer_mot_de_passe` bool · `reset_mot_de_passe_hash` texte
(SHA-256) · `reset_mot_de_passe_expiration` texte (ISO 8601).
> L'API expose `roles` ; la colonne technique existante dans Grist reste `role` (ChoiceList).
> Un utilisateur peut cumuler plusieurs rôles. S'il en possède plusieurs, il choisit un
> `role_actif` autorisé lors de la connexion. La session conserve ce rôle actif et le backend
> applique uniquement son périmètre jusqu'à la déconnexion ou au changement de session.

### Agences
`id` PK · `nom` · `adresse` FK→Adresses · `responsable` FK→Utilisateurs · `actif` bool.

### Ref_Roles
`id` PK · `code` · `perimetre`.

### Adresses
`id` PK · `adresse_formatee` · `latitude` · `longitude` · `code_postal` · `ville` ·
`infos_acces` · `photos` []image · `agence_id` FK→Agences.

### Sites
`id` PK · `nom` · `adresse_id` FK→Adresses · `surface_terrain` · `section_cadastrale` ·
`parcelles` []texte · `divisible` bool · `reserve_fonciere` bool · `servitudes` texte ·
`en_bloc` bool · `gestionnaire` FK→Utilisateurs · `agence_id`.

### Batiments
`id` PK · `site_id` FK→Sites · `nom` · `numero` · `annee_construction` · `surface_totale` ·
`etat` enum · `divisible` bool · `copropriete` bool · `erp` bool · `igh` bool ·
`erp_categorie` · `erp_type` · `destination_plu` · `decret_tertiaire` bool · `photos` []image ·
`gestionnaire` FK→Utilisateurs · `agence_id`.

### Cellules
`id` PK · `batiment_id` FK→Batiments · `nom` · `numero` · `surface` · `etage` enum ·
`type_bien` FK→Ref_Familles · `photos` []image · `gestionnaire` FK→Utilisateurs · `agence_id`.

### Lots
`id` PK · `nom` · `numero` · `cellules` []FK→Cellules · `site_id` FK→Sites (si terrain nu) ·
`surface` · `divisible` bool · `nombre_parking` · `en_bloc` bool ·
`gestionnaire` FK→Utilisateurs · `agence_id`.

### Ref_Familles
`id` PK · `code` (logistique|activite|bureaux|commerce|terrain|locaux_sociaux) · `libelle`.

### Ref_Categories_Carac
`id` PK · `libelle` (SITE|BATIMENT|ENTREPOT|BUREAUX|COMMERCE|…) · `ordre`.

### Ref_Caracteristiques  (dictionnaire)
`id` PK · `libelle` · `categorie_id` FK→Ref_Categories_Carac · `familles` []FK→Ref_Familles ·
`niveaux` enum multiple (batiment|cellule|lot) · `type_valeur` (bool|nombre|texte|liste) ·
`unite` · `ordre`.

### Caracteristiques_Bien  (valeurs, polymorphe)
`id` PK · `caracteristique_id` FK→Ref_Caracteristiques · `niveau` (batiment|cellule|lot) ·
`batiment_id` FK→Batiments · `cellule_id` FK→Cellules · `lot_id` FK→Lots ·
`valeur_bool` · `valeur_nombre` · `valeur_texte` · `agence_id`.
> Un seul des `*_id` est renseigné, selon `niveau`. Le formulaire n'affiche que les
> caractéristiques dont `familles` contient la famille du bien ET dont `niveaux` contient le
> niveau édité.

### Offres
`id` PK · `numero` · `nom` · `lot_id` FK→Lots · `nature` (vente|location|vente_et_location) ·
`type_contrat` enum · `occupation` (libre|occupe) · `stade_commercialisation` enum ·
`gestionnaire` FK→Utilisateurs · `co_gestionnaires` []FK→Utilisateurs · `agence_id`.

### Conditions_Financieres
`id` PK · `offre_id` FK→Offres · `type` (vente|location) · `prix_vente` · `loyer_ht_m2_an` ·
`loyer_global_an` · `charges_ht_m2_an` · `depot_garantie` · `taxe_fonciere` · `teom` · `cfe` ·
`taux_net_initial` · `taux_net_potentiel` · `disponibilite`.
> Une offre `vente_et_location` a **deux** lignes Conditions_Financieres (une par `type`).

### Mandats
`id` PK · `numero` · `numero_registre` · `offre_id` FK→Offres · `societe_mandante` FK→Societes ·
`type` (exclusif|simple|co-mandat) · `nature` (vente|location) · `avancement` enum ·
`date_debut` · `date_fin` · `honoraires_mode` · `honoraires_montant` · `honoraires_charge` ·
`gestionnaire` FK→Utilisateurs · `donnee_exclusive` bool · `agence_id`.

### Societes
`id` PK · `raison_sociale` · `enseigne` · `siren` · `siret` · `code_ape` · `libelle_ape` ·
`forme_juridique` · `capital` · `effectif_salarie` · `adresse_siege` FK→Adresses ·
`contact_principal` FK→Contacts · `type_relation` (proprietaire|prospect|preneur|partenaire) ·
`gestionnaire` FK→Utilisateurs · `donnee_exclusive` bool · `agence_id`.

### Contacts
`id` PK · `nom` · `prenom` · `fonction` · `email` · `tel` · `mobile` · `societe_id` FK→Societes ·
`gestionnaire` FK→Utilisateurs · `donnee_exclusive` bool · `agence_id`.

### Demandes
`id` PK · `societe_id` FK→Societes · `contact_id` FK→Contacts ·
`nature_transaction` (vente|location|les_deux) · `familles` []FK→Ref_Familles ·
`surface_min` · `surface_max` · `budget_min` · `budget_max` · `secteur_geo` ·
`criteres_specifiques` · `gestionnaire` FK→Utilisateurs · `donnee_exclusive` bool · `agence_id`.

> Sociétés, Contacts, Demandes et Mandats sont exclusifs à la création. Le gestionnaire peut lever
> l’exclusivité ; directeur et administrateur d’agence peuvent la lever ou la réactiver dans leur
> agence. Une donnée non exclusive est lisible dans l’agence, mais reste modifiable par son
> gestionnaire ou ces deux rôles. Le master consultant n’obtient qu’une lecture de son équipe.

### Matching
`id` PK · `demande_id` FK→Demandes · `lot_id` FK→Lots · `score_global` · `scores_detail`.
> Les quatre scores Grist existants sont des valeurs historiques. L’audit réel n’a trouvé aucune
> formule active à traduire. Le backend les **lit** sans recalcul ; tout futur moteur de matching
> doit être spécifié et validé sur un oracle métier avant remplacement.

## 5. Contrats d'API (backend-proxy)

Toutes les routes métier exigent une session valide. Exceptions : `/health`, connexion, demande et
réalisation d’une réinitialisation de mot de passe, et callback n8n protégé par son secret dédié. Le
backend déduit `user`, `role_actif` et `agence_id` de la session puis filtre en conséquence.
Réponses en JSON.
Codes : 200 OK · 201 créé · 400 requête invalide · 401 non authentifié · 403 interdit ·
404 introuvable · 500 erreur serveur.

En déploiement séparé, l'API autorise uniquement l'origine exacte définie par
`FRONTEND_ORIGIN`, avec les cookies de session. Toute autre origine navigateur est refusée ;
les appels serveur sans en-tête `Origin` restent possibles pour n8n et les contrôles internes.

### Authentification
- `POST /auth/login` — body `{ email, mot_de_passe, role_actif? }` → vérifie bcrypt, refuse si
  `actif=false`. Si plusieurs rôles sont attribués et que `role_actif` est absent, renvoie la
  liste des rôles afin que l'utilisateur en choisisse un. Le backend refuse tout rôle actif non
  attribué à l'utilisateur, puis émet un jeton de session (cookie httpOnly recommandé).
  Réponse authentifiée `{ user: {id, nom, prenom, roles, role_actif} }`.
- `POST /auth/logout` — invalide la session.
- `GET /auth/me` — renvoie l'utilisateur courant (ou 401).
- `POST /auth/role` — body `{ role_actif }` ; relit le compte dans la persistance, vérifie qu'il est
  toujours actif et que le rôle est toujours attribué, puis met à jour la session. Aucun nouveau
  mot de passe n'est demandé tant que la session est valide.
- `POST /auth/mot-de-passe/premiere-connexion` — body `{ nouveau_mot_de_passe }` ; uniquement
  pour une session portant `doit_changer_mot_de_passe=true`. Hache la nouvelle valeur avec
  bcrypt, désactive le drapeau puis met à jour la session.
- `POST /auth/mot-de-passe/demande` — body `{ email }` ; répond toujours de façon générique,
  crée un jeton aléatoire valable 30 minutes pour un compte actif et envoie le lien par SMTP.
  La persistance ne conserve que le hash SHA-256 du jeton.
- `POST /auth/mot-de-passe/reinitialisation` — body `{ token, nouveau_mot_de_passe }` ; vérifie
  le hash et l'expiration, remplace le hash bcrypt puis invalide immédiatement le jeton.

### Middleware (à appliquer sur toutes les routes protégées)
- `requireAuth` — rejette 401 si pas de session valide.
- `scopeByRole` — utilise exclusivement le `role_actif` validé côté serveur : consultant → ses
  données ; master consultant → ses données et lecture de son équipe ; directeur/admin d’agence →
  leur agence ; super admin → aucun accès métier implicite. Ce périmètre s’applique à chaque
  lecture/écriture.
- `requirePasswordChanged` — bloque avec `PASSWORD_CHANGE_REQUIRED` toutes les routes métier
  d'une session utilisant encore un mot de passe provisoire. Les routes de changement et de
  déconnexion restent accessibles.

### Ressources métier (patron REST identique pour chaque entité)
Pour chaque ressource ci-dessous : `GET /{ressource}` (liste filtrée par rôle),
`GET /{ressource}/:id` (403 si hors périmètre), `POST /{ressource}` (crée avec `agence_id` de
l'utilisateur), `PUT /{ressource}/:id` (403 si hors périmètre), `DELETE /{ressource}/:id`
(directeur ou administrateur d’agence selon la ressource).

Ressources PHASE 1 : `sites`, `batiments`, `cellules`, `lots`, `offres`,
`conditions-financieres`, `mandats`, `societes`, `contacts`, `demandes`.

### Bac à sable Offre
- `GET /sandbox/offres` — jeu fictif en lecture seule, disponible uniquement lorsque
  `ORIANA_SANDBOX_MODE=1`, après authentification et calcul d’un périmètre métier valide.
- Le mode est refusé avec `NODE_ENV=production`. Il remplace les connecteurs externes par une copie
  en mémoire du jeu fictif et exige `SANDBOX_USER_EMAIL` ainsi qu’un `SANDBOX_PASSWORD_HASH`
  bcrypt fournis hors dépôt. Il ne contacte jamais Grist, PostgreSQL ou n8n.
- Le compte fictif propose les cinq rôles métier. Les contrôles d’authentification, de rôle et de
  périmètre restent appliqués côté serveur ; toute écriture métier ou opération sur son mot de
  passe répond `403 SANDBOX_READ_ONLY`.
- Le frontend l’utilise uniquement avec le paramètre local `?sandbox=1`. Sans ce paramètre, les
  routes métier habituelles restent la seule source de données.

### Qualification (EAV)
- `GET /caracteristiques/dictionnaire?famille=&niveau=` — renvoie les caractéristiques du
  dictionnaire filtrées par famille et niveau (pour construire le formulaire dynamique).
- `GET /caracteristiques-bien?niveau=&id=` — valeurs saisies pour un bien donné.
- `POST /caracteristiques-bien` — enregistre une valeur (un `*_id` selon `niveau`).

### Matching
- `GET /matching?demande_id=` — renvoie les lots scorés pour une demande (lecture des valeurs
  historiques de la persistance), triés par `score_global` décroissant.

### Administration hiérarchique
- `GET|POST|PUT /utilisateurs` — réservé à `directeur_agence`, `admin_agence` et `super_admin`,
  avec leurs limites hiérarchiques respectives. `POST` hache le mot de passe (bcrypt)
  avant écriture et impose son remplacement initial. `PUT` peut désactiver (`actif=false`).
- `PUT /utilisateurs/:id/mot-de-passe` — réinitialisation administrative ; hache la nouvelle valeur et
  repositionne obligatoirement `doit_changer_mot_de_passe=true`.

### Intégration n8n (contrat asynchrone — voir §6)
- `POST /agents/:agent/declencher` — body `{ objet_type, objet_id }`. Le backend appelle le
  webhook n8n correspondant (secret partagé), renvoie `202 Accepted` + un identifiant de suivi.
  Le résultat n'est PAS attendu de façon synchrone.
- `GET /agents/statut?objet_type=&objet_id=` — renvoie l'état du traitement (lu dans la persistance :
  en_attente|en_cours|termine|erreur) et le résultat si `termine`.
- Démonstration PHASE 1 : agent `demonstration`, limité aux objets `demande`, webhook fixe
  `{N8N_WEBHOOK_BASE_URL}/webhook/oriana-demonstration`.
- `POST /agents/callback` — appelé par n8n avec le secret partagé ; le backend écrit le résultat
  dans la persistance. Aucun connecteur de données n’est exposé à n8n.

### Traitements_Agents
`id` PK · `suivi_id` · `agent` · `objet_type` · `objet_id` · `statut_traitement`
(en_attente|en_cours|termine|erreur) · `resultat` · `message_erreur` · `agence_id` FK→Agences ·
`user_id` FK→Utilisateurs · `date_creation` · `date_mise_a_jour`.

## 6. Contrat d'intégration n8n (asynchrone, à respecter dès le socle)

Principe : un agent peut mettre plusieurs secondes à minutes. On ne bloque jamais l'utilisateur.

1. Le frontend déclenche via `POST /agents/:agent/declencher`.
2. Le backend appelle le webhook n8n (URL + secret depuis l'environnement), en passant
   `objet_type`, `objet_id`, `agence_id`, `user_id`. Il répond immédiatement `202` au frontend.
3. n8n travaille, puis appelle le callback backend protégé. Le backend écrit son résultat dans
   la persistance et met `statut_traitement` à `termine` (ou `erreur`).
4. Le frontend interroge `GET /agents/statut` (polling léger) jusqu'à `termine`, puis affiche
   le résultat. Pendant ce temps, l'UI montre « traitement en cours », sans figer.

Ne jamais implémenter d'appel n8n synchrone bloquant. La persistance est la boîte aux lettres du
résultat ; n8n ne détient aucun accès direct à la source de vérité.

## 7. Découpage et statut

- **PHASE 1 (implémentée, recette T-30A en cours)** : auth, rôles/droits, CRUD patrimoine
  (Sites→Lots), qualification EAV, offres/conditions, mandats, CRM de base (Societes, Contacts,
  Demandes), lecture matching, administration utilisateurs et contrat n8n avec un agent de
  démonstration.
- **Modules planifiés** : Baux, Diagnostics, Documents, Annonces, Transactions, Interactions,
  Actions, Copropriété, honoraires détaillés, historique CRM complet.
- **Cible plateforme à spécifier** : Knowledge Center, ORMO détaillé, Organisation Virtuelle,
  Chief Agent, Experts Virtuels et AI Gateway.

Ne pas anticiper leur code avant critères et contrats validés. Ne rien coder qui empêche leur ajout.

## 8. Critères de recette de la base actuelle

- Un utilisateur peut se connecter, et selon son rôle, voit un périmètre correct (testé).
- Un consultant ne peut PAS accéder aux données d'un autre consultant, même via appel API direct
  (test de sécurité explicite exigé).
- On peut créer un bien complet (Site→Bâtiment→Cellule→Lot), le qualifier via le formulaire
  dynamique filtré par famille, créer une offre vente_et_location avec deux jeux de conditions.
- On peut créer une société, un contact, une demande, et afficher le matching scoré.
- Le déclenchement d'un agent n8n fonctionne en asynchrone (déclencher → statut → résultat).
- lint + build + tests passent sur backend et frontend.

## 9. Transition PostgreSQL et marketing assisté par IA

- PostgreSQL devient la source de vérité pour l'authentification, les droits et toutes les données
  métier après une bascule réversible et contrôlée.
- Les sauvegardes automatiques, la rétention, le chiffrement des accès et un test réel de
  restauration sont obligatoires avant la bascule.
- L’usage résiduel de Grist après bascule doit être explicitement décidé ; il peut éventuellement
  piloter calendrier éditorial, brouillons et validations sans redevenir une source métier.
- Un connecteur de diffusion tel que Brevo peut gérer abonnements, segments, campagnes,
  préférences et désinscriptions ; PostgreSQL conserve la référence des consentements, leur date et
  leur provenance. Ce connecteur reste remplaçable.
- n8n et les agents IA produisent des brouillons de newsletters et de publications sociales.
  Une validation humaine est requise avant diffusion, au moins jusqu'à décision explicite contraire.
- Une offre ne peut être publiée que si son état et sa disponibilité viennent d'être confirmés
  depuis PostgreSQL.

## 10. Contrats à spécifier avant développement de la plateforme cible

Pour le Knowledge Center, ORMO, l’Organisation Virtuelle, les Experts Virtuels, le Chief Agent et
l’AI Gateway, chaque spécification devra définir : responsabilités, entrées/sorties, provenance,
confiance, mémoire, droits, validation humaine, erreurs, reprise, coût, observabilité, rétention,
sécurité, tests et mode dégradé. Le nombre historique d’au moins 23 agents/Experts est un élément de
patrimoine, pas une contrainte de découpage technique.

### Objets transverses du socle

La cible technique d’autorité, cycles de vie, droits, conservation et API pour Audit,
Notification, Préférence, Consentement, Fichier, Tâche et Capture est définie dans
[`docs/architecture/CONTRATS_OBJETS_TRANSVERSES.md`](docs/architecture/CONTRATS_OBJETS_TRANSVERSES.md).
Elle est validée comme contrat de socle, mais chaque capacité reste non exécutable tant que ses
catalogues métier et paramètres de conservation applicables ne sont pas définis. Aucune table ni
route n’est réputée implémentée par cette validation documentaire.

## 11. Cadrage technique de la capture mobile

Le séquencement, les conditions d’activation, les limites du hors-ligne et la place de l’IA sont
définis dans
[`docs/architecture/CADRAGE_T34_CAPTURE_MOBILE.md`](docs/architecture/CADRAGE_T34_CAPTURE_MOBILE.md).

T-34 peut être développé avec doubles de test, PostgreSQL isolé et stockage privé de
préproduction. Aucune route Capture/Fichier ne doit être activée en production avant le Go T-30,
les droits, rétentions et objets cibles validés, et la restauration du stockage vérifiée. Grist ne
reçoit aucune nouvelle table ou double écriture pour contourner cette dépendance.

Le service worker ne met en cache que le shell non sensible. Les données hors ligne ne sont jamais
placées dans `localStorage` ou `sessionStorage`. Les médias locaux exigent un modèle de menace et
une purge bornée avant implémentation.

Antivirus, OCR, transcription et analyse sémantique sont asynchrones et passent par des ports
internes. Une analyse générative ne devient active qu’au travers de l’AI Gateway T-42, sauf nouvelle
décision d’architecture explicitement validée. OCR ou transcription ne peuvent jamais écrire une
donnée métier sans une commande humaine de validation.
