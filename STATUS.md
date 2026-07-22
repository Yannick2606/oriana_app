# STATUS.md — Journal et état vivant du projet orIAna

> Fichier tenu à jour par l'agent à CHAQUE tâche. C'est la mémoire partagée : décisions prises,
> ce qui est fait, ce qui reste, points bloquants. Ne pas effacer l'historique, ajouter en tête.

## Checklist humaine préalable (à confirmer avant T-03)
- [x] Ajouter le champ `mot_de_passe_hash` (texte) à la table Utilisateurs dans Grist.
- [x] Renseigner un hash bcrypt pour au moins un compte de test par rôle (consultant, manager, admin).
- [x] Fournir les valeurs réelles dans un `.env` local (jamais commité) : clés Grist, secret n8n, etc.

## État par phase
- Documentation v2.0 : T-31A terminée et validée le 19 juillet 2026.
- PHASE 1 : terminée — T-00 à T-22 et extensions T-22A à T-22D validées.
- Migration PostgreSQL : T-27, T-28 et T-29 terminées ; T-30 non démarrée.
- Reprise fonctionnelle : T-30A est active ; toute bascule PostgreSQL reste bloquée.
- PHASE 2 : vision modulaire repriorisée par T-31 ; T-32 et T-33 sont terminées, T-34A attend le
  choix du stockage et la spécification de T-34B est active.
- CIBLE : réservé (ne pas coder).

## Journal (le plus récent en haut)
- **2026-07-22 — Gouvernance : sas de décision fondateur formalisé localement**
  - Toute décision stratégique, métier, fonctionnelle, UX, architecturale ou relative à l’IA doit
    désormais être précédée d’une relecture de l’ADN, de la Constitution, de la Charte des dix
    principes et de BORÉAL, puis d’un contrôle de cohérence avec ORMO et les décisions existantes.
  - Une contradiction arrête le travail et exige un arbitrage. Les opérations purement techniques
    ou d’exploitation conservent un contrôle de non-contradiction sans imposer une relecture
    intégrale qui ne produirait aucune décision.
  - La règle est ajoutée à `AGENTS.md` et à la gouvernance documentaire. Ce lot n’est pas commité,
    poussé ni déployé.
- **2026-07-22 — T-30A : portefeuille Offres déployé en prévisualisation**
  - Le commit `015179b` a été récupéré et reconstruit uniquement dans le profil isolé
    `oriana-preview`. Les conteneurs frontend et backend ont été contrôlés `healthy`.
  - La production n’a pas été modifiée. OFF-01 reste « À exécuter » jusqu’au contrôle humain des
    quatre rôles, du desktop, du smartphone et du clavier.
- **2026-07-22 — T-30A : portefeuille Offres restructuré localement**
  - La liste et la fiche sont désormais organisées en maître–détail : recherche par nom, numéro ou
    ville, filtre par nature, compteur de résultats et conservation de la fiche sélectionnée.
  - Sur smartphone, la liste précède la fiche et un retour explicite ramène au portefeuille ; sur
    desktop, la liste et la fiche restent visibles ensemble. Les huit vues et leurs contrats métier
    sont inchangés.
  - Trois non-régressions couvrent la recherche et le filtre, le parcours mobile et la navigation
    clavier entre onglets. La lecture seule du bac à sable reste couverte.
  - Vérifications réussies : lint frontend, build Vite de production et 64 tests frontend sur 64.
    OFF-01 reste « À exécuter » jusqu’à la recette humaine sur la prévisualisation.
  - Ce lot est local : aucun commit, push, déploiement, secret, `.env`, VPS ou production n’a été
    touché.
- **2026-07-21 — T-30A : preuves de navigation Patrimoine renforcées localement**
  - Trois non-régressions couvrent désormais l’ouverture guidée du niveau suivant, le retour
    explicite fiche → liste sur smartphone et la reprise après indisponibilité du chargement.
  - La suite frontend complète réussit avec 61 tests sur 61 ; le lint et le build Vite de
    production réussissent également.
  - La fiche guidée de PAT-01 est préparée dans la matrice T-30A. Son statut reste « À exécuter » :
    ces preuves automatisées ne remplacent pas la recette humaine sur la prévisualisation.
  - Ce lot de preuves et de documentation n’est ni poussé ni déployé.
- **2026-07-21 — T-30A : explorateur Patrimoine restructuré localement**
  - La grille simultanée Site → Bâtiment → Cellule → Lot est remplacée par une navigation à
    onglets avec compteurs, recherche sur le niveau actif, liste principale et fiche contextuelle.
  - Le rattachement courant reste visible dans un fil dédié ; chaque fiche permet d’ouvrir le
    niveau suivant. Sur smartphone, la liste et la fiche se succèdent avec un retour explicite.
  - Les API, autorisations, formulaires et règles de lecture seule restent inchangés. Les contrôles
    réussissent : lint frontend, build Vite et 58 tests frontend sur 58.
  - La vérification visuelle automatisée locale est empêchée par l’isolation réseau du navigateur
    intégré. Le commit `2ff6144` est poussé sur la branche de travail mais n’est pas déployé ; la
    refonte attend la recette humaine sur la prévisualisation.
- **2026-07-21 — T-30A : défaut de syntaxe détecté avant remplacement de la prévisualisation**
  - La reconstruction isolée de la prévisualisation s’est arrêtée pendant le build frontend sur
    une accolade JSX manquante dans `frontend/src/App.jsx` ; aucun conteneur n’a été remplacé.
  - La correction locale est limitée à la fermeture de la propriété `onBack`. Le lint frontend,
    le build Vite de production et les 57 tests frontend réussissent après correction.
  - Le correctif `d3d4ea5` a ensuite été poussé puis reconstruit uniquement dans la prévisualisation
    isolée. Les conteneurs frontend et backend sont sains et l’accueil a été contrôlé humainement.
- **2026-07-20 — T-30A : lecture seule frontend fermée et couverture automatisée consolidée**
  - Patrimoine masque les créations et modifications en prévisualisation ; la qualification reste
    visible avec des champs désactivés et sans commande d’enregistrement.
  - Administration conserve les comptes fictifs consultables mais remplace toute commande de
    gestion par un état « Lecture seule ». Agents IA affiche son indisponibilité, sans charger de
    demande, appeler de connecteur ni simuler de traitement.
  - Le thème sombre est appliqué avant le montage React ; seule la préférence non sensible
    `oriana-theme` est conservée dans `localStorage`.
  - Vérifications réussies : 57 tests frontend sur 57, lint frontend, build Vite, frontières et
    lint backend, puis 161 tests backend sur 162 avec l’intégration PostgreSQL ignorée comme prévu.
  - L’audit automatisé est consigné dans
    `docs/audit/AUDIT_COUVERTURE_AUTOMATISEE_T30A_2026-07-20.md`. Il ne valide pas la recette
    humaine, l’activité normale ou la pointe VPS, R1/R2 ni le `GO T-30A`.
  - Aucun secret, `.env`, VPS, ressource externe, commit, push ou déploiement n’a été touché.
- **2026-07-20 — T-30A : protocole de capacité et d’isolation du VPS spécifié**
  - Trois campagnes sont requises : repos, activité normale et pointe réelle représentative. Les
    commandes autorisées observent uniquement CPU, mémoire, disque, I/O, conteneurs, réseaux,
    volumes, ports et pare-feu.
  - Le protocole interdit toute installation, mutation, lecture de `.env`, inspection Docker,
    journal applicatif, dump, test de charge, sortie brute dans le dépôt ou modification distante.
  - Les seuils bloquants et le budget minimal de R1 conduisent soit à « VPS actuel admissible sous
    conditions », soit à « VPS dédié obligatoire ». Une mesure incomplète produit un No-Go
    conservatoire.
  - Le protocole est prêt mais n’a pas été exécuté. Aucune connexion au VPS, donnée d’exploitation,
    ressource, secret, commit, push ou opération de déploiement n’a été réalisé.
  - Une tentative d’authentification SSH non interactive a ensuite été refusée pour les comptes
    opérateur et administrateur (`publickey`) : la clé protégée n’est pas déverrouillée dans la
    session Codex. Aucune commande ni mesure n’a atteint le VPS ; l’exécution attend une session
    SSH ouverte par l’opérateur, sans communication de la phrase secrète.
  - L’opérateur a exécuté la campagne au repos dans sa session SSH : 2 cœurs, charge
    `0,00 / 0,01 / 0,00`, CPU inactif moyen corrigé autour de 98,5 %, attente I/O et swap nuls,
    environ 6,46 Gio de mémoire disponible, 88,5 Gio de disque disponible et 97 % d’inodes libres.
    Les seuils au repos sont respectés.
  - Un second contrôle tardif, sans utilisation de l’application, confirme environ 98 % de CPU
    inactif et l’absence de pression I/O, swap ou file d’exécution. Il reste classé « repos ». Le
    filtre d’agrégation exclut désormais les en-têtes répétés de `vmstat`.
  - Les projets Compose sont distincts, Grist et PostgreSQL ne publient pas leurs ports natifs et
    n8n reste sur la boucle locale. Le volume au nom automatique appartient au conteneur de
    sauvegarde PostgreSQL de production ; il est hors périmètre de toute remise à zéro T-30A.
  - `ufw` est inactif, mais le pare-feu Hostinger actif accepte uniquement TCP 22, 80 et 443 avant
    une règle finale de blocage général. La protection externe est donc prouvée sans modification ;
    l’ouverture SSH à toute source pourra faire l’objet d’un durcissement séparé.
  - Activité normale et pointe représentative manquent encore : le No-Go conservatoire R1 reste en
    vigueur.
- **2026-07-20 — T-30A : matrice préparée et environnement de recette séparé validé**
  - La recette est structurée par scénario, rôle, appareil, mode d’interaction, résultat et preuve ;
    elle couvre connexion, shell, Patrimoine, Offres, CRM, Matching, Agents IA, Auto-formation et
    Administration.
  - Les observations historiques restent qualifiées comme partielles. Directeur d’agence et
    Administrateur d’agence ne disposent pas encore d’une recette consignée ; le périmètre d’équipe
    du Master consultant reste à vérifier.
  - La prévisualisation T-32 conserve son isolement et son refus de toute écriture. Les créations,
    modifications, erreurs métier, rattachements et parcours n8n exigent un environnement de
    recette distinct, inscriptible et réinitialisable. DEC-037 valide ce principe sans choisir le
    fournisseur ni autoriser la création du profil.
  - Référence automatisée du lot : lint, 52 tests frontend et build réussis ; frontières, lint et
    161 tests backend sur 162 réussis, avec l’intégration PostgreSQL ignorée comme prévu.
  - DEC-038 valide, sans création, un premier lot sur le VPS actuel sous condition de capacité :
    backend hors sandbox, Grist métier isolé, PostgreSQL de sessions et Mailpit interne. Un VPS
    dédié devient obligatoire si la mesure ou l’isolation échoue.
  - n8n est retenu dans un second lot séparément autorisé pour les seuls scénarios Agents IA ;
    production, Grist de production, SMTP réel et n8n de production sont exclus de la recette.
  - Aucun environnement, connecteur, secret, code applicatif, commit, push ou déploiement n’est
    créé ou autorisé par cette décision. T-30A reste active et T-30 reste bloquée.
- **2026-07-20 — T-34B : audit documentaire de persistance clos**
  - DEC-033 à DEC-036 possèdent chacune une entrée unique dans la synthèse et le registre détaillé ;
    la matrice ne contient plus de question ouverte.
  - Les liens du corpus T-34B sont valides, `git diff --check` réussit et le diff reste limité aux
    fichiers Markdown. `.env` est inchangé et aucune signature de secret n’est détectée.
  - La cible de persistance est documentée mais non implémentée. Aucun test de base, migration,
    adaptateur, route, commit, push ou déploiement n’est revendiqué.
- **2026-07-20 — T-34B : conflit atomique de persistance validé**
  - DEC-036 fixe une transaction courte qui recherche et verrouille le brouillon dans le périmètre
    identifiant, auteur, agence et état privé avant de comparer `version_attendue`.
  - La mutation et l’incrément réussissent ensemble, ou le conflit sûr est construit depuis le même
    état verrouillé sans mutation ni fuite. Toute erreur annule la transaction.
  - Les quatre arbitrages de persistance sont clos. Aucun SQL, migration, adaptateur, route, commit,
    push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : curseur opaque de persistance validé**
  - DEC-035 fixe un futur curseur chiffré et authentifié valable 15 minutes, contenant la position
    stable, l’auteur, l’agence, les filtres et une version de format.
  - Le matériel cryptographique restera uniquement dans l’environnement. Le curseur ne conférera
    aucun droit et le serveur revérifiera le périmètre complet à chaque page.
  - Seul le conflit atomique restait alors à arbitrer. Aucun secret, codec, route, SQL, adaptateur,
    commit, push ou déploiement n’avait été ajouté.
- **2026-07-20 — T-34B : persistance de l’idempotence validée**
  - DEC-034 place l’idempotence dans un futur registre technique séparé, unique par agence, auteur
    et empreinte de clé. La clé brute ne sera ni stockée ni journalisée.
  - Le registre conservera aussi l’empreinte déterministe de la commande, la Capture créée et
    l’expiration. Après 24 heures, l’entrée ne sera plus reconnue et pourra être remplacée ou purgée
    sans supprimer la Capture.
  - Curseur opaque et conflit atomique restaient alors à arbitrer. Aucun SQL, table, tâche
    planifiée, adaptateur, commit, push ou déploiement n’avait été ajouté.
- **2026-07-20 — T-34B : rattachement relationnel de persistance validé**
  - DEC-033 représente la proposition de rattachement par quatre références facultatives vers
    Société, Contact, Demande ou Offre, avec au plus une cible renseignée.
  - L’adaptateur traduira ultérieurement cette forme vers `{ type, id }`. La suppression autorisée
    d’une cible détachera la proposition sans supprimer la Capture.
  - Idempotence, curseur opaque et conflit atomique restaient alors à arbitrer. Aucun SQL,
    adaptateur, route, commit, push ou déploiement n’avait été ajouté.
- **2026-07-20 — T-34B : audit et matrice de persistance consignés**
  - L’audit statique confirme le migrateur transactionnel, le rejeu d’idempotence en CI et les
    procédures existantes de sauvegarde/restauration ; aucune base ni donnée d’environnement n’a
    été consultée.
  - Le workflow PostgreSQL devra évoluer avec toute cinquième migration, car il énumère les quatre
    fichiers actuels et attend exactement quatre entrées dans `schema_migrations`.
  - Le CRUD PostgreSQL générique n’est pas adapté aux invariants Capture. Un futur adaptateur dédié
    derrière `captureRepository` est recommandé, sans décision ni implémentation à ce stade.
  - Quatre arbitrages documentés étaient alors ouverts : rattachement polymorphe, idempotence
    24 heures, curseur opaque et conflit atomique. Aucun SQL, adaptateur, route, commit, push ou
    déploiement n’avait été ajouté.
- **2026-07-20 — T-34B lot pur : audit final de robustesse réussi**
  - Le comptage du commentaire s’arrête au 2 001e caractère sans construire de tableau proportionnel
    à la taille d’une entrée externe ; un test couvre désormais une chaîne d’un million de caractères.
  - Vérifications finales réussies : 31 tests documentaires, lint et frontières backend, puis 162
    tests backend dont 161 réussis et l’intégration PostgreSQL ignorée comme prévu.
  - `git diff --check` et le contrôle de traces sensibles restent verts. Aucun commit, push ou
    déploiement n’a été effectué.
- **2026-07-20 — T-34B lot pur : implémentation vérifiée**
  - `backend/src/documentary/drafts.js` valide les créations et modifications partielles, borne les
    commentaires à 2 000 caractères Unicode, protège les champs serveur et normalise la liste.
  - Le catalogue expose `CAPTURE_VERSION_CONFLICT` et le port `captureRepository` exige désormais
    `listByAuthor`. Aucun adaptateur, schéma, route, interface ou stockage local n’est ajouté.
  - Vérifications réussies : 31 tests documentaires ciblés, lint et frontières backend, puis 162
    tests backend dont 161 réussis et l’intégration PostgreSQL ignorée comme prévu.
  - Aucun commit, push ou déploiement n’a été effectué.
- **2026-07-20 — T-34B : audit de cohérence documentaire terminé**
  - Les documents distinguent désormais le contrat validé de la capacité non implémentée ; les
    anciens libellés « proposition à valider » ont été retirés du périmètre T-34B.
  - Le type est obligatoire à la création mais facultatif dans un `PATCH` partiel ; lorsqu’il est
    présent, sa valeur reste contrôlée par `CAPTURE_TYPES`.
  - Liens locaux valides, décisions uniques, `git diff --check` réussi et aucune trace de secret
    détectée. Aucun code, schéma, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : géolocalisation exclue et arbitrages terminés**
  - DEC-032 exclut tout champ, collecte, déduction, transmission ou stockage de géolocalisation du
    premier contrat de brouillon.
  - Un ajout ultérieur exigera une décision sur la finalité, le consentement, la précision, la
    rétention, l’effacement et les accès.
  - Les dix arbitrages DEC-023 à DEC-032 sont désormais validés. Aucun code, schéma, commit, push
    ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : premier lot strictement en ligne validé**
  - DEC-031 exclut du premier lot toute persistance de donnée métier dans IndexedDB,
    `localStorage`, `sessionStorage` ou le cache du navigateur.
  - Un éventuel service worker reste limité au shell non sensible. Le mode déconnecté complet est
    reporté après validation de son modèle de menace.
  - Seule la géolocalisation reste à arbitrer. Aucun code, schéma, commit, push ou déploiement n’a
    été ajouté.
- **2026-07-20 — T-34B : champs modifiables validés**
  - DEC-030 limite la modification au type catalogué, au commentaire facultatif de 2 000
    caractères et au rattachement proposé dont la cible est contrôlée côté serveur.
  - L’auteur, l’agence, l’état, la version, les dates, les fichiers et la géolocalisation restent
    non modifiables ; les champs inconnus sont rejetés.
  - Les frontières hors ligne et géolocalisation restent à arbitrer. Aucun code, schéma, commit,
    push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : liste privée des brouillons validée**
  - DEC-029 ajoute au contrat futur du repository `listByAuthor`, limité à l’auteur et à l’agence
    issus de la session, sans élargissement hiérarchique ni accès métier du super administrateur.
  - La liste utilise un curseur opaque, le tri modification décroissante puis identifiant, 20
    résultats par défaut et 50 maximum.
  - Champs modifiables, frontière hors ligne et géolocalisation restent à arbitrer. Aucun code,
    schéma, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : création idempotente validée**
  - DEC-028 borne pendant 24 heures une clé aléatoire à l’utilisateur et à son agence. Même clé et
    mêmes données retournent le brouillon existant ; des données différentes produisent un conflit.
  - La clé ne remplace ni la session ni les droits et peut être purgée après expiration. Liste,
    champs modifiables, frontière hors ligne et géolocalisation restent à arbitrer.
  - Aucun code, schéma, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : sauvegarde en nouveau brouillon validée**
  - DEC-027 permet de préserver des valeurs locales en créant explicitement un nouveau brouillon
    privé par le contrat normal de création, avec nouvel identifiant et version `1`.
  - Seuls les champs modifiables choisis sont repris. Fichiers, état technique et géolocalisation ne
    sont jamais copiés implicitement ; l’accès au brouillon source est revérifié.
  - L’idempotence reste ouverte avec les quatre autres arbitrages, soit cinq choix restants. Aucun
    code, schéma, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : résolution humaine du conflit validée**
  - DEC-026 interdit tout écrasement global et toute fusion automatique d’un brouillon en conflit.
  - L’utilisateur charge la version serveur ou réapplique manuellement des champs choisis avant une
    nouvelle commande. La comparaison doit rester explicite, accessible au clavier et au toucher.
  - La duplication reste ouverte avec les cinq autres arbitrages, soit six choix restants. Aucun
    code, schéma, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : réponse de conflit validée**
  - DEC-025 fixe `409 CAPTURE_VERSION_CONFLICT`, avec version serveur et seuls champs modifiables
    sûrs après contrôle complet de la session, du rôle, de l’agence, de l’auteur et de l’état privé.
  - Un objet absent ou non visible ne divulgue aucune version ni valeur. Les actions de résolution
    restent ouvertes avec les six autres arbitrages, soit sept choix restants.
  - Aucun code, schéma, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : transport de la version attendue validé**
  - DEC-024 impose `version_attendue` dans le JSON de chaque `PATCH` de brouillon. Elle doit être un
    entier positif et son absence ou son invalidité refuse la commande avant mutation.
  - Le contrat reste cohérent avec `updateWithExpectedVersion`. La réponse de conflit et sa
    résolution font partie des huit arbitrages restants.
  - Aucun code, schéma, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : version des brouillons validée**
  - DEC-023 fixe la version initiale d’une Capture à `1` et son incrément atomique à `1` après chaque
    mutation réussie. Une commande refusée ou en conflit ne modifie pas la version.
  - La version reste locale à la Capture et ne constitue pas une horloge globale. Le transport, la
    réponse de conflit et sa résolution font partie des neuf arbitrages restants.
  - Aucun code, schéma, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34B : proposition des brouillons multi-appareil rédigée**
  - L’audit confirme que T-34A fournit les politiques et le port de mise à jour avec version, mais
    qu’aucune table, liste de brouillons, route, interface, PWA ou persistance navigateur n’existe.
  - La proposition borne les champs modifiables, la concurrence optimiste, le conflit `409`, la
    reprise entre sessions, l’idempotence de création et les contrôles de périmètre.
  - Le premier lot recommandé reste pur et en ligne. IndexedDB, service worker, médias locaux et
    géolocalisation sont différés jusqu’au modèle de menace et aux décisions correspondantes.
  - Dix arbitrages ont été soumis à validation humaine. Aucun code, secret, schéma, fournisseur,
    commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34A lot 1 : audit final prêt pour commit**
  - L’audit a aligné les quotas `Mo`/`Go` sur des unités décimales et fermé l’accès aux actions non
    cataloguées sur un brouillon privé ; un test de non-régression couvre ce refus.
  - `SPEC.md`, l’architecture documentaire, l’annexe T-34A et les décisions distinguent désormais
    le noyau pur implémenté du stockage objet, de la persistance et de l’activation encore différés.
  - Vérifications réussies : frontières architecturales, ESLint, liens Markdown locaux, contrôle du
    diff, recherche ciblée de motifs sensibles et 152 tests backend sur 153, avec l’intégration
    PostgreSQL ignorée. Un premier passage concurrent avait échoué sans détail sur Mandats ; le
    fichier puis la suite complète ont réussi sans correction dans cette zone.
  - Aucun fichier n’est indexé. Aucun secret, schéma, route, adaptateur réel, commit, push ou
    déploiement n’a été ajouté par l’audit.
- **2026-07-20 — T-34A lot 1 : contrats de ports implémentés et lot clos**
  - Les six ports documentaires disposent d’une liste immuable d’opérations requises et d’un
    contrôle de composition qui refuse tout double ou futur adaptateur incomplet.
  - `captureRepository`, `fileRepository`, `objectStorage`, `malwareScanner`, `previewGenerator` et
    `retentionExecutor` restent sans implémentation réelle et ne sont pas composés dans l’application.
  - Vérifications réussies : frontières architecturales et ESLint, 22 tests documentaires, puis 152
    tests backend réussis sur 153 avec l’intégration PostgreSQL ignorée.
  - Le lot 1 pur est clos. Aucun schéma, route, fournisseur, secret, commit, push ou déploiement n’a
    été ajouté.
- **2026-07-20 — T-34A lot 1 : politiques documentaires implémentées**
  - Les politiques pures contrôlent conjointement extension, MIME déclaré, MIME détecté, taille et
    durée audio, ainsi que les quatre rattachements autorisés.
  - Les transitions Capture/Fichier, échéances DEC-020, gel juridique et verdicts DEC-022 sont
    déterministes. Seul `sain` ouvre la suite du traitement.
  - Les droits réservent le brouillon à son auteur, bornent le master à son équipe soumise, la
    validation aux directeur/admin de l’agence et refusent tout accès métier implicite au super admin.
  - Vérifications réussies : frontières architecturales et ESLint, 17 tests documentaires, puis 147
    tests backend réussis sur 148 avec l’intégration PostgreSQL ignorée.
  - Aucun port, route, fournisseur, secret, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34A lot 1 : catalogues et erreurs implémentés**
  - Le nouveau module documentaire expose les catalogues immuables de types, cibles, formats,
    états, verdicts, quotas et conservations issus de DEC-018 à DEC-022.
  - `DocumentaryError` limite les erreurs du domaine à six codes stables, sans statut HTTP ni détail
    fournisseur. Aucune route, persistance, variable d’environnement ou composition n’est ajoutée.
  - Vérifications réussies : frontières architecturales et ESLint, 8 tests ciblés, puis 138 tests
    backend réussis sur 139 avec l’intégration PostgreSQL ignorée.
  - Les politiques pures et contrats de ports restent à implémenter. Aucun commit, push ou
    déploiement n’a été réalisé.
- **2026-07-20 — T-34A : premier lot technique délimité**
  - L’audit confirme l’absence de tables Capture/Fichier, de ports documentaires et de routes
    `/socle` dans le backend actuel.
  - Le lot proposé crée seulement un module pur de catalogues, politiques, erreurs et contrats de
    ports, avec tests unitaires et sans import Express, persistance, réseau, filesystem ou fournisseur.
  - Migrations, routes, composition, stockage objet, ClamAV, OCR, IA et activation restent hors lot.
    La source opérationnelle Grist et le blocage du Go T-30 sont inchangés.
  - Aucun code applicatif, secret, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34A : antivirus de preuve validé**
  - DEC-022 retient ClamAV `clamd` en conteneur isolé derrière `malwareScanner`, sans exposition
    publique ni droit métier général.
  - Seul `sain` permet la suite ; `infecte`, `non_analysable`, `erreur` et `indisponible` maintiennent
    le fichier en quarantaine et aucun diagnostic brut ne traverse l’API.
  - L’activation reste interdite avant POC de chaque format, de la charge, de l’indisponibilité et
    de la fraîcheur des signatures, avec capacité réservée de 3 Gio minimum et 4 Gio préférés.
  - Le stockage reste reporté à la qualification Qaegis. Aucun scanner, secret, commit, push ou
    déploiement n’a été ajouté.
- **2026-07-20 — T-34A : étude antivirus préparée**
  - ClamAV `clamd` en conteneur isolé est recommandé pour la preuve derrière le port
    `malwareScanner`, avec flux borné et verdicts normalisés.
  - Seul `sain` permet la suite ; infection, format non analysable, erreur ou indisponibilité
    maintiennent le fichier en quarantaine. HEIC, WebM et MP4 exigent une preuve spécifique.
  - La documentation officielle recommande 3 Gio de RAM au minimum et 4 Gio de préférence ; aucune
    installation sur le VPS actuel n’est autorisée avant mesure de capacité et POC de charge.
  - Aucun scanner, fournisseur, secret, commit, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34A : piste Qaegis intégrée à l’étude de stockage**
  - Qaegis devient le candidat prioritaire à qualifier ; Scaleway Multi-AZ Paris reste la référence
    technique et la solution de repli, sans décision fournisseur définitive.
  - Aucune documentation technique publique clairement attribuable à cette offre Qaegis n’a été
    identifiée. Un questionnaire couvre responsabilités, régions, S3, droits, chiffrement,
    restauration, conformité, coûts et preuve fictive.
  - Aucun compte, engagement, secret, push ou déploiement n’a été créé.
- **2026-07-20 — T-34A : étude du stockage objet préparée**
  - Les offres officielles Scaleway, OVHcloud, Backblaze et Cloudflare ont été comparées sur région,
    S3, versionnement, cycle de vie, chiffrement, restauration et coût.
  - Scaleway Standard Multi-AZ Paris constitue la référence technique étudiée ; la piste Qaegis a
    ensuite été ajoutée comme candidat prioritaire à qualifier.
  - Cloudflare R2 est écarté comme stockage principal car son API S3 n’implémente pas les opérations
    de versionnement requises. Aucun compte, abonnement, secret, push ou déploiement n’a été créé.
- **2026-07-20 — T-34A : rattachements initiaux validés**
  - DEC-021 autorise Société, Contact, Demande et Offre, sous contrôle serveur du rôle, de l’agence,
    des rattachements et de la visibilité de la cible.
  - Territoire, Opportunité, Tâche et Idée éditoriale restent des intentions de brouillon non
    validables jusqu’à l’implémentation de leurs contrats, persistance et droits.
  - Aucun code, fournisseur, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34A : matrice de conservation validée**
  - DEC-020 fixe 24 heures pour un transfert incomplet, 7 jours pour une quarantaine, 90 jours
    d’inactivité pour un brouillon privé, 30 jours pour une capture rejetée ou un aperçu
    régénérable, et la durée de vie du parent pour un original validé.
  - Le gel juridique suspend toute purge et une restauration ne doit pas remettre en circulation un
    objet déjà purgé. La validation métier et juridique reste obligatoire avant production.
  - Aucun code, fournisseur, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34A : quotas initiaux validés**
  - DEC-019 fixe 20 Mo par fichier, 10 fichiers ou 100 Mo par capture, 100 fichiers ou 2 Go par
    utilisateur et par jour, puis 500 fichiers ou 10 Go par agence et par jour.
  - Une alerte est prévue à 80 %. Les limites restent configurables côté serveur et révisables après
    mesure ; `413` distingue la taille du fichier et `429` le quota journalier.
  - Aucun code, fournisseur, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34A : profil de capture vocale validé**
  - DEC-018 accepte `audio/webm` et `audio/mp4`, avec un plafond de 5 minutes et 20 Mo.
  - Le backend devra contrôler le type réel, conserver l’original et produire la version de travail
    de façon asynchrone ; une alternative textuelle reste disponible.
  - La recette sur terminaux ciblés, l’antivirus et l’action explicite avant transcription restent
    obligatoires. Aucun code, fournisseur, push ou déploiement n’a été ajouté.
- **2026-07-20 — T-34A : proposition du contrat documentaire rédigée**
  - L’annexe décrit métadonnées, versions, empreintes, droits, quarantaine, ports internes et
    restauration conjointe des métadonnées et objets.
  - Les formats documentaires et la limite de 20 Mo sont repris des décisions existantes ; audio,
    quotas et conservation ont ensuite été arbitrés explicitement par DEC-018 à DEC-020.
  - La recette de restauration rapproche inventaire, versions, empreintes, droits, quarantaines et
    purges en attente, tout en vérifiant que les objets restaurés restent privés.
  - Deux arbitrages restent bloquants après DEC-018 à DEC-021 : stockage objet et antivirus. Aucun
    schéma, route, fournisseur, push ou déploiement n’a été ajouté.
  - Un support non normatif prépare pour chacun une recommandation, une alternative et ses
    conséquences ; aucune option ne devient applicable sans validation humaine.
- **2026-07-20 — T-34 : cadrage et conditions d’activation validés**
  - T-34 reste découpée en socle documentaire, brouillons multi-appareil, envoi résilient, analyse
    asynchrone et validation mobile, dans cet ordre.
  - Le développement isolé est possible, mais aucune activation en production ne précède le Go
    T-30, les matrices de droits/rétention et la restauration vérifiée du stockage objet.
  - Le hors-ligne exclut `localStorage` et `sessionStorage` pour les données sensibles ; les médias
    locaux exigent un modèle de menace, une durée bornée et une purge vérifiable.
  - T-34D constitue le premier usage fonctionnel IA envisagé. Les ports et l’OCR peuvent précéder
    T-42, mais aucun fournisseur génératif n’est activé sans AI Gateway ou décision transitoire.
  - Aucun schéma, route, interface, fournisseur, variable d’environnement, push ou déploiement n’a
    été ajouté par ce cadrage documentaire.
- **2026-07-20 — T-33F et T-33 : frontières automatisées et tâches closes**
  - `checkArchitecture.js`, exécuté par le lint backend, refuse les imports d’un service vers un
    middleware, l’accès aux adaptateurs hors composition, les sorties du frontend hors de son
    source et les appels réseau hors des connecteurs ou de l’API frontend.
  - La politique `resourceMatchesScope` appartient désormais au service partagé `accessPolicy` ;
    cinq services métier ne dépendent plus du middleware HTTP.
  - Quatre tests prouvent le refus des violations et les exceptions de composition. Le contrôle
    architectural et les lints sont verts ; le frontend construit et réussit 52 tests.
  - La suite backend finale réussit 130 tests sur 131, avec l’intégration PostgreSQL ignorée. Un
    premier passage avait signalé isolément le fichier Patrimoine sans détail ; celui-ci a ensuite
    réussi seul puis dans la suite complète, sans modification supplémentaire.
  - Limites : l’analyse porte sur les imports ES modules statiques/dynamiques à chaîne littérale et
    les primitives réseau explicites. Les scripts d’exploitation et tests restent hors du chemin
    applicatif contrôlé. Aucun push ni déploiement n’a été réalisé.
- **2026-07-20 — T-33E : contrats transverses validés et tâche close**
  - La validation humaine confirme les contrats cibles d’Audit, Notification, Préférence,
    Consentement, Fichier, Tâche et Capture, ainsi que leurs frontières respectives.
  - La clôture autorise les futures tâches propriétaires à s’appuyer sur ces contrats ; elle ne
    crée aucune table, route, interface ou capacité et ne vaut pas activation en production.
  - Chaque implémentation devra encore valider ses catalogues, transitions, finalités, durées et
    règles réglementaires applicables avant activation.
- **2026-07-20 — T-33E : proposition des contrats transverses prête à valider**
  - Audit, Notification, Préférence, Consentement, Fichier, Tâche et Capture disposent désormais
    d’une proposition distinguant autorité, données minimales, cycle de vie, droits et conservation.
  - Un contrat API cible explicite les opérations permises, notamment l’absence de CRUD destructif
    pour l’audit et le consentement, la reprise des fichiers et la validation humaine des captures.
  - Les durées légales, finalités, catalogues et matrices détaillées restent soumis à validation
    métier et architecture ; aucune valeur réglementaire n’a été inventée.
  - Aucune table, route, interface, donnée fictive, variable d’environnement, intégration IA,
    publication GitHub ou opération de déploiement n’a été créée par ce lot documentaire.
- **2026-07-20 — T-33D : connecteurs externes encapsulés et tâche close**
  - L’audit final confirme que l’authentification et le service Agents dépendent uniquement des
    ports injectés. Nodemailer, `fetch`, les URL et les variables fournisseur restent confinés aux
    adaptateurs et à la composition au démarrage.
  - SMTP conserve des délais bornés et n8n son déclenchement asynchrone avec délai de cinq
    secondes. Les indisponibilités, refus et configurations absentes sont testés sans appel réel.
  - Les secrets demeurent hors des données métier et le callback n8n conserve sa comparaison
    temporelle sûre. Les codes API existants et les routes publiques sont inchangés.
  - T-33D n’intègre aucun fournisseur IA ; elle prépare seulement les frontières prévues pour
    T-34D, T-36 et T-42. La dernière suite compte 126 tests réussis sur 127, avec l’intégration
    PostgreSQL ignorée.
- **2026-07-20 — T-33D : second lot du connecteur d’orchestration n8n**
  - Le service Agents dépend désormais d’un port d’orchestration injecté. Il ne lit plus de
    variable d’environnement, ne construit plus d’URL fournisseur et n’appelle plus `fetch`.
  - L’adaptateur n8n est composé par `server.js`, conserve le délai de cinq secondes, le secret
    dédié au webhook et l’URL de callback. Les codes API n8n historiques restent inchangés.
  - Le callback conserve sa comparaison temporelle sûre et reçoit explicitement son secret depuis
    la composition. Le suivi en persistance reste la boîte aux lettres asynchrone du résultat.
  - Aucune IA, route publique ou donnée n’est ajoutée. Vérifications réussies : lint backend,
    126 tests backend réussis sur 127 avec l’intégration PostgreSQL ignorée, et `git diff --check`.
- **2026-07-19 — T-33D : premier lot du connecteur de messagerie**
  - Le service d’authentification dépend désormais d’un port de messagerie injecté et n’importe
    plus directement Nodemailer ni un adaptateur SMTP.
  - `server.js` compose explicitement l’adaptateur avec les variables d’environnement. Le bac à
    sable, qui injecte son propre service d’authentification, ne crée aucun transport SMTP.
  - L’adaptateur conserve le contenu du message existant, refuse explicitement une configuration
    incomplète et borne connexion, salutation et socket. Aucun secret n’est journalisé ou renvoyé.
  - Aucune intégration IA, route publique ou donnée n’est modifiée. Vérifications réussies : lint
    backend, 123 tests backend réussis sur 124 avec l’intégration
    PostgreSQL ignorée, et `git diff --check`.
- **2026-07-19 — T-33C : persistance métier découplée et tâche close**
  - L’audit de clôture confirme qu’aucun service métier, contrôleur ou middleware n’importe un
    adaptateur Grist, PostgreSQL ou bac à sable. Les modules dépendent uniquement du port injecté.
  - Les helpers de filtres et de champs utilisent désormais un vocabulaire neutre. Les codes
    historiques `GRIST_READBACK_FAILED` restent inchangés afin de préserver le contrat d’erreur.
  - La composition choisit explicitement Grist dans l’état opérationnel actuel, PostgreSQL reste
    la cible non basculée et le bac à sable conserve son adaptateur mémoire en lecture seule.
  - Aucune bascule T-30, route publique, donnée ou capacité n’est modifiée. Vérifications du lot de
    clôture réussies : lint backend, 120 tests backend réussis sur 121 avec l’intégration
    PostgreSQL ignorée, et `git diff --check`.
- **2026-07-19 — T-33C : premier lot de persistance explicitement composée**
  - L’application et le service d’authentification n’importent plus le client Grist et refusent
    désormais une composition privée du port de persistance ou du référentiel d’identité requis.
  - Le choix opérationnel actuel de Grist est conservé, mais il est effectué explicitement dans
    `server.js`. La fabrique de persistance ne suppose plus silencieusement un fournisseur absent.
  - Les routes HTTP utilisent un double commun injecté dans les tests qui n’exercent pas la
    persistance. Le bac à sable conserve son adaptateur mémoire isolé et lecture seule.
  - Aucune bascule PostgreSQL, route publique, donnée, variable d’environnement ou capacité n’est
    modifiée. Vérifications réussies : lint backend, 120 tests backend réussis sur 121 avec
    l’intégration PostgreSQL ignorée, et `git diff --check`.
- **2026-07-19 — T-33B : politiques de rôles consolidées**
  - Le référentiel canonique porte désormais les décisions communes de gestion des données
    d'agence et d'administration des utilisateurs. Les middlewares et règles d'exclusivité les
    réutilisent au lieu de maintenir leurs propres listes de rôles.
  - L'ancien alias `manager` est normalisé en `master_consultant` et ne reçoit donc pas les droits
    de suppression réservés au directeur et à l'administrateur d'agence. L'alias `admin` conserve
    son équivalence avec `admin_agence`.
  - Le super administrateur peut administrer les utilisateurs, mais ne reçoit toujours aucun
    périmètre métier ni droit implicite de gestion des données d'une agence.
  - La normalisation des anciens rôles lors de l'import Grist réutilise également le référentiel
    canonique. Les politiques des cinq rôles sont couvertes directement.
  - Vérifications réussies : lint backend, 118 tests backend réussis sur 119 avec l'intégration
    PostgreSQL ignorée, et `git diff --check`.
- **2026-07-19 — T-33B : premier lot d'injection du référentiel d'identité**
  - Le middleware de périmètre n'importe plus Grist et ne possède plus de fournisseur implicite
    pour charger l'équipe d'un master consultant.
  - La composition fournit explicitement le référentiel d'identité. Une absence de configuration
    échoue sans construire de périmètre et sans élargir les droits.
  - Un test direct couvre désormais les périmètres de lecture et d'écriture des cinq rôles ; un
    second vérifie l'échec sûr lorsque le référentiel requis n'est pas injecté.
  - Ce lot ne bascule aucune persistance et ne modifie ni route publique, ni session, ni donnée.
    Vérifications réussies : lint backend, 117 tests backend réussis sur 118 avec l'intégration
    PostgreSQL ignorée, et `git diff --check`.
- **2026-07-19 — T-33A : frontières du socle cartographiées**
  - Une architecture de transition décrit la chaîne frontend, couches backend, ports internes,
    adaptateurs et composition sans transformer le monolithe en services séparés.
  - Les responsabilités de l'identité, des autorisations, des sessions, de la persistance et des
    connecteurs reçoivent un propriétaire explicite. Les objets transverses non spécifiés restent
    exclus du code et des migrations.
  - Les dépendances autorisées et interdites sont consignées avec six écarts observés, chacun
    rattaché à T-33B, T-33C, T-33D, T-33E ou T-33F.
  - T-33A ne change aucun comportement : Grist reste la source opérationnelle, PostgreSQL la cible
    non basculée et le bac à sable demeure isolé en lecture seule.
  - Aucun code, environnement, commit, push ou déploiement n'a été modifié ou déclenché.
- **2026-07-19 — T-33 : audit du socle et découpage opératoire**
  - Le socle possède déjà authentification, rôles, agences, sessions, autorisations, client API et
    sélection de persistance, mais ces responsabilités restent dispersées dans la composition,
    les services et les middlewares.
  - Des dépendances implicites à Grist subsistent dans l'application, l'authentification et le
    calcul du périmètre. Le service Agents construit directement son appel n8n et le service
    d'authentification dépend directement du transport SMTP.
  - Audit, notifications, préférences, consentements, fichiers, tâches et capture ne disposent pas
    encore de contrats complets ni de tables autorisées. Ils doivent être spécifiés avant code et
    ne seront pas simulés pour satisfaire artificiellement T-33.
  - T-33 est découpée en six lots : frontières, identité/autorisations, persistance, connecteurs,
    spécification des objets transverses et contrôles automatisés. Grist demeure la source
    opérationnelle actuelle et aucune bascule T-30 n'est engagée.
  - Audit réalisé en lecture seule : aucun code, environnement, commit, push ou déploiement n'a été
    modifié ou déclenché.
- **2026-07-19 — T-32 : périmètre clarifié et tâche close**
  - L’audit de séquencement a confirmé que les tunnels, interactions, tâches et alertes de veille ne
    peuvent pas être ajoutés honnêtement au bac à sable avant la définition de leurs contrats.
  - Le plan rattache désormais le socle des tâches à T-33, les tunnels à T-35, les interactions à
    T-36, la todolist à T-38 et les alertes de veille à T-41. Les données fictives correspondantes
    seront développées avec ces capacités, sans simulation anticipée.
  - T-32 est close sur le périmètre validé : cinq rôles fictifs, profil isolé en lecture seule,
    offres, patrimoine, sociétés, contacts, demandes, rapprochements et photographies locales.
    La génération est déterministe et documentée ; les relations et l’ergonomie CRM ont été
    validées humainement dans la prévisualisation.
  - Cette clarification documentaire ne modifie aucun code, contrat métier ou environnement et ne
    déclenche aucun commit, push ou déploiement.
- **2026-07-19 — T-32 : vue CRM maître–détail déployée et validée**
  - La vue en trois colonnes, jugée peu ergonomique en recette, est remplacée par un répertoire de
    sociétés et une fiche contextualisée présentant successivement contacts, demandes, critères et
    rapprochements.
  - La société, le contact et la demande actifs disposent d’un état visuel et accessible explicite.
    La recherche locale filtre le répertoire et les demandes restent bornées à la société choisie.
  - Sur smartphone, la liste et la fiche constituent deux étapes avec un retour vers les sociétés ;
    aucun nouveau contrat métier, tunnel ou objet non spécifié n’est introduit.
  - Un libellé accessible complet distingue chaque demande. Vérifications réussies :
    `git diff --check`, lint frontend, 52 tests frontend et build de production.
  - Le commit `121cab2` a été poussé puis le frontend de prévisualisation seul a été reconstruit et
    redémarré. Frontend et backend ont été contrôlés sains.
  - Après actualisation forcée et parcours de la fiche, cette nouvelle ergonomie a été validée
    humainement comme nettement meilleure que la vue en trois colonnes.
- **2026-07-19 — T-32 : premier lot CRM fictif déployé, ergonomie à reprendre**
  - Le générateur déterministe ajoute 4 sociétés, 6 contacts, 5 demandes et 6 résultats de matching
    reliés aux lots fictifs déjà présents, sans identité ni adresse de messagerie réelle.
  - Le serveur de prévisualisation branche explicitement les routes CRM et Matching sur la
    persistance isolée en mémoire ; aucune lecture Grist ou PostgreSQL n’est requise.
  - En mode `?sandbox=1`, le CRM signale la lecture seule et masque les actions d’écriture, y compris
    « Nouvelle opportunité » depuis l’accueil. Les parcours normaux conservent leur CRUD existant.
  - Les tunnels, actions et transactions ne sont pas simulés : leurs contrats restent à arbitrer
    avant code. Vérifications réussies : lint backend, 115 tests backend sur 116 avec 1 test
    PostgreSQL ignoré, lint frontend, 52 tests frontend et build de production.
  - Le commit `57f1ab1` a été poussé puis les deux conteneurs de prévisualisation ont été reconstruits
    et contrôlés sains. Les données ont été validées humainement ; la présentation en trois colonnes
    a été refusée en recette ergonomique et fait l’objet du correctif ci-dessus.
- **2026-07-19 — T-32 : adaptation responsive de l’en-tête déployée et validée**
  - L’en-tête de page conserve une composition verticale jusqu’aux écrans réellement larges afin
    que les actions ne compriment plus le titre et sa description avec un zoom élevé.
  - Sur l’accueil, le prénom et l’emoji de bienvenue restent solidaires pour éviter un emoji isolé.
  - Vérifications locales réussies : `git diff --check`, lint frontend, 51 tests frontend et build
    de production. Le commit `2ef2b33` a été poussé puis le frontend de prévisualisation seul a été
    reconstruit et redémarré ; frontend et backend sont sains.
  - Le rendu a été validé humainement après actualisation forcée : titre et emoji restent groupés,
    tandis que les actions disposent de leur propre espace sans comprimer le contenu.
- **2026-07-19 — T-32 : prévisualisation HTTPS ouverte et onboarding lecture seule corrigé**
  - Le profil isolé est déployé sur `oriana-preview.boreal.immo` et
    `api-oriana-preview.boreal.immo`. Les deux endpoints répondent en HTTPS avec un statut 200 et
    les conteneurs de production n’ont pas été redémarrés.
  - La connexion au compte fictif multirôle et l’ouverture du rôle administrateur d’agence sont
    validées humainement. La recette a révélé que l’onboarding tentait encore d’écrire sa progression
    malgré le mode lecture seule.
  - Le frontend détecte désormais `?sandbox=1`, fait avancer ce parcours uniquement en mémoire et
    affiche « Prévisualisation : progression non enregistrée. » sans appeler le serveur.
  - Le correctif `eef3573` a été poussé puis redéployé uniquement sur le frontend de prévisualisation.
    La progression locale et l’absence d’erreur ont été validées humainement ; le backend est resté
    sain et les services de production n’ont pas été redémarrés.
- **2026-07-19 — T-32 : profil de prévisualisation isolé préparé, non déployé**
  - Un profil Compose distinct assemble le frontend et le backend fictif sans conteneur PostgreSQL,
    sans Grist et sans n8n. Il n’utilise ni les noms de conteneurs ni les volumes de production.
  - Le backend embarque les fixtures, les clone en mémoire et exige un compte fictif multirôle dont
    l’adresse et le hash bcrypt sont fournis uniquement par `.env.preview`, exclu de Git.
  - L’authentification, la sélection des cinq rôles, la session HTTPS et les périmètres serveur sont
    conservés. Toute écriture métier ou modification du compte répond `SANDBOX_READ_ONLY`.
  - Le mode opératoire est documenté dans `deploy/PREVIEW.md`. Aucun profil n’a été lancé, aucun DNS
    modifié et aucun déploiement effectué ; ces actions restent soumises à une validation distincte.
  - Vérifications réussies : lint backend, 113 tests backend réussis et 1 intégration PostgreSQL
    ignorée, lint frontend, 50 tests frontend, build frontend et `git diff --check`.
  - La résolution statique a ensuite été validée sur le VPS avec Docker Compose v5.3.1 depuis une
    copie temporaire du commit `e4d419e` : `docker compose config --no-env-resolution --quiet` a
    produit `COMPOSE_CONFIG_OK`. Aucun build, conteneur, DNS ou déploiement n’a été déclenché.
  - T-32 reste en cours : les tunnels CRM, tâches et alertes de veille restent à enrichir.
- **2026-07-19 — T-32 : premier jeu d’offres fictives et photographies locales**
  - Un générateur déterministe prépare cinq offres reliées à leur agence, utilisateurs fictifs,
    adresses non précises, sites, bâtiments, cellules, lots, conditions financières, mandats et
    médias. Trois biens se situent dans le Val-d’Oise et deux dans le nord de la Seine-et-Marne.
  - Les cinq photographies ont été générées spécifiquement pour orIAna, optimisées en WebP et
    stockées dans le frontend sans URL externe, marque, texte ni personne identifiable.
  - Le générateur ne contacte ni Grist ni PostgreSQL et peut être relancé avec
    `npm run generate:sandbox --prefix backend` pour produire le même fichier JSON.
  - Le backend expose le jeu en lecture seule uniquement avec `ORIANA_SANDBOX_MODE=1`, refuse ce
    mode en production et conserve l’authentification ainsi que les contrôles de rôle réels.
  - La fiche Offre activée par `?sandbox=1` présente les photographies et huit vues : Synthèse,
    Bien & surfaces, Finances, Mandats, Actions, Visites, Documents et Transactions. Les quatre
    contrats non implémentés affichent un état indisponible explicite, sans action simulée.
  - T-32 reste en cours : ce premier lot ne couvre pas encore tous les tunnels CRM, interactions,
    tâches et alertes prévus par son acceptation.
- **2026-07-19 — T-30A : correctifs frontend publiés sur la branche de travail**
  - Les commits `86c97e1` (interactions et charte frontend) et `bb39638` (rôles et administration)
    ont été poussés sur `agent/t30a-interactions`, désormais synchronisée avec sa branche distante.
  - Aucun workflow GitHub Actions n’a été déclenché : les contrôles présents sont manuels ou
    limités aux pushes sur `main`. Cette absence de contrôle n’est donc pas un échec de CI.
  - Aucune fusion dans `main`, pull request, relance de workflow ou mise en production n’a été
    effectuée. La version publique reste inchangée.
- **2026-07-19 — T-30A : initialisation sombre garantie avant React**
  - Le thème sombre était déjà la valeur par défaut du hook, mais le document HTML ne portait pas
    d’attribut initial explicite. `data-theme="dark"` est maintenant posé directement sur la racine
    afin d’éviter un premier affichage clair et de garantir le sombre après rechargement complet.
  - Vérifications réussies : `git diff --check`, 49 tests frontend et build de production.
  - La version publique ne reçoit pas cette correction tant qu’aucun commit, push et déploiement
    n’ont été séparément autorisés et réalisés.
- **2026-07-19 — T-30A : thème sombre confirmé comme présentation par défaut**
  - La recette humaine confirme que le mode sombre correspond mieux à l’identité visuelle attendue ;
    il remplace donc le choix local précédent du thème clair par défaut. Le thème clair reste
    disponible depuis la commande existante.
  - La sidebar passe à 92 % d’opacité avec un léger flou d’arrière-plan et des libellés plus clairs,
    afin de mieux distinguer le menu sans perdre l’aubergine presque noir validé.
  - La charte et le test de thème sont réalignés sur cette décision. Vérifications réussies :
    `git diff --check`, lint frontend, 49 tests frontend et build de production. Aucun commit,
    déploiement ou publication GitHub n’a été effectué.
- **2026-07-19 — T-30A : cohérence visuelle du shell finalisée localement**
  - En l’absence de préférence explicite, le thème clair devient la présentation initiale conforme
    à la charte : sidebar aubergine sombre et espace métier clair. Le thème sombre et son bouton
    restent disponibles.
  - Le bouton de l’assistant futur conserve son explication mais adopte une surface secondaire,
    sans dégradé violet ni élévation d’action principale.
  - Un test de non-régression vérifie le thème clair par défaut et la présence du changement de
    thème.
  - Vérifications réussies : `git diff --check`, lint frontend, 49 tests frontend et build de
    production. La recette visuelle humaine à 320/375 px reste nécessaire ; aucun commit,
    déploiement ou publication GitHub n’a été effectué.
- **2026-07-19 — T-30A : navigation clavier et primitives de fiches renforcées**
  - Le sélecteur de rôle place le focus sur le rôle actif, gère flèches, début, fin et `Échap`, se
    ferme au clic extérieur et restitue le focus à son déclencheur.
  - Les actions de `PageHeader` peuvent revenir à la ligne afin de limiter les débordements sur
    petite largeur et avec zoom.
  - `Tabs` fournit désormais les relations onglet–panneau, un seul arrêt de tabulation, les flèches
    horizontales, début et fin. Ce contrat est prêt pour les huit vues Offre et cinq vues CRM.
  - Trois tests supplémentaires couvrent le focus du sélecteur, les onglets et les actions
    adaptatives d’en-tête.
  - Vérifications réussies : `git diff --check`, lint frontend, 48 tests frontend et build de
    production. Aucun commit, déploiement ou publication GitHub n’a été effectué.
- **2026-07-19 — T-30A : second lot du shell accessible et factuel**
  - Le footer ne déclare plus le backend « Opérationnel » par défaut. Il appelle réellement
    `GET /health` via le client API centralisé et affiche seulement vérification, disponibilité ou
    indisponibilité de l’API ; il ne prétend pas mesurer PostgreSQL ou les connecteurs externes.
  - Le champ de recherche factice est remplacé par un bouton sémantique utilisable au clavier qui
    ouvre l’explication de disponibilité déjà prévue.
  - Un lien d’évitement « Aller au contenu » est placé avant le shell et cible le contenu principal.
  - Trois tests couvrent le statut mesuré, la commande de recherche et le lien d’évitement.
  - Vérifications réussies : `git diff --check`, lint frontend, 45 tests frontend et build de
    production. Aucun commit, déploiement ou publication GitHub n’a été effectué.
- **2026-07-19 — T-30A : premier lot du shell aligné sur la charte**
  - La marque complète `orIAna` reste visible dans la sidebar ouverte et repliée ainsi que dans
    l’en-tête mobile ; le mode compact ne tronque plus le nom.
  - La navigation latérale utilise désormais des tokens aubergine très sombre indépendants du
    thème clair ou sombre, avec textes et bordures dédiés.
  - L’en-tête mobile abandonne la largeur fixe du logo au profit d’une composition fluide ; le
    tiroir smartphone conserve sa largeur et ses libellés même si la sidebar desktop était repliée.
  - Les entrées repliées gardent un nom accessible et une infobulle au survol ou au focus. Deux
    tests de non-régression couvrent la marque complète et le fond de navigation dédié.
  - Vérifications réussies : `git diff --check`, lint frontend, 42 tests frontend et build de
    production. La géométrie à 320/375 px reste à confirmer par recette visuelle humaine.
  - Le statut backend non mesuré, la recherche clavier, le lien d’évitement et les autres écarts du
    rapport restent à traiter ; aucun commit, déploiement ou publication GitHub n’a été effectué.
- **2026-07-19 — T-30A : audit de l’interface contre la charte**
  - La navigation et la structure générale ont été comparées à la charte consolidée sans modifier
    le code applicatif. Tokens, typographies, structure du shell, navigation par rôle, états
    explicites et primitives de dialogue sont déjà présents.
  - Six écarts prioritaires sont confirmés dans le code : identité tronquée en mode replié, sidebar
    claire dans le thème clair, statut backend affirmé sans mesure, risque de débordement de
    l’en-tête à 320 px, boutons repliés sans nom accessible et recherche non activable correctement
    au clavier.
  - Les écarts secondaires couvrent le thème sombre face à l’espace métier clair, les actions
    d’en-tête, le repli mobile, le sélecteur de rôle, le lien d’évitement, les futurs onglets et
    l’emphase de l’assistant indisponible.
  - Le contrôle navigateur automatisé reste bloqué par l’incompatibilité connue de son environnement
    au démarrage. Les constats géométriques et visuels exigent donc encore une recette humaine.
  - Aucun correctif applicatif, donnée, secret, commit, déploiement ou publication GitHub n’a été
    engagé pendant cet audit.
- **2026-07-19 — Patrimoine complété : architecture documentaire et sources métier**
  - Les exigences absentes de stockage, formats, volumétrie, brouillons multi-appareil, reprise
    d’envoi, antivirus, empreinte, analyse asynchrone et validation humaine sont consolidées comme
    cible, sans prétendre qu’elles sont implémentées.
  - T-34 est détaillée en T-34A à T-34E : socle documentaire, brouillons, envoi résilient, analyse
    asynchrone puis validation et expérience mobile. La recette de capacité cible 30 utilisateurs
    simultanés.
  - La décision d’un stockage objet privé compatible S3, distinct du serveur applicatif et derrière
    le backend, est enregistrée ; fournisseur et contrats techniques restent à spécifier.
  - Les analyses historiques LOGI PRO, prestations et dossiers commerciaux sont inventoriées avec
    leurs règles de déduplication, anonymisation, rapprochement et réversibilité. Les chiffres
    restent à revérifier car les sources ne sont pas présentes dans le dépôt.
  - Le conflit entre les noms réels de l’ancien prompt et le bac à sable fictif actuel est tranché
    selon le plan en vigueur : les réaffectations servent au mapping autorisé, mais T-32 ne crée
    aucune identité réelle.
  - Aucun stockage, import, donnée, code applicatif, secret, déploiement ou publication GitHub n’a
    été engagé.
- **2026-07-19 — Patrimoine complété : charte d’interface et fiches métier cibles**
  - Un ancien prompt de reprise validé a été comparé à la documentation v2.0 et à l’état actuel ;
    les décisions déjà présentes ou remplacées n’ont pas été dupliquées.
  - La direction visuelle manquante est consolidée : marque orIAna complète, navigation aubergine
    sombre, espace métier clair, cartes compactes, violet réservé aux actions et états, densité
    lisible, responsive et accessibilité.
  - Les fiches Offre, Terrain et CRM à développer disposent désormais de vues et contenus cibles
    explicites. Elles restent planifiées et ne sont pas déclarées implémentées.
  - Le terrain autonome, la relation Demande–Offre et les objets Actions, Visites, Transactions,
    Documents, Annonces, Publications et Panneaux nécessitent encore un arbitrage de modèle et des
    contrats dans `SPEC.md` avant code.
  - Aucun schéma, code applicatif, donnée, secret, déploiement ou publication GitHub n’a été modifié
    par cette consolidation documentaire.
- **2026-07-19 — T-30A : Administration refondue localement selon la charte**
  - L’écran Administration présente désormais uniquement des indicateurs calculés depuis les
    comptes réellement renvoyés par le backend, avec recherche, filtres par rôle et état, tableau
    desktop et cartes smartphone.
  - Un panneau latéral permet de gérer les rôles autorisés, le rattachement Consultant → Master
    consultant et l’état actif du compte ; les actions disponibles suivent le rôle actif et restent
    systématiquement validées par le serveur.
  - Les états de chargement, absence de résultat, erreur récupérable et succès sont explicites ;
    aucun compte, volume ou rattachement n’est simulé.
  - La recette a révélé qu’un libellé libre `Master consultant` stocké dans Grist provoque un écran
    blanc, tandis que le code canonique `master_consultant` fonctionne. L’authentification refuse
    désormais toute valeur hors référentiel et le frontend affiche une issue explicite au lieu de
    planter si une ancienne session contient encore un rôle inconnu.
  - Le rôle Master consultant est validé pour la connexion, le libellé, la navigation métier et
    l’absence d’Administration. Son périmètre d’équipe reste à recetter. Un compte administratif
    courant portant aussi le rôle Master consultant est maintenant renvoyé comme candidat de
    rattachement de sa propre agence avec `administrable: false` : il peut recevoir des consultants
    sans permettre la modification de son compte protégé.
  - Vérifications réussies : lint et build frontend, 40 tests frontend, lint backend et 100 tests
    backend dont 99 réussis et l’intégration PostgreSQL ignorée faute de serveur local.
- **2026-07-19 — T-30A poursuivie : build réparé et simulations visibles retirées**
  - T-30A est rattachée à l’Epic Plateforme & Infrastructure et aux Epics transverses Identité &
    Sécurité, CRM, Immobilier d’affaires, Administration et API & Intégrations.
  - Le build de production résout désormais explicitement `SessionContext.jsx` ; l’ambiguïté avec
    `sessionContext.js` ne peut plus casser la compilation selon l’ordre de résolution des modules.
  - Le tableau de bord ne présente plus de volumes, actifs, alertes ou taux fictifs comme des faits
    métier ; il propose uniquement des raccourcis réels vers les modules autorisés pour le rôle.
  - Un échec d’enregistrement des conditions financières reste visible dans la fiche et permet de
    réessayer. Les dialogues et tiroirs prennent le focus, se ferment avec Échap et restaurent le
    focus précédent.
  - Vérifications locales réussies : lint et build frontend, 34 tests frontend, lint backend,
    97 tests backend dont 96 réussis et l’intégration PostgreSQL ignorée faute de serveur local ;
    le frontend local répond HTTP 200.
  - Le contrôle automatisé du navigateur intégré reste indisponible à cause d’une incompatibilité
    de son runtime lors de l’initialisation. La recette humaine desktop/smartphone et cinq rôles
    reste obligatoire avant clôture de T-30A ; T-30 et toute bascule restent bloquées.
  - Recette humaine partielle : le rôle Consultant est validé sur l’application publique pour la
    connexion, la navigation autorisée, l’absence d’Administration, les utilitaires visibles, la
    fermeture des dialogues avec Échap et la déconnexion.
  - Le workflow manuel « Vérification utilisateurs Grist » #10 a réussi sur `main` en 22 secondes :
    la promotion initiale configurée par `SUPER_ADMIN_EMAIL` a été appliquée et l’artefact privé de
    sauvegarde de structure a été produit, sans exposer la valeur du secret.
  - Après déconnexion et nouvelle authentification, le rôle Super administrateur, son libellé de
    profil et l’accès au module Administration ont été validés humainement. Consultant et
    Super administrateur sont donc validés ; Master consultant, Directeur d’agence et
    Administrateur d’agence restent à recetter. T-30 et la bascule PostgreSQL restent bloquées.
- **2026-07-19 — T-31A terminée : Documentation v2.0 validée**
  - L’ensemble des Markdown du dépôt et les trois historiques PDF `ORIANA1`, `ORIANA2` et
    `ORIANA3` fournis ont été lus avant modification. Les répertoires `docs/vision`,
    `docs/methode` et `docs/audit` attendus n’existaient ni dans la branche ni dans son historique.
  - La hiérarchie Vision → Méthode BORÉAL → ORMO → Plateforme → Patrimoine, les familles de
    documents, niveaux de validation et règles de traçabilité sont consolidés.
  - orIAna est défini comme plateforme d’organisation augmentée. Knowledge Center, Organisation
    Virtuelle, Experts Virtuels, Chief Agent, agents spécialisés et AI Gateway sont des cibles
    validées mais leurs contrats détaillés restent à spécifier.
  - PostgreSQL est la source de vérité métier cible ; Grist reste la source opérationnelle de
    production jusqu’au Go humain de T-30. Aucun déploiement ni changement de source n’a eu lieu.
  - Le registre des décisions, ORMO minimal, le Glossaire et les référentiels modules/objets ainsi
    que les guides UX/UI et de gouvernance ont été ajoutés sans inventer les détails absents.
  - Le commit `499ce8300ce86fdd710fe26c04ac62eb362fe0a4` et le grand document d’audit évoqués dans un
    historique PDF ne sont pas présents dans le clone local ; leur contenu non fourni n’est pas
    traité comme acquis.
  - Arbitrages ouverts : contrats Knowledge Center/Organisation Virtuelle/Chief Agent, inventaire
    canonique des Experts, maturité patrimoniale, usage résiduel de Grist, confrontation des
    méthodes marketing externes à leurs documents sources.
  - Les contrôles finaux sont conformes et la validation humaine du commit documentaire unique a
    été reçue. T-30A demeure la prochaine tâche de développement active.
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
