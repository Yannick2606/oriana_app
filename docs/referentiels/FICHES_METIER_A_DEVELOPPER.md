# Fiches métier à développer

> Exigences fonctionnelles validées — 19 juillet 2026. Ces fiches décrivent une cible de
> développement ; elles ne sont pas réputées implémentées. `SPEC.md` et les migrations devront être
> complétés et validés avant leur code lorsque le modèle actuel ne couvre pas les données requises.

Les anciennes fiches Alliance, LOGI PRO et CAKE O’CLOCK servent à comprendre le contenu et
l’organisation du travail. Leur graphisme n’est pas une référence. Toutes les vues suivent la
[charte d’interface](../ux/CHARTE_INTERFACE_ORIANA.md), utilisent uniquement le backend et
respectent les droits du rôle actif à chaque requête.

## Fiche Offre

La fiche Offre comporte huit vues fonctionnelles :

1. **Synthèse** ;
2. **Bien & surfaces** ;
3. **Finances** ;
4. **Mandats** ;
5. **Actions** ;
6. **Visites** ;
7. **Documents** ;
8. **Transactions**.

Elle s’adapte automatiquement à la nature `vente`, `location` ou `vente_et_location`. Cette
adaptation concerne les libellés, prix de vente, loyers, charges, fiscalité, honoraires,
disponibilités, conditions de négociation, mandats et transactions. Une offre double nature
conserve deux ensembles financiers distincts sans mélanger les valeurs.

Lorsque les données existent, la fiche présente :

- identité, statut, adresse, localisation et photographies de l’offre ;
- surfaces par étage et par usage, type de bien, caractéristiques, équipements et accès ;
- disponibilité et informations financières et juridiques ;
- propriétaire ou mandant, consultant responsable et co-commercialisation ;
- publications, annonces et panneaux ;
- historique des négociations ;
- documents, plans et diagnostics.

Chaque vue distingue les données disponibles, absentes, en attente ou non encore prises en charge.
Aucune action d’envoi, publication ou transaction n’est déclenchée silencieusement.

## Terrain

Le terrain est une catégorie métier à part entière, et non un attribut secondaire d’un bâtiment.
Il doit pouvoir porter :

- adresse et localisation ;
- surface, parcelles et sections cadastrales ;
- accès, pente, réseaux et environnement ;
- réserves foncières et servitudes ;
- limites observées et anomalies visibles ;
- photographies dédiées ;
- offre, mandat, documents et conditions financières.

L’application ne conclut jamais automatiquement à une limite, une surface, une constructibilité
ou une conformité réglementaire. Une donnée extraite ou suggérée reste qualifiée, sourcée et
soumise à validation humaine.

Le modèle de phase 1 représente encore le terrain nu au travers d’un Site et d’un Lot. Le passage
à un objet Terrain autonome constitue donc un **arbitrage de modèle à réaliser avant code** ; ce
document ne crée pas implicitement une table ni une migration.

## Fiche CRM société, contact et demande

La fiche relationnelle articule les objets Société, Contact et Demande sans les fusionner. Elle
propose cinq vues fonctionnelles :

1. **Critères** ;
2. **Offres liées** ;
3. **Actions** ;
4. **Mandats** ;
5. **Transactions**.

### Critères

La demande peut couvrir : type de contrat, nature du bien, surfaces minimale et maximale, budgets
minimal et maximal, secteur géographique, département, ville, code postal, activité envisagée,
délai ou échéance, alerte, stade et motivation.

Les critères avancés comprennent ERP, occupation, bâtiment indépendant, surface en
rez-de-chaussée, hauteur libre, ICPE, classement ou mise aux normes, plain-pied et multimodalité.
L’utilisateur peut définir une logique **ET/OU** explicite entre les critères et exclure
facultativement la demande du rapprochement automatique.

### Offres liées

Une relation dédiée Demande–Offre suit au minimum les états `proposee`, `envoyee`, `visitee` et
`denoncee`. Les actions associées sont explicites et contrôlées : proposer, envoyer, planifier une
visite, dénoncer et exporter. Le passage d’un état à un autre est tracé ; aucune action n’est
déduite ou exécutée silencieusement.

### Actions

Une action prévoit auteur, nature, type, statut, date et heure, responsable, libellé, échéance et
état terminé ou non. La vue permet des filtres par période, auteur, nature et statut.

### Mandats

La vue présente notamment numéro de fiche, numéro de registre, type, nature, avancement, dates de
début et de fin, archivage et responsable.

### Transactions

La vue présente notamment preneur ou acquéreur, date de signature, type, contrat, surface, origine
directe ou indirecte, consultant et agence.

## Contrats restant à spécifier

Avant développement, les documents d’autorité doivent arbitrer et `SPEC.md` doit définir :

- l’objet Terrain autonome et sa relation à Site, Lot et Offre ;
- la relation Demande–Offre, ses états, son historique et ses droits ;
- Actions, Visites, Transactions, Documents, Annonces, Publications et Panneaux ;
- les critères CRM avancés et leur logique ET/OU ;
- les règles d’archivage, de conservation, de traçabilité et de suppression ;
- les contrats API et les contrôles serveur pour chacun des cinq rôles.

Ces arbitrages précèdent le code et la création de données de démonstration correspondantes.
