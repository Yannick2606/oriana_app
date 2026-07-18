# T-30 — Audit des prérequis GitHub Actions

Audit réalisé en lecture seule sur les fichiers du dépôt et les métadonnées accessibles. Aucune
valeur de secret n'a été demandée ou lue, aucun workflow n'a été déclenché et aucun réglage GitHub
n'a été modifié.

## Verdict

**NO-GO pour l'activation du pré-contrôle.** Le workflow est correctement borné dans son contenu,
mais il n'est pas encore rattaché à un environnement GitHub protégé. Son fichier n'est pas présent
sur la branche par défaut, ce qui le rend volontairement inactif dans l'onglet Actions.

## Résultats vérifiables dans le dépôt

| ID | Contrôle | Résultat | Impact |
|---|---|---|---|
| GH-01 | déclenchement | `workflow_dispatch` uniquement | conforme |
| GH-02 | permissions | `contents: read` | conforme |
| GH-03 | concurrence | groupe unique, annulation désactivée | conforme |
| GH-04 | artefact | rapport seul, privé, rétention 14 jours | conforme |
| GH-05 | verdict | étape finale en échec si le pré-contrôle n'est pas vert | conforme |
| GH-06 | confirmations | six booléens obligatoires, `false` par défaut | conforme |
| GH-07 | commandes sensibles | aucune commande de déploiement, migration, sauvegarde, restauration ou bascule | conforme |
| GH-08 | environnement GitHub | aucune clé `environment:` dans le job | **bloquant** |
| GH-09 | branche par défaut | workflow absent de `main`, présent seulement sur la branche de préparation | inactif, conforme à l'absence d'autorisation de fusion |
| GH-10 | actions tierces | actions officielles référencées par version majeure, pas par SHA immuable | avertissement chaîne d'approvisionnement |

## Noms de secrets attendus par le workflow

La présence et la valeur ne sont pas vérifiables avec l'accès disponible. Le tableau confirme
uniquement les noms référencés par le fichier YAML.

| Secret attendu | Présence vérifiée | Valeur lue |
|---|---|---|
| `POSTGRES_HOST` | non vérifiable | jamais |
| `POSTGRES_PORT` | non vérifiable | jamais |
| `POSTGRES_DB` | non vérifiable | jamais |
| `POSTGRES_USER` | non vérifiable | jamais |
| `POSTGRES_PASSWORD` | non vérifiable | jamais |
| `SESSION_SECRET` | non vérifiable | jamais |
| `FRONTEND_ORIGIN` | non vérifiable | jamais |
| `BACKEND_PUBLIC_URL` | non vérifiable | jamais |
| `FRONTEND_PUBLIC_URL` | non vérifiable | jamais |
| `VITE_API_BASE_URL` | non vérifiable | jamais |
| `N8N_WEBHOOK_BASE_URL` | non vérifiable | jamais |
| `N8N_SHARED_SECRET` | non vérifiable | jamais |

Une valeur absente est transmise comme chaîne vide et le script conclut No-Go. Cette sécurité ne
remplace pas l'isolation par environnement GitHub.

## Métadonnées GitHub non vérifiables

| Contrôle | État requis avant activation |
|---|---|
| environnement `t30-repetition` | créé et distinct de toute production |
| secrets attachés à l'environnement | 12 noms présents ; valeurs contrôlées par une personne habilitée |
| approbateurs obligatoires | au moins un approbateur indépendant du déclencheur |
| interdiction d'auto-approbation | activée si l'offre GitHub le permet |
| branches autorisées | branche ou tag candidat explicitement limité |
| délai de protection | défini si requis par la procédure de changement |
| journal d'approbation | conservé avec la preuve Go/No-Go |
| règles de branche `main` | fusion protégée et contrôles obligatoires confirmés |

Ces éléments doivent être vérifiés dans les paramètres GitHub par un administrateur habilité. Une
capture peut être jointe seulement après masquage des noms de personnes non nécessaires et sans
ouvrir la vue d'une valeur de secret.

## Écart avec les workflows existants

- Les workflows Grist utilisent déjà `GRIST_API_URL`, `GRIST_API_KEY` et `GRIST_DOC_ID`, mais cela
  ne prouve ni leur présence actuelle ni leur adéquation à un environnement de répétition.
- `check-postgres.yml` utilise une base PostgreSQL éphémère et des valeurs CI non sensibles. Son
  succès prouve migrations et restauration techniques, pas la restauration d'une sauvegarde de
  répétition ni la disponibilité d'une copie hors VPS.
- Tous les workflows inspectés limitent les permissions à `contents: read`.

## Corrections à autoriser séparément

1. créer ou confirmer l'environnement GitHub `t30-repetition` avec approbateurs et branches limitées ;
2. rattacher le job `preflight` à cet environnement par `environment: t30-repetition` ;
3. confirmer les 12 noms de secrets sans lire ni copier leurs valeurs ;
4. décider si les actions officielles doivent être épinglées par SHA immuable ;
5. seulement après revue, autoriser une fusion qui rendrait le workflow déclenchable ;
6. déclencher le workflow avec les six preuves externes laissées à `false` tant qu'elles ne sont pas signées.

Aucune de ces corrections n'est effectuée par cet audit.

