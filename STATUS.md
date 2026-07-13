# STATUS.md — Journal et état vivant du projet orIAna

> Fichier tenu à jour par l'agent à CHAQUE tâche. C'est la mémoire partagée : décisions prises,
> ce qui est fait, ce qui reste, points bloquants. Ne pas effacer l'historique, ajouter en tête.

## Checklist humaine préalable (à confirmer avant T-03)
- [x] Ajouter le champ `mot_de_passe_hash` (texte) à la table Utilisateurs dans Grist.
- [x] Renseigner un hash bcrypt pour au moins un compte de test par rôle (consultant, manager, admin).
- [ ] Fournir les valeurs réelles dans un `.env` local (jamais commité) : clés Grist, secret n8n, etc.

## État par phase
- PHASE 1 : en cours — T-00 à T-04 terminées.
- PHASE 2 : non planifiée (ne pas coder).
- CIBLE : réservé (ne pas coder).

## Journal (le plus récent en haut)
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
