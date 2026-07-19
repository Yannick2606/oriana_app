# Architecture du socle applicatif orIAna

> Cartographie de transition — T-33A — 19 juillet 2026. Ce document décrit les frontières du
> monolithe modulaire et distingue l’état observé de la cible. Il ne vaut ni bascule PostgreSQL,
> ni création des objets transverses encore à spécifier.

## Autorité et portée

Cette cartographie applique les décisions DEC-004, DEC-006, DEC-007 et DEC-013 : PostgreSQL reste
la cible non basculée, le backend est l’unique porte d’accès du frontend, l’application reste un
monolithe modulaire et les fournisseurs externes doivent être interchangeables.

Le socle porte les capacités communes. Les modules Patrimoine, Offres, CRM, Matching, Formation et
Agents les consomment sans devenir propriétaires de l’identité, des autorisations, des sessions ou
des connecteurs. Une frontière interne ne constitue pas un microservice.

## Chaîne de dépendances autorisée

```text
Frontend React
    ↓ HTTPS/JSON
Routes Express → Contrôleurs → Services métier
                                  ↓
                            Ports internes du socle
                                  ↓
            Adaptateurs Grist / PostgreSQL / SMTP / n8n / bac à sable
                                  ↑
                    Composition et configuration au démarrage
```

Les dépendances suivent les flèches. Un adaptateur peut satisfaire un port ; le port ne connaît
jamais son adaptateur. Le point de composition choisit les implémentations et les injecte. Les
variables d’environnement sont lues à cette périphérie ou par un adaptateur dédié, jamais par le
frontend ni par une donnée métier.

## Responsabilités et propriétaires

| Zone | Propriétaire | Responsabilité | État observé |
|---|---|---|---|
| Composition | `backend/src/server.js`, `backend/src/app.js` | choisir et assembler services, persistance et connecteurs | le premier lot T-33C rend le port de persistance obligatoire et choisit explicitement le fournisseur au démarrage |
| Identité | service d’authentification et référentiel des rôles | compte, rôle actif, rattachement d’agence et session publique | le référentiel d’identité est injecté sans valeur de repli fournisseur ; le connecteur SMTP relève encore de T-33D |
| Autorisations | référentiel des rôles, middlewares et politiques de périmètre | normaliser les rôles et contrôler lecture/écriture côté serveur | consolidé par T-33B ; référentiel d’identité injecté et groupes de rôles centralisés |
| Sessions | magasin de session et invalidation | conserver et invalider les sessions sans exposer de secret | PostgreSQL en exploitation normale, mémoire dans le bac à sable |
| Persistance métier | port de dépôt générique de transition | lire et écrire les objets pris en charge | T-33C close ; modules découplés et adaptateurs Grist, PostgreSQL et bac à sable sélectionnés à la composition |
| Connecteurs | adaptateurs externes | email et orchestration asynchrone | SMTP et n8n présents, frontières à extraire |
| Objets transverses futurs | socle | Audit, Notification, Préférence, Consentement, Fichier, Tâche et Capture | à spécifier ; aucune création de table autorisée par T-33A |

## Ports internes

Les noms ci-dessous désignent des responsabilités stables. Ils ne figent pas un langage, un
fournisseur ou un protocole externe.

| Port | Opérations attendues | Implémentations ou état |
|---|---|---|
| Référentiel d’identité | rechercher un compte, relire ses rôles et rattachements, mettre à jour ses attributs autorisés | actuellement fourni par le client de persistance métier ; séparation prévue en T-33B |
| Politique d’autorisation | construire le périmètre du rôle actif, décider lecture/écriture, charger une équipe par le référentiel d’identité | logique présente dans les middlewares et services ; consolidation prévue en T-33B |
| Magasin de sessions | lire, enregistrer, expirer et invalider une session | `connect-pg-simple` en mode normal ; magasin mémoire Express dans la prévisualisation |
| Persistance métier | `list`, `getById`, `create`, `update`, `delete` sur une ressource autorisée | T-33C implémentée ; Grist actuel, PostgreSQL cible et adaptateur mémoire en lecture seule satisfont le même port |
| Envoi de message transactionnel | envoyer un message à un destinataire à partir d’un contenu validé, avec erreur explicite | SMTP via Nodemailer ; extraction prévue en T-33D |
| Orchestration asynchrone | déclencher un traitement borné, recevoir un accusé, suivre son état et authentifier le callback | n8n pour le démonstrateur ; extraction prévue en T-33D |
| Audit, notification, préférence, consentement, fichier, tâche et capture | aucun contrat exécutable avant arbitrage de l’autorité, du cycle de vie, des droits et de la conservation | spécification prévue en T-33E |

Le port de persistance générique est une compatibilité de transition avec les contrats de phase 1.
Il ne justifie pas de propager des noms de tables ou des particularités Grist dans les futurs objets.

## Règles de dépendance

### Autorisé

- le frontend appelle les fonctions centralisées de `frontend/src/api`, qui parlent au backend ;
- une route assemble les middlewares de sécurité puis délègue à un contrôleur ;
- un contrôleur traduit HTTP et délègue à un service ;
- un service applique les règles métier et utilise un port injecté ;
- le point de composition instancie les adaptateurs selon l’environnement ;
- un adaptateur traduit un contrat interne vers un fournisseur externe.

### Interdit

- tout appel direct du frontend à Grist, PostgreSQL, n8n, SMTP, un stockage ou une IA ;
- tout import d’un adaptateur fournisseur depuis un module métier, un contrôleur ou un middleware ;
- toute lecture de secret ou construction d’URL fournisseur dans une donnée métier ;
- toute autorisation fondée uniquement sur un état du frontend ;
- toute double écriture ou bascule implicite entre Grist et PostgreSQL ;
- toute création d’un objet transverse avant validation de son contrat T-33E.

Les scripts de migration et d’exploitation peuvent appeler explicitement un adaptateur quand leur
mission le requiert. Ils restent hors du chemin d’exécution des modules et ne deviennent pas un
modèle à reproduire dans les services métier.

## Écarts observés et traitement

| Écart | Risque | Tâche propriétaire |
|---|---|---|
| `app.js` et le service d’authentification proposaient Grist comme valeur de repli | fournisseur implicite dans le cœur applicatif | traité par le premier lot T-33C |
| le calcul du périmètre importait directement Grist et les groupes de rôles étaient dupliqués | autorisation couplée au fournisseur et politiques divergentes | traité par T-33B |
| le service Agents construit l’URL n8n et effectue lui-même l’appel réseau | orchestration confondue avec la règle métier | T-33D |
| l’authentification dépend directement du transport SMTP | identité couplée au fournisseur de message | T-33D |
| les objets transverses futurs ne possèdent pas encore de contrat | risque d’inventer tables et comportements | T-33E |
| aucune règle automatisée ne bloque les imports interdits | dérive architecturale silencieuse | T-33F |

## Critères de conservation du comportement

Chaque lot suivant doit conserver les routes publiques, les codes d’erreur, les contrôles des cinq
rôles, le refus d’accès métier implicite du super administrateur, le mode lecture seule du bac à
sable et le choix opérationnel de Grist tant que T-30 n’est pas validée. Une extraction de frontière
n’autorise ni nouvelle capacité, ni donnée fictive, ni appel externe supplémentaire.
