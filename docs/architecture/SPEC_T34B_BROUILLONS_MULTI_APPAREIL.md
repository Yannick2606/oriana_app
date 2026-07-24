# Spécification T-34B — Brouillons multi-appareil

> **Statut : contrat validé, deux lots purs implémentés — complété le 24 juillet 2026.** Ce document
> fixe T-34B par DEC-023 à DEC-032, complétées par DEC-043 et DEC-044. Ces lots ne créent aucune
> table, route, interface, donnée locale persistante ni capacité de production.

## 1. Objectif et périmètre

T-34B permet à l’auteur d’une Capture de créer un brouillon privé sur un appareil, de le retrouver
sur un autre et de le modifier sans écrasement silencieux. La Capture reste `brouillon_prive`
jusqu’à une soumission explicite, qui appartient à T-34E.

Le lot traite les métadonnées du brouillon. Les octets, transferts interrompus et files d’attente
relèvent de T-34C. Antivirus, OCR, transcription et IA relèvent de T-34D. Aucun de ces traitements
n’est simulé dans T-34B.

## 2. Préconditions et état observé

Le noyau T-34A fournit les catalogues, les droits purs et le port `captureRepository`, dont
`createDraft`, `getById` et `updateWithExpectedVersion`. Il ne fournit encore ni schéma PostgreSQL,
ni adaptateur, ni route `/socle/captures`, ni interface.

Le catalogue implémenté reste antérieur à DEC-040 et ne contient pas encore `mandat`. Son extension,
ses validations et leurs tests appartiennent à un lot de code distinct soumis à autorisation.

Le port possède désormais l’opération contractuelle `listByAuthor`, sans adaptateur ni lecture
réelle. Le module pur `drafts.js` porte les bornes, la validation des commandes et l’incrément de
version. Grist ne reçoit aucune table Capture et ne devient pas un stockage transitoire de T-34B.

## 3. Métadonnées modifiables validées

Une création de brouillon accepte seulement :

- un type obligatoire issu de `CAPTURE_TYPES` ;
- un titre facultatif : absent, `null` ou vide après suppression des espaces périphériques, sinon
  limité à 160 caractères ;
- un commentaire facultatif, limité à 2 000 caractères et neutralisé à l’affichage ;
- un rattachement proposé facultatif : son type et son identifiant sont soit tous deux absents,
  soit tous deux fournis ; le type appartient à `VALID_ATTACHMENT_TARGETS` et l’objet est visible
  par l’auteur.

DEC-033 fixe sa représentation PostgreSQL initiale ; DEC-040 l'étend à cinq références facultatives
vers Société, Contact, Demande, Offre et Mandat, avec au plus une cible renseignée. L’adaptateur conserve le
contrat `{ type, id }`. La suppression autorisée de la cible détache la proposition sans supprimer
la Capture. Cette cible relationnelle reste non implémentée et n’autorise aucune migration.

Le backend impose l’identifiant, `agence_id`, l’auteur, `brouillon_prive`, la version et les dates.
Conformément à DEC-032, la géolocalisation est entièrement absente du contrat initial. Aucun champ,
même nullable, ne lui est réservé. Les références de fichiers sont en lecture seule dans ce lot et
seront alimentées par T-34C.

Dans un `PATCH` partiel, `type` peut être omis ; s’il est présent, il appartient à `CAPTURE_TYPES`.
`titre` peut être omis ou explicitement ramené à « sans titre » par `null` ou une chaîne vide après
normalisation. Une modification ne peut changer ni l’auteur, ni l’agence, ni l’état, ni la version,
ni les dates serveur, ni les fichiers, ni la géolocalisation, ni les références techniques. Une
propriété absente du catalogue de modification est refusée ; elle n’est pas ignorée silencieusement.

## 4. Contrat de concurrence validé

DEC-023 fixe la version initiale à l’entier `1` et son incrément à `1` par mutation réussie. DEC-024
impose `version_attendue` dans le corps JSON de toute modification. Le repository effectue
atomiquement le contrôle de l’auteur, de l’agence, de l’état et de la version, puis applique la
modification et incrémente la version d’une unité.

Trois résultats restent distincts :

1. brouillon absent ou non visible : aucune information de version n’est divulguée ;
2. brouillon visible mais version obsolète : conflit `409` sans mutation ;
3. version courante : modification unique et réponse avec la nouvelle version.

Une répétition avec l’ancienne version produit le même conflit et ne réapplique jamais la commande.
Le backend n’effectue ni fusion automatique, ni écrasement forcé. DEC-025 fixe le code stable
`CAPTURE_VERSION_CONFLICT` et sa réponse sûre après contrôle complet des droits.

DEC-036 fixe la future opération PostgreSQL à une transaction courte. L’adaptateur recherche et
verrouille la ligne dans le périmètre identifiant, auteur, agence et état privé, puis compare la
version. Il effectue ensemble la mutation et l’incrément, ou construit sans mutation le conflit sûr
depuis le même état verrouillé. Un objet absent ou non visible ne divulgue aucune valeur. Cette
cible reste non implémentée et n’autorise ni migration, ni adaptateur, ni route.

## 5. API cible validée

Toutes les routes exigent une session et vérifient les droits avant de révéler le brouillon :

| Route | Effet | Réponse principale |
|---|---|---|
| `POST /socle/captures` | créer un brouillon privé idempotent | `201` avec identifiant et version |
| `GET /socle/captures?etat=brouillon_prive` | lister uniquement les brouillons de l’auteur | `200` paginé |
| `GET /socle/captures/:id` | reprendre un brouillon visible | `200` |
| `PATCH /socle/captures/:id` | modifier avec `version_attendue` | `200` ou `409` |

DEC-029 borne la liste par un curseur opaque, avec 20 résultats par défaut et 50 au maximum. Elle
est triée par dernière modification décroissante, puis par identifiant pour un ordre stable, et ne
lit jamais les brouillons d’un membre de l’équipe. Le master, le directeur et l’administrateur
d’agence restent auteurs de leurs propres brouillons ; leur rôle ne leur donne pas accès aux
brouillons privés d’autrui. Le super administrateur n’obtient aucun accès métier implicite.

DEC-035 fixe le futur curseur à un jeton chiffré et authentifié valable 15 minutes. Il porte la
version de format, la position stable, l’auteur, l’agence et les filtres de requête. Le matériel
cryptographique reste uniquement dans l’environnement. Chaque page revérifie tous les droits ; un
curseur ne constitue jamais une autorisation. Cette cible reste non implémentée et n’autorise ni
secret, ni codec, ni route.

DEC-028 impose une clé d’idempotence aléatoire fournie par le client et bornée à l’auteur et à
l’agence pendant 24 heures. La même clé et les mêmes données retournent le brouillon existant ; la
même clé avec des données différentes produit un conflit sans mutation. La clé ne constitue jamais
une autorisation et sa purge après expiration doit être contrôlée.

DEC-034 fixe sa future persistance dans un registre technique séparé contenant uniquement une
empreinte de clé, l’auteur, l’agence, l’empreinte déterministe de la commande, la Capture créée et
l’expiration. La clé brute n’est ni stockée ni journalisée. Une entrée expirée n’est plus reconnue
et peut être remplacée ou purgée sans supprimer la Capture. Cette cible reste non implémentée et
n’autorise ni table, ni migration, ni tâche planifiée.

## 6. Conflit compréhensible et résolution explicite

Après contrôle complet des droits, le `409` restitue la version courante et une représentation sûre
des seuls champs modifiables, titre compris. Un objet absent ou non visible ne restitue aucune
version ni valeur.
L’interface conserve temporairement les valeurs saisies à l’écran,
présente les deux versions et propose une action humaine.

DEC-026 impose les deux actions explicites suivantes :

- abandonner les changements locaux et charger la version serveur ;
- réappliquer manuellement des champs choisis sur la version serveur, puis envoyer une nouvelle
  commande avec sa version courante.

Un bouton de forçage global et une fusion automatique sont interdits. DEC-027 autorise l’action
explicite « Enregistrer comme nouveau brouillon » par le contrat normal de création. Elle reprend
uniquement les champs modifiables choisis et reçoit un nouvel identifiant et la version `1` ; aucun
fichier, état technique ou élément de géolocalisation n’est copié. Chaque choix utilisateur est
accessible au clavier et au toucher.

L'interface peut présenter les libellés calculés « À compléter » et « Prêt à traiter ». Ils ne sont
jamais envoyés à l'API ni persistés. La règle initiale présente « Prêt à traiter » lorsque le type est
valide et qu'au moins un contenu descriptif non vide existe parmi le titre et le commentaire ; elle
présente « À compléter » sinon. Ces libellés n'ont aucun effet sur les droits, les traitements ou la
machine d'état : la valeur serveur reste `brouillon_prive` jusqu'à la soumission explicite de T-34E.

## 7. Frontière hors ligne et données locales

DEC-031 confirme que le premier lot reste strictement en ligne. Il ne persiste aucun brouillon,
média ou contact dans le navigateur. Il couvre la
reprise en ligne entre appareils à partir de l’autorité serveur. `localStorage` et `sessionStorage`
restent interdits pour ces données, comme IndexedDB et le cache applicatif.

Un futur stockage structuré local, par exemple IndexedDB, exige auparavant un modèle de menace
validé précisant chiffrement éventuel, durée maximale, purge après synchronisation, révocation de
session, perte ou partage du terminal, quotas, erreurs et effacement vérifiable. Le service worker
ne pourra conserver que le shell non sensible tant que ce modèle n’est pas accepté. Le mode
déconnecté complet constitue donc un lot ultérieur et non une capacité implicite de T-34B.

## 8. Validation et erreurs

Les entrées sont des données externes non fiables. Le titre est limité à 160 caractères et le
commentaire à 2 000 caractères ; les types et cibles sont contrôlés par les catalogues T-34A ; les
champs inconnus, versions absentes, nulles ou non entières et modifications d’une Capture soumise
sont refusés.

Les erreurs validées sont :

- `400` pour une forme invalide ;
- `401` sans session ;
- `403` hors périmètre selon la convention serveur existante ;
- `404` pour un identifiant absent dans un périmètre autorisé ;
- `409 CAPTURE_VERSION_CONFLICT` pour une version obsolète visible ;
- `422` pour un type, rattachement ou état non modifiable.

## 9. Preuves attendues

Les tests doivent démontrer au minimum :

- création puis reprise du même brouillon par le même compte sur deux sessions ;
- version initiale et incrément atomique ;
- deux modifications concurrentes dont une seule réussit ;
- conflit sans mutation et sans fuite inter-agences ;
- impossibilité pour un master ou un administrateur de lire le brouillon privé d’autrui ;
- refus du super administrateur sans périmètre métier ;
- géolocalisation absente et champs serveur non modifiables ;
- titre facultatif, normalisé et borné à 160 caractères ;
- indicateur de complétude calculé sans champ persistant ni changement de `brouillon_prive` ;
- création idempotente sans doublon ;
- parcours de conflit utilisable au clavier et sur smartphone.

## 10. Premier lot technique implémenté

Le premier lot de code est pur et sans capacité active :

1. ajouter le code stable de conflit validé ;
2. définir les champs modifiables et les fonctions pures de validation de version et de commande ;
3. étendre le contrat `captureRepository` avec la liste bornée des brouillons de l’auteur ;
4. tester versions, conflits, propriétés protégées et absence de géolocalisation.

Les constantes et validations résident dans `backend/src/documentary/drafts.js`, le code de conflit
dans le catalogue d’erreurs et `listByAuthor` dans le contrat du repository. Les tests unitaires
couvrent les versions, champs protégés, commentaires, rattachements, listes et absence de
géolocalisation.

Migrations, adaptateur PostgreSQL, routes, interface, service worker et stockage local restent hors
de ce premier lot. Leur réalisation exige une nouvelle validation.

L’[audit de persistance](AUDIT_PERSISTANCE_T34B_2026-07-20.md) confirme que le mécanisme de
migration, l’idempotence CI et la restauration existants sont réutilisables, mais que quatre choix
physiques ont été identifiés et fermés : DEC-033 pour le rattachement polymorphe, DEC-034 pour le
stockage de l’idempotence, DEC-035 pour le codec de curseur et DEC-036 pour le conflit atomique. La
[matrice de persistance](ARBITRAGES_PERSISTANCE_T34B.md) en conserve l’historique sans autoriser de
SQL ni d’adaptateur.

## 11. Arbitrages validés

Les douze options, recommandations et impacts validés sont consignés dans
[`ARBITRAGES_T34B_BROUILLONS_MULTI_APPAREIL.md`](ARBITRAGES_T34B_BROUILLONS_MULTI_APPAREIL.md).
Les décisions DEC-023 à DEC-032 bornent le premier lot pur implémenté. DEC-043 et DEC-044 bornent
le second avec un titre facultatif et une aide de complétude non persistée. Toute capacité active
reste soumise à une validation explicite distincte.

Les quatre choix de persistance sont validés par DEC-033 à DEC-036 et leur historique figure dans
[`ARBITRAGES_PERSISTANCE_T34B.md`](ARBITRAGES_PERSISTANCE_T34B.md). Ils décrivent une cible non
implémentée et n’autorisent ni migration, ni adaptateur, ni route, ni activation.
