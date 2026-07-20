# Référentiel des objets métier orIAna

> Vue canonique de haut niveau — version 2.0 — 19 juillet 2026.

Ce référentiel nomme les objets ; [SPEC.md](../../SPEC.md) et les migrations SQL font foi sur les
champs et contraintes implémentés.

## Objets actuellement implémentés ou migrés

| Domaine | Objets | Source technique actuelle/cible |
|---|---|---|
| Organisation | Agence, Utilisateur, Rôle, rattachement d’équipe | Grist en production / PostgreSQL cible |
| Patrimoine | Adresse, Site, Bâtiment, Cellule, Lot, Famille | idem |
| Qualification | Catégorie, Caractéristique, Valeur de caractéristique | idem |
| Commercial | Offre, Condition financière, Mandat | idem |
| Relation | Société, Contact, Demande | idem |
| Intelligence | Matching demande-lot, Traitement d’agent | idem |
| Technique | Session, journal d’import, rejet d’import | PostgreSQL |

Les tables PostgreSQL normalisent aussi les relations multivaluées : rôles utilisateur, parcelles,
cellules d’un lot, co-gestionnaires, familles d’une demande et portées d’une caractéristique.

## Objets cibles à spécifier avant création

Connaissance, Source, Signal, Capacité, Mission, Proposition, Décision métier, Action, Résultat,
Retour d’expérience, Audit, Consentement, Préférence, Notification, Fichier, Tâche, Capture,
Interaction, Tunnel, Étape, Publication et Abonnement de veille.

Cette liste exprime un besoin de modélisation, pas une autorisation de créer des tables. Chaque
objet doit recevoir une définition ORMO, une autorité, un cycle de vie, des droits, une politique de
conservation et des critères d’acceptation.

Les contrats cibles T-33E pour Audit, Consentement, Préférence, Notification, Fichier, Tâche et
Capture sont validés et consignés dans les
[contrats des objets transverses](../architecture/CONTRATS_OBJETS_TRANSVERSES.md). Leur
implémentation reste affectée aux tâches propriétaires et exige leur paramétrage applicable.

## Invariants transverses

- toute donnée métier est rattachée à son organisation/agence lorsque le périmètre l’exige ;
- les identifiants PostgreSQL sont indépendants des identifiants Grist ; `legacy_grist_id` assure
  le rapprochement de migration ;
- provenance, auteur, dates et validation sont conservés pour les objets cognitifs futurs ;
- les suppressions métier sont restrictives ; l’archivage est préféré lorsque l’historique compte ;
- les montants et surfaces utilisent des types décimaux, les événements un temps horodaté.
