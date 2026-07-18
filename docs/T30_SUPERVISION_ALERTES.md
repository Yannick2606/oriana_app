# T-30 — Grille de supervision et tests d'alertes

Cette grille définit les signaux nécessaires à la répétition et à la décision Go/No-Go. Elle ne
configure aucun service de supervision et ne contacte aucun environnement. Les seuils ci-dessous
sont des valeurs initiales prudentes à confirmer selon les volumes observés pendant la répétition.

## Principes

- aucune alerte ne doit contenir cookie, secret, corps de requête, email ou donnée métier ;
- chaque signal porte environnement, composant, horodatage UTC, sévérité et identifiant technique ;
- un tableau vert sans test de déclenchement ne constitue pas une preuve ;
- les alertes critiques doivent atteindre au moins deux personnes ou canaux autorisés ;
- l'acquittement ne désactive jamais la collecte ni la preuve de l'incident ;
- toute perte de visibilité pendant la fenêtre de bascule impose No-Go ou retour arrière.

Sévérités : `INFO`, `AVERTISSEMENT`, `CRITIQUE`. Les seuils marqués `CRITIQUE` sont bloquants pour
le Go tant que la cause n'est pas corrigée et le test rejoué.

## Santé et disponibilité

| ID | Signal | Seuil initial | Sévérité | Test synthétique | Preuve attendue |
|---|---|---|---|---|---|
| MON-API-01 | `/health` indisponible | 2 contrôles consécutifs à 30 s | CRITIQUE | cibler une URL factice dans le banc de test | alerte puis résolution |
| MON-API-02 | taux HTTP 5xx | > 1 % sur 5 min ou 5 erreurs consécutives | CRITIQUE | injecter des réponses 500 dans le banc | compteur, fenêtre, notification |
| MON-API-03 | latence API p95 | > 1 s pendant 10 min | AVERTISSEMENT | ajouter une latence synthétique | graphe p95 sans contenu métier |
| MON-API-04 | latence API p95 | > 2 s pendant 5 min | CRITIQUE | augmenter la latence synthétique | escalade critique |
| MON-FE-01 | frontend inaccessible | 2 contrôles consécutifs à 30 s | CRITIQUE | URL factice ou service de test arrêté | alerte puis retour au vert |
| MON-CORS-01 | origine attendue refusée | 1 échec du contrôle CORS | CRITIQUE | origine de répétition contrôlée | en-têtes uniquement |

## Sessions et sécurité

| ID | Signal | Seuil initial | Sévérité | Test synthétique | Preuve attendue |
|---|---|---|---|---|---|
| MON-AUTH-01 | échecs techniques de session | > 1 % sur 5 min | CRITIQUE | stockage de session indisponible dans le banc | code, taux et durée |
| MON-AUTH-02 | hausse des 401 | > 3 fois la référence sur 10 min | AVERTISSEMENT | sessions expirées de test | agrégat sans identifiant |
| MON-AUTH-03 | hausse des 403 | > 3 fois la référence sur 10 min | AVERTISSEMENT | appels hors rôle avec comptes fictifs | agrégat par route normalisée |
| MON-SEC-01 | secret ou hash détecté dans un journal | 1 occurrence | CRITIQUE | chaîne sentinelle non secrète | alerte sans reproduire la valeur |
| MON-SEC-02 | accès inter-agences réussi | 1 occurrence | CRITIQUE | scénario négatif de la recette R1–R5 | code attendu 403/404 ; aucun contenu |

Les erreurs d'identifiants fonctionnelles ne doivent pas être confondues avec une panne de session.
Les routes sont regroupées par modèle normalisé afin de ne pas créer de cardinalité par identifiant.

## PostgreSQL

| ID | Signal | Seuil initial | Sévérité | Test synthétique | Preuve attendue |
|---|---|---|---|---|---|
| MON-PG-01 | `pg_isready` en échec | 2 contrôles consécutifs à 15 s | CRITIQUE | hôte factice dans le banc | alerte puis résolution |
| MON-PG-02 | connexions utilisées | > 80 % pendant 10 min | AVERTISSEMENT | charge synthétique bornée | ratio uniquement |
| MON-PG-03 | connexions utilisées | > 90 % pendant 5 min | CRITIQUE | charge synthétique bornée | escalade critique |
| MON-PG-04 | transactions annulées/erreurs | hausse > 3 fois la référence sur 10 min | AVERTISSEMENT | transaction de test volontairement invalide | agrégat technique |
| MON-PG-05 | disque volume PostgreSQL | > 80 % | AVERTISSEMENT | métrique synthétique | capacité et pourcentage |
| MON-PG-06 | disque volume PostgreSQL | > 90 % | CRITIQUE | métrique synthétique | alerte critique |
| MON-PG-07 | migrations attendues absentes | 1 écart | CRITIQUE | base temporaire incomplète | noms de migration uniquement |

## Sauvegardes et restauration

| ID | Signal | Seuil initial | Sévérité | Test synthétique | Preuve attendue |
|---|---|---|---|---|---|
| MON-BKP-01 | dernière sauvegarde valide | âge > 26 h | CRITIQUE | horodatage synthétique ancien | âge, taille, empreinte logique |
| MON-BKP-02 | catalogue `pg_restore --list` | 1 échec | CRITIQUE | archive factice invalide | code d'échec sans contenu |
| MON-BKP-03 | volume de sauvegarde | > 80 % | AVERTISSEMENT | métrique synthétique | capacité et tendance |
| MON-BKP-04 | copie chiffrée hors VPS | preuve absente avant fenêtre | CRITIQUE | retirer la preuve du dossier de test | blocage du pré-contrôle |
| MON-RST-01 | restauration chronométrée | échec ou durée > fenêtre validée | CRITIQUE | base temporaire seulement | durée, migrations, volumes |

## Agents asynchrones

| ID | Signal | Seuil initial | Sévérité | Test synthétique | Preuve attendue |
|---|---|---|---|---|---|
| MON-AGT-01 | traitement en attente | > 5 min | AVERTISSEMENT | agent fictif retardé | âge et statut uniquement |
| MON-AGT-02 | traitement en cours | > 15 min | CRITIQUE | traitement fictif bloqué | durée et identifiant technique |
| MON-AGT-03 | taux d'erreur | > 5 % sur 15 min avec au moins 5 traitements | AVERTISSEMENT | erreurs synthétiques | taux et volume |
| MON-AGT-04 | webhook n8n indisponible | 2 échecs consécutifs | CRITIQUE | URL factice dans le banc | codes et durée |
| MON-AGT-05 | résultat sans suivi correspondant | 1 occurrence | CRITIQUE | référence fictive inconnue | code de corrélation technique |

## Import et rapprochement

| ID | Signal | Seuil initial | Sévérité | Test synthétique | Preuve attendue |
|---|---|---|---|---|---|
| MON-IMP-01 | rejet d'import inexpliqué | 1 ligne | CRITIQUE | rejet fictif contrôlé | table, identifiant legacy, code |
| MON-IMP-02 | relation orpheline | 1 relation | CRITIQUE | relation fictive invalide | table et compte, sans contenu |
| MON-IMP-03 | volume source/cible divergent | 1 écart non justifié | CRITIQUE | compteur synthétique divergent | volumes par table |
| MON-IMP-04 | agrégat financier divergent | écart non nul hors règle d'arrondi | CRITIQUE | agrégat synthétique différent | sommes globales uniquement |
| MON-IMP-05 | import idempotent divergent | 1 variation au second passage | CRITIQUE | double import de répétition | volumes avant/après |

## Procédure de test des alertes

Pour chaque ID :

1. confirmer que le test cible le banc de supervision ou l'environnement de répétition ;
2. noter l'état vert initial et l'heure UTC ;
3. injecter uniquement le signal synthétique décrit, sans donnée métier ;
4. vérifier détection, seuil, sévérité, routage et contenu expurgé ;
5. retirer le signal ;
6. vérifier le retour au vert et la notification de résolution ;
7. joindre une preuve expurgée et le visa du responsable.

Ne jamais arrêter un service de production pour tester une alerte. Une alerte impossible à tester de
façon isolée reste `NON PROUVÉE` et bloque le Go.

## Matrice d'exécution

| Domaine | Tests attendus | Réussis | Échecs | Non prouvés | Visa |
|---|---:|---:|---:|---:|---|
| API/frontend/CORS | 6 |  |  |  |  |
| Sessions/sécurité | 5 |  |  |  |  |
| PostgreSQL | 7 |  |  |  |  |
| Sauvegarde/restauration | 5 |  |  |  |  |
| Agents | 5 |  |  |  |  |
| Import/rapprochement | 5 |  |  |  |  |
| **Total** | **33** |  |  |  |  |

## Critères de supervision pour le Go

- 33 tests exécutés et prouvés, sans échec ni test critique non prouvé ;
- notifications critiques reçues par les destinataires autorisés et résolutions observées ;
- tableaux de bord accessibles pendant toute la fenêtre prévue ;
- rétention des preuves définie sans contenu sensible ;
- seuils confirmés après observation de la répétition ;
- personne responsable et remplaçant identifiés pour la fenêtre ;
- lien vers le protocole d'escalade et la décision de retour arrière disponible.

Même entièrement verte, cette grille ne vaut pas décision Go. Elle alimente la fiche de décision du
dossier `T30_GO_NO_GO.md`.

