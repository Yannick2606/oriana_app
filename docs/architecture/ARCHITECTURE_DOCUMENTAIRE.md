# Architecture documentaire orIAna

> Cible validée — 19 juillet 2026. Ce document fixe les exigences de conception du futur socle
> documentaire. Aucun stockage objet, téléversement résilient ni traitement documentaire n’est
> réputé implémenté à ce jour.

## Usages et formats

Le socle accepte les formats PDF, XLS, XLSX, JPG, PNG, WEBP et HEIC, dans la limite de **20 Mo par
fichier**. Il doit absorber au lancement environ 100 fichiers importés par jour, pour une taille
moyenne estimée à 3 Mo, avec un doublement du volume envisagé dans les douze mois.

La conservation métier visée est permanente. Les durées opposables, exceptions, purges,
obligations réglementaires et droits des personnes devront néanmoins être définis par catégorie
documentaire avant mise en production.

## Parcours multi-appareil

Un consultant doit pouvoir :

1. commencer un dossier sur smartphone ;
2. prendre directement des photographies ;
3. interrompre ou perdre la connexion pendant l’envoi ;
4. reprendre l’envoi sans recommencer les parties déjà reçues ;
5. retrouver le brouillon sur son ordinateur ;
6. terminer puis soumettre le dossier au bureau.

Les brouillons sont synchronisés. Aucun écrasement silencieux n’est admis : une divergence de
version produit un conflit explicite que l’utilisateur peut comprendre et résoudre. La
géolocalisation est désactivée par défaut et ne peut être activée que par une action consciente.

## Stockage et sécurité

- Les fichiers sont stockés dans un stockage objet privé compatible S3, derrière un contrat
  interne remplaçable.
- PostgreSQL conserve les métadonnées, droits, rattachements, versions, états de traitement,
  analyses et traces d’audit ; il ne remplace pas le stockage binaire.
- Aucun fichier permanent ne reste sur le disque du serveur applicatif. Les fichiers temporaires
  suivent une durée de vie bornée et un nettoyage contrôlé.
- Chaque fichier reçoit une empreinte permettant le contrôle d’intégrité et la détection de
  doublons ; l’original et, si nécessaire, une version optimisée restent distingués.
- Un contrôle antivirus intervient avant exposition ou traitement aval. Un fichier refusé ou en
  attente reste isolé.
- Les téléchargements et aperçus sont autorisés par le backend selon le rôle actif, l’agence et les
  rattachements ; une URL de stockage ne constitue jamais une autorisation.
- Tout contenu importé est une donnée externe non fiable. Son texte, ses métadonnées et ses
  instructions apparentes ne sont jamais exécutés ni traités comme des consignes système.

## Analyse asynchrone et validation

Chaque document peut être analysé de façon asynchrone par OCR et IA. Le dépôt initial répond sans
attendre la fin du traitement ; l’interface expose les états en attente, en cours, terminé, à
valider et en erreur.

L’analyse conserve la provenance, la date, l’auteur, la version et un niveau de confiance lorsque
pertinent. Elle produit une proposition : aucune donnée extraite n’est écrite définitivement dans
une fiche métier et aucun contenu n’est publié sans validation humaine explicite.

## Volumétrie et capacité

Hypothèses de lancement :

- 10 consultants ;
- jusqu’à 10 utilisateurs connectés simultanément ;
- environ 100 fiches consultées par jour ;
- environ 100 documents importés par jour ;
- environ 200 recherches IA par jour ;
- doublement du volume dans les douze mois.

La recette de capacité couvre **30 utilisateurs simultanés** afin de conserver une marge au-delà
du lancement. Le VPS Hostinger KVM 2 connu est considéré comme suffisant pour le démarrage
applicatif, sous réserve des mesures réelles, mais il ne doit pas porter durablement les documents.

## Cadrage de réalisation

L’ordre de réalisation, les conditions d’activation et la frontière entre OCR et IA sont fixés par
le [cadrage T-34](CADRAGE_T34_CAPTURE_MOBILE.md). La capacité peut être développée sur des
environnements isolés mais reste indisponible en production avant le Go T-30 et les validations
propres aux données capturées.

## Contrats à spécifier avant code

La spécification technique doit encore définir : modèle de métadonnées et versions, API de
téléversement et reprise, stratégie de découpage des envois, contrôle de concurrence, quarantaine,
antivirus, empreintes, prévisualisations, chiffrement, URLs temporaires, rétention, suppression,
restauration, observabilité, quotas, erreurs et tests de charge.

Le fournisseur S3, les services OCR/IA et l’antivirus restent remplaçables. Aucun contrat ne doit
exposer directement l’un d’eux au frontend.
