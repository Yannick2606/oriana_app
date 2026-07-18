# T-30 — Recette réelle des cinq rôles

Cette fiche s'exécute uniquement sur l'environnement de répétition. Elle ne contient aucun
identifiant, mot de passe, cookie, jeton, secret, adresse personnelle ou donnée client réelle.
Les comptes de recette sont résolus hors de ce document par la personne habilitée.

## Règles de preuve

- utiliser un jeu de données fictif identifié par des références techniques non personnelles ;
- masquer cookies, en-têtes d'autorisation, emails et valeurs de configuration ;
- conserver pour chaque scénario : date, commit, rôle actif, résultat, code HTTP utile et visa ;
- ne jamais joindre une réponse complète si elle contient des données métier ;
- un accès indu, une écriture hors périmètre ou une fuite de secret impose immédiatement No-Go.

États autorisés : `NON EXÉCUTÉ`, `RÉUSSI`, `ÉCHEC`, `BLOQUÉ`. Un scénario `ÉCHEC`, `BLOQUÉ` ou
sans preuve maintient T-30 en No-Go.

## Préconditions communes

| ID | Contrôle | Résultat attendu | Preuve minimale |
|---|---|---|---|
| PRE-01 | Commit candidat identifié | SHA identique au dossier Go/No-Go | SHA et visa |
| PRE-02 | Environnement de répétition isolé | aucune URL de production ciblée | nom logique de l'environnement |
| PRE-03 | Jeu fictif chargé | deux agences, deux consultants d'une même agence et relations liées | volumes uniquement |
| PRE-04 | Comptes des cinq rôles actifs | un compte de recette par rôle, sans secret dans la fiche | références anonymes R1 à R5 |
| PRE-05 | Journalisation sûre | aucun secret ni contenu métier complet | extrait expurgé |

## Socle de session — tous les rôles

Exécuter `SES-01` à `SES-06` pour chacun des rôles `R1` à `R5`.

| ID | Action | Résultat attendu | Preuve minimale |
|---|---|---|---|
| SES-01 | Connexion valide | session créée, profil public sans hash ni agence interne | code HTTP et champs publics |
| SES-02 | Première connexion si applicable | changement de mot de passe imposé avant les écrans protégés | capture expurgée |
| SES-03 | Rôle actif | navigation et droits correspondent au rôle sélectionné | rôle logique et menus visibles |
| SES-04 | Rôle non attribué | refus uniforme, aucun changement de session | code 403 expurgé |
| SES-05 | Déconnexion | session invalidée | code HTTP |
| SES-06 | Appel après déconnexion | accès protégé refusé | code 401 |

## R1 — Consultant

| ID | Action | Résultat attendu | Refus obligatoire | Preuve minimale |
|---|---|---|---|---|
| CON-01 | Lister patrimoine, offres et CRM | uniquement ses ressources et les partages autorisés | ressource exclusive du collègue absente | volumes et références fictives |
| CON-02 | Créer Site → Bâtiment → Cellule → Lot | gestionnaire et agence imposés par le serveur | usurpation des champs serveur refusée | identifiants techniques |
| CON-03 | Créer une offre et ses conditions | vente/location cohérentes avec l'offre | lot du collègue refusé | codes HTTP et montants fictifs |
| CON-04 | Créer Société → Contact → Demande | exclusivité et propriété correctes | autre agence refusée | références fictives |
| CON-05 | Lire une demande partagée | lecture autorisée dans le cadre prévu | modification réservée au gestionnaire | codes 200 puis 403 |
| CON-06 | Lancer le matching | uniquement lots autorisés | aucun lot interdit dans les résultats | nombre de résultats et scores |
| CON-07 | Administration | aucun accès | création ou modification d'utilisateur refusée | code 403 |

## R2 — Master consultant

| ID | Action | Résultat attendu | Refus obligatoire | Preuve minimale |
|---|---|---|---|---|
| MAS-01 | Lire l'activité de son équipe | ressources de l'équipe visibles | autre agence absente | volumes par périmètre |
| MAS-02 | Ouvrir la ressource d'un consultant rattaché | lecture conforme au modèle | écriture arbitraire refusée | codes 200 puis 403 |
| MAS-03 | Gérer ses propres ressources | mêmes droits métier qu'un consultant sur ses données | transfert implicite de propriété refusé | identifiants techniques |
| MAS-04 | Administration d'agence | écran et API non accessibles | création d'utilisateur refusée | code 403 |

## R3 — Directeur d'agence

| ID | Action | Résultat attendu | Refus obligatoire | Preuve minimale |
|---|---|---|---|---|
| DIR-01 | Lire le périmètre agence | équipe et données de l'agence visibles | autre agence absente | volumes par agence |
| DIR-02 | Organiser consultant/master | opération autorisée dans sa seule agence | cible d'une autre agence refusée | codes HTTP expurgés |
| DIR-03 | Lever ou réactiver un partage autorisé | transition conforme et auditée | contournement des règles d'exclusivité refusé | états avant/après |
| DIR-04 | Supprimer une ressource autorisée | suppression réservée dans son agence | autre agence et super admin refusés | référence fictive et code HTTP |

## R4 — Administrateur d'agence

| ID | Action | Résultat attendu | Refus obligatoire | Preuve minimale |
|---|---|---|---|---|
| ADM-01 | Lister les utilisateurs administrables | uniquement niveaux autorisés de son agence | autre agence et super admin absents | volumes par niveau |
| ADM-02 | Créer un compte multirôle autorisé | hash jamais renvoyé, agence imposée | rôle ou agence usurpés refusés | champs publics uniquement |
| ADM-03 | Désactiver et réinitialiser | compte inactif puis nouveau changement imposé | session ancienne toujours valide interdite | états et codes HTTP |
| ADM-04 | Modifier son propre niveau | aucun privilège supplémentaire | auto-élévation refusée | code 403 |

## R5 — Super administrateur

| ID | Action | Résultat attendu | Refus obligatoire | Preuve minimale |
|---|---|---|---|---|
| SUP-01 | Administrer plusieurs agences | opérations prévues possibles sur cible explicite | cible absente ou incohérente refusée | références d'agences fictives |
| SUP-02 | Attribuer un rôle supérieur | rôle enregistré et relu sans secret | rôle inconnu refusé | rôles avant/après |
| SUP-03 | Contrôler les parcours métier | validations métier toujours appliquées | privilège global ne contourne pas cohérence et relations | code 400/422 attendu |
| SUP-04 | Vérifier les réponses publiques | aucune donnée sensible exposée | hash, secret, cookie ou clé absents | liste des noms de champs |

## Parcours transverses

| ID | Action | Rôles | Résultat attendu | Preuve minimale |
|---|---|---|---|---|
| TRA-01 | Offre vente | R1, R2, R3 | condition vente uniquement et négociation adaptée | capture expurgée et code HTTP |
| TRA-02 | Offre location | R1, R2, R3 | condition location uniquement et négociation adaptée | capture expurgée et code HTTP |
| TRA-03 | Offre vente/location | R1, R2, R3 | une condition de chaque type | capture expurgée et codes HTTP |
| TRA-04 | Agent asynchrone réussi | R1 à R5 selon droits | attente, exécution et résultat observables | statuts et durée |
| TRA-05 | Agent en erreur | R1 à R5 selon droits | erreur compréhensible, aucune donnée sensible | statut et message expurgé |
| TRA-06 | Front clavier | R1 à R5 | accès au contenu, focus visible et actions principales utilisables | grille de contrôle |
| TRA-07 | Front smartphone | R1 à R5 | menu refermé après navigation, onglets et actions tactiles | grille de contrôle |

## Synthèse d'exécution

| Bloc | Réussi | Échec | Bloqué | Non exécuté | Visa |
|---|---:|---:|---:|---:|---|
| Préconditions |  |  |  |  |  |
| Sessions R1–R5 |  |  |  |  |  |
| Consultant |  |  |  |  |  |
| Master consultant |  |  |  |  |  |
| Directeur d'agence |  |  |  |  |  |
| Administrateur d'agence |  |  |  |  |  |
| Super administrateur |  |  |  |  |  |
| Parcours transverses |  |  |  |  |  |

## Verdict de la recette

- Commit candidat :
- Environnement de répétition :
- Date de début/fin :
- Nombre de scénarios réussis :
- Échecs ou blocages :
- Anomalies corrigées et retestées :
- Preuves expurgées archivées à :
- Verdict : **RÉUSSI / NO-GO**
- Responsable de recette et visa :

Cette fiche ne constitue jamais à elle seule une décision Go. Le verdict doit être repris dans le
dossier `T30_GO_NO_GO.md` avec les preuves de sauvegarde, restauration, supervision et retour arrière.

