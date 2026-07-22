# Matrice de recette T-30A

> Document de pilotage et de preuve — version initiale du 20 juillet 2026.
>
> **Statut : à exécuter.** Cette matrice ne constitue ni une validation de T-30A, ni une
> autorisation de préparer T-30. Elle organise la recette humaine exigée par `PLAN.md`.

## 1. Objet

T-30A doit démontrer que les parcours prioritaires d’orIAna sont réellement utilisables avant
toute préparation de bascule PostgreSQL. La recette couvre :

- les cinq rôles canoniques ;
- connexion, shell, Patrimoine, Offres, CRM, Matching, Agents IA, Auto-formation et
  Administration ;
- clavier, souris et smartphone tactile ;
- succès, validation, erreur récupérable, interdiction et attente asynchrone ;
- contrôle des droits par le backend, sans faire du frontend une autorité.

Les exigences sources sont [T-30A](../../PLAN.md#-t-30a--rendre-lapplication-réellement-utilisable-avant-bascule),
le [Guide UX/UI](../ux/GUIDE_UX_UI.md) et la
[Charte d’interface](../ux/CHARTE_INTERFACE_ORIANA.md).

## 2. Environnements et décision préalable

| Environnement | Usage autorisé | État pour T-30A |
|---|---|---|
| Prévisualisation T-32 | Navigation, responsive, rôles, données fictives, refus explicite des écritures | Disponible et strictement en lecture seule |
| Environnement de recette inscriptible | Créations, modifications, erreurs métier, rattachements et déclenchement asynchrone | Principe DEC-037 et composition DEC-038 validés ; profil non créé |
| Production | Aucun test destructif ou exploratoire | Exclue de T-30A |

La prévisualisation T-32 **ne doit pas être rendue inscriptible** pour satisfaire cette matrice. Son
isolement et le refus serveur `SANDBOX_READ_ONLY` restent des garanties validées.

### Décision validée — DEC-037

Les options et la recommandation d’implémentation sont détaillées dans
[l’étude de l’environnement de recette T-30A](../architecture/ETUDE_ENVIRONNEMENT_RECETTE_T30A_2026-07-20.md).

Le futur profil de recette est distinct, réinitialisable et inscriptible, avec :

- identités et données exclusivement fictives ;
- stockage, sessions, volumes et identifiants séparés de la production et de la prévisualisation ;
- aucun accès aux données de production ;
- fournisseur de persistance choisi explicitement, sans supposer la bascule PostgreSQL acquise ;
- connecteurs externes désactivés par défaut ;
- éventuel n8n de recette isolé, avec webhook et secrets propres à l’environnement, activé par une
  autorisation distincte ;
- procédure vérifiée de réinitialisation et de suppression ;
- journaux sans secret, mot de passe, hash ni donnée personnelle réelle.

Le principe et la composition R1/R2 sont validés. Les versions, noms, initialiseur, procédure
d’exploitation et preuve de capacité restent à spécifier. Aucun environnement, connecteur, secret
ou déploiement n’est créé ou autorisé par le présent document.

## 3. Légende et preuve minimale

Statuts autorisés : `À exécuter`, `Réussi`, `Échec`, `Bloqué`, `Sans objet`.

Une ligne n’est `Réussi` que si la preuve indique :

- date et personne ayant réalisé la recette ;
- commit exact et environnement ;
- rôle actif, appareil ou viewport, navigateur et mode d’interaction ;
- résultat observé, y compris le message d’erreur ou d’interdiction attendu ;
- référence vers une capture, une vidéo, un journal expurgé ou un test automatisé ;
- anomalie associée lorsqu’un écart est constaté.

Un test automatisé avec API simulée prouve une non-régression du frontend, mais ne remplace pas une
recette humaine contre le backend de recette.

### Référence automatisée actualisée

Le 20 juillet 2026, sur `5dcded28e14e639050d2a85750b3c1378a474715` avec le lot local non commité :
lint frontend, 57 tests frontend et build réussissent ; frontières et lint backend réussissent,
puis 161 tests backend sur 162 passent, avec l’intégration PostgreSQL ignorée comme prévu. Les
preuves et limites sont détaillées dans l’[audit de couverture automatisée](AUDIT_COUVERTURE_AUTOMATISEE_T30A_2026-07-20.md).
Cette référence ne valide aucun scénario humain de la matrice.

Le 22 juillet 2026, le commit `36ba286` a également passé lint et build frontend, 68 tests
frontend sur 68, les frontières d’architecture et le lint backend, puis 161 tests backend sur 162,
avec l’intégration PostgreSQL ignorée comme prévu. Il a ensuite été publié sur la branche
`agent/t30a-interactions` et installé uniquement dans la prévisualisation isolée, où les deux
conteneurs ont été observés `healthy`. Cette preuve n’autorise ni la production ni la bascule T-30.

## 4. Accès attendu par rôle

| Module | Consultant | Master consultant | Directeur d’agence | Administrateur d’agence | Super administrateur |
|---|---:|---:|---:|---:|---:|
| Accueil | Oui | Oui | Oui | Oui | Oui |
| Patrimoine | Oui, périmètre propre | Oui, équipe active en lecture | Oui, agence | Non | Non, aucun accès métier implicite |
| Offres | Oui, périmètre propre | Oui, équipe active en lecture | Oui, agence | Non | Non, aucun accès métier implicite |
| CRM et Matching | Oui, périmètre propre ou partagé | Oui, équipe active | Oui, agence | Non | Non, aucun accès métier implicite |
| Agents IA | Oui, sur demande autorisée | Oui, sur demande autorisée | Oui, agence | Non | Non |
| Auto-formation | Oui | Oui | Oui | Oui | Oui |
| Administration | Non | Non | Rattachement et état autorisés | Comptes de niveau inférieur de l’agence | Inter-agences et rôles selon politiques serveur |

Toute divergence entre cette visibilité et la réponse du backend est un échec. Une entrée masquée
dans le frontend doit aussi être refusée par appel direct au backend.

### Contrôle visuel ciblé de DEC-041 — 22 juillet 2026

Sur le commit `36ba286`, dans la prévisualisation isolée et avec Chrome desktop à la souris, les
cinq rôles ont été rejoués manuellement. Le menu, les raccourcis d’accueil, le sélecteur unique et
le rappel latéral correspondent à la matrice ci-dessus. Le passage d’une vue métier vers
Administrateur d’agence ramène à Accueil ; Administrateur d’agence et Super administrateur
n’exposent aucun module métier. Les captures ont été fournies pendant la recette interactive mais
ne sont pas archivées dans le dépôt.

Ce contrôle est **réussi dans son périmètre visuel**. Les contrôles clavier et smartphone réalisés
ensuite sont conformes. Le changement effectif de rôle a finalement réussi après renouvellement de
la session, mais les refus par appels directs au backend restent à exécuter avant de passer
`SHELL-03` à `Réussi`.

### Anomalies ouvertes après contrôle smartphone — 22 juillet 2026

- À 320 px, aucun débordement horizontal du document n’est observé. Les flèches déplacent le focus
  dans le menu, et `Échap` ferme le menu en restituant le focus au déclencheur.
- Le changement effectif de `master_consultant` vers `consultant` a d’abord échoué sur une session
  existante, sans événement correspondant dans les journaux backend ou Traefik consultés. Le
  pré-vol `OPTIONS /auth/role` répondait `204`, mais la réponse du `POST` n’a pas été capturée.
  Après renouvellement de la session, le changement a réussi et les vues Consultant ont été
  affichées. La cause initiale reste donc non démontrée ; une session périmée est seulement une
  hypothèse, pas un diagnostic établi.
- La contradiction d’autorité de `admin_agence` est tranchée par DEC-042 : ce rôle conserve
  l’administration hiérarchique des utilisateurs de son agence, sans périmètre métier implicite.
  Le modèle serveur et ses tests directs sont alignés. La preuve sur l’environnement inscrit reste
  à exécuter avant de clore la recette.

## 5. Scénarios transverses

| ID | Parcours | Résultat attendu | Contexte obligatoire | Statut | Preuve / anomalie |
|---|---|---|---|---|---|
| AUTH-01 | Ouvrir une route protégée sans session | Retour à la connexion, sans donnée métier | Desktop clavier et smartphone | À exécuter | — |
| AUTH-02 | Se connecter avec des identifiants valides | Session ouverte sans stockage sensible navigateur | Cinq rôles | À exécuter | — |
| AUTH-03 | Mot de passe erroné, compte inactif ou rôle retiré | Refus compréhensible, sans révéler l’existence du compte | Desktop et smartphone | À exécuter | — |
| AUTH-04 | Compte multirôle | Choix obligatoire d’un rôle attribué seulement | Clavier, souris, tactile | À exécuter | — |
| AUTH-05 | Première connexion | Remplacement obligatoire du mot de passe provisoire | Environnement inscriptible | Bloqué | Environnement non créé |
| AUTH-06 | Mot de passe oublié et lien de réinitialisation | Réponse neutre, lien utilisable une seule fois | Environnement inscriptible avec messagerie de recette | Bloqué | Environnement et messagerie non créés |
| AUTH-07 | Déconnexion | Session détruite et routes protégées de nouveau refusées | Cinq rôles | À exécuter | — |
| SHELL-01 | Parcourir la navigation ouverte et repliée | Nom accessible, focus visible, aucun débordement | 320 px, 375 px, desktop, zoom 200 % | À exécuter | — |
| SHELL-02 | Utiliser recherche, notifications, aide et assistant indisponibles | Chaque action explique son état, aucun bouton silencieux | Clavier, souris, tactile | À exécuter | — |
| SHELL-03 | Changer de rôle | Menu aux flèches, `Échap`, focus restauré, droits recalculés serveur | Compte multirôle | Partiel | Clavier et focus conformes à 320 px ; intégration HTTP locale réussie ; changement déployé `master_consultant` → `consultant` réussi après renouvellement de session ; refus directs des rôles interdits restant à exécuter |
| SHELL-04 | Basculer le thème et recharger | Sombre par défaut, préférence explicite conservée sans donnée sensible | Desktop et smartphone | À exécuter | — |
| SHELL-05 | Simuler une API indisponible | État explicite et issue réaliste, aucune affirmation fictive | Desktop et smartphone | À exécuter | — |
| FORM-01 | Parcourir l’Auto-formation | Dialogue accessible, progression liée au rôle, erreur explicite | Cinq rôles | À exécuter | — |

## 6. Scénarios métier

### Patrimoine

| ID | Action | Résultat attendu | Rôles / environnement | Statut | Preuve / anomalie |
|---|---|---|---|---|---|
| PAT-01 | Parcourir Site → Bâtiment → Cellule → Lot | Hiérarchie lisible et retour mobile sans perte de contexte | Trois rôles métier, prévisualisation | À exécuter | — |
| PAT-02 | Créer un bâtiment puis un lot | Données créées dans le bon périmètre et relues | Rôles autorisés, recette inscriptible | Bloqué | Environnement non créé |
| PAT-03 | Modifier un lot et sa qualification | Validation typée, succès puis relecture | Rôles autorisés, recette inscriptible | Bloqué | Environnement non créé |
| PAT-04 | Tenter une écriture hors périmètre | Refus serveur sans donnée de l’autre périmètre | Cinq rôles par appels directs | Bloqué | Environnement non créé |
| PAT-05 | Provoquer validation et indisponibilité API | Formulaire conservé ou reprise proposée | Desktop et smartphone | Bloqué | Environnement non créé |

#### Fiche guidée PAT-01 — à exécuter après mise à jour de la prévisualisation

Cette fiche prépare la recette humaine du commit `2ff6144` sans la déclarer réussie. Pour chacun
des trois rôles métier, consigner séparément l’appareil, le navigateur et le mode d’interaction :

1. ouvrir Patrimoine et vérifier que **Sites** est le niveau actif avec son compteur ;
2. sélectionner un site, utiliser **Explorer les bâtiments**, puis poursuivre jusqu’au lot ;
3. vérifier à chaque niveau la liste filtrée, la fiche active et le fil de rattachement ;
4. rechercher un actif, effacer la recherche et vérifier que le contexte reste cohérent ;
5. au clavier, parcourir les onglets avec `←`, `→`, `Début` et `Fin`, puis activer les actions ;
6. sur smartphone, ouvrir une fiche puis utiliser **Retour à la liste** sans perdre la sélection ;
7. confirmer l’absence de création et de modification dans la prévisualisation en lecture seule ;
8. joindre une preuve expurgée pour desktop, smartphone et clavier avant de modifier PAT-01.

Support automatisé local au 21 juillet 2026 : le parcours guidé, le retour mobile et la reprise
après indisponibilité sont couverts ; la suite frontend compte 61 tests réussis. Cette preuve ne
remplace ni le contrôle visuel, ni les trois rôles métier, ni le backend effectivement recetté.

### Offres

| ID | Action | Résultat attendu | Rôles / environnement | Statut | Preuve / anomalie |
|---|---|---|---|---|---|
| OFF-01 | Ouvrir une offre et ses huit vues | Onglets utilisables au clavier et tactile, états indisponibles explicites | Trois rôles métier, prévisualisation | À exécuter | — |
| OFF-02 | Créer une offre simple ou double nature | Offre et conditions cohérentes, rattachement autorisé seulement | Recette inscriptible | Bloqué | Environnement non créé |
| OFF-03 | Modifier séparément vente et location | Valeurs exactes relues, aucune condition écrasée | Recette inscriptible | Bloqué | Environnement non créé |
| OFF-04 | Échec d’enregistrement | Formulaire reste ouvert, valeurs préservées, nouvelle tentative possible | Recette inscriptible | Bloqué | Environnement non créé |
| OFF-05 | Offre d’un autre périmètre | Absence de fuite et refus serveur direct | Cinq rôles par appels directs | Bloqué | Environnement non créé |

#### Fiche guidée OFF-01 — prévisualisation en lecture seule

1. ouvrir **Offres** avec chacun des trois rôles métier et confirmer l’absence de commande
   d’écriture dans la prévisualisation ;
2. sur desktop, rechercher une offre par nom puis par ville et vérifier que la liste et la fiche
   restent visibles ensemble ;
3. filtrer successivement sur Vente, Location et Vente & location, puis vérifier le compteur et
   l’état explicite sans résultat ;
4. ouvrir une offre, parcourir les huit vues et contrôler que les capacités non disponibles sont
   annoncées sans bouton simulé ;
5. au clavier, placer le focus sur **Synthèse**, utiliser les flèches, Début et Fin, puis vérifier le
   focus, la vue active et le contenu associé ;
6. sur smartphone, ouvrir une offre depuis la liste, parcourir sa fiche puis utiliser **Retour aux
   offres** ; la recherche précédente doit rester disponible ;
7. joindre une preuve expurgée desktop, smartphone et clavier avant de modifier OFF-01.

Preuve humaine partielle du 22 juillet 2026 : avec le rôle Directeur d’agence, la recherche, le
compteur, les filtres combinés, l’état sans résultat, la réinitialisation et les huit vues ont été
validés sur desktop. Flèche droite, Début et Fin activent au clavier la vue et le contenu attendus.
Sur smartphone, le parcours liste → fiche → retour conserve la recherche et son compteur. Les
profils Consultant et Master consultant accèdent à Offres en lecture seule, sans commande
d’écriture ni accès Administration. La fiche reste cohérente avec la liste filtrée et les capacités
non livrées ont un état explicite. L’ancienne anomalie du second sélecteur latéral est résolue par
DEC-041 : le sélecteur interactif est désormais unique dans l’en-tête et les rôles administratifs
sans accès métier implicite ne font plus partie du périmètre d’OFF-01. OFF-01 reste néanmoins
« À exécuter » jusqu’à l’archivage de preuves complètes et au contrôle du backend recetté.

Support automatisé local au 22 juillet 2026 : recherche et filtres combinés, comptage, ouverture
effective des huit vues, états indisponibles explicites, parcours mobile avec conservation de la
recherche, navigation clavier par Flèche droite, Début et Fin, et lecture seule sont couverts ; la
suite frontend compte désormais 68 tests réussis. Cette preuve ne remplace ni le contrôle visuel,
ni les trois rôles métier, ni le backend effectivement recetté.

### CRM et Matching

| ID | Action | Résultat attendu | Rôles / environnement | Statut | Preuve / anomalie |
|---|---|---|---|---|---|
| CRM-01 | Rechercher puis ouvrir une société | Liste puis fiche, sans vue en trois colonnes sur smartphone | Trois rôles métier, prévisualisation | À exécuter | — |
| CRM-02 | Parcourir Société → Contact → Demande | Contexte et retour conservés sur desktop et smartphone | Trois rôles métier, prévisualisation | À exécuter | — |
| CRM-03 | Créer société, contact et demande | Relations cohérentes, propriété imposée par le serveur | Recette inscriptible | Bloqué | Environnement non créé |
| CRM-04 | Afficher le Matching d’une demande | Résultats triés reçus du backend, sans recalcul frontend | Trois rôles métier | À exécuter | — |
| CRM-05 | Tenter une relation inter-agences incohérente | Refus serveur et aucune donnée étrangère affichée | Recette inscriptible | Bloqué | Environnement non créé |
| CRM-06 | Erreur de chargement ou sauvegarde | Message utile, contexte préservé et réessai possible | Desktop et smartphone | Bloqué | Environnement non créé |

### Agents IA

| ID | Action | Résultat attendu | Rôles / environnement | Statut | Preuve / anomalie |
|---|---|---|---|---|---|
| AGT-01 | Ouvrir Agents IA sans connecteur | Indisponibilité explicite, aucune capacité simulée | Trois rôles métier, prévisualisation | À exécuter | — |
| AGT-02 | Déclencher un agent sur une demande autorisée | Réponse immédiate, interface utilisable, statut en attente | Recette inscriptible et connecteur isolé autorisé | Bloqué | Environnement et connecteur non créés |
| AGT-03 | Recevoir le callback puis le résultat | Progression et résultat proposés, aucun secret navigateur | Recette inscriptible et connecteur isolé autorisé | Bloqué | Environnement et connecteur non créés |
| AGT-04 | Faux callback, agent inconnu ou demande interdite | Refus authentifié et absence de fuite | Appels directs backend | Bloqué | Connecteur de recette non créé |
| AGT-05 | n8n indisponible ou en erreur | Échec récupérable distinct d’un refus métier | Recette inscriptible | Bloqué | Environnement et connecteur non créés |

### Administration

| ID | Action | Résultat attendu | Rôles / environnement | Statut | Preuve / anomalie |
|---|---|---|---|---|---|
| ADM-01 | Ouvrir Administration ou appeler ses routes | Module visible uniquement aux trois rôles autorisés ; refus serveur sinon | Cinq rôles | À exécuter | — |
| ADM-02 | Rechercher et filtrer les comptes | Résultats réels du périmètre, états vide et erreur explicites | Directeur, admin d’agence, super admin | À exécuter | — |
| ADM-03 | Rattacher un consultant à un master | Master éligible de la même agence ; compte courant protégé | Directeur et rôles autorisés, recette inscriptible | Bloqué | Environnement non créé |
| ADM-04 | Modifier rôles, agence ou état | Champs disponibles selon le rôle ; contrôles répétés par le serveur | Admin d’agence et super admin, recette inscriptible | Bloqué | Environnement non créé |
| ADM-05 | Agir sur un niveau égal/supérieur ou une autre agence | Refus sans exposition du compte protégé | Cinq rôles par appels directs | Bloqué | Environnement non créé |
| ADM-06 | Erreur pendant l’enregistrement | Panneau et saisie préservés, réessai ou sortie explicite | Desktop et smartphone | Bloqué | Environnement non créé |

## 7. Couverture humaine par rôle et appareil

Chaque ligne impose les scénarios applicables des sections précédentes. Une capture isolée de
l’accueil ne suffit pas.

| Rôle | Desktop clavier | Desktop souris | Smartphone tactile | Particularité à prouver | Statut global |
|---|---|---|---|---|---|
| Consultant | À exécuter | Contrôle DEC-041 réussi | À exécuter | Périmètre propre, aucun accès Administration | Partiel ; accueil et menu validés |
| Master consultant | À exécuter | Contrôle DEC-041 réussi | À exécuter | Équipe active en lecture, aucun accès Administration | Partiel ; accueil et menu validés |
| Directeur d’agence | À exécuter | Contrôle DEC-041 réussi | À exécuter | Agence et rattachements autorisés seulement | Partiel ; accueil et menu validés |
| Administrateur d’agence | À exécuter | Contrôle DEC-041 réussi | À exécuter | Administration des niveaux inférieurs, aucun métier implicite | Partiel ; accueil et menu validés |
| Super administrateur | À exécuter | Contrôle DEC-041 réussi | À exécuter | Administration inter-agences, aucun métier implicite | Partiel ; accueil et menu validés |

Les validations historiques consignées dans `STATUS.md` servent de contexte, mais doivent être
rejouées sur le commit et l’environnement inscrits dans la preuve finale.

## 8. Registre d’exécution

| Date | Commit | Environnement | Testeur | Rôle | Appareil / navigateur | IDs exécutés | Résultat | Preuve / anomalie |
|---|---|---|---|---|---|---|---|---|
| 2026-07-22 | `36ba286` | Prévisualisation T-32 | Validation humaine utilisateur | Cinq rôles | Desktop / Chrome / souris | DEC-041, visibilité seulement | Réussi | Captures interactives non archivées ; clavier, smartphone et refus serveur restant à exécuter |
| — | — | — | — | — | — | — | À exécuter | — |

## 9. Critères de clôture et autorisation humaine

T-30A ne peut passer à `Terminée` que si :

- tous les scénarios obligatoires sont `Réussi`, ou `Sans objet` avec justification validée ;
- les cinq rôles et les trois modes d’interaction possèdent une preuve complète ;
- aucun défaut bloquant ou majeur ne reste ouvert ;
- les appels directs confirment les refus et cloisonnements serveur ;
- lint, build et tests frontend/backend sont verts sur le commit recetté ;
- aucun secret ni donnée réelle n’apparaît dans les preuves ;
- la personne habilitée formule explicitement l’autorisation ci-dessous.

### Décision finale

- [ ] **GO T-30A** — la recette autorise la préparation de T-30, sans autoriser sa bascule.
- [ ] **NO-GO T-30A** — la préparation de T-30 reste bloquée.

Décisionnaire : —

Date : —

Commit recetté : —

Réserves acceptées et échéance : —

Une décision `GO T-30A` n’autorise ni commit, ni push, ni déploiement, ni migration, ni changement
de source de vérité. Chacune de ces actions conserve son autorisation propre.
