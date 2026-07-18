# T-30 — Protocole de répétition sauvegarde/restauration

Ce protocole est préparatoire. Aucune commande décrite ici n'a été exécutée. Il cible exclusivement
un environnement de répétition autorisé et une base temporaire ; il ne doit jamais être lancé contre
la production sans une autorisation distincte.

## Garde-fous fournis

- archive limitée au motif `/backups/oriana-*.dump` et catalogue vérifié avant création ;
- cible limitée à `oriana_restore_t30_[a-z0-9_]+` ;
- refus si la cible égale `POSTGRES_DB` ou une base système ;
- refus d'écraser une base temporaire existante ;
- restauration sans `--clean`, dans une base vide créée par le script ;
- arrêt immédiat à la première erreur de restauration ;
- aucune suppression automatique après le contrôle ;
- suppression séparée avec confirmation `T30_DROP_CONFIRM=YES` et même contrôle du nom.

Le script générique `deploy/restore-postgres.sh` restaure dans `POSTGRES_DB` et ne doit pas être
utilisé pour cette répétition. Le protocole T-30 utilise uniquement les deux scripts dédiés.

## Préconditions bloquantes

1. environnement de répétition identifié et distinct de la production ;
2. `.env` présent sur l'hôte, non commité et vérifié par une personne habilitée ;
3. archive créée par `postgres-backup` et catalogue `pg_restore --list` valide ;
4. espace disque suffisant pour conserver archive, base source et base temporaire ;
5. copie chiffrée hors VPS réalisée, avec empreinte SHA-256 et responsable consignés ;
6. fenêtre, durée maximale et personne autorisée à interrompre la répétition définies.

Une précondition absente impose No-Go et interdit d'exécuter les commandes suivantes.

## 1. Identifier l'archive sans afficher de secret

Depuis la racine du dépôt sur l'environnement de répétition :

```sh
docker compose --env-file .env -f deploy/docker-compose.yml exec postgres-backup \
  sh -c 'ls -1t /backups/oriana-*.dump | head -1'
```

Noter uniquement le nom, la date, la taille et l'empreinte. Ne jamais copier de variable
d'environnement dans la preuve.

## 2. Vérifier le catalogue

```sh
docker compose --env-file .env -f deploy/docker-compose.yml exec postgres-backup \
  pg_restore --list /backups/oriana-TIMESTAMP.dump >/dev/null
```

Le code doit être `0`. Aucun objet n'est restauré à cette étape.

## 3. Restaurer dans une base temporaire

Choisir un suffixe non ambigu, par exemple une date UTC compacte. La valeur doit rester conforme au
motif imposé et ne doit jamais reprendre le nom de la base métier.

```sh
docker compose --env-file .env -f deploy/docker-compose.yml run --rm \
  -e T30_REHEARSAL_CONFIRM=YES \
  -v "$PWD/deploy/rehearse-restore-postgres.sh:/usr/local/bin/rehearse-restore-postgres.sh:ro" \
  postgres-backup /usr/local/bin/rehearse-restore-postgres.sh \
  /backups/oriana-TIMESTAMP.dump oriana_restore_t30_YYYYMMDD
```

La sortie autorisée contient uniquement : empreinte, nom de la base temporaire, nombre de migrations,
nombre de tables publiques et durée. Une erreur laisse la base temporaire disponible pour diagnostic ;
elle n'est jamais supprimée implicitement.

## 4. Contrôles d'intégrité

Exécuter sur la base temporaire, sans journaliser de contenu métier :

- nombre de lignes de `schema_migrations` et liste des noms de migration attendus ;
- volumes par table comparés au rapport de sauvegarde ;
- zéro clé étrangère orpheline ;
- agrégats financiers attendus, sans détail nominatif ;
- présence des contraintes et index critiques ;
- contrôle d'un échantillon canonique exclusivement fictif ;
- durée totale compatible avec la fenêtre de retour arrière.

Tout écart inexpliqué impose No-Go. La correction doit être réalisée dans le code ou la procédure,
puis la répétition reprise depuis une nouvelle base temporaire.

## 5. Supprimer uniquement après visa

Après conservation du rapport expurgé et visa du responsable :

```sh
docker compose --env-file .env -f deploy/docker-compose.yml run --rm \
  -e T30_DROP_CONFIRM=YES \
  -v "$PWD/deploy/drop-t30-restore-db.sh:/usr/local/bin/drop-t30-restore-db.sh:ro" \
  postgres-backup /usr/local/bin/drop-t30-restore-db.sh oriana_restore_t30_YYYYMMDD
```

Le script ne termine aucune connexion active et n'utilise pas `--force`. Une base occupée reste en
place jusqu'à diagnostic et nouvelle validation.

## Preuves à joindre au dossier Go/No-Go

| Preuve | Valeur attendue |
|---|---|
| Commit candidat | SHA exact |
| Archive | nom, date UTC, taille, SHA-256 |
| Copie hors VPS | emplacement logique, chiffrement et visa ; aucun secret |
| Catalogue | valide |
| Base temporaire | nom conforme |
| Migrations | nombre et noms attendus |
| Volumes/relations | concordants, zéro orphelin |
| Agrégats | concordants |
| Durée restauration | secondes |
| Nettoyage | base temporaire supprimée après visa |
| Verdict | RÉUSSI / NO-GO |

## Arrêt immédiat

Interrompre la répétition sans tenter de « réparer en direct » si : environnement incertain, archive
invalide, cible inattendue, espace disque insuffisant, restauration partielle, relation orpheline,
montant divergent, secret visible ou durée supérieure à la fenêtre.

