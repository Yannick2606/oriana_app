# CDC.md — Cahier des charges orIAna

> Référence des capacités et exigences métier — version 2.0 — 19 juillet 2026.
> Les contrats techniques sont dans [SPEC.md](SPEC.md) ; l’état réel dans [STATUS.md](STATUS.md).

## 1. Finalité et périmètre

orIAna est une plateforme d’organisation augmentée. Elle doit permettre à une organisation de
capter ses signaux, structurer ses objets, mobiliser connaissances et expertises, décider avec
traçabilité, agir, mesurer et apprendre. BORÉAL est la première organisation servie ; l’immobilier
d’affaires est le premier domaine métier.

La plateforme repose sur cinq couches : Vision, Méthode BORÉAL, ORMO, Plateforme et Patrimoine.
Le [référentiel des modules](docs/referentiels/REFERENTIEL_MODULES.md) cartographie leur réalisation.

## 2. Principes de produit

- Les capacités précèdent les fonctionnalités.
- L’IA propose et explique ; l’autorité humaine valide les actes engageants.
- Le Knowledge Center préserve connaissances, sources, décisions et apprentissages.
- L’Organisation Virtuelle coordonne humains, Experts Virtuels, Chief Agent et agents spécialisés.
- Les fournisseurs, modèles et connecteurs demeurent remplaçables.
- PostgreSQL est la source de vérité métier cible ; Grist est transitoire.
- Le produit reste utile en mode dégradé lorsqu’un modèle IA est indisponible.

Les contrats détaillés des nouveaux piliers sont à spécifier avant leur développement.

## 3. Acteurs et droits actuels

| Rôle | Périmètre actuel |
|---|---|
| Consultant | ses données métier et actions autorisées |
| Master consultant | ses données et lecture de son équipe active |
| Directeur d’agence | métier et organisation de son agence |
| Administrateur d’agence | comptes et habilitations des niveaux inférieurs de son agence |
| Super administrateur | administration globale, sans accès métier implicite |

Un utilisateur peut posséder plusieurs rôles et choisit un rôle actif. Les autorisations sont
recalculées côté serveur. Les futurs acteurs externes (prospect/client) seront spécifiés avant le
portail T-40.

## 4. Capacités du socle

### 4.1 Identité et gouvernance

Authentifier, gérer rôles/agences/équipes, imposer le premier changement de mot de passe, isoler
les périmètres, auditer les actions, gérer préférences et consentements futurs.

### 4.2 Captation et qualification

Capter saisie, voix, photo, document ou signal terrain ; conserver source, date, auteur, droits et
confiance ; détecter les doublons ; maintenir un brouillon privé jusqu’à validation.

### 4.3 Knowledge Center

Rechercher, relier et réutiliser les connaissances avec leur provenance, validation, temporalité,
confidentialité et historique. Cette capacité est une cible validée, non implémentée à ce jour.

### 4.4 Décision et action

Produire une proposition justifiée, la soumettre à la bonne autorité, transformer une validation
en action suivie, mesurer le résultat et capitaliser le retour d’expérience.

### 4.5 Organisation Virtuelle

Distribuer une mission à des Experts Virtuels, orchestrer les agents techniques, gérer contexte,
droits, coûts, erreurs, escalades et validation humaine. Préserver l’inventaire historique d’au
moins 23 agents/Experts sans imposer autant de workflows séparés.

### 4.6 Gouvernance IA

Faire passer tous les fournisseurs par l’AI Gateway ; router selon usage, qualité, confidentialité,
coût et disponibilité ; prévoir secours, quotas, budgets et mode sans IA ; tracer appels et
évaluations sans journaliser de contenu sensible.

### 4.7 Évolution continue

Surveiller technologie, IA, cybersécurité, réglementation, métiers, concurrence, coûts, usages,
UX et cohérence du patrimoine. L’Expert d’évolution continue structure les propositions ; il ne
modifie rien seul.

## 5. Capacités métier actuelles

### 5.1 Immobilier d’affaires

- Patrimoine : Adresse → Site → Bâtiment → Cellule → Lot, avec terrain nu.
- Qualification dynamique par famille et niveau.
- Commercialisation : offres vente/location, conditions financières et mandats.
- Relation : sociétés, contacts, demandes et matching historique.
- Administration et Auto-formation adaptées aux cinq rôles.
- Déclenchement asynchrone d’un agent de démonstration.

### 5.2 CRM étendu

La cible couvre fiche relation à 360°, tunnels configurables, interactions, prochain geste
recommandé, historique, mesure des processus et coaching explicable, sans notation opaque des
personnes.

### 5.3 Modules planifiés

Capture mobile et boîte de réception, todolist/agenda, marketing/site, portail prospect/client,
veille territoriale, immobilier enrichi et fonds de commerce. Les critères sont dans `PLAN.md` ;
aucun module planifié n’est réputé livré.

## 6. Exigences transverses

### 6.1 Sécurité et confidentialité

Backend unique, secrets hors dépôt, droits serveur à chaque requête, cloisonnement organisationnel,
mots de passe hachés, webhooks authentifiés, données externes non fiables, journalisation minimale
et politiques de conservation à définir par type de donnée.

### 6.2 Traçabilité et explicabilité

Relier source, objet, capacité, proposition, décision, action, résultat et retour d’expérience.
Séparer fait, résumé, interprétation et recommandation. Permettre correction et contestation.

### 6.3 UX et accessibilité

Parcours bureau et smartphone, clavier, états explicites, aucun bouton sans effet, traitement IA
non bloquant, validation claire avant action engageante. Voir
[GUIDE_UX_UI.md](docs/ux/GUIDE_UX_UI.md).

### 6.4 Architecture et exploitation

Monolithe modulaire, contrats internes stables, connecteurs remplaçables, migrations versionnées,
sauvegardes et restaurations testées, observabilité proportionnée, absence de dépendance
fonctionnelle directe à Grist, n8n ou un LLM.

Le futur socle documentaire suit
[`docs/architecture/ARCHITECTURE_DOCUMENTAIRE.md`](docs/architecture/ARCHITECTURE_DOCUMENTAIRE.md) :
stockage objet privé, métadonnées et droits dans PostgreSQL, brouillons multi-appareil, envoi
résilient, analyse asynchrone et validation humaine avant écriture définitive ou publication.

### 6.5 Qualité documentaire

Toute évolution significative met à jour la décision et les documents d’autorité avant ou avec le
code. Les statuts cible, transition, implémenté et exploratoire restent explicites.

## 7. Transition des données

T-27 à T-29 ont audité Grist, créé PostgreSQL, validé sauvegarde/restauration et importé les données
accessibles de façon idempotente. T-30A doit rendre les parcours réellement utilisables ; T-30
doit tester et autoriser la bascule. Jusqu’au Go T-30, annoncer PostgreSQL comme source active de
production est incorrect.

Après bascule, l’usage résiduel de Grist sera limité et explicitement décidé. Toute fonction
marketing/éditoriale devra traiter Grist comme un connecteur optionnel, pas comme une dépendance
métier.

## 8. Critères de réussite de la plateforme

- un nouvel arrivant peut relier la Vision au code sans conversation historique ;
- les cinq rôles sont cloisonnés et testés ;
- les parcours prioritaires sont réalisables de bout en bout et accessibles ;
- toute recommandation IA importante est gouvernée, explicable et mesurable ;
- une panne de fournisseur ne bloque pas les fonctions essentielles ;
- données, décisions et apprentissages restent récupérables et réversibles ;
- la maturité du patrimoine peut être évaluée selon une méthode encore à spécifier.
