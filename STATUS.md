# STATUS.md — Journal et état vivant du projet orIAna

> Fichier tenu à jour par l'agent à CHAQUE tâche. C'est la mémoire partagée : décisions prises,
> ce qui est fait, ce qui reste, points bloquants. Ne pas effacer l'historique, ajouter en tête.

## Checklist humaine préalable (à confirmer avant T-03)
- [x] Ajouter le champ `mot_de_passe_hash` (texte) à la table Utilisateurs dans Grist.
- [x] Renseigner un hash bcrypt pour au moins un compte de test par rôle (consultant, manager, admin).
- [ ] Fournir les valeurs réelles dans un `.env` local (jamais commité) : clés Grist, secret n8n, etc.

## État par phase
- PHASE 1 : en cours — T-00 à T-06 terminées.
- PHASE 2 : non planifiée (ne pas coder).
- CIBLE : réservé (ne pas coder).

## Journal (le plus récent en haut)
- **2026-07-13 — T-07 : compatibilité des mises à jour et grands montants**
  - La préparation réelle des tables Offres et Conditions financières a réussi.
  - La validation a révélé qu'une mise à jour réussie peut renvoyer HTTP 204 sur l'instance Grist ; le client relit désormais la ligne au lieu d'attendre un corps JSON.
  - Les montants financiers sont validés comme nombres finis sûrs et un test explicite couvre 250 millions d'euros ; le contrôle réel négocie 125 à 118 millions d'euros.
- **2026-07-13 — T-07 en cours, validation Grist requise**
  - CRUD sécurisé des Offres et Conditions financières implémenté ; les droits des conditions sont dérivés de l'offre liée à chaque requête.
  - Une offre `vente_et_location` accepte exactement une condition vente et une condition location ; les montants courants restent modifiables pour refléter la négociation client.
  - Le schéma de phase 1 conserve l'état négocié courant ; l'historique de propositions n'est pas prévu par `SPEC.md` et n'est pas inventé dans T-07.
  - Vérifications locales réussies : lint et 34 tests, dont double nature, renégociation, incohérences et accès hors périmètre.
  - T-07 reste en cours jusqu'au succès de la vérification réelle Grist.
- **2026-07-13 — T-06 terminée**
  - Validation réelle Grist réussie : schéma et dictionnaire EAV préparés, caractéristique numérique enregistrée puis relue sur une Cellule temporaire.
  - Les trois endpoints de qualification filtrent le dictionnaire par famille+niveau et contrôlent le périmètre du bien lié avant chaque lecture ou écriture.
  - Les données métier temporaires ont été supprimées ; les tables et référentiels EAV validés restent disponibles.
  - Vérifications finales réussies : lint, 29 tests, contrôle des diffs et recherche de secrets en dur.
- **2026-07-13 — T-06 en cours, validation Grist requise**
  - Endpoints de dictionnaire et de valeurs EAV implémentés avec validation stricte du niveau, du type de valeur et du bien lié.
  - Les lectures et écritures contrôlent côté serveur le périmètre du Bâtiment, de la Cellule ou du Lot avant d'accéder aux valeurs polymorphes.
  - Préparation idempotente prête pour les trois tables EAV et un dictionnaire initial différenciant notamment logistique, activité, bureaux et commerce.
  - Vérifications locales réussies : lint et 29 tests, dont filtrage famille+niveau, saisie/relecture et refus du bien d'un autre consultant.
  - T-06 reste en cours jusqu'au succès de la vérification réelle Grist.
- **2026-07-13 — T-05 terminée**
  - Validation réelle Grist réussie : préparation idempotente du schéma, création/lecture de la hiérarchie Site → Bâtiment → Cellule → Lot, puis suppression des données temporaires.
  - La table `Ref_Familles` et ses six valeurs conformes à `SPEC.md` sont disponibles ; la table `Cellules` et les champs `gestionnaire` autorisés sont en place.
  - CRUD REST des quatre ressources protégé côté serveur par l'agence et, pour un consultant, par son identifiant gestionnaire.
  - Vérifications finales réussies : lint, 25 tests, contrôle des diffs et recherche de secrets en dur.
- **2026-07-13 — T-05 : lecture Grist unitaire corrigée**
  - La préparation réelle du schéma patrimoine et de `Ref_Familles` a réussi.
  - La validation a révélé que l'API REST Grist ne fournit pas de route `GET /records/:id` ; le client utilisait donc une route inexistante et recevait 404.
  - `getById` relit désormais la collection officielle puis sélectionne strictement l'identifiant demandé ; le filtrage d'autorisation reste appliqué ensuite côté serveur.
- **2026-07-13 — T-05 : création de `Ref_Familles` autorisée**
  - Autorisation reçue pour créer la table et les valeurs de référence nécessaires.
  - La préparation crée désormais la table si elle manque et complète de façon idempotente les six codes définis dans `SPEC.md`, sans modifier les lignes déjà présentes.
- **2026-07-13 — T-05 bloquée par l'absence de `Ref_Familles` dans Grist**
  - Le workflow réel a échoué à l'étape de préparation du schéma : la table préalable `Ref_Familles`, requise par `Cellules.type_bien`, n'existe pas.
  - Le contrôle s'est arrêté avant toute mutation : aucune table ni colonne n'a été créée et aucune donnée existante n'a été modifiée.
  - Autorisation requise pour créer `Ref_Familles` selon `SPEC.md` avant de relancer la validation T-05.
- **2026-07-13 — T-05 en cours, validation Grist requise**
  - Spécification patrimoine complétée après autorisation : `gestionnaire` est porté par Sites, Bâtiments, Cellules et Lots.
  - CRUD REST des quatre ressources implémenté avec injection serveur de l'agence et du gestionnaire, listes filtrées, contrôle individuel et validation des liens parents.
  - Suppression réservée aux managers et admins dans leur agence ; les champs serveur ne peuvent pas être usurpés par le client.
  - Vérifications locales réussies : lint et 24 tests, dont Site → Bâtiment → Cellule → Lot, rattachement d'une adresse de l'agence et tentatives d'accès hors périmètre.
  - Workflow manuel prêt pour créer `Cellules`, compléter sans destruction les colonnes Grist manquantes, puis créer/lire/supprimer une hiérarchie de contrôle.
  - T-05 reste en cours jusqu'au succès de cette vérification réelle Grist.
- **2026-07-13 — T-05 bloquée avant code**
  - Contradiction de schéma détectée : T-05 exige qu'un consultant ne voie que ses propres Sites, Bâtiments, Cellules et Lots, alors que ces quatre tables ne portent aucun champ `gestionnaire` dans `SPEC.md`.
  - Le seul `agence_id` permet le cloisonnement inter-agences, mais pas entre deux consultants de la même agence ; coder le CRUD ainsi violerait la règle de sécurité serveur.
  - Décision fonctionnelle requise avant reprise : ajouter un `gestionnaire` à chaque table patrimoine, ou définir un propriétaire au niveau Site et faire hériter tout le périmètre descendant.
  - Existence et conformité de la table Grist `Cellules` également à confirmer avant la vérification réelle de la hiérarchie.
  - Aucun CRUD T-05 n'a été codé et aucune règle de sécurité n'a été contournée.
  - **Décision reçue** : ajout autorisé de `gestionnaire` aux quatre tables patrimoine et création autorisée de `Cellules`. `SPEC.md` a été mis à jour avant reprise du code.
- **2026-07-13 — T-04 terminée**
  - Middleware `requireAuth` ajouté et appliqué aux routes de session protégées.
  - `scopeByRole` construit côté serveur un périmètre cumulant toujours `agence_id` et, pour un consultant, son identifiant `gestionnaire`.
  - Contrôle individuel réutilisable ajouté : une ressource absente renvoie 404 et une ressource hors périmètre renvoie 403 avant le contrôleur.
  - Test de sécurité obligatoire réussi : `GET /offres/:id` refuse explicitement à un consultant A l'offre d'un consultant B, même dans la même agence.
  - Tests complémentaires réussis : accès à sa propre offre, cloisonnement manager inter-agences et refus sans session.
  - Vérifications réussies : lint, 17 tests, contrôle des diffs et recherche de secrets en dur.
- **2026-07-13 — T-03 terminée**
  - Routes `POST /auth/login`, `POST /auth/logout` et `GET /auth/me` ajoutées selon la structure routes → contrôleurs → services.
  - Authentification Grist par email, comparaison bcrypt et refus uniforme des identifiants invalides ou comptes inactifs.
  - Multirôle pris en charge : sélection exigée si nécessaire et refus serveur d'un rôle non attribué.
  - Session signée par `SESSION_SECRET`, cookie `httpOnly`, `sameSite=lax` et `secure` en production ; l'agence reste uniquement dans la session serveur.
  - Les réponses publiques excluent mot de passe, hash et `agence_id`. Les tests génèrent leurs valeurs sensibles uniquement à l'exécution.
  - Vérifications réussies : lint, 12 tests, contrôle des diffs et recherche de secrets en dur.
- **2026-07-13 — T-02 terminée**
  - Squelette Express en couches créé avec endpoint `GET /health` et client Grist générique (`list`, `getById`, `create`, `update`).
  - La configuration Grist est lue exclusivement depuis l'environnement dans `gristClient.js` ; aucun secret n'est présent dans le dépôt.
  - Vérifications locales réussies : lint et 6 tests passent, dont les appels Grist simulés.
  - Grist est disponible en HTTPS sur `https://grist.boreal.immo` et les secrets de contrôle sont configurés dans GitHub Actions.
  - Lecture réelle de la table `Agences` réussie via le client backend et le workflow GitHub Actions `Vérification Grist`.
  - Vérifications finales réussies : lint, 6 tests, contrôle des diffs et recherche de secrets en dur.
- **2026-07-12 — T-01 terminée**
  - Champ Grist `mot_de_passe_hash` confirmé et comptes de test actifs disponibles pour consultant, manager et admin.
  - Décision fonctionnelle : un utilisateur peut cumuler plusieurs rôles et choisit son rôle actif à la connexion ; le backend vérifie ce choix et applique exclusivement les droits du rôle actif.
  - Aucun mot de passe ni hash n'est ajouté au dépôt.
- **2026-07-12 — T-00 terminée**
  - Arborescence `backend/` et `frontend/` initialisée avec un paquet npm privé minimal dans chaque zone.
  - Fichiers racine installés ; `.gitignore` protège `.env`, les dépendances et les sorties de build.
  - Exigence complémentaire enregistrée : préparer ultérieurement un jeu de données Grist bac à sable suffisamment volumineux pour tester les parcours, les droits et le matching, principalement dans le Val-d'Oise (95) et la Seine-et-Marne (77). Données entièrement fictives, reproductibles et sans doublons.
  - Aucun développement PHASE 2 ou CIBLE engagé ; aucune base locale ne sera créée, Grist restant la source de vérité.
  - Dépôt GitHub `Yannick2606/oriana_app` connecté ; contrôles T-00 réussis et tâche synchronisée sur la branche `main`.
