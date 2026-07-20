# Contrats des objets transverses du socle orIAna

> Cible validée T-33E — 20 juillet 2026 — validation humaine et architecture.
> Ce document ne crée aucune table, route, interface ou donnée. Les durées opposables restent
> soumises à validation juridique et métier avant mise en production.

## Principes communs

Les sept objets appartiennent au socle commun et non à un module métier. PostgreSQL en sera la
source de vérité après le Go T-30 ; Grist reste la source opérationnelle de production jusque-là.
Le backend est leur unique porte d’accès et applique à chaque requête le rôle actif, l’agence, les
rattachements et, lorsqu’il existe, le périmètre de l’objet parent.

Chaque objet possède un identifiant propre, `agence_id` lorsque le périmètre métier l’exige, un
auteur ou acteur, des dates de création et de mise à jour, un état explicite et une version pour le
contrôle de concurrence. Une référence polymorphe éventuelle est limitée à une liste de types
autorisés ; elle ne devient jamais un identifiant libre permettant de contourner les droits.

Les suppressions physiques ne sont pas des opérations REST ordinaires. Elles passent par une
politique de conservation validée, une purge auditée et, si nécessaire, un gel juridique. Les
contenus sensibles, secrets, mots de passe, jetons et charges utiles brutes de fournisseurs sont
exclus de l’audit et des notifications.

## Contrats par objet

### Audit

- **Définition et autorité** : preuve technique d’un événement significatif produit par le backend.
  Le service d’audit fait autorité sur la trace, jamais sur la donnée métier qui a provoqué
  l’événement.
- **Données minimales** : acteur, rôle actif, agence, action canonique, type et identifiant de
  l’objet, résultat, date, identifiant de corrélation et métadonnées explicitement autorisées.
- **Cycle de vie** : `enregistre` → `conserve` → `purge` ou `anonymise`. Une entrée enregistrée est
  immuable ; une correction crée une nouvelle entrée liée.
- **Droits** : écriture interne seulement. Lecture réservée aux autorités habilitées dans leur
  périmètre ; le super administrateur n’obtient pas d’accès métier implicite. Aucun acteur ne peut
  modifier ou supprimer directement une trace.
- **Conservation** : classe de conservation attachée à l’événement, purge ou anonymisation par un
  traitement contrôlé. La durée chiffrée dépend de la finalité et doit être validée avant
  production.

### Notification

- **Définition et autorité** : information adressée à un utilisateur au sujet d’un événement ; elle
  n’est ni la preuve de l’événement ni la preuve de livraison d’un fournisseur.
- **Données minimales** : destinataire, type canonique, titre non sensible, référence autorisée,
  canal, état et dates utiles. Le contenu métier détaillé est chargé depuis sa source après contrôle
  des droits.
- **Cycle de vie** : `planifiee` → `envoyee` ou `echec` ; puis `lue`, `expiree` ou `annulee`.
- **Droits** : un utilisateur lit et marque uniquement ses notifications. Les services autorisés les
  créent ; une administration ne peut pas lire leur contenu hors de son périmètre.
- **Conservation** : suppression après expiration et délai opérationnel validé ; les preuves
  nécessaires sont portées par Audit, pas conservées indéfiniment dans Notification.

### Préférence

- **Définition et autorité** : choix d’expérience ou de canal exprimé par un utilisateur. Une
  préférence ne crée jamais un rôle, un droit ou un consentement.
- **Données minimales** : utilisateur, clé issue d’un catalogue fermé, valeur validée, portée,
  version et dates.
- **Cycle de vie** : `active` → `remplacee` ou `supprimee`. La valeur courante est unique par clé et
  portée.
- **Droits** : lecture et modification par l’utilisateur concerné ; valeurs institutionnelles
  éventuelles gérées séparément. Aucun administrateur ne peut transformer une préférence en
  consentement au nom d’une personne.
- **Conservation** : valeur courante durant la vie du compte ; historique minimal seulement si une
  finalité de preuve le justifie, puis purge avec le compte selon la politique validée.

### Consentement

- **Définition et autorité** : preuve attribuée et datée d’un accord, d’un refus ou d’un retrait
  pour une finalité et une version de texte précises. L’état courant est dérivé de preuves
  immuables.
- **Données minimales** : personne concernée, finalité canonique, état, version du texte, provenance,
  acteur de collecte et dates d’effet. Aucune case précochée ni finalité globale implicite.
- **Cycle de vie** : `accorde` ou `refuse` → `retire`, `expire` ou `remplace`. Un retrait n’efface pas
  la preuve qui permet d’établir qu’il a été respecté.
- **Droits** : la personne concernée agit sur ses choix par un parcours authentifié ou vérifiable ;
  un opérateur habilité peut enregistrer une preuve externe avec sa provenance, sans antidater ni
  masquer l’acteur.
- **Conservation** : preuve conservée selon la finalité et les obligations applicables, puis
  anonymisée ou purgée. Les durées et bases légales doivent être validées avant activation de chaque
  finalité.

### Fichier

- **Définition et autorité** : métadonnées, versions et référence opaque d’un contenu binaire privé.
  Le stockage objet détient les octets ; PostgreSQL détient métadonnées, droits et états.
- **Données minimales** : propriétaire logique, objet parent, nom affiché neutralisé, type déclaré et
  détecté, taille, empreinte, version, référence de stockage opaque, état antivirus et dates.
- **Cycle de vie** : `initie` → `transfert` → `quarantaine` → `disponible` ou `refuse` ; puis
  `archive` → `purge`. Un transfert interrompu peut reprendre sans devenir disponible.
- **Droits** : hérités de l’objet parent et revérifiés par le backend à chaque envoi, aperçu ou
  téléchargement. Aucune URL permanente ni autorisation de stockage n’est exposée au navigateur.
- **Conservation** : liée à la catégorie du parent. Temporaires et transferts incomplets ont une
  durée bornée ; originaux, versions, quarantaines, sauvegardes et purges suivent des politiques
  distinctes à valider.

### Tâche

- **Définition et autorité** : engagement opérationnel attribué, daté et suivi. Elle peut référencer
  un objet métier mais ne modifie ni ses droits ni son état sans action métier explicite.
- **Données minimales** : libellé, auteur, responsable, agence, priorité bornée, échéance, état,
  référence autorisée, dates et version.
- **Cycle de vie** : `brouillon` → `planifiee` → `en_cours` → `terminee`, avec branches `bloquee`,
  `annulee` et `archivee`. Toute réouverture est tracée.
- **Droits** : auteur et responsable selon leur périmètre ; responsables hiérarchiques dans leur
  agence. Une réaffectation exige le droit sur la tâche et sur le destinataire.
- **Conservation** : tâches actives jusqu’à clôture ; archivage et purge selon la finalité de la
  tâche et celle de son objet parent, sans supprimer la trace d’une action engageante requise.

### Capture

- **Définition et autorité** : enveloppe privée de collecte d’un signal, d’une carte de visite, d’un
  article ou document, avant qualification humaine. Elle peut contenir des Fichiers et des
  propositions d’extraction ; elle n’est pas encore une donnée métier validée.
- **Données minimales** : auteur, agence, type de capture, commentaire, provenance, fichiers liés,
  état, confiance des extractions, référence cible proposée et dates. La géolocalisation est absente
  par défaut et résulte d’un choix explicite.
- **Cycle de vie** : `brouillon_prive` → `transfert` → `traitement` → `a_valider` → `validee` ou
  `rejetee`, avec branche `erreur`, puis `archivee` ou `purge`. La validation crée ou complète la
  donnée métier par une commande distincte et auditée.
- **Droits** : auteur seul au brouillon ; partage explicite à la soumission selon le périmètre. OCR,
  n8n ou IA proposent sans publier, envoyer ni écrire définitivement.
- **Conservation** : médias bruts et extractions rejetées ont une durée limitée par catégorie ; les
  éléments validés suivent ensuite la politique de leur objet cible. Les durées chiffrées doivent
  être validées avant le parcours T-34.

## Contrat API cible

Toutes les routes ci-dessous sont sous `/socle`, exigent une session valide et héritent des
middlewares de rôle et de périmètre. Elles ne deviennent exécutables qu’avec la tâche propriétaire.

| Objet | Contrat minimal cible | Particularités |
|---|---|---|
| Audit | `GET /socle/audit`, `GET /socle/audit/:id` | aucune route publique de création, modification ou suppression |
| Notification | `GET /socle/notifications`, `PATCH /socle/notifications/:id/lecture` | création interne ; liste limitée au destinataire |
| Préférence | `GET /socle/preferences`, `PUT /socle/preferences/:cle`, `DELETE /socle/preferences/:cle` | clés et valeurs validées par catalogue |
| Consentement | `GET /socle/consentements`, `POST /socle/consentements`, `POST /socle/consentements/:id/retrait` | ajout de preuves ; aucune modification destructive |
| Fichier | `POST /socle/fichiers/transferts`, `PATCH /socle/fichiers/transferts/:id`, `POST /socle/fichiers/transferts/:id/finalisation`, `GET /socle/fichiers/:id`, `GET /socle/fichiers/:id/contenu` | reprise, contrôle antivirus et autorisation serveur obligatoires |
| Tâche | `GET /socle/taches`, `POST /socle/taches`, `GET /socle/taches/:id`, `PATCH /socle/taches/:id`, `POST /socle/taches/:id/transitions` | transitions contrôlées, pas de `DELETE` courant |
| Capture | `GET /socle/captures`, `POST /socle/captures`, `GET /socle/captures/:id`, `PATCH /socle/captures/:id`, `POST /socle/captures/:id/soumission`, `POST /socle/captures/:id/validation`, `POST /socle/captures/:id/rejet` | validation humaine distincte du traitement asynchrone |

Les créations répondent `201`, les traitements asynchrones `202`, les lectures et transitions
réussies `200`. Les erreurs communes sont `400` requête invalide, `401` non authentifié, `403` hors
périmètre, `404` absent, `409` conflit de version ou transition, `413` fichier trop volumineux,
`415` format refusé, `422` état ou contenu non validable et `503` dépendance indisponible. Les codes
métier stables devront être détaillés avec chaque tâche d’implémentation.

## Paramétrage préalable et séquencement

Les contrats sont validés. Avant d’activer la capacité correspondante en production, chaque tâche
propriétaire doit néanmoins définir et faire valider son paramétrage applicable :

1. le catalogue des finalités de consentement et leurs bases légales ;
2. la matrice des classes de conservation, durées, gels, anonymisations et purges ;
3. les catégories de fichiers, quotas et règles antivirus ;
4. les événements auditables et les métadonnées autorisées ;
5. le catalogue des préférences et notifications ;
6. la matrice détaillée des transitions et délégations de Tâche ;
7. les types de Capture et leurs objets cibles autorisés.

Les tâches T-34, T-38, T-39, T-41 et T-42 spécialisent ensuite ces contrats sans les contourner.
