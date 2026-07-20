# Questionnaire Qaegis — Stockage objet T-34A

> **Support de qualification — 20 juillet 2026.** Ce questionnaire ne vaut ni engagement, ni
> commande, ni validation fournisseur. Les réponses doivent être écrites, datées et accompagnées
> de documentation ou d’une preuve sur environnement fictif.

## 1. Offre et responsabilités

1. Quelle entité juridique fournit et exploite le service ?
2. Qaegis fournit-il directement le stockage, l’administre-t-il chez un tiers ou agit-il comme
   intégrateur ? Identifier tous les sous-traitants et responsabilités.
3. Quelles régions et quels centres de données hébergent objets, métadonnées, journaux et copies ?
4. Des données ou accès d’administration peuvent-ils sortir de l’Union européenne ?

## 2. Compatibilité S3

Confirmer et démontrer la prise en charge de :

- chargement simple et multipart, reprise et annulation ;
- empreintes ou sommes de contrôle ;
- versionnement, liste et restauration d’une version ;
- règles de cycle de vie sur versions courantes, anciennes et transferts incomplets ;
- suppression définitive d’une version ;
- Object Lock et gel légal, si proposés ;
- URLs temporaires ou accès backend équivalent, sans objet public permanent.

Lister toute divergence avec l’API Amazon S3 et fournir l’URL de la matrice de compatibilité.

## 3. Sécurité et droits

1. Les compartiments et objets sont-ils privés par défaut ?
2. Les droits peuvent-ils être limités par projet, compartiment, préfixe et opération ?
3. Comment les identifiants sont-ils créés, bornés, renouvelés, révoqués et audités ?
4. Quels chiffrements protègent les données en transit et au repos ? Qui gère les clés ?
5. Quels journaux d’accès et événements d’administration sont disponibles, pendant quelle durée ?
6. Quelles mesures empêchent un opérateur ou un support non autorisé d’accéder au contenu ?

## 4. Résilience, sauvegarde et suppression

1. Indiquer durabilité, disponibilité contractuelle, RPO, RTO et exclusions du SLA.
2. Décrire la redondance entre zones et les scénarios de perte couverts.
3. Une copie séparée, dans un autre compte, projet ou site, est-elle possible ?
4. Décrire la restauration après suppression, corruption, compromission d’identifiants et perte de
   région.
5. Comment une purge est-elle propagée aux versions, répliques, sauvegardes et journaux ?
6. Comment éviter qu’une restauration réintroduise un objet dont la purge métier était acquise ?

## 5. Conformité et contrat

1. Fournir l’accord de traitement des données, les lieux de traitement et la liste des
   sous-traitants ultérieurs.
2. Fournir les certifications, rapports d’audit ou qualifications applicables au service exact.
3. Décrire notification d’incident, réversibilité, export complet et destruction en fin de contrat.
4. Préciser propriété des données, assistance, délais de support et procédure d’escalade.

## 6. Tarification

Chiffrer séparément, hors taxes :

- stockage actif et versions par Go/mois ;
- requêtes d’écriture, lecture, liste et suppression ;
- trafic entrant, sortant et inter-régions ;
- copie, réplication, sauvegarde, restauration et gel légal ;
- minimum mensuel, engagement, dépassement, support et sortie du service.

Fournir une estimation pour 250 Go puis 500 Go stockés, avec 500 fichiers ou 10 Go ajoutés au
maximum par agence et par jour.

## 7. Preuve technique attendue

Qaegis fournit un environnement privé ne contenant que des données fictives. orIAna vérifiera :

1. refus de tout accès anonyme ;
2. séparation préproduction/production et droits minimaux ;
3. envoi simple et multipart d’un fichier de 20 Mo ;
4. interruption puis reprise sans recommencer les parties reçues ;
5. création, liste et restauration de versions ;
6. application des durées DEC-020 et d’un gel légal ;
7. suppression contrôlée puis restauration depuis une copie séparée ;
8. rapprochement des versions, tailles et SHA-256 avec l’inventaire simulé ;
9. révocation immédiate des identifiants ;
10. mesure des latences, erreurs, volumes, requêtes, sorties et coûts.

## Règle de décision

Qaegis ne peut être retenu que si les responsabilités, régions, sous-traitants, droits fins,
chiffrement, versionnement, cycle de vie, suppression et restauration sont documentés et si la
preuve technique réussit intégralement. Dans le cas contraire, Scaleway Multi-AZ Paris reste la
solution de repli étudiée. Aucun secret de preuve ne doit entrer dans le dépôt ou le navigateur.
