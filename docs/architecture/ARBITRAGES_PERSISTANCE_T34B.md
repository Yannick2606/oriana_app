# Arbitrages de persistance T-34B

> **Support historique non normatif — 20 juillet 2026.** Les quatre recommandations sont acceptées
> par DEC-033 à DEC-036. Le registre des décisions fait autorité. Aucun SQL, adaptateur, route ou
> mécanisme actif n’est autorisé par ce document.

## Matrice de décision

| Sujet | Recommandation | Alternative principale | Impact à accepter |
|---|---|---|---|
| Rattachement proposé | **Acceptée — DEC-033** : quatre clés étrangères nullables (`societe`, `contact`, `demande`, `offre`) avec contrainte « zéro ou une », puis traduction en `{ type, id }` par l’adaptateur | couple générique `type` + `id` | intégrité référentielle native, au prix de colonnes supplémentaires et d’une migration lors d’une nouvelle cible |
| Idempotence 24 h | **Acceptée — DEC-034** : registre technique dédié avec empreinte de clé, auteur, agence, empreinte de commande, Capture créée et expiration | colonnes directement sur Capture | unicité, rejeu et purge explicites, avec une table et une tâche de nettoyage supplémentaires |
| Curseur opaque | **Acceptée — DEC-035** : jeton chiffré et authentifié, lié au périmètre et à la requête, contenant la position stable et valable 15 minutes | jeton aléatoire stocké côté serveur | pas de table de curseurs, mais gestion serveur d’une clé et de sa rotation ; les droits restent revérifiés |
| Conflit atomique | **Acceptée — DEC-036** : transaction dédiée verrouillant le brouillon visible, comparant `version_attendue`, puis mutant et incrémentant une seule fois | `UPDATE ... WHERE version = ...` suivi d’une lecture | charge de conflit cohérente et sûre, au prix d’un verrou bref et d’un adaptateur spécialisé |

## 1. Représentation du rattachement proposé

### Recommandation

Conserver quatre références physiques facultatives, chacune protégée par une clé étrangère, et une
contrainte garantissant qu’aucune ou une seule cible est renseignée. L’adaptateur traduit cette
forme relationnelle vers le contrat de domaine unique `rattachement_propose: { type, id }`.

Cette option empêche qu’un brouillon pointe vers un objet inexistant sans imposer au domaine la
forme du schéma. La suppression d’une cible devrait détacher la proposition plutôt que supprimer la
Capture, sous réserve d’un arbitrage explicite sur le comportement `ON DELETE`.

### Alternative

Un couple `cible_type` et `cible_id` est plus compact et facilite l’ajout d’une cible, mais
PostgreSQL ne peut pas garantir directement que l’identifiant existe dans la table désignée. Cette
intégrité devrait alors être reproduite par du code ou des déclencheurs plus complexes.

### Décision validée

DEC-033 retient les quatre clés étrangères, la contrainte « zéro ou une » et le détachement lors de
la suppression autorisée d’une cible. Cette cible est validée mais non implémentée.

## 2. Persistance de l’idempotence

### Recommandation

Utiliser une table technique distincte. Elle conserve seulement une empreinte non réversible de la
clé, l’auteur, l’agence, une empreinte canonique de la commande, la Capture créée et une date
d’expiration. Une unicité couvre le périmètre auteur–agence–empreinte de clé.

Le rejeu de la même commande retrouve la Capture initiale ; une empreinte de commande différente
produit un conflit sans mutation. La purge supprime les lignes expirées après 24 heures sans
supprimer les Captures. La clé brute n’est ni journalisée ni stockée.

### Alternative

Placer ces informations sur Capture réduit le nombre de tables, mais mélange une donnée technique
temporaire au brouillon durable et complique la purge, le rejeu et une éventuelle réutilisation
après expiration.

### Décision validée

DEC-034 retient un registre technique dédié, le stockage des empreintes seulement et une expiration
à 24 heures. Une entrée expirée n’est plus reconnue et peut être remplacée ou purgée sans supprimer
la Capture. Cette cible est validée mais non implémentée.

## 3. Encodage du curseur opaque

### Recommandation

Employer un codec serveur produisant un jeton authentifié et non lisible. Sa charge minimale porte
la position `date_mise_a_jour` et `id`, la version du format, le périmètre de requête et une
expiration courte. Le secret reste uniquement dans l’environnement et doit pouvoir être renouvelé.

Le curseur ne confère aucun accès : la session, l’agence, l’auteur et l’état privé sont revérifiés à
chaque page. Un jeton altéré, expiré ou créé pour une autre requête est refusé sans révéler son
contenu.

### Alternative

Un identifiant aléatoire vers un état de curseur stocké côté serveur évite de transporter la
position, mais ajoute une persistance temporaire, une purge et une dépendance d’état pour chaque
pagination.

### Décision validée

DEC-035 retient un curseur chiffré et authentifié, valable 15 minutes et sans table serveur. Il est
lié à l’auteur, à l’agence et aux filtres ; les droits sont revérifiés pour chaque page. Cette cible
est validée mais non implémentée.

## 4. Stratégie de conflit atomique

### Recommandation

L’adaptateur ouvre une transaction, recherche et verrouille la Capture dans le périmètre auteur,
agence et état privé, compare la version attendue, puis applique la mutation et l’incrément. Si la
version diffère, la même lecture verrouillée fournit les seuls champs sûrs prévus par DEC-025 et la
transaction ne mute rien.

Cette stratégie distingue un objet non visible d’un conflit visible sans seconde lecture instable.
Le verrou reste limité à une Capture et à la durée de la transaction.

### Alternative

Une mise à jour conditionnelle unique est efficace pour décider succès ou échec, mais une seconde
lecture est nécessaire pour construire le conflit. Sans transaction ou verrou cohérent, un autre
écrivain peut changer encore la version entre ces deux opérations.

### Décision validée

DEC-036 retient une transaction courte avec verrou de ligne après contrôle du périmètre. La
mutation et l’incrément réussissent ensemble, ou le conflit sûr est construit depuis le même état
verrouillé sans mutation. Cette cible est validée mais non implémentée.

## Ordre recommandé des validations

1. **validé — DEC-033** : rattachement proposé ;
2. **validé — DEC-034** : idempotence et purge ;
3. **validé — DEC-035** : curseur opaque et temporaire ;
4. **validé — DEC-036** : conflit atomique et charge `409` cohérente.

Les quatre validations sont inscrites au registre et dans la spécification. La préparation d’une
migration reste soumise à une autorisation distincte.
