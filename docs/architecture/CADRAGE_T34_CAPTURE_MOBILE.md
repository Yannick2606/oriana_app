# Cadrage T-34 — Capture mobile, voix, OCR et boîte de réception

> Cadrage validé — 20 juillet 2026. Ce document fixe l’ordre de réalisation et les conditions
> d’activation. Il ne crée aucun schéma, fournisseur, traitement ou parcours disponible.

## État de départ

Le dépôt ne contient actuellement ni modèle Capture/Fichier, ni stockage objet, ni antivirus, ni
OCR, ni transcription vocale, ni manifeste PWA ou service worker. Les contrats abstraits de
Capture et Fichier sont validés par T-33E, mais leurs catalogues, paramètres de conservation et
adaptateurs ne sont pas implémentés.

PostgreSQL est l’autorité cible de ces nouveaux objets. Tant que T-30 n’a pas reçu de Go humain,
Grist reste la source opérationnelle de production et T-34 ne doit provoquer ni double écriture, ni
extension implicite du modèle Grist.

## Conditions d’activation

Le développement peut avancer avec des doubles de test, une persistance PostgreSQL isolée et un
stockage privé de préproduction. La capacité demeure désactivée en production jusqu’à réunion de
toutes les conditions suivantes :

1. Go T-30, rapprochement et retour arrière validés ;
2. catégories de capture, objets cibles et matrice de droits validés ;
3. classes et durées de conservation, purge et gel juridique validées ;
4. stockage objet privé, sauvegarde, restauration et suppression vérifiés ;
5. modèle de menace hors ligne et traitement des données de tiers acceptés ;
6. antivirus, OCR et transcription évalués sur un jeu fictif sans donnée personnelle réelle ;
7. recette humaine de la validation avant écriture métier ;
8. mesure de capacité à 30 utilisateurs simultanés.

L’absence d’une condition produit un état indisponible explicite. Aucun résultat fictif ne doit
masquer une dépendance absente.

## Séquence de réalisation

### T-34A — Socle documentaire

1. arrêter le catalogue des catégories, formats, parents autorisés, quotas et rétentions ;
2. détailler les métadonnées et transitions Fichier/Capture dans SPEC ;
3. définir les ports de métadonnées, stockage objet, antivirus et génération d’aperçu ;
4. choisir l’adaptateur S3 privé par décision traçable, sans l’exposer au frontend ;
5. seulement ensuite créer migrations, services, routes et tests de sauvegarde/restauration.

Les originaux ne séjournent jamais durablement sur le disque applicatif. Une référence de stockage
opaque n’est pas une autorisation ; le backend recontrôle le parent, l’agence et le rôle actif.

DEC-040 ajoute Mandat comme cinquième parent documentaire. Son premier parcours, limité au PDF
signé, est détaillé dans le
[`cadrage de la pièce jointe du mandat`](CADRAGE_T34_MANDAT_PIECE_JOINTE.md) sans autoriser encore
de route, de stockage ou d'interface active.

### T-34B — Brouillons multi-appareil

La Capture reste `brouillon_prive` jusqu’à soumission explicite. Chaque modification fournit une
version attendue ; un écart répond par un conflit compréhensible et ne fusionne rien silencieusement.
La géolocalisation est absente par défaut.

Le cache du service worker contient uniquement le shell applicatif non sensible. Les brouillons et
files d’attente utilisent un stockage structuré dédié, jamais `localStorage` ou `sessionStorage`.
La conservation locale de photos, voix ou données de contact exige avant code un modèle de menace,
une durée bornée, une purge après synchronisation et un traitement explicite de la perte du terminal.

### T-34C — Envoi résilient

Le backend initialise un transfert borné et retourne un identifiant opaque. Les parties reçues sont
numérotées et contrôlées ; la finalisation vérifie taille, empreinte et complétude avant passage en
quarantaine. Un transfert incomplet, expiré ou refusé n’est jamais lisible comme Fichier disponible.

La taille maximale reste 20 Mo par fichier. Le protocole précis, la taille des parties, la durée de
reprise et les quotas doivent être fixés dans SPEC avec l’adaptateur choisi.

### T-34D — Analyse asynchrone

L’ordre est antivirus, puis OCR ou transcription, puis analyse sémantique optionnelle. Chaque étape
est asynchrone, idempotente et observable ; elle conserve version source, outil ou classe d’outil,
date, confiance, statut et erreur récupérable. Le contenu importé demeure une donnée non fiable.

Antivirus, OCR, transcription et analyse IA passent par des ports internes et peuvent être
orchestrés par n8n. Aucun fournisseur IA direct n’est autorisé dans un service métier ou dans le
frontend. L’enrichissement par modèle génératif ne peut être activé qu’après l’AI Gateway T-42, ou
une nouvelle décision d’architecture explicitant un adaptateur transitoire, ses coûts, sa
confidentialité et son retrait.

### T-34E — Validation et expérience mobile

La boîte de réception présente les brouillons, traitements, erreurs et propositions à valider. Une
proposition distingue la source, la valeur extraite, la confiance et la valeur métier existante.
Correction, refus et validation sont des commandes distinctes et auditées.

La validation humaine est la seule commande autorisée à créer ou compléter une donnée métier. Une
validation partielle n’applique que les champs explicitement acceptés. Le parcours doit rester
utilisable au clavier, au toucher, avec lecteur d’écran et en mode dégradé sans OCR ou IA.

## Première intégration de l’IA

T-34D est le premier point fonctionnel prévu pour exploiter une analyse IA de document ou de voix.
T-34A à T-34C doivent rester utiles sans IA. T-34D prépare les ports et l’orchestration ; T-42
apporte l’autorité de routage des fournisseurs, coûts, quotas, confidentialité et secours.

Cette séparation permet de livrer stockage, brouillons, envois et OCR sans rendre le parcours
dépendant d’un modèle génératif.
