# T-30 — Dossier de préparation Go/No-Go

Ce document prépare la recette et la décision de bascule. Il n'autorise ni mutation de production,
ni passage de Grist en lecture seule, ni déploiement. Toute étape marquée « production » exige une
autorisation distincte et une décision humaine explicite.

La revue de branche `docs/T30_REVUE_FINALE_BRANCHE.md` conclut actuellement No-Go avant PR et doit
être soldée avant toute activation du workflow.

## État de départ

| Contrôle | État | Preuve actuelle |
|---|---|---|
| Backend | Prêt localement | lint réussi ; 96 tests réussis, 1 intégration PostgreSQL ignorée hors environnement réel |
| Frontend | Prêt localement | lint et build réussis ; 39 tests réussis |
| Migration initiale | Déjà validée | import idempotent de 69 lignes, zéro rejet et zéro relation orpheline documentés dans `PLAN.md` |
| Contrats API | Couvert | tests backend des ressources, relations, montants, sessions et agents |
| Recette réelle des cinq rôles | À exécuter | comptes de recette et environnement de répétition requis |
| Sauvegarde hors VPS | Bloquant | copie chiffrée hors serveur à confirmer |
| Restauration chronométrée finale | À exécuter | base temporaire exclusivement |
| Supervision et alertes | À confirmer | santé, erreurs, sauvegardes et agents doivent être observables avant le Go |
| Décision Go/No-Go | Bloquant | validation humaine obligatoire |

Le pré-contrôle local se lance depuis la racine avec `node scripts/preflightT30.mjs`. Il écrit
`docs/T30_PREFLIGHT_REPORT.md`, ne restitue aucune valeur de configuration et conserve un résultat
« No-Go » tant que les preuves externes ne sont pas explicitement fournies.

Le workflow manuel `Pré-contrôle T-30` reprend le même contrôle, avec des confirmations externes
désactivées par défaut. Il publie le rapport comme artefact privé pendant 14 jours, n'accorde que la
permission de lecture du dépôt et ne contient aucune commande de déploiement, migration ou bascule.
Tant que ce workflow n'est pas présent sur la branche par défaut, il ne peut pas être déclenché depuis
l'onglet Actions ; sa création sur cette branche de préparation ne vaut donc pas activation.
L'audit statique des prérequis et les métadonnées GitHub restant à vérifier sont consignés dans
`docs/T30_AUDIT_GITHUB_PREREQUIS.md`.

## Matrice des cinq rôles

Chaque scénario doit être exécuté avec un compte de recette distinct. Les résultats attendus se
contrôlent dans l'interface puis par appel API direct lorsque le cloisonnement est en jeu.
La fiche d'exécution détaillée et expurgée est disponible dans `docs/T30_RECETTE_5_ROLES.md`.

| Rôle | Lecture attendue | Écriture attendue | Refus obligatoire |
|---|---|---|---|
| Consultant | ses données et les ressources explicitement partagées | ses ressources | données exclusives d'un collègue et toute autre agence |
| Master consultant | son activité et lecture de son équipe | ses ressources ; actions d'équipe autorisées seulement par le backend | administration d'agence et écriture arbitraire sur l'équipe |
| Directeur d'agence | périmètre complet de son agence | gestion de l'équipe et opérations autorisées dans l'agence | toute autre agence et privilèges super administrateur |
| Administrateur d'agence | utilisateurs et paramètres autorisés de son agence | administration conforme au modèle hiérarchique | autre agence, propre élévation et gestion d'un super administrateur |
| Super administrateur | périmètre global prévu | opérations inter-agences autorisées | contournement des validations métier et exposition des secrets |

Pour chaque rôle : connexion, changement de mot de passe initial, changement de rôle si applicable,
navigation, déconnexion, refus après déconnexion, puis contrôle des codes 401/403/404 sans fuite de
données.

## Parcours métier à recetter

| Parcours | Scénario minimal | Critère de succès |
|---|---|---|
| Patrimoine | Site → Bâtiment → Cellule → Lot puis qualification | relations conservées, périmètre respecté, aucune écriture hors droit |
| Offres | vente, location, vente/location et modification des conditions | une condition cohérente par type, montants exacts, vues adaptées |
| Mandats | création, modification des honoraires et lecture liée | nature et période valides, société et offre dans le périmètre |
| CRM | Société → Contact → Demande puis partage contrôlé | propriété, exclusivité et rattachements conservés |
| Matching | demande autorisée vers lots autorisés | scores relus et triés sans révéler de lot interdit |
| Agents | déclenchement, attente, résultat et erreur | traitement asynchrone observable, idempotence et absence de secret dans les journaux |
| Administration | création, désactivation, hiérarchie et réinitialisation | droits serveur respectés et sessions invalidées lorsque requis |
| Front responsive | parcours principaux au clavier et sur smartphone | actions accessibles, onglets utilisables et aucun blocage de navigation |

## Répétition de bascule

Le protocole de sauvegarde/restauration et ses scripts à garde-fous sont détaillés dans
`docs/T30_REPETITION_SAUVEGARDE_RESTAURATION.md`. Ils sont préparés mais n'ont pas été exécutés.

1. Annoncer la fenêtre de répétition et confirmer qu'elle ne cible pas la production.
2. Créer une sauvegarde PostgreSQL au format personnalisé et vérifier son catalogue.
3. Copier la sauvegarde chiffrée hors VPS et consigner emplacement, date, empreinte et responsable.
4. Restaurer dans une base temporaire explicitement nommée ; vérifier migrations, volumes, relations
   orphelines, agrégats financiers et échantillons canoniques.
5. Exécuter l'import Grist à blanc, puis deux imports réels dans l'environnement de répétition pour
   prouver l'idempotence.
6. Simuler le gel des écritures, importer le delta et mesurer la durée totale de la fenêtre.
7. Basculer uniquement l'environnement de répétition vers PostgreSQL et exécuter la matrice complète.
8. Simuler le retour vers Grist avant toute écriture non répliquée, puis documenter le traitement
   du delta requis si des écritures PostgreSQL ont été acceptées.
9. Détruire uniquement la base temporaire après conservation des preuves non sensibles.

## Critères Go

La grille `docs/T30_SUPERVISION_ALERTES.md` définit 33 tests synthétiques à prouver sans donnée métier.
Ses seuils initiaux doivent être confirmés après observation de la répétition.

- tous les contrôles ci-dessus sont verts et signés par un responsable identifié ;
- sauvegarde locale vérifiée et copie chiffrée hors VPS disponible ;
- restauration finale réussie et durée compatible avec la fenêtre annoncée ;
- rapprochement complet sans rejet inexpliqué ni relation orpheline ;
- cinq rôles et parcours métier réussis sur l'environnement de répétition ;
- santé, erreurs, sauvegardes et agents supervisés avec alertes testées ;
- procédure de retour arrière répétée dans la durée acceptable ;
- décision Go explicite donnée après présentation des preuves.

Un seul critère manquant impose « No-Go ». L'absence de décision vaut « No-Go ».

## Déclencheurs de retour arrière

- écart de volume, relation orpheline ou montant divergent ;
- erreur d'autorisation ou fuite inter-consultants/inter-agences ;
- indisponibilité durable, taux d'erreur anormal ou sessions instables ;
- sauvegarde, restauration, supervision ou agents asynchrones non opérationnels ;
- durée de migration incompatible avec la fenêtre validée.

Le retour vers Grist est direct uniquement avant toute écriture PostgreSQL non répliquée. Après
ouverture des écritures, le delta doit être exporté, contrôlé et réconcilié avant tout retour.

## Fiche de décision

- Date et fenêtre :
- Version/commit candidat :
- Sauvegarde et empreinte :
- Restauration temporaire :
- Rapprochement :
- Recette cinq rôles :
- Supervision :
- Retour arrière répété :
- Risques acceptés :
- Décision : **GO / NO-GO**
- Décideur et visa :
