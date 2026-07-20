# Audit d’implémentation T-34A — Lot 1

> **Audit préalable exécuté — 20 juillet 2026.** Ce document conserve les constats antérieurs à
> l’implémentation. Le lot délimité a ensuite été réalisé et vérifié, sans route, table, migration,
> donnée, variable d’environnement, adaptateur réel ou connexion fournisseur.

## Résultat de l’audit

Le backend est un monolithe Node.js/Express en modules ES. Les services métier sont actuellement
placés dans `backend/src/services`, leurs dépendances sont injectées et les frontières sont
contrôlées par `backend/scripts/checkArchitecture.js`.

Constats initiaux utiles pour T-34A :

- aucune table Capture ou Fichier n’existe dans les migrations PostgreSQL actuelles ;
- aucun contrat de port `captureRepository`, `fileRepository`, `objectStorage`, `malwareScanner`,
  `previewGenerator` ou `retentionExecutor` n’existait au moment de l’audit ;
- aucune route `/socle` ni contrôleur documentaire n’est monté dans `app.js` ;
- la persistance opérationnelle reste Grist et PostgreSQL ne peut pas devenir autoritaire avant le
  Go T-30 ;
- les politiques de rôle et de périmètre sont séparées des middlewares HTTP dans `roleModel.js` et
  `accessPolicy.js` ;
- le super administrateur ne reçoit déjà aucun accès métier implicite ;
- les tests utilisent `node:test` et les frontières font partie du lint backend.

## Lot 1 retenu et implémenté

Le lot crée un module pur `backend/src/documentary`, sans import Express, PostgreSQL, Grist,
réseau, filesystem, environnement ou SDK fournisseur.

### 1. Catalogues fermés

`backend/src/documentary/catalogs.js` porte des valeurs immuables issues des décisions :

- types de capture : `signal_terrain`, `article_document`, `carte_visite` ;
- cibles validables : `societe`, `contact`, `demande`, `offre` ;
- catégories de fichier et formats autorisés ;
- états de Capture et Fichier ;
- verdicts DEC-022 ;
- classes DEC-020 ;
- quotas DEC-019 et profil audio DEC-018.

Les valeurs sont exportées sans lecture de configuration. Les seuils de production resteront
injectables plus tard ; ce premier lot fournit seulement les valeurs par défaut validées.

### 2. Politiques pures

`backend/src/documentary/policies.js` contient uniquement des fonctions déterministes :

- valider la cohérence taille, extension, type déclaré et type détecté ;
- refuser une cible absente du catalogue validable ;
- vérifier une transition de cycle de vie ;
- déterminer si un verdict antivirus autorise l’étape suivante ;
- calculer la classe et l’échéance technique de conservation ;
- vérifier le périmètre d’une capture à partir d’un acteur et d’un ensemble d’identifiants d’équipe
  déjà calculé, sans appeler le référentiel d’identité ;
- interdire l’accès métier implicite du super administrateur.

Les fonctions ne déplacent aucun octet, ne persistent rien et ne produisent aucun effet externe.

### 3. Contrats de ports

`backend/src/documentary/ports.js` décrit et vérifie à la composition les opérations minimales
attendues, sans fournir d’adaptateur :

| Port | Opérations contractuelles minimales |
|---|---|
| `captureRepository` | `createDraft`, `getById`, `updateWithExpectedVersion`, `transition`, `listExpired` |
| `fileRepository` | `createVersion`, `getById`, `listByCapture`, `recordMalwareVerdict`, `listExpired` |
| `objectStorage` | `putPrivate`, `openReadStream`, `deleteObject`, `listVersions` |
| `malwareScanner` | `scanStream` avec verdict DEC-022 |
| `previewGenerator` | `generatePreview` depuis une entrée bornée |
| `retentionExecutor` | `purge`, idempotente, avec preuve non sensible |

Ce fichier ne crée aucun client. Il refuse une composition incomplète avec une erreur de
configuration locale, avant le traitement d’une requête.

### 4. Erreurs stables du domaine

`backend/src/documentary/errors.js` définit une erreur documentaire sans détail fournisseur,
avec les premiers codes testables :

- `INVALID_DOCUMENT_TYPE` ;
- `INVALID_DOCUMENT_SIZE` ;
- `INVALID_ATTACHMENT_TARGET` ;
- `INVALID_DOCUMENT_TRANSITION` ;
- `DOCUMENT_SCOPE_FORBIDDEN` ;
- `MALWARE_SCAN_REQUIRED`.

Les correspondances HTTP restent hors de ce lot et seront définies avec les routes propriétaires.

## Tests du lot

Quatre fichiers de tests unitaires couvrent le lot :

- `documentaryCatalogs.test.js` : valeurs DEC-018 à DEC-022, immutabilité et absence de cible future
  validable ;
- `documentaryErrors.test.js` : codes fermés et absence de détail fournisseur ou HTTP ;
- `documentaryPolicies.test.js` : formats, 20 Mo, transitions, conservation, verdicts, agences,
  auteur, équipe et refus du super administrateur ;
- `documentaryPorts.test.js` : acceptation de doubles complets et refus de chaque opération absente.

La recette du lot exige ensuite :

```text
npm run lint --prefix backend
npm test --prefix backend
git diff --check
```

## Hors périmètre explicite

- aucune migration ou table PostgreSQL ;
- aucune table ou modification Grist ;
- aucun stockage local ou objet ;
- aucun conteneur ClamAV ;
- aucune route, contrôleur ou modification de `app.js` et `server.js` ;
- aucune lecture de `.env` ;
- aucun traitement OCR, IA ou n8n ;
- aucune donnée fictive supplémentaire ;
- aucun déploiement ni activation dans la prévisualisation.

## Séquencement après le lot 1

Le lot suivant ne pourra être choisi qu’après revue des tests du noyau. La persistance documentaire
PostgreSQL et le stockage objet resteront désactivés tant que la qualification Qaegis, la migration
associée, la restauration et les conditions du Go T-30 ne sont pas validées. T-34B pourra ensuite
s’appuyer sur les catalogues et politiques sans contourner ces dépendances.
