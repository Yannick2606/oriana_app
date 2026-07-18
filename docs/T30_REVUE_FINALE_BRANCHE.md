# T-30 — Revue finale de la branche de préparation

Revue effectuée sans PR, fusion, déclenchement de workflow ni accès à un environnement. Comparaison
GitHub : `t30-preparation-go-no-go` est 19 commits devant `main`, zéro commit derrière, avec 33
fichiers modifiés ou ajoutés.

## Verdict

**NO-GO pour ouvrir une PR ou activer le workflow.** Deux corrections de sécurité sont bloquantes et
le périmètre de la future intégration doit être clarifié.

Mise à jour : les corrections REV-01 et REV-02 ont passé la contre-revue locale et les contrôles
complets. REV-02 doit encore être exécutée sur PostgreSQL éphémère par le workflow dédié. Le No-Go
reste inchangé tant que cette preuve et les autres prérequis externes ne sont pas disponibles.

## Constats bloquants

### REV-01 — Secrets hérités par les tests enfants

- Sévérité : **CRITIQUE**.
- Fichiers : `.github/workflows/preflight-t30.yml`, `scripts/preflightT30.mjs`.
- Constat : les 12 secrets sont injectés dans l'environnement du processus Node. Le script lance
  ensuite lint, tests et build avec `env: process.env`, ce qui transmet inutilement les secrets à
  tous les processus npm et au code de test.
- Risque : un test, outil de build ou paquet compromis peut lire ou exfiltrer des valeurs qui ne lui
  sont pas nécessaires.
- Correction attendue : exécuter les contrôles avec un environnement explicitement filtré, puis
  vérifier la seule présence des secrets dans le processus de pré-contrôle. Aucun secret PostgreSQL,
  session ou n8n ne doit être accessible aux commandes frontend/backend ordinaires.
- Preuve de correction : test automatisé démontrant qu'une variable sentinelle sensible n'est pas
  visible depuis un processus enfant, tandis que le rapport détecte sa présence dans le parent.
- État : **clos localement** — environnement enfant sur liste blanche ; test sentinelle 2/2 réussi.

### REV-02 — Suppression fondée uniquement sur le nom

- Sévérité : **ÉLEVÉE**.
- Fichier : `deploy/drop-t30-restore-db.sh`.
- Constat : le script exige une confirmation et un motif strict, mais supprime toute base correspondant
  à `oriana_restore_t30_[a-z0-9_]+` sans prouver qu'elle a été créée par la répétition courante.
- Risque : une base temporaire utile ou créée par une autre répétition peut être supprimée si son nom
  est saisi par erreur.
- Correction attendue : créer après restauration un marqueur contenant un identifiant de répétition,
  puis exiger ce même identifiant lors du nettoyage. Refuser la suppression si le marqueur est absent
  ou divergent. Conserver le refus des connexions actives et ne jamais utiliser `--force`.
- Preuve de correction : tests négatifs sans PostgreSQL pour nom/confirmation et test d'intégration
  sur une instance éphémère prouvant qu'une base sans marqueur n'est jamais supprimée.
- État : **corrigé localement, preuve CI attendue** — marqueur unique requis, validations négatives
  réussies et scénario PostgreSQL éphémère ajouté sans avoir été déclenché.

## Périmètre à clarifier avant PR

### REV-03 — T30B et T-30 regroupées

- Sévérité : **ÉLEVÉE pour la revue**, non destructive en l'état.
- Constat : la branche de préparation part de T30B non fusionnée et contient donc l'interface, les
  captures, l'image métier, les tests frontend et tout le dossier T-30.
- Impact : une PR dite « préparation T-30 » contiendrait 19 commits et 33 fichiers, dont des changements
  UX/UI sans rapport direct avec le dossier Go/No-Go.
- Décision attendue : soit intégrer T30B séparément après autorisation, puis rebaser/recréer T-30 sur
  ce nouveau `main` ; soit assumer explicitement une seule PR combinée avec une revue adaptée. Aucune
  de ces actions n'est autorisée par cette revue.

## Constats importants non bloquants à court terme

| ID | Niveau | Constat | Recommandation |
|---|---|---|---|
| REV-04 | moyen | actions officielles référencées par version majeure | décider d'un épinglage par SHA immuable |
| REV-05 | moyen | scripts shell couverts seulement par syntaxe et tests négatifs manuels | ajouter tests automatisés et intégration PostgreSQL éphémère |
| REV-06 | faible | rapport local horodaté commité puis régénéré par workflow | préférer artefact généré ou préciser qu'il s'agit d'un instantané |
| REV-07 | information | workflow absent de `main` | comportement attendu : il reste inactif |
| REV-08 | information | environnement référencé mais protections non lisibles | vérification visuelle toujours obligatoire |

## Contrôles satisfaisants

- permissions Actions limitées à `contents: read` ;
- déclenchement manuel uniquement et concurrence sérialisée ;
- six confirmations externes obligatoires et fausses par défaut ;
- aucune commande de déploiement, migration, gel Grist ou bascule dans le workflow ;
- rapport sans valeur de secret ;
- scripts de restauration limités à une archive et un nom temporaires, refus de `POSTGRES_DB` et des
  bases système, aucun écrasement, aucune suppression automatique ;
- documentation cohérente sur le No-Go par défaut, la décision humaine et le retour arrière ;
- recherche statique : aucun secret en clair détecté dans les ajouts T-30 ;
- branche distante à jour, zéro commit derrière `main` au moment de la revue.

## Ordre de correction recommandé

1. isoler l'environnement des processus enfants et ajouter le test sentinelle ;
2. ajouter le marqueur de répétition et protéger le nettoyage ;
3. automatiser les tests shell sur PostgreSQL éphémère ;
4. décider du périmètre d'intégration T30B/T-30 ;
5. statuer sur l'épinglage des actions ;
6. relancer lint, 96 tests backend, 39 tests frontend, build et pré-contrôle ;
7. effectuer une nouvelle revue avant toute PR.
