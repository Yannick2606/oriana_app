# SPEC.md — Spécification orIAna

> Ce fichier décrit **quoi** construire. Il fait foi sur les exigences, le schéma de données et
> les contrats d'API. `AGENTS.md` = comment opérer. `PLAN.md` = dans quel ordre. En cas de doute
> sur une exigence, ce fichier tranche ; ne pas inventer de comportement non spécifié — le
> signaler dans STATUS.md.

---

## 1. Objectif et périmètre

Application d'intelligence pour l'immobilier d'entreprise de l'agence BORÉAL. Trois briques :

1. **Backend-proxy** (Node.js/Express) — détient les secrets, authentifie, applique les droits,
   sert de pont unique vers Grist et n8n.
2. **Frontend** (React + Vite + Tailwind) — interface, vues par rôle.
3. **Grist** (externe, existant) — base de données, source de vérité. Accès par API.
4. **n8n** (externe, existant) — agents d'intelligence, appelés par webhook.

Périmètre de code de la PHASE 1 (voir §7 pour le découpage phases) :
authentification, gestion des rôles/droits, CRUD du patrimoine et des offres, CRM de base,
affichage du matching. Les baux, diagnostics, documents, historique CRM, POI et fonds de
commerce sont **hors périmètre de code PHASE 1** (modélisés mais non développés maintenant).

## 2. Contraintes techniques imposées

- Backend : Node.js (LTS), Express. Structure en couches (routes → contrôleurs → services →
  client Grist). Tests avec le runner au choix (Jest ou node:test), lint ESLint.
- Frontend : React (fonctionnel + hooks), Vite, Tailwind CSS. Pas de state manager externe en
  PHASE 1.
- Communication : le frontend appelle exclusivement le backend en HTTPS/JSON. Le backend appelle
  Grist (API REST) et n8n (webhooks). Le frontend n'appelle jamais Grist ni n8n.
- Secrets : variables d'environnement uniquement (voir `.env.example`). Rien dans le dépôt.

## 3. Rôles et droits (exigence centrale)

Quatre rôles. Trois actifs en PHASE 1 (client = PHASE ultérieure).

| Rôle | Type | Périmètre de visibilité |
|------|------|-------------------------|
| consultant | interne | Uniquement SES données (offres, demandes, mandats, contacts dont il est gestionnaire) |
| manager | interne | Toute l'agence (tous les consultants de son `agence_id`) |
| admin | interne | Toute l'agence + gestion des utilisateurs et données de référence |
| client | externe | (PHASE ultérieure) annonces publiques + ses demandes |

**Règle d'or** : le filtrage s'applique **côté serveur**, à chaque requête. Un `consultant`
n'obtient jamais, via l'API, une donnée dont il n'est pas gestionnaire, même s'il forge la requête.
Le `agence_id` de l'utilisateur connecté filtre systématiquement toutes les requêtes.

## 4. Modèle de données (PHASE 1)

> Source de vérité : Grist. Ces tables existent (ou sont à créer) côté Grist. Le backend les lit
> via l'API Grist. Ne pas recréer une base locale : Grist EST la base.
> Convention : `PK` identifiant · `FK→` référence · `[]FK→` liste de références.
> **Toutes les tables métier portent `agence_id`.**

### Utilisateurs
`id` PK · `nom` · `prenom` · `email` (unique) · `mot_de_passe_hash` (bcrypt) · `roles` enum
multiple (consultant|manager|admin|client) · `agence_id` FK→Agences · `actif` bool ·
`derniere_connexion` · `doit_changer_mot_de_passe` bool · `reset_mot_de_passe_hash` texte
(SHA-256) · `reset_mot_de_passe_expiration` texte (ISO 8601).
> L'API expose `roles` ; la colonne technique existante dans Grist reste `role` (ChoiceList).
> **Action Grist requise** : ajouter `mot_de_passe_hash` (absent aujourd'hui). Voir PLAN T-01.
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

> Sociétés, Contacts, Demandes et Mandats sont exclusifs à la création. Le gestionnaire et le
> manager de l'agence peuvent lever l'exclusivité. Une donnée non exclusive est lisible par les
> consultants de la même agence, mais reste modifiable uniquement par son gestionnaire ou le
> manager. Seul le manager peut réactiver l'exclusivité. Aucun partage inter-agences en PHASE 1.

### Matching  (table Grist existante `Matching_demandes_lots`, formules Grist)
`id` PK · `demande_id` FK→Demandes · `lot_id` FK→Lots · `score_global` · `scores_detail`.
> Le score est calculé par Grist (formules, pondération 35/30/20/15). Le backend le **lit**,
> ne le recalcule pas.

## 5. Contrats d'API (backend-proxy)

Toutes les routes (sauf `/auth/login`) exigent une session valide. Le backend déduit
`user`, `role`, `agence_id` du jeton, et filtre en conséquence. Réponses en JSON.
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
- `POST /auth/role` — body `{ role_actif }` ; relit le compte dans Grist, vérifie qu'il est
  toujours actif et que le rôle est toujours attribué, puis met à jour la session. Aucun nouveau
  mot de passe n'est demandé tant que la session est valide.
- `POST /auth/mot-de-passe/premiere-connexion` — body `{ nouveau_mot_de_passe }` ; uniquement
  pour une session portant `doit_changer_mot_de_passe=true`. Hache la nouvelle valeur avec
  bcrypt, désactive le drapeau puis met à jour la session.
- `POST /auth/mot-de-passe/demande` — body `{ email }` ; répond toujours de façon générique,
  crée un jeton aléatoire valable 30 minutes pour un compte actif et envoie le lien par SMTP.
  Grist ne conserve que le hash SHA-256 du jeton.
- `POST /auth/mot-de-passe/reinitialisation` — body `{ token, nouveau_mot_de_passe }` ; vérifie
  le hash et l'expiration, remplace le hash bcrypt puis invalide immédiatement le jeton.

### Middleware (à appliquer sur toutes les routes protégées)
- `requireAuth` — rejette 401 si pas de session valide.
- `scopeByRole` — utilise exclusivement le `role_actif` validé côté serveur et injecte le filtre :
  `consultant` → `gestionnaire = user.id` ; `manager`/`admin` →
  `agence_id = user.agence_id`. Ce filtre est appliqué à CHAQUE lecture/écriture.
- `requirePasswordChanged` — bloque avec `PASSWORD_CHANGE_REQUIRED` toutes les routes métier
  d'une session utilisant encore un mot de passe provisoire. Les routes de changement et de
  déconnexion restent accessibles.

### Ressources métier (patron REST identique pour chaque entité)
Pour chaque ressource ci-dessous : `GET /{ressource}` (liste filtrée par rôle),
`GET /{ressource}/:id` (403 si hors périmètre), `POST /{ressource}` (crée avec `agence_id` de
l'utilisateur), `PUT /{ressource}/:id` (403 si hors périmètre), `DELETE /{ressource}/:id`
(admin/manager selon règle).

Ressources PHASE 1 : `sites`, `batiments`, `cellules`, `lots`, `offres`,
`conditions-financieres`, `mandats`, `societes`, `contacts`, `demandes`.

### Qualification (EAV)
- `GET /caracteristiques/dictionnaire?famille=&niveau=` — renvoie les caractéristiques du
  dictionnaire filtrées par famille et niveau (pour construire le formulaire dynamique).
- `GET /caracteristiques-bien?niveau=&id=` — valeurs saisies pour un bien donné.
- `POST /caracteristiques-bien` — enregistre une valeur (un `*_id` selon `niveau`).

### Matching
- `GET /matching?demande_id=` — renvoie les lots scorés pour une demande (lecture des scores
  Grist), triés par `score_global` décroissant.

### Administration (admin uniquement)
- `GET|POST|PUT /utilisateurs` — gestion des comptes. `POST` hache le mot de passe (bcrypt)
  avant écriture et impose son remplacement initial. `PUT` peut désactiver (`actif=false`).
- `PUT /utilisateurs/:id/mot-de-passe` — réinitialisation admin ; hache la nouvelle valeur et
  repositionne obligatoirement `doit_changer_mot_de_passe=true`.

### Intégration n8n (contrat asynchrone — voir §6)
- `POST /agents/:agent/declencher` — body `{ objet_type, objet_id }`. Le backend appelle le
  webhook n8n correspondant (secret partagé), renvoie `202 Accepted` + un identifiant de suivi.
  Le résultat n'est PAS attendu de façon synchrone.
- `GET /agents/statut?objet_type=&objet_id=` — renvoie l'état du traitement (lu dans Grist :
  en_attente|en_cours|termine|erreur) et le résultat si `termine`.
- Démonstration PHASE 1 : agent `demonstration`, limité aux objets `demande`, webhook fixe
  `{N8N_WEBHOOK_BASE_URL}/webhook/oriana-demonstration`.
- `POST /agents/callback` — appelé par n8n avec le secret partagé ; le backend écrit le résultat
  dans Grist. La clé Grist reste ainsi exclusivement dans le backend.

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
   Grist et met `statut_traitement` à `termine` (ou `erreur`).
4. Le frontend interroge `GET /agents/statut` (polling léger) jusqu'à `termine`, puis affiche
   le résultat. Pendant ce temps, l'UI montre « traitement en cours », sans figer.

Ne jamais implémenter d'appel n8n synchrone bloquant. Grist est la boîte aux lettres du résultat.

## 7. Découpage en phases (ne coder que la PHASE 1)

- **PHASE 1 (ce build)** : auth, rôles/droits, CRUD patrimoine (Sites→Lots) + qualification EAV
  + offres/conditions + mandats + CRM de base (Societes, Contacts, Demandes) + lecture matching
  + admin utilisateurs + squelette du contrat n8n (déclencher/statut) avec **un** agent branché
  en démonstration.
- **PHASE 2 (plus tard)** : Baux, Diagnostics, Documents, Annonces, Transactions, Interactions,
  Actions, Copropriété, honoraires détaillés, historique CRM complet.
- **CIBLE (réservé)** : POI thématiques (dépend d'un agent), Fonds de commerce, portail client
  externe, collaboration inter-agences.

Ne pas anticiper le code des PHASES 2/CIBLE. En revanche, ne rien coder qui **empêcherait** de
les ajouter (garder `agence_id` partout, garder le 4e rôle `client` prévu dans l'enum).

## 8. Critères de « fini » pour la PHASE 1

- Un utilisateur peut se connecter, et selon son rôle, voit un périmètre correct (testé).
- Un consultant ne peut PAS accéder aux données d'un autre consultant, même via appel API direct
  (test de sécurité explicite exigé).
- On peut créer un bien complet (Site→Bâtiment→Cellule→Lot), le qualifier via le formulaire
  dynamique filtré par famille, créer une offre vente_et_location avec deux jeux de conditions.
- On peut créer une société, un contact, une demande, et afficher le matching scoré.
- Le déclenchement d'un agent n8n fonctionne en asynchrone (déclencher → statut → résultat).
- lint + build + tests passent sur backend et frontend.
