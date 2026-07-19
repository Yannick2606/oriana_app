# Sources métier et règles d’import

> Inventaire de reprise — 19 juillet 2026. Les volumes ci-dessous proviennent d’analyses
> historiques transmises par le porteur du projet ; les fichiers sources ne sont pas présents dans
> ce dépôt et ces chiffres devront être revérifiés avant tout import réel.

## Sources recensées

- export LOGI PRO ;
- tableau des prestations et aménagements ;
- fiches et documents Alliance ;
- dossier commercial de Domont ;
- fiche de Goussainville ;
- captures CAKE O’CLOCK ;
- anciens documents de structure de données ;
- fiches de demande et documents Outlook ;
- PDF de synthèse issu d’un échange antérieur.

Ces documents servent à concevoir le contenu et les parcours. Ils ne constituent ni une charte
graphique, ni un schéma à recopier, ni une autorisation d’importer des données personnelles.

## Export LOGI PRO

L’analyse historique indique 383 lignes, 191 colonnes, 122 offres distinctes et 45 villes. Une
offre peut apparaître sur plusieurs lignes en raison de ses lots.

Répartition historique observée des gestionnaires :

- Nicolas Yalap : 205 lignes ;
- Denis Palais : 140 lignes ;
- Gabriel Duman : 37 lignes ;
- Alliance Administrateur : 1 ligne.

Les familles observées couvrent locaux d’activité, entrepôts, bureaux, bureaux et entrepôts,
locaux commerciaux, bureaux et activités et fonds de commerce. Les contextes couvrent vente,
location, vente ou location, cession de fonds, cession de bail et vente de murs occupés.

Avant import, il faut :

- conserver le fichier source intact et établir son empreinte ;
- dédupliquer par offre et par lot sans perdre la relation Offre–Lots ;
- anonymiser les personnes, coordonnées et autres données non nécessaires au bac à sable ;
- rapprocher et contrôler la hiérarchie Site–Bâtiment–Cellule–Lot–Offre ;
- journaliser conversions, exclusions, doublons et rejets ;
- ne pas forcer une colonne incompatible dans le schéma actuel ;
- exécuter les imports de façon idempotente, transactionnelle et réversible.

## Prestations et aménagements

Le tableau historique contient environ 110 caractéristiques à normaliser dans le modèle EAV. Les
familles identifiées sont Site, Bâtiment, Activité, Entrepôt, Messagerie, Bureaux et Locaux
sociaux.

Doublons, fautes, types, unités, niveaux et familles sont arbitrés avant import. Les libellés
sources ne sont pas transformés automatiquement en référentiel canonique.

## Dossiers commerciaux

Les dossiers confirment les besoins de contenu suivants : descriptif, photographies, plans, plan
de situation, annexes, évaluation, surfaces par niveau et usage, équipements, accès, informations
financières et juridiques et contact responsable.

Leur traduction fonctionnelle est décrite dans
[les fiches métier à développer](FICHES_METIER_A_DEVELOPPER.md).

## Règles de personnes et bac à sable

La décision métier transmise indique que Nicolas Yalap remplace Gabriel Duman dans les
attributions historiques et que Denis Palais est également consultant. Gabriel Duman ne doit donc
pas être créé comme profil cible ; ses attributions sources doivent être rapprochées avant
anonymisation vers le successeur décidé.

Cette règle de conversion ne remet pas en cause l’exigence actuelle de T-32 : le bac à sable du
dépôt utilise exclusivement des identités fictives et des adresses `example.invalid`. Les noms
réels servent au rapprochement contrôlé d’une source autorisée, pas à la démonstration. Un jeu
fictif peut reproduire la distribution et la réaffectation sans conserver les identités.

## Contrôles préalables obligatoires

Avant tout import réel : vérifier l’autorité et la licéité de la source, réaliser une sauvegarde,
figer le mapping versionné, exécuter un import à blanc, contrôler volumes et relations, examiner
les rejets, tester la restauration et obtenir une décision humaine explicite. Aucun chiffre de ce
document ne vaut preuve d’un import réussi.
