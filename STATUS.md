# STATUS.md — Journal et état vivant du projet orIAna

> Fichier tenu à jour par l'agent à CHAQUE tâche. C'est la mémoire partagée : décisions prises,
> ce qui est fait, ce qui reste, points bloquants. Ne pas effacer l'historique, ajouter en tête.

## Checklist humaine préalable (à confirmer avant T-03)
- [x] Ajouter le champ `mot_de_passe_hash` (texte) à la table Utilisateurs dans Grist.
- [x] Renseigner un hash bcrypt pour au moins un compte de test par rôle (consultant, manager, admin).
- [x] Fournir les valeurs réelles dans un `.env` local (jamais commité) : clés Grist, secret n8n, etc.

## État par phase
- PHASE 1 : terminée — T-00 à T-22 et extensions T-22A à T-22D validées.
- Migration PostgreSQL : T-27, T-28 et T-29 terminées ; T-30 non démarrée.
- Reprise fonctionnelle : T-30A et T-30B terminées sur la branche temporaire ; toute bascule PostgreSQL reste bloquée.
- PHASE 2 : vision modulaire repriorisée par T-31 ; aucun développement démarré.
- CIBLE : réservé (ne pas coder).

## Journal (le plus récent en haut)
- **2026-07-18 — T-30 : fiche de recette des cinq rôles prête**
  - La recette comporte des scénarios stables pour les sessions, chaque rôle hiérarchique, les refus de cloisonnement et les parcours vente/location, agents, clavier et smartphone.
  - Chaque scénario impose un résultat attendu, une preuve minimale expurgée et un refus obligatoire ; aucun identifiant ni secret n'est stocké dans le document.
  - Tout scénario en échec, bloqué, non exécuté ou sans preuve maintient automatiquement le verdict No-Go.
  - La fiche reste documentaire : aucun compte résolu, aucun appel d'environnement et aucune opération de production exécutés.
- **2026-07-18 — T-30 : workflow manuel de pré-contrôle préparé**
  - Le workflow `Pré-contrôle T-30` exécute le contrôle local, conserve le rapport privé 14 jours et échoue tant que le verdict n'est pas prêt pour décision humaine.
  - Les six preuves externes sont des confirmations manuelles obligatoires, toutes désactivées par défaut ; les valeurs de configuration proviennent exclusivement des secrets GitHub et ne sont jamais écrites dans le rapport.
  - Permissions limitées à la lecture du dépôt, concurrence sérialisée et absence totale de commande de déploiement, migration, gel Grist ou bascule.
  - Le workflow reste inactif tant qu'il n'est pas présent sur la branche par défaut ; aucune fusion n'est autorisée dans cette étape.
- **2026-07-18 — T-30 : pré-contrôle local automatisé**
  - `scripts/preflightT30.mjs` exécute les contrôles backend/frontend, vérifie uniquement la présence des noms de configuration et recense les preuves externes sans restituer aucune valeur sensible.
  - Le rapport `docs/T30_PREFLIGHT_REPORT.md` conclut correctement « NO-GO » : les contrôles de code sont verts, mais la configuration de l'environnement de répétition et les six preuves externes sont absentes localement.
  - Le script renvoie un code non nul tant qu'un bloquant subsiste et ne peut donc pas être interprété comme une autorisation de bascule.
  - Aucun accès production, aucune sauvegarde, aucune restauration, aucun gel Grist et aucun déploiement effectués.
- **2026-07-18 — T-30 active en préparation, production inchangée**
  - Le dossier Go/No-Go formalise la recette des cinq rôles, les parcours métier, la répétition, les critères de décision et les déclencheurs de retour arrière.
  - État local vérifié : backend lint réussi et 96 tests réussis sur 97, avec l'intégration PostgreSQL réelle ignorée hors environnement ; frontend lint/build réussis et 39 tests réussis.
  - Bloquants avant tout Go : copie chiffrée hors VPS, restauration chronométrée finale, recette réelle des cinq rôles, agents réels, supervision et décision humaine explicite.
  - Aucune sauvegarde de production, aucun gel Grist, aucune migration de delta, aucune bascule et aucun déploiement effectués.
- **2026-07-18 — T-30B terminée**
  - Validation humaine reçue après correction de la direction graphique et consolidation de la charte comme règle du design system.
  - Les contextes vente, location et vente/location, la navigation responsive, l’accès clavier et les cibles tactiles sont validés.
  - Contrôles de clôture réussis : lint, build et 39 tests frontend.
  - Clôture limitée à la branche temporaire de validation : aucune fusion et aucun déploiement.
- **2026-07-18 — T-30B prête à validation humaine finale**
  - Le design system applique la charte comme consigne de développement : navigation aubergine sombre, espace métier clair, cartes sobres et violet limité aux actions et états actifs.
  - Les fiches Offre et CRM conservent leurs vues métier, leur organisation responsive et leurs actions sans reproduire graphiquement les documents sources.
  - La recette couvre séparément vente, location et vente/location, y compris les conditions financières et libellés de négociation associés.
  - L’accès direct clavier au contenu, l’état actif des vues et les tailles tactiles principales sont protégés par des tests de non-régression.
  - Contrôles finaux réussis : lint, build et 39 tests frontend. Branche temporaire uniquement, sans fusion ni déploiement.
- **2026-07-18 — T-30B techniquement finalisée localement, validation visuelle restante**
  - La fiche Offre reprend la charte orIAna et les informations des fiches Alliance : identité, photographie, surfaces, équipements, accès, conditions financières et contact.
  - Huit vues réelles sont disponibles : Synthèse, Bien & surfaces, Finances, Mandats, Actions, Visites, Documents et Transactions.
  - La fiche s’adapte à la vente, à la location ou au double contexte : libellés, prix/loyer, conditions, mandat et négociations.
  - La fiche CRM reprend l’organisation Critères, Offres liées, Actions, Mandats et Transactions avec un aperçu société, contact et demande.
  - Les contrôles frontend sont verts : lint, build et 35 tests, dont les nouvelles vues liées et l’adaptation locative.
  - La capture navigateur locale est bloquée par les restrictions du bac à sable (socket système NETLINK interdit). Aucun visuel artificiel n’est substitué à une capture réelle ; la validation humaine du rendu reste nécessaire avant clôture formelle.
  - Aucun commit, push ou déploiement n’a été effectué.
- **2026-07-18 — Jeu LOGI PRO reçu pour le futur bac à sable**
  - Export analysé en lecture seule : 383 lignes, 191 colonnes et 122 offres distinctes ; une offre peut occuper plusieurs lignes en raison de ses lots.
  - Nicolas Yalap et Denis Palais sont retenus comme profils consultants du jeu de démonstration, sans création de compte ni import à ce stade.
  - Décision fonctionnelle : Gabriel Duman ne sera pas créé comme profil ; toutes ses attributions dans le futur bac à sable seront réaffectées à Nicolas Yalap, tout en conservant le fichier source intact.
  - Les données couvrent vente, location, vente/location, cession de fonds, cession de bail et vente de murs occupés, avec de nombreux champs techniques, financiers, mandats, publications et lots à rapprocher du schéma cible.
  - Avant import : dédoublonnage par identifiant d’offre et de lot, anonymisation des données personnelles et contrôle des relations Site–Bâtiment–Cellule–Lot–Offre.
- **2026-07-17 — T-30B : compléments métier issus des fiches Alliance analysés localement**
  - Quatre sources analysées : ancien modèle de données, dictionnaire d’aménagements/prestations et deux fiches de demande Outlook.
  - Environ 110 caractéristiques sont à normaliser dans le modèle EAV existant, entre SITE, BÂTIMENT, ACTIVITÉ, ENTREPÔT, MESSAGERIE, BUREAUX et LOCAUX SOCIAUX ; les doublons et libellés fautifs ne seront pas importés tels quels.
  - La fiche Demande confirme les vues liées Critères, Offres liées, Actions, Mandats et Transactions, ainsi qu’une relation dédiée Demande–Offre (proposée/envoyée, visite, dénoncée).
  - Compléments identifiés pour Demandes : activité envisagée, délai, alerte, stade, motivation, critères structurés, logique ET/OU et exclusion du rapprochement automatique.
  - Compléments identifiés pour les conditions : modalités locatives, honoraires, fiscalité, frais, travaux, taux d’occupation et procédure de visite.
  - Entités futures confirmées : Actions/Interactions, Visites, Documents, Transactions, Annonces et suivi des panneaux. Aucune migration PostgreSQL engagée avant validation du schéma cible.
- **2026-07-17 — T-30B active localement : première proposition visuelle prête à valider**
  - La charte et les écrans produit joints ont été comparés visuellement à l'interface avant modification.
  - Le logo conserve désormais l'identité complète « orIAna » dans la barre latérale déployée ou repliée ; le mode compact ne tronque plus « na ».
  - Le tableau de bord présente un parcours guidé en trois étapes, une priorité explicite et une prochaine action, dans la palette aubergine, lavande et blanche de la charte.
  - La navigation active est davantage marquée, les cibles tactiles sont renforcées et l'assistant IA porte un libellé explicite sur desktop.
  - Les contrôles frontend sont verts : lint, build et 32 tests. Des captures locales desktop et mobile sont prêtes pour validation humaine.
  - Aucun commit, aucune publication GitHub et aucun déploiement n'ont été effectués.
- **2026-07-17 — T-30A active : premier audit des interactions corrigé localement**
  - Les raccourcis visibles du tableau de bord ouvrent désormais un parcours réel : patrimoine,
    qualification et création d'une nouvelle société dans le CRM.
  - La pagination de démonstration ne présente plus de page suivante fictive et tous les boutons
    partagés reçoivent par défaut le type HTML `button`.
  - Recherche globale, notifications et assistant IA ne restent plus silencieux : ils affichent
    explicitement leur état fonctionnel sans simuler une fonctionnalité encore absente.
  - Le tiroir latéral possède maintenant un intitulé accessible. La navigation mobile et les
    périmètres visibles des cinq rôles sont couverts par des tests de non-régression.
  - Les 32 tests frontend, dont les nouveaux contrôles T-30A, sont verts ; le
    lint et le build frontend sont verts. La recette humaine et la publication restent à faire.
- **2026-07-17 — T-31 : vision produit et ordre de reprise validés**
  - La prochaine priorité est T-30A : auditer et réparer les boutons et parcours réels sur desktop
    et smartphone. T-30 reste bloquée tant que l'application n'est pas effectivement utilisable.
  - La suite est organisée en socle commun réutilisable et modules CRM, immobilier d'entreprise,
    fonds de commerce, marketing/site, todolist et veille, avec fiche relation à 360°, boîte de
    réception universelle et prochain geste recommandé comme principes directeurs.
  - Le bac à sable devra contenir des données fictives cohérentes et des photographies d'immeubles
    maîtrisées juridiquement, sans donnée personnelle réelle ni dépendance à des URL externes.
  - Le CRM reposera sur des tunnels configurables, mesurables par agence, équipe et consultant ; le
    directeur d'agence pourra déléguer leur administration. Les analyses portent sur les processus
    sans notation opaque ni décision automatique sur les personnes.
  - La capture mobile privilégiera la voix et trois modes explicites : signal terrain, article ou
    document et carte de visite. OCR et IA préparent les données, tâches et rattachements, mais une
    validation humaine précède toute écriture définitive ou publication.
  - Le scan de carte permet un premier contact très simple, dicté par le consultant et relu avant
    envoi. La remise volontaire justifie le suivi relationnel attendu, pas un consentement marketing
    général ; abonnements, information, opposition et préférences restent distincts par canal.
  - Le marketing couvrira site institutionnel, blog, extraits d'annonces, espace prospect/client,
    recherches enregistrées, email/WhatsApp, réseaux sociaux, talents et franchise, sous charte
    éditoriale et validation humaine. Les finalités et consentements ne seront pas mélangés.
  - La veille associera sources territoriales et portefeuille client aux signaux faibles captés par
    les consultants ; faits, sources, confiance et interprétation IA resteront clairement séparés.
  - Une passerelle IA indépendante pilotera fournisseurs, modèles, secours, budgets, quotas et
    consommations. Les fonctions essentielles conserveront un mode sans IA afin d'éviter un blocage.
  - Une intégration Epineon est réservée comme future couche de protection des flux externes ; son
    contrat ne sera pas inventé avant réception de la documentation et ne remplacera pas la sécurité
    globale de la plateforme.
  - PostgreSQL reste la cible métier. Après T-30, Grist pourra servir temporairement au travail
    éditorial, mais les connecteurs Grist, Brevo, n8n, WhatsApp et IA resteront remplaçables.
  - Aucun code PHASE 2, aucune bascule, aucun déploiement et aucune publication GitHub n'ont été
    engagés par cette mise à jour documentaire.
- **2026-07-16 — T-29 terminée : import PostgreSQL rapproché et réversible**
  - Les 19 tables Grist réellement accessibles totalisent 69 lignes : l'écart avec l'audit de
    75 lignes correspond aux six rôles attendus dans une table `Ref_Roles` absente de Grist ; les
    rôles sont portés par `Utilisateurs` et normalisés vers le référentiel PostgreSQL.
  - Le contrôle à blanc final ne contient aucun rejet. L'import réel a réussi puis a été rejoué :
    les deux exécutions sont `reussi`, avec volumes source/cible identiques et zéro rejet.
  - Le rapprochement confirme 5 bâtiments sur 5 reliés au bon site et à la bonne agence, 11 lots
    sur 11 reliés au bon bâtiment et à la bonne agence, deux usages historiques `entrepôt`
    conservés et rattachés à `Logistique`, et quatre matchings historiques valides.
  - Aucun bâtiment, lot, matching, demande ou mandat importé n'est orphelin. Aucune cellule
    artificielle n'a été créée et le lien transitoire direct lot → bâtiment est conservé.
  - La sauvegarde pré-import `20260716T180344Z` a été restaurée avec succès dans une base
    temporaire, vérifiée puis supprimée sans toucher à la base active. La sauvegarde post-import
    `20260716T184545Z` est vérifiée et conservée.
  - Un backend éphémère isolé de Traefik a démarré avec `PERSISTENCE_PROVIDER=postgres` : santé
    HTTP 200, contrat `{ id, fields }` valide, authentification PostgreSQL et refus sans session
    conformes, filtres hiérarchiques cohérents. Le conteneur de test a ensuite été supprimé.
  - L'API et l'application de production répondent HTTP 200 et n'ont pas été basculées : Grist
    reste la source de vérité jusqu'à la répétition et à la décision Go/No-Go de T-30.
  - Vérifications réussies : lint backend, 97 tests (96 locaux et l'intégration PostgreSQL en CI),
    workflow PostgreSQL #20 vert au commit `8534f27`.
- **2026-07-16 — T-29 : second import réel annulé intégralement**
  - Après correction des bâtiments, PostgreSQL a refusé le premier lot sans `agence_id` direct ;
    la transaction a de nouveau effectué un rollback complet.
  - Les 11 lots historiques étant directement rattachés à un bâtiment, leur agence doit être
    héritée de ce bâtiment existant, conformément à la hiérarchie validée.
- **2026-07-16 — T-29 : premier import réel annulé intégralement**
  - Le contrôle à blanc était vert sur 69 lignes et zéro rejet ; une sauvegarde pré-import vérifiée
    a été créée avant exécution.
  - PostgreSQL a ensuite refusé un bâtiment sans `agence_id` direct ; la transaction a effectué
    un rollback complet, sans import partiel ni bascule du backend.
  - Les bâtiments historiques étant déjà rattachés à un site, leur agence doit être héritée de ce
    site existant sans créer de relation artificielle.
- **2026-07-16 — T-29 : qualification validée de l’usage historique `entrepôt`**
  - Les lots Grist 4 et 11 portent l’usage `entrepôt`, absent des six familles du référentiel.
  - Décision métier validée : rattachement à la famille `Logistique`, avec conservation séparée
    de la valeur historique d’origine dans PostgreSQL.
  - La migration 004 et la conversion explicite sont préparées ; aucun import ni aucune bascule
    n’a encore été exécuté.
- **2026-07-16 — T-29 : conservation explicite des champs historiques des lots**
  - Le contrôle à blanc a confirmé que `Lots.nom` est vide sur 11 lignes et que
    `reference_lot` est renseignée sur les 11 ; cette référence devient le nom historique sans
    écraser ni modifier Grist.
  - Les 11 lots portent aussi des données utiles de disponibilité, étage, statut, transaction et
    usage ; six portent des charges et loyers, cinq un prix de vente.
  - La migration 003 conserve ces valeurs directement sur `lots`, relie `usage` au référentiel
    `ref_familles` et n'invente ni cellule, ni offre, ni condition financière.
  - Aucun import PostgreSQL ni aucune bascule n'a été exécuté.
- **2026-07-16 — T-29 : contrôle VPS arrêté sur une table Grist absente**
  - La migration PostgreSQL 002 a été appliquée avec succès, puis le contrôle à blanc s'est arrêté
    avant toute lecture métier sur un `404` Grist.
  - L'inventaire technique réel confirme 19 tables : `Ref_Roles` n'existe pas dans Grist ; les
    rôles historiques sont portés par `Utilisateurs` et le référentiel PostgreSQL est déjà alimenté
    par la migration 001.
  - L'import ne requiert donc plus une table source inexistante et conserve la normalisation des
    rôles depuis `Utilisateurs`, sans créer de table ni de donnée artificielle dans Grist.
  - Aucun import PostgreSQL ni aucune bascule n'a été exécuté.
- **2026-07-16 — T-29 : correctif CI de normalisation des rôles**
  - Le premier contrôle PostgreSQL réel a confirmé 94 tests sur 95 et isolé l'échec dans
    l'import de `utilisateur_roles` : un code de rôle textuel était traité à tort comme une
    référence Grist numérique, produisant une valeur nulle refusée par PostgreSQL.
  - Les rôles normalisés sont désormais insérés directement par leur code ; les RefList métier
    continuent d'être résolues par `legacy_grist_id`.
  - Aucun import VPS ni aucune bascule n'a été exécuté.
- **2026-07-15 — T-29 prête à publier pour validation PostgreSQL réelle**
  - La persistance métier, l'authentification, l'administration des utilisateurs, la formation et
    les agents utilisent un client configurable conservant le contrat `{ id, fields }` ; Grist
    reste le fournisseur par défaut tant que `PERSISTENCE_PROVIDER` n'est pas basculé explicitement.
  - La migration `002-import-grist.sql` ajoute le rattachement transitoire nullable
    `lots.batiment_id` et les journaux techniques d'import, sans créer de cellules artificielles.
  - Le contrôle à blanc lit les 20 tables Grist sans écrire dans Grist et ne restitue que volumes,
    identifiants rejetés et codes ; aucun contenu métier ne figure dans les journaux.
  - L'import PostgreSQL est transactionnel et idempotent par `legacy_grist_id`, résout les
    dépendances et listes normalisées, conserve les quatre matchings comme historique et annule
    intégralement les données métier au moindre rejet.
  - Une réinitialisation de mot de passe publique ou administrative invalide toutes les sessions
    PostgreSQL actives de l'utilisateur concerné.
  - Vérifications locales réussies : lint et 95 tests backend (94 réussis, un test d'intégration
    PostgreSQL ignoré faute de serveur local). Le workflow PostgreSQL exécutera migration 002,
    intégration, relations, idempotence, dump et restauration après publication autorisée.
  - T-29 reste en cours : aucun import réel, aucune bascule et aucune clôture ne sont engagés avant
    succès CI, sauvegarde VPS, rapprochement des 75 lignes et validation des parcours réels.
- **2026-07-15 — T-28 terminée : PostgreSQL privé et sauvegardes validés sur le VPS**
  - PostgreSQL 17.10 est déployé sur le réseau Docker interne sans port public, avec volume persistant
    et six paramètres de production conservés uniquement dans le `.env` protégé en mode `600`.
  - La migration `001-initial-schema.sql` est appliquée et idempotente : une migration enregistrée,
    29 tables publiques et aucun secret dans le dépôt.
  - Le backend utilise les sessions PostgreSQL en production ; la connexion est restée active après
    un redémarrage réel du conteneur, et l'API publique répond `{"status":"ok"}`.
  - La sauvegarde quotidienne a produit et vérifié un dump réel ; sa restauration dans la base
    temporaire `oriana_restore_t28` a réussi avant suppression automatique de cette base.
  - Le correctif de packaging `ffe5d96` inclut les scripts et le SQL dans l'image backend ; le
    workflow « Vérification PostgreSQL » n°29434873706 et les 90 tests backend sont réussis.
  - T-29 est lancée pour adapter la persistance métier et importer Grist de façon idempotente,
    sans bascule de la source de vérité avant rapprochement et validation du retour arrière.
- **2026-07-15 — T-28 en cours : socle PostgreSQL prêt à valider en CI**
  - PostgreSQL 17.10 est défini sans port public sur un réseau Docker interne et avec volume persistant.
  - Le schéma relationnel initial est versionné, normalise les RefList et conserve `legacy_grist_id`.
  - Les sessions Express utilisent PostgreSQL en production ; le MemoryStore reste uniquement
    utilisé par les tests qui injectent leur application sans démarrer le serveur.
  - Une sauvegarde quotidienne vérifiée, une rétention configurable et un script de restauration
    sont ajoutés ; une copie chiffrée hors VPS reste obligatoire avant la bascule métier.
  - Vérifications locales réussies : lint et 90 tests backend. Docker étant absent localement,
    le workflow PostgreSQL doit encore valider migration, idempotence, dump et restauration.
- **2026-07-15 — T-27 terminée : audit Grist réel validé**
  - Le workflow « Audit Grist pour PostgreSQL » n°1 a réussi et produit l'artefact privé attendu.
  - Le document contient 20 tables et 75 enregistrements ; cinq tables cibles sont encore vides,
    ce qui limite le volume à convertir sans réduire les exigences de contrôle.
  - Le schéma réel et ses champs historiques sont cartographiés vers le modèle canonique ; les
    listes de références seront normalisées et chaque ligne conservera `legacy_grist_id`.
  - Les colonnes marquées comme formules ont toutes une formule vide, y compris les scores de
    matching : aucune logique active ne sera perdue. Les quatre scores existants seront conservés
    comme historique et le moteur futur sera spécifié séparément.
  - T-28 ne démarre qu'après validation du résultat et conserve PostgreSQL privé, les migrations
    versionnées, les sauvegardes automatiques et un test réel de restauration comme critères.
- **2026-07-15 — T-27 : audit statique terminé, contrôle Grist réel prêt**
  - La cartographie Grist → PostgreSQL couvre les tables métier, les listes normalisées, les
    pièces jointes, les données EAV, le matching et la boîte aux lettres des agents.
  - La stratégie retient des identifiants PostgreSQL indépendants avec `legacy_grist_id`, un
    import idempotent, un rapprochement par volumes/relations/agrégats et une bascule réversible.
  - Un workflow manuel inventorie uniquement le schéma, les formules et les volumes Grist dans
    un artefact privé ; aucune donnée métier ni aucun secret n'est écrit dans les journaux.
  - Les formules exactes du matching, les pièces jointes et les valeurs Choice/ChoiceList restent
    à confirmer par cet audit réel avant de figer le schéma SQL.
  - Vérifications locales réussies : lint et 88 tests backend.
- **2026-07-15 — T-27 lancée : trajectoire PostgreSQL validée**
  - T-26 est clôturée après validation réelle du message, du lien, du remplacement et de la connexion.
  - PostgreSQL est retenu comme future source de vérité métier ; Grist restera la référence jusqu'à
    une bascule contrôlée, puis servira au pilotage marketing et éditorial.
  - Le chantier est découpé en audit, infrastructure et sauvegardes, adaptation et migration,
    tests et bascule, puis reprise fonctionnelle.
  - Le module futur Marketing IA combine Grist, Brevo, n8n et validation humaine ; PostgreSQL
    conserve la référence des consentements et de la disponibilité des offres.
  - Aucun déploiement PostgreSQL ni changement de production n'est engagé par cette décision documentaire.
- **2026-07-14 — T-26 prête à publier : réinitialisation sécurisée par e-mail**
  - La page de connexion propose désormais « Mot de passe oublié » sans révéler si l'adresse existe.
  - Le backend génère un jeton aléatoire valable 30 minutes, conserve seulement son hash SHA-256 dans Grist et l'invalide après remplacement bcrypt.
  - L'envoi utilise Google Workspace SMTP avec un mot de passe d'application fourni uniquement dans le `.env` du VPS.
  - La migration 004 ajoute les deux champs techniques après sauvegarde du schéma ; la validation réelle Grist et l'envoi réel restent à exécuter après publication.
  - Vérifications locales réussies : lint et 88 tests backend, lint, build et 24 tests frontend.
- **2026-07-14 — T-25 prête à publier : droits temporaires du frontend**
  - Le build T-24 a réussi et le backend est sain ; le frontend redémarre avant de servir l'interface.
  - Les journaux Nginx montrent un refus lors de la création de `/var/cache/nginx/client_temp` : le tmpfs monté à l'exécution appartient à root alors que l'image utilise `USER nginx`.
  - Les tmpfs du cache et du PID reçoivent désormais explicitement l'UID/GID 101, sans retirer le mode lecture seule ni `no-new-privileges`.
  - Vérifications réussies : lint et 83 tests backend, lint, build et 23 tests frontend ; le redémarrage réel reste à confirmer sur le VPS.
- **2026-07-14 — T-24 prête à publier : correction du build Docker frontend**
  - Le premier build VPS a révélé que `.dockerignore` excluait le dossier `frontend`, rendant les instructions `COPY frontend/...` impossibles.
  - Les conteneurs existants n'ont pas été remplacés : BuildKit a interrompu l'opération avant le déploiement.
  - Le contexte inclut désormais les sources frontend mais continue d'ignorer son artefact local `dist` ; la procédure charge explicitement le `.env` racine.
  - Vérifications réussies : lint et 83 tests backend, lint, build et 23 tests frontend ; le contrôle Docker final doit être rejoué sur le VPS équipé du moteur Docker.
- **2026-07-14 — T-23 prête à publier : préparation du déploiement frontend**
  - L'API limite CORS à l'origine exacte configurée, accepte les cookies de session et refuse les origines navigateur inconnues.
  - La procédure VPS couvre le DNS `oriana.boreal.immo`, les variables publiques de build, Docker/Traefik et les contrôles fonctionnels après déploiement.
  - Vérifications réussies : lint et 83 tests backend, lint, build et 23 tests frontend.
  - La publication réelle reste dépendante de la création du DNS et de l'exécution des commandes sur le VPS par son administrateur.
- **2026-07-14 — T-22 terminée : PHASE 1 clôturée**
  - Le README permet à un tiers de configurer, installer, lancer, migrer et vérifier le monorepo sans dépendre de l'historique des échanges.
  - Les cinq rôles, le changement obligatoire du mot de passe initial, les périmètres d'équipe/agence et l'Auto-formation sont documentés.
  - La phase 1 livre le backend sécurisé, les modules métier et leurs interfaces, le contrat n8n asynchrone, l'administration hiérarchique et les migrations Grist sauvegardées.
  - Prêts pour une future planification de phase 2 : jeu de données fictif 77/95, historique des négociations, enrichissements métier, agents supplémentaires, observabilité et déploiement industrialisé.
  - Aucun développement de phase 2 ou de la cible n'est engagé par cette clôture.
- **2026-07-14 — T-22D terminée : Auto-formation validée sur Grist**
  - Le workflow « Vérification utilisateurs Grist #7 » a réussi sur le commit correctif `04286c0` en 23 secondes.
  - La migration 003 est confirmée idempotente sur l'instance réelle ; le champ `progression_formation` est disponible et l'artefact de sauvegarde du schéma a été produit.
  - Le contrôle réel de création, réinitialisation et désactivation d'un utilisateur de niveau inférieur est également réussi avec le contexte d'administrateur d'agence.
  - L'avertissement de compatibilité Node.js des actions GitHub est non bloquant et ne remet pas en cause les contrôles exécutés.
- **2026-07-14 — T-22D : correctif du contrôle réel utilisateurs**
  - Le workflow #6 a bien exécuté la migration 003 et conservé l'artefact de sauvegarde, puis a échoué dans le contrôle historique T-11.
  - Cause : `checkUtilisateurs.js` n'envoyait pas le contexte administrateur rendu obligatoire par T-22C lors des appels directs au service.
  - Le script utilise désormais explicitement un administrateur d'agence pour créer, réinitialiser et désactiver son compte temporaire de niveau inférieur.
- **2026-07-14 — T-22D en cours : parcours adaptatif prêt à valider sur Grist**
  - Un parcours s'ouvre à la première connexion et adapte ses étapes au rôle actif parmi les cinq rôles hiérarchiques.
  - L'utilisateur peut passer, reprendre, terminer ou recommencer depuis l'espace permanent « Auto-formation » ; la progression est distincte pour chaque rôle.
  - La progression est enregistrée côté backend dans le champ Grist `progression_formation`, sans stockage navigateur ; la migration 003 est idempotente et sauvegarde le schéma avant ajout.
  - Vérifications locales réussies : lint, 80 tests backend, lint, build et 23 tests frontend.
  - T-22D reste en cours jusqu'au succès de la migration réelle via le workflow « Vérification utilisateurs Grist ».
- **2026-07-14 — T-22C terminée : administration hiérarchique des équipes**
  - Le directeur d'agence voit les niveaux inférieurs de son agence, rattache les consultants aux masters et bloque ou réactive uniquement consultants et masters.
  - L'administrateur d'agence crée, modifie et réinitialise les comptes de niveaux inférieurs dans sa seule agence ; il ne peut ni administrer un autre admin ni attribuer super admin.
  - Le super administrateur peut agir entre agences et reste le seul rôle autorisé à attribuer `super_admin` ; un compte déjà de même niveau demeure protégé.
  - L'interface Administration propose le rattachement d'équipe et le blocage/réactivation, tandis que les contrôles décisifs restent appliqués par le backend.
  - Vérifications réussies : 78 tests backend et 21 tests frontend, lint des deux zones et build frontend.
- **2026-07-14 — T-22B terminée : autorisations hiérarchiques côté serveur**
  - Le consultant reste limité à ses données ; le master consultant lit ses données et celles de ses consultants actifs rattachés, sans pouvoir modifier les données de son équipe.
  - Le rattachement d'équipe est relu dans Grist à chaque requête : un consultant retiré de l'équipe disparaît immédiatement du périmètre du master consultant.
  - Le directeur et l'administrateur d'agence accèdent aux données métier de leur agence ; le super administrateur ne reçoit aucun accès métier implicite.
  - La navigation et les libellés reflètent les cinq rôles cibles tout en conservant la compatibilité d'affichage des anciens noms pendant la migration.
  - Vérifications réussies : 75 tests backend et 20 tests frontend, dont appels API directs pour chacun des cinq rôles et refus d'écriture sur les données d'équipe.
- **2026-07-14 — T-22A terminée : modèle hiérarchique validé**
  - Cinq rôles cibles : consultant, master consultant, directeur d'agence, administrateur d'agence et super administrateur.
  - Le super administrateur conserve un périmètre administratif global sans accès métier implicite ; le directeur peut bloquer/réactiver uniquement les niveaux inférieurs de son agence.
  - La migration versionnée transforme les anciens rôles, ajoute le rattachement consultant → master consultant et permet une promotion initiale explicite via `SUPER_ADMIN_EMAIL`.
  - Validation réelle Grist réussie via « Vérification utilisateurs Grist #5 » : migration idempotente exécutée en 25 secondes et artefact de sauvegarde produit.
  - Vérifications locales réussies : lint et 71 tests backend.
  - T-22 reste ouverte : la clôture PHASE 1 sera reprise après T-22A à T-22D.
- **2026-07-14 — T-21 terminée : revue de sécurité PHASE 1**
  - Les six règles non négociables d'`AGENTS.md` ont été contrôlées et consignées dans `SECURITY_REVIEW.md` ; aucun écart n'a été trouvé.
  - Aucun secret, jeton, mot de passe en clair ou clé privée n'est présent dans les fichiers suivis ; les fichiers `.env` restent ignorés.
  - Le frontend ne contient aucun accès Grist/n8n et ne stocke aucune donnée sensible dans le navigateur ; toutes les autorisations restent appliquées côté serveur.
  - Les mots de passe utilisent bcrypt avec coût 12 et remplacement initial obligatoire ; le callback n8n utilise un secret d'environnement comparé en temps constant.
  - Dix-sept tests ciblés de cloisonnement consultant, hors périmètre et inter-agences sont verts, ainsi que les 69 tests backend et 20 tests frontend complets, les lints et le build.
- **2026-07-14 — T-20 terminée : agent asynchrone depuis l'interface**
  - Le module Agents IA permet de choisir une demande lisible et de déclencher l'agent de démonstration via le backend uniquement.
  - L'interface affiche immédiatement l'état en cours sans bloquer l'application, puis interroge légèrement le statut jusqu'à `termine` ou `erreur`.
  - Le résultat final ou le message d'erreur est présenté dans la fiche de suivi ; le polling est arrêté au démontage de l'écran.
  - Vérifications réussies : lint et 69 tests backend ; lint, build et 20 tests frontend, dont déclenchement, état intermédiaire et résultat final.
- **2026-07-14 — T-19 terminée : parcours CRM et matching**
  - Le module CRM propose le parcours Société → Contact → Demande avec listes contextuelles, création et modification via les API backend sécurisées.
  - Les formulaires respectent les relations société/contact, les natures de transaction, fourchettes de surface et budget et critères spécifiques du schéma.
  - La sélection d'une demande charge son matching calculé par Grist et affiche les lots autorisés dans l'ordre de score renvoyé par le backend.
  - Les entrées CRM et Matching de la navigation ouvrent ce même parcours unifié sans appel direct du frontend à Grist.
  - Vérifications réussies : lint et 69 tests backend ; lint, build et 19 tests frontend, dont parcours complet et création d'un contact rattaché.
- **2026-07-14 — T-18 terminée : offres et conditions financières**
  - Le module Offres charge les offres, leurs conditions et les lots associés exclusivement via le backend sécurisé.
  - La liste ouvre une fiche détaillée modifiable avec lot, nature, occupation, contrat et stade de commercialisation ; une nouvelle offre peut être créée depuis un lot du périmètre.
  - Une offre vente ou location présente le jeu de conditions correspondant ; une offre `vente_et_location` affiche simultanément deux blocs clairement séparés.
  - Les conditions vente et location sont créées ou modifiées indépendamment avec prix, loyers, charges, dépôt, taxes, taux et disponibilité prévus par le schéma.
  - Vérifications réussies : lint et 69 tests backend ; lint, build et 17 tests frontend, dont double nature, modification indépendante de la vente et création d'une offre de location.
- **2026-07-14 — T-17 terminée : qualification EAV dynamique**
  - Les fiches Bâtiment, Cellule et Lot affichent les caractéristiques renvoyées par le dictionnaire backend selon la famille réelle du bien et son niveau ; aucun champ métier n'est codé en dur dans l'interface.
  - Les types booléen, nombre, texte et liste pilotent automatiquement le contrôle affiché, avec unité et ordre issus du référentiel.
  - Les valeurs existantes sont relues à l'ouverture puis enregistrées via le backend ; une nouvelle saisie remplace la valeur EAV existante au lieu de créer un doublon.
  - Le dictionnaire accepte le code ou l'identifiant de famille porté par Grist, sans exposer de référentiel ni de clé Grist au frontend.
  - Le backend refuse aussi les caractéristiques d'une autre famille lors d'un appel API direct et conserve les contrôles de niveau, de type, d'agence et de gestionnaire.
  - Vérifications réussies : lint et 69 tests backend ; lint, build et 14 tests frontend, dont champs distincts logistique/bureaux, relecture et modification typée.
- **2026-07-14 — T-16 terminée : écran patrimoine hiérarchique**
  - Le module Patrimoine remplace l'écran d'orientation et charge exclusivement les API backend sécurisées `sites`, `batiments`, `cellules` et `lots`.
  - L'explorateur en quatre niveaux permet de parcourir Site → Bâtiment → Cellule → Lot, avec filtrage immédiat des descendants et fiche synthétique de l'élément sélectionné.
  - Chaque niveau peut être créé depuis son contexte ; le parent courant est présélectionné et les lots couvrent aussi le cas du terrain nu rattaché directement à un site.
  - Les fiches sont modifiables dans un panneau latéral responsive, sans appel direct à Grist et sans déplacer les contrôles d'autorisation hors du backend.
  - La qualification dynamique reste volontairement hors de T-16 et sera ajoutée par T-17.
  - Vérifications réussies : lint et 66 tests backend ; lint, build et 12 tests frontend, dont parcours complet, création d'un bâtiment et édition d'un lot.
- **2026-07-14 — T-15A terminée : premier mot de passe obligatoire validé sur Grist**
  - Le workflow manuel « Vérification utilisateurs Grist » #4 a réussi sur `main` au commit `7db44be` en 28 secondes.
  - La migration a été exécutée deux fois avec succès, confirmant son idempotence sur l'instance Grist réelle.
  - La sauvegarde de structure a été produite et conservée comme artefact du workflow.
  - La création et la réinitialisation administrateur imposent désormais le remplacement du mot de passe provisoire à la première connexion.
- **2026-07-14 — T-15A implémentée localement, validation Grist réelle requise**
  - Migration versionnée `001-utilisateurs-premier-mot-de-passe` ajoutant le booléen `doit_changer_mot_de_passe` sans modifier les comptes existants.
  - Le workflow sauvegarde la structure de la table Utilisateurs avant migration, conserve l'artefact 30 jours et exécute deux fois la préparation pour vérifier son idempotence.
  - Toute création ou réinitialisation admin hache le mot de passe avec bcrypt et impose `doit_changer_mot_de_passe=true` ; aucune valeur sensible n'est renvoyée.
  - Après connexion avec un mot de passe provisoire, un middleware global bloque toutes les routes métier, y compris les appels API directs, avec `PASSWORD_CHANGE_REQUIRED`.
  - L'utilisateur ne conserve que les routes d'authentification nécessaires pour remplacer son mot de passe ou se déconnecter ; le nouveau mot de passe doit contenir au moins 12 caractères et différer du provisoire.
  - L'écran frontend de première connexion masque entièrement l'application jusqu'au changement réussi, sans stockage navigateur.
  - Les comptes existants dont le nouveau champ est vide ou faux ne sont pas bloqués automatiquement.
  - Vérifications locales réussies : lint et 66 tests backend ; lint, build et 9 tests frontend. T-15A reste ouverte jusqu'au succès du workflow réel Utilisateurs Grist après publication autorisée.
- **2026-07-14 — T-15 terminée : navigation selon le rôle actif**
  - Matrice de navigation centralisée pour les trois rôles internes de PHASE 1 ; elle s'appuie uniquement sur le `role_actif` renvoyé par la session.
  - Consultant, manager et admin accèdent aux modules métier prévus : Accueil, Patrimoine, Offres, CRM, Matching et Agents IA.
  - L'entrée Administration est strictement réservée à l'admin dans l'interface ; consultant et manager ne la voient jamais. Les autorisations réelles restent contrôlées par le backend.
  - Un sélecteur de rôle dans le profil et la sidebar permet aux comptes multirôles de basculer sans ressaisir leur mot de passe ; `POST /auth/role` relit préalablement le compte actif et ses rôles dans Grist.
  - Le tableau de bord reprend la composition UI/UX validée : accueil personnalisé, indicateurs, actifs récents, activité guidée et prochaine action.
  - Les modules futurs affichent uniquement une vue d'orientation avec retour à l'accueil ; aucun CRUD T-16+ ni aucune fonctionnalité PHASE 2, notamment les panneaux d'affichage, n'a été anticipé.
  - Navigation active, repli de sidebar, fermeture mobile et déconnexion mobile sont pris en charge de manière accessible et responsive.
  - Vérifications réussies : lint, build et 8 tests frontend, dont menus consultant/manager/admin, absence d'administration pour les rôles non autorisés et bascule multirôle ; lint backend et 63 tests.
  - Prochaine tâche ajoutée avant T-16 : T-15A impose le remplacement à la première connexion de tout mot de passe créé ou réinitialisé par un administrateur.
- **2026-07-14 — T-14 terminée : connexion et gestion de session frontend**
  - Écran de connexion responsive créé dans l'esthétique premium validée, avec modes clair et sombre, états d'attente et erreurs accessibles.
  - La session est restaurée au chargement via `GET /auth/me` ; un utilisateur non authentifié reste sur l'écran de connexion et ne peut pas atteindre l'espace protégé.
  - La connexion utilise `POST /auth/login` et gère le choix obligatoire du rôle actif pour les comptes multirôles avant l'ouverture de l'application.
  - La déconnexion appelle `POST /auth/logout` et rétablit immédiatement la garde d'accès.
  - Le cookie httpOnly reste entièrement géré par le backend avec `credentials: "include"` ; aucun mot de passe, jeton ou état de session sensible n'est stocké dans `localStorage` ou `sessionStorage`.
  - Cible frontend actuelle validée : `oriana.boreal.immo`. L'hôte, l'organisation et l'URL API restent configurables pour accompagner un futur changement de nom ou de domaine sans refonte.
  - Contrat distant contrôlé sur `api.boreal.immo` : `/auth/me` refuse correctement une requête sans session. La connexion réelle avec un compte Grist sera rejouée après déploiement du frontend et configuration CORS de l'origine retenue.
  - Vérifications réussies : lint et build frontend, 4 tests frontend couvrant garde, connexion, multirôle et absence de stockage navigateur ; lint backend et 61 tests.
- **2026-07-14 — T-13 terminée : Design System officiel orIAna**
  - Frontend React/Vite/Tailwind initialisé avec thèmes clair et sombre instantanés, design tokens centralisés et charte aubergine/lavande conforme.
  - Bibliothèque de composants génériques créée : formulaires, actions, navigation, retours utilisateur, overlays, tableaux, états vides et aide contextuelle.
  - Layout universel responsive Header / Sidebar / Content / Footer ajouté avec rôle actif, recherche, notifications, statut backend et navigation repliable.
  - Page de démonstration accessible créée, avec repères d'action, progressive disclosure, assistant IA strictement graphique et architecture compatible avec un futur mode Focus.
  - Client API unique dans `src/api`, configuré exclusivement par `VITE_API_BASE_URL` et utilisant systématiquement `credentials: "include"` ; aucun accès frontend à Grist ou n8n.
  - Build de production Docker multi-stage et nginx non privilégié préparés, avec healthcheck et routage Traefik paramétrable. Docker étant indisponible localement, la construction réelle de l'image reste à valider au déploiement.
  - Documentation d'architecture ajoutée dans `DESIGN_SYSTEM.md` ; le nom d'organisation, l'hôte frontend et l'URL API restent remplaçables par configuration.
  - Vérifications réussies : lint, build et test frontend ; lint backend et 61 tests ; contrôle du diff et absence de couleurs interdites ou d'URL Grist/n8n dans le code frontend.
- **2026-07-14 — T-12 terminée : cycle n8n réel validé après rotation du secret**
  - Le backend redéployé répond en HTTPS et le contrôle réel confirme le cycle complet `en_attente → termine → résultat` entre le backend, n8n et Grist.
  - Le secret partagé exposé pendant le diagnostic a été remplacé simultanément côté backend et côté n8n, sans ajout au dépôt ; les deux services ont été recréés avec cette nouvelle valeur.
  - Le fichier temporaire de rotation a été supprimé et les deux fichiers d'environnement du VPS sont limités au mode `600`.
  - Un second contrôle réel après rotation a réussi ; les critères d'acceptation de T-12 sont remplis et T-13 peut commencer.
- **2026-07-14 — T-12 : interception du callback par un routeur générique corrigée localement**
  - Le test HTTP du middleware isolé répond 204 alors que le même appel via `createApp` répondait 401 : le secret et son transport n'étaient donc pas en cause.
  - Le routeur de qualification, monté à la racine avant les routes agents, appliquait `requireAuth` à `/agents/callback` et exigeait à tort une session utilisateur avant le contrôle n8n.
  - Les routes agents sont désormais montées avant les routeurs racine ; leur déclenchement et leur statut conservent leurs propres contrôles de session et de périmètre.
  - Un test de régression vérifie qu'un callback porteur du bon secret fonctionne sans session utilisateur ; lint backend et 61 tests réussissent.
  - Correctif non publié : T-12 reste ouverte jusqu'à autorisation, redéploiement, rotation du secret exposé et succès du contrôle réel complet.
- **2026-07-14 — T-12 : résolution tardive du secret de callback à valider sur le VPS**
  - Le correctif précédent est bien déployé, mais le test HTTP interne reproduit encore un refus `401` alors que le middleware isolé accepte la même variable.
  - La route résout désormais le secret partagé au moment de chaque requête au lieu de conserver la valeur capturée lors de l'initialisation.
  - Un test de non-régression couvre cette résolution tardive ; lint backend et 60 tests réussissent.
  - T-12 reste ouverte jusqu'au redéploiement, à la rotation du secret exposé et au succès du contrôle réel complet.
- **2026-07-14 — T-12 : correctif de configuration du callback à valider sur le VPS**
  - Le contrôle réel a reproduit un refus `401` du callback, y compris lors d'un appel interne au conteneur backend avec sa propre variable d'environnement.
  - Le démarrage de production transmet désormais explicitement la configuration n8n à l'application ; le service sortant et le middleware de callback utilisent ainsi la même valeur résolue.
  - Vérifications locales réussies après correction : lint backend et 59 tests.
  - T-12 reste ouverte jusqu'au redéploiement de ce correctif, à la rotation du secret exposé pendant le diagnostic et au succès du contrôle réel complet.
- **2026-07-14 — T-12 : workflow n8n actif, contrôle réel prêt**
  - Backend déployé derrière Traefik sur `https://api.boreal.immo` ; contrôle de santé HTTPS validé avec une réponse HTTP 200.
  - Workflow n8n `oriana-demonstration` créé et activé avec comparaison du secret d'environnement, branche de refus et callback backend protégé.
  - Secret n8n partagé par variables d'environnement distinctes sur le VPS, sans valeur dans le dépôt ni dans le workflow.
  - Contrôle réel reproductible ajouté : il crée un suivi technique, appelle n8n, attend le callback, vérifie le résultat puis nettoie la ligne temporaire.
  - T-12 reste ouverte jusqu'à l'exécution réussie de ce dernier contrôle sur le VPS.
- **2026-07-13 — T-12 : déploiement backend préparé**
  - Image Docker minimale préparée pour le backend uniquement, exécutée avec l'utilisateur non privilégié `node`, système de fichiers en lecture seule et contrôle de santé.
  - Composition reliée au réseau Traefik externe `root_default`, sans port hôte exposé, avec routage TLS `api.boreal.immo` via `mytlschallenge`.
  - Les secrets restent exclusivement dans le `.env` du VPS ignoré par Git ; aucune valeur n'est intégrée à l'image ou au fichier Compose.
  - Express fait confiance à un seul proxy en production afin que les cookies sécurisés fonctionnent derrière Traefik.
  - Vérifications locales : lint backend et 59 tests réussis ; aucune valeur de secret détectée dans les fichiers suivis.
  - Limite locale : Docker n'est pas installé dans l'environnement de travail, donc la construction de l'image et le routage Traefik restent à valider sur le VPS.
- **2026-07-13 — T-12 : boîte aux lettres Grist validée, branchement n8n restant**
  - Le workflow GitHub est vert : table `Traitements_Agents` préparée et cycle `en_attente → termine → résultat` validé avec nettoyage de la ligne temporaire.
  - Le webhook était simulé pendant ce contrôle ; le critère T-12 exige encore un appel réel à n8n et un callback réel vers le backend.
  - Le backend orIAna n'étant pas encore exposé publiquement, n8n ne peut pas joindre `/agents/callback`.
  - T-13 ne démarre pas avant la clôture de T-12. Prochaine action proposée : déployer le backend sur `api.boreal.immo`, puis créer et activer le workflow `oriana-demonstration` dans n8n.
- **2026-07-13 — T-12 en cours, validation Grist requise**
  - Contrat validé puis implémenté pour l'agent `demonstration`, limité aux demandes lisibles par l'utilisateur.
  - Le backend crée `Traitements_Agents`, appelle le webhook fixe avec le secret uniquement en en-tête et répond `202` après l'accusé de réception, sans attendre le résultat.
  - n8n renvoie le résultat via `/agents/callback` protégé par comparaison du secret en temps constant ; n8n ne détient aucune clé Grist.
  - La lecture du statut contrôle à nouveau la demande, l'agence et le propriétaire du suivi ; manager et admin voient les suivis de leur agence.
  - Vérifications locales réussies : lint et 59 tests, dont callback, résultat, faux secret, agent inconnu et demande hors périmètre.
  - Le workflow GitHub valide la boîte aux lettres Grist avec un webhook simulé ; le branchement du workflow n8n réel restera nécessaire avant clôture de T-12.
- **2026-07-13 — T-12 bloquée avant code : contrat n8n incomplet**
  - `SPEC.md` impose un agent de démonstration et une boîte aux lettres Grist, mais ne nomme ni l'agent, ni la table de suivi, ni ses colonnes.
  - La convention exacte entre `N8N_WEBHOOK_BASE_URL` et le chemin du webhook n'est pas définie ; aucun workflow n8n orIAna n'est encore confirmé.
  - Le code s'arrête avant toute implémentation pour ne pas inventer un schéma ou une URL d'intégration non validés.
  - Décision requise : valider la création de `Traitements_Agents` et le webhook de démonstration proposés, puis créer ou importer le workflow correspondant dans n8n.
- **2026-07-13 — T-11 terminée**
  - Validation réelle Grist réussie : compte temporaire multirôle créé avec hash bcrypt vérifié, désactivé, relu sans exposition du hash, puis supprimé.
  - Le contrôle a confirmé la compatibilité avec les réponses Grist ne contenant qu'un identifiant après création.
  - Vérifications finales réussies : lint, 56 tests, contrôle des diffs et recherche de secrets en dur.
- **2026-07-13 — T-11 : relecture après création Grist sans contenu**
  - Le workflow réel a révélé que la création d'un utilisateur peut réussir avec une réponse HTTP 204 sans enregistrement JSON.
  - Le service relit désormais le compte par son email unique avant de construire la réponse publique.
  - Le nettoyage supprime d'abord les comptes techniques marqués `TEST-T11`, puis recherche aussi l'email temporaire si aucun identifiant n'a pu être récupéré.
  - Un second essai a précisé le contrat réel : la création peut renvoyer uniquement un identifiant ; toute réponse sans objet `fields` déclenche maintenant la relecture par email.
- **2026-07-13 — T-11 en cours**
  - Administration des utilisateurs limitée au rôle actif `admin` côté serveur pour chaque route.
  - Création prévue avec rôles multiples validés, agence existante, email normalisé et mot de passe haché bcrypt avant toute écriture Grist.
  - Les réponses publiques excluent systématiquement `mot_de_passe_hash` ; le mot de passe en clair n'est ni stocké ni journalisé.
  - Compatibilité conservée avec la colonne Grist existante `role` (ChoiceList), traduite en `roles` dans le contrat JSON.
  - Validation réelle prévue avec un compte temporaire supprimé en fin de contrôle, y compris en cas d'échec.
  - Vérifications locales réussies : lint et 54 tests, dont refus non-admin, bcrypt vérifiable, désactivation, email unique et absence du hash dans les réponses.
  - T-11 reste en cours jusqu'au succès du workflow réel « Vérification utilisateurs Grist ».
- **2026-07-13 — T-10 terminée**
  - Validation réelle Grist réussie en lecture seule sur `Matching_demandes_lots` ; aucun score ni aucune donnée métier n'a été modifié.
  - Les résultats sont triés par `score_global` décroissant sans recalcul et restent filtrés par les droits sur la demande et les lots.
  - Vérifications finales réussies : lint, 49 tests, contrôle des diffs et recherche de secrets en dur.
- **2026-07-13 — T-10 en cours, validation Grist requise**
  - `GET /matching?demande_id=` lit la table Grist existante `Matching_demandes_lots` et trie uniquement les valeurs `score_global` déjà calculées.
  - La demande doit être lisible selon son agence et son exclusivité ; les résultats associés à des lots hors périmètre sont retirés côté serveur.
  - Aucun calcul ni aucune écriture de score n'est effectué par le backend.
  - Vérifications locales réussies : lint et 49 tests, dont ordre décroissant, conservation des détails Grist et refus des demandes ou lots hors périmètre.
  - T-10 reste en cours jusqu'au succès du workflow réel « Vérification matching Grist ».
- **2026-07-13 — T-09 terminée**
  - Validation réelle Grist réussie : préparation non destructive du schéma, création d'une société, d'un contact et d'une demande liés, levée d'exclusivité, puis relecture.
  - Les données temporaires du contrôle ont été supprimées ; les colonnes de propriété et d'exclusivité restent disponibles pour l'application.
  - Le filtrage serveur couvre l'exclusivité, le partage en lecture dans l'agence, l'écriture réservée et le cloisonnement inter-agences.
  - Vérifications finales réussies : lint, 45 tests, contrôle des diffs et recherche de secrets en dur.
- **2026-07-13 — T-09 en cours, validation Grist requise**
  - CRUD Société → Contact → Demande implémenté avec validation des relations et des fourchettes de surface et de budget.
  - Les quatre ressources Société, Contact, Demande et Mandat sont exclusives à la création ; la levée partage la lecture dans l'agence sans transférer l'écriture.
  - Le gestionnaire peut lever l'exclusivité, mais seul un manager ou admin de l'agence peut la réactiver ; le cloisonnement inter-agences reste absolu.
  - Préparation Grist idempotente prévue, y compris pour la référence circulaire Société ↔ Contact et l'ajout non destructif des colonnes de propriété.
  - Vérifications locales réussies : lint et 45 tests, dont partage intra-agence, écriture interdite au collègue, réactivation manager et refus inter-agences.
  - T-09 reste en cours jusqu'au succès du workflow réel « Vérification CRM Grist ».
- **2026-07-13 — T-09 : modèle d'exclusivité CRM validé**
  - Sociétés, Contacts, Demandes et Mandats sont exclusifs par défaut et attribués au consultant créateur.
  - Après levée par le gestionnaire ou le manager, les consultants de la même agence disposent d'une lecture partagée ; l'écriture reste réservée au gestionnaire et au manager.
  - Seul le manager peut réactiver une exclusivité levée. Le partage inter-agences reste hors PHASE 1 conformément à la CIBLE.
  - `SPEC.md` est mis à jour avant reprise du code.
- **2026-07-13 — T-09 bloquée avant code : propriété de Sociétés et Contacts**
  - `SPEC.md` exige le filtre consultant `gestionnaire = user.id` sur chaque ressource métier.
  - `Demandes` porte ce champ, mais `Societes` et `Contacts` ne portent que `agence_id` ; leur CRUD ne peut donc pas isoler deux consultants de la même agence.
  - Coder avec le seul périmètre agence contournerait la règle de sécurité serveur ; aucun CRUD T-09 n'a été implémenté.
  - Décision requise : ajouter `gestionnaire` à Sociétés et Contacts, ou définir explicitement un autre modèle de partage CRM dans `SPEC.md`.
- **2026-07-13 — T-08 terminée**
  - Validation réelle Grist réussie : création, modification des honoraires et relecture d'un mandat lié à une offre et une société temporaires.
  - Le workflow valide le contrat CRUD avec une clé de service ; les autorisations métier restent contrôlées par le backend et ses tests de cloisonnement.
  - Toutes les données temporaires ont été supprimées après le contrôle.
  - Vérifications finales réussies : lint, 40 tests, contrôle des diffs et recherche de secrets en dur.
- **2026-07-13 — T-08 en cours, validation Grist requise**
  - CRUD Mandats implémenté avec contrôle serveur du mandat, de l'offre liée et de la société mandante dans l'agence.
  - Validation ajoutée pour type, nature compatible avec l'offre, période, honoraires numériques et champs d'agence/gestionnaire gérés par le serveur.
  - Vérifications locales réussies : lint et 40 tests, dont modification des honoraires, relations hors périmètre et suppression réservée.
  - T-08 reste en cours jusqu'au succès de la vérification réelle Grist.
- **2026-07-13 — T-07 terminée**
  - Validation réelle Grist réussie : offre `vente_et_location`, conditions vente et location distinctes, puis renégociation d'un prix de 125 à 118 millions d'euros.
  - Les grands montants sont couverts par un test automatisé à 250 millions d'euros et validés comme nombres finis sûrs.
  - Les conditions restent modifiables dans le périmètre autorisé et leur sécurité est dérivée de l'offre liée.
  - Vérifications finales réussies : lint, 36 tests, contrôle des diffs et recherche de secrets en dur.
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
