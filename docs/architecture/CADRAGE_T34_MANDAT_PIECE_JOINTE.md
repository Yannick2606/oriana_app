# Cadrage T-34 — Pièce jointe du mandat

> **Cible validée, non implémentée — 22 juillet 2026.** Ce document étend le socle documentaire
> pour permettre de rattacher un original signé à un Mandat. Il ne crée ni bouton actif, ni route,
> ni migration, ni stockage, ni autorisation de production.

## 1. Finalité

Le mandat signé est une source engageante du dossier commercial. orIAna doit préserver son
original, ses versions, son auteur, sa provenance et ses droits sans réduire le document à un lien
ou à un champ du Mandat. Le fichier relève du socle documentaire ; le Mandat reste l'objet métier
qui porte numéro, registre, parties, dates, honoraires, avancement et responsabilités.

Cette séparation applique l'ADN d'orIAna : conserver la source et la transformer en patrimoine
réutilisable, tout en maintenant une autorité humaine explicite sur les actes engageants.

## 2. Parcours initial

Depuis la vue **Mandats** d'une Offre, un utilisateur autorisé pourra :

1. choisir **Ajouter le mandat signé** ;
2. sélectionner un PDF de 20 Mo maximum ;
3. vérifier le nom neutralisé, la taille et le Mandat destinataire ;
4. confirmer explicitement l'envoi ;
5. suivre les états `transfert`, `quarantaine`, puis `disponible` ou `refuse` ;
6. consulter ou télécharger une version disponible après un nouveau contrôle serveur des droits ;
7. déposer une nouvelle version sans écraser ni rendre invisible l'original précédent.

Le premier parcours accepte uniquement `application/pdf`. Les autres formats documentaires du
socle ne sont pas automatiquement autorisés pour l'original contractuel d'un Mandat. Une image
issue d'une numérisation pourra être traitée comme Capture distincte tant qu'un parcours de
conversion et de validation n'est pas spécifié.

## 3. Droits et sécurité

- L'ajout, le remplacement, la lecture et le téléchargement héritent des droits d'écriture ou de
  lecture du Mandat et sont revérifiés par le backend à chaque commande.
- Le gestionnaire du Mandat et, dans leur agence, le directeur ou l'administrateur d'agence peuvent
  ajouter une version. Le master consultant conserve seulement la lecture autorisée de son équipe.
- Le super administrateur n'obtient aucun accès implicite au contenu métier.
- L'agence, l'auteur et la cible sont imposés par la session serveur ; ils ne sont jamais acceptés
  comme autorité depuis le navigateur.
- Le fichier demeure privé, sans URL permanente. Seul un verdict antivirus `sain` permet sa mise à
  disposition. Aucun contenu importé n'est traité comme une instruction exécutable.
- L'archivage du Mandat conserve les versions selon la politique opposable. Suppression, gel légal,
  restitution et purge doivent rester auditables.

## 4. Modèle et rattachement

DEC-040 étend DEC-021 et DEC-033 : `mandat` devient la cinquième valeur future de
`VALID_ATTACHMENT_TARGETS`. La persistance cible ajoute une référence facultative protégée par clé
étrangère vers Mandat, tout en conservant la contrainte « zéro ou une cible » et le contrat de
domaine `{ type, id }`.

Le fichier signé n'est pas ajouté comme colonne binaire, chemin local ou URL dans Mandat. Une
Capture de type `article_document` porte le ou les Fichiers et propose le rattachement au Mandat.
Après validation, le Mandat expose les versions disponibles sans devenir propriétaire des octets.

## 5. États d'interface

- La prévisualisation T-32 reste en lecture seule : elle peut montrer une pièce fictive clairement
  identifiée, mais ne propose aucune commande d'envoi.
- Un environnement inscriptible sans stockage documentaire affiche une indisponibilité explicite ;
  aucun bouton sans effet n'est rendu.
- Pendant un envoi, la progression, l'interruption et la reprise sont visibles.
- En quarantaine ou en cas de refus, le document n'est ni consultable ni téléchargeable ; le message
  reste sûr et n'expose aucun diagnostic brut du scanner.
- La liste distingue version courante, versions antérieures, auteur, date, taille et état.

## 6. Séquencement

1. **T-34A** : étendre catalogues, politiques et contrat de persistance à la cible Mandat ; choisir
   et vérifier le stockage objet privé.
2. **T-34B** : accepter le rattachement proposé `mandat` dans les brouillons et conflits.
3. **T-34C** : envoyer et reprendre le PDF, contrôler taille, empreinte et quarantaine.
4. **T-34D** : exécuter l'antivirus ; OCR éventuel seulement après disponibilité et validation.
5. **T-34E** : livrer l'expérience de dépôt, validation, versionnement et consultation dans la
   fiche Offre/Mandat.

Le développement isolé reste possible avec doubles de test, PostgreSQL isolé et stockage privé de
préproduction. Toute persistance ou activation de production reste interdite avant le choix du
stockage, la restauration vérifiée, la recette des droits et le Go T-30 explicite.

## 7. Acceptation future

- PDF sain de moins de 20 Mo ajouté au Mandat autorisé et disponible après quarantaine ;
- PDF trop volumineux, type ou signature incohérents et fichier infecté refusés sans exposition ;
- accès inter-agences et rôle non autorisé refusés par appels backend directs ;
- nouvelle version ajoutée sans écrasement de l'ancienne ;
- interruption réseau reprise sans doublon ni fichier partiel visible ;
- clavier, tactile, lecteur d'écran et états d'attente ou d'erreur vérifiés ;
- sauvegarde et restauration cohérentes des métadonnées et des objets démontrées.

## 8. État réel au 22 juillet 2026

Le CRUD Mandat structuré est implémenté. Le noyau documentaire pur ne reconnaît encore que
Société, Contact, Demande et Offre. Aucune route de transfert, migration Capture/Fichier, interface
d'ajout, persistance documentaire ou connexion à un stockage objet n'est active. La vue observée
dans la prévisualisation est donc conforme à son état de bac à sable, mais la capacité demandée
reste à développer.
