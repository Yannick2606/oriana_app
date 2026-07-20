# Audit de persistance T-34B — Brouillons multi-appareil

> **Statut : audit documentaire clos, aucune autorisation de persister — 20 juillet 2026.** Ce
> document décrit l’état observé du dépôt et les quatre cibles validées par DEC-033 à DEC-036. Il
> n’autorise ni migration, ni adaptateur, ni route, ni activation.

## 1. Conclusion

Le noyau pur T-34B peut être prolongé par un adaptateur PostgreSQL dédié lorsque le lot aura reçu
une validation explicite. Le dépôt possède déjà un mécanisme transactionnel de migrations, une
vérification d’idempotence en CI et des procédures de sauvegarde et restauration. Il ne possède
aucune implémentation physique Capture : ni schéma, ni registre d’idempotence, ni codec de curseur,
ni adaptateur transactionnel. Les cibles correspondantes sont toutefois fixées par DEC-033 à
DEC-036.

La création de ces éléments reste bloquée par le cadrage T-34 : migrations, services, routes et
tests de sauvegarde/restauration ne viennent qu’après les validations prévues, sans bascule ni
activation de production avant le Go T-30. Grist reste la source opérationnelle de production et
ne doit recevoir ni table Capture ni double écriture.

## 2. État vérifié du dépôt

### Migrations et intégration continue

- `backend/scripts/migratePostgres.js` applique les fichiers SQL ordonnés dans une transaction et
  enregistre leur nom dans `schema_migrations`.
- Le schéma existant comporte quatre migrations, `001` à `004`.
- `.github/workflows/check-postgres.yml` applique les migrations, exécute lint et tests avec
  PostgreSQL, rejoue deux fois le migrateur puis vérifie un dump et sa restauration.
- Ce workflow contient deux attentes liées au nombre actuel de migrations : la présence explicite
  des fichiers `001` à `004` dans l’image et un total attendu de quatre lignes dans
  `schema_migrations`. Une future migration devra faire évoluer ces contrôles dans le même lot.

### Sauvegarde et restauration

- `deploy/backup-postgres.sh` produit un dump PostgreSQL au format personnalisé, vérifie qu’il est
  lisible et applique une rétention contrôlée.
- `deploy/restore-postgres.sh` restaure avec nettoyage préalable de la cible. Cette opération est
  destructive et doit rester une action d’exploitation explicitement autorisée sur une cible
  identifiée.
- Une future persistance Capture devra démontrer une sauvegarde avant migration, une restauration
  isolée et un retour arrière vérifié. Aucun de ces contrôles n’a été exécuté pendant cet audit.

### Couche de persistance

- `backend/src/services/postgresClient.js` fournit un CRUD générique pour les tables métier déjà
  cartographiées.
- Ce client ne porte pas les invariants T-34B : auteur et agence indissociables, état privé,
  idempotence bornée, comparaison atomique de version et réponse de conflit sûre.
- Le futur modèle Capture doit donc être implémenté par un adaptateur dédié derrière
  `captureRepository`, sans ajouter Capture au CRUD générique ni exposer SQL au domaine.

## 3. Données minimales à porter ultérieurement

Le futur schéma de métadonnées devra représenter au minimum : identifiant, agence, auteur, type,
commentaire, rattachement proposé, état, version, dates serveur et échéance de conservation. Les
références de fichiers restent du ressort de T-34C. La géolocalisation demeure absente conformément
à DEC-032.

La liste privée prévue par DEC-029 appelle un index commençant par le périmètre imposé par la
session et compatible avec l’ordre stable `date_mise_a_jour DESC, id DESC`. La forme exacte de cet
index dépend des arbitrages physiques et ne constitue pas encore une décision normative.

## 4. Contrats structurels

1. **Validé — DEC-033 — Rattachement polymorphe** : quatre références facultatives préservent
   l’intégrité vers Société, Contact, Demande ou Offre, avec zéro ou une cible et traduction vers le
   contrat API `{ type, id }`. Une cible supprimée est détachée sans supprimer la Capture.
2. **Validé — DEC-034 — Idempotence** : un registre séparé stocke les empreintes de clé et de
   commande, bornées à l’auteur et à l’agence, retrouve la création initiale pendant 24 heures puis
   rend l’entrée remplaçable ou purgeable sans supprimer la Capture.
3. **Validé — DEC-035 — Curseur opaque** : un jeton chiffré et authentifié, valable 15 minutes,
   transporte la position stable et le périmètre sans donnée lisible ; les droits sont revérifiés à
   chaque requête.
4. **Validé — DEC-036 — Conflit atomique** : une transaction courte verrouille la ligne autorisée,
   compare visibilité, état et version, puis effectue une mutation unique ou construit le conflit
   sûr depuis le même état sans mutation.

Les quatre contrats sont clos et leur support historique est conservé dans
[`ARBITRAGES_PERSISTANCE_T34B.md`](ARBITRAGES_PERSISTANCE_T34B.md). Le registre des décisions fait
autorité. Leur implémentation reste entièrement distincte et non autorisée.

## 5. Séquence sûre d’un futur lot

1. obtenir l’autorisation explicite du lot de persistance dans le respect du cadrage T-34 et de
   T-30 ;
2. écrire ensemble migration, adaptateur dédié et tests d’intégration, sans route active ;
3. mettre à jour les contrôles CI qui énumèrent et comptent les migrations ;
4. vérifier idempotence, concurrence, cloisonnements par appels directs, sauvegarde et restauration
   isolée ;
5. seulement après une validation distincte, examiner les routes et l’interface.

## 6. Limites de l’audit

L’audit est statique : aucune base n’a été contactée, aucune migration n’a été appliquée, aucun dump
n’a été créé ou restauré et aucun secret d’environnement n’a été lu. Il ne valide ni capacité,
performance, coût, exploitation ni activation de production.

## 7. Preuves de clôture documentaire

Le 20 juillet 2026, les contrôles locaux confirment :

- une fiche et une ligne de synthèse uniques pour chacune des décisions DEC-033 à DEC-036 ;
- aucune question de persistance encore ouverte dans la matrice ;
- des liens locaux valides dans le corpus T-34B et ses documents d’autorité ;
- un diff limité aux fichiers Markdown, sans modification de `.env` ;
- `git diff --check` réussi et aucune signature de secret détectée dans les fichiers modifiés.

Ces preuves concernent uniquement la cohérence documentaire. Aucun test de base, de concurrence ou
de restauration ne peut être revendiqué avant l’autorisation et l’existence du futur lot technique.
