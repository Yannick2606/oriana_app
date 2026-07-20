# Étude T-34A — Stockage objet compatible S3

> **Support de décision — non normatif — 20 juillet 2026.** Comparaison fondée sur les pages
> officielles consultées à cette date. Aucun compte, abonnement, compartiment ou secret n’a été
> créé. Les prix sont hors taxes lorsqu’indiqué par le fournisseur et doivent être revérifiés au
> moment de la souscription.

## Besoin orIAna

Le stockage doit rester privé, distinct du VPS applicatif et accessible uniquement derrière le
port `objectStorage`. Le premier lot exige une région européenne, une API compatible S3, le
versionnement, des règles de cycle de vie, le chiffrement, une restauration vérifiable, des droits
bornés et un coût observable.

Hypothèses validées : 100 fichiers par jour, 3 Mo en moyenne, 10 consultants et doublement du volume
en douze mois. Cela représente environ 9 Go de nouveaux originaux par mois au lancement et 18 Go par
mois au volume doublé, hors versions, aperçus et sauvegardes.

## Comparaison au 20 juillet 2026

| Solution | Région et résidence | Fonctions pertinentes | Prix public observé | Analyse |
|---|---|---|---|---|
| Scaleway Object Storage Standard Multi-AZ | Paris, Amsterdam ou Varsovie | S3, trois zones en Multi-AZ, versionnement, cycle de vie, Object Lock, gel légal, SSE | Paris : 0,01606 € par Go/mois ; 75 Go de sortie gratuits par mois puis 0,01 €/Go | meilleur alignement fonctionnel et européen ; coût légèrement supérieur mais faible au volume prévu |
| OVHcloud Standard 3-AZ Object Storage | Paris ou Milan pour l’offre 3-AZ consultée | S3, versionnement, chiffrement SSE-OMK ou SSE-C, trafic sortant inclus | 0,00002152 $ par Gio/heure pour les 50 premiers Tio, soit environ 0,01571 $ par Gio/mois | alternative française solide ; la FAQ consultée indique que les droits par compartiment ne sont pas encore configurables, à vérifier impérativement en preuve |
| Backblaze B2 | région EU Central à Amsterdam, choisie pour tout le compte | S3, versions, règles de cycle de vie, Object Lock et chiffrement serveur | 0,00695 $ par Go/mois ; sortie gratuite jusqu’à trois fois le stockage mensuel moyen, puis 0,01 $/Go | option la moins chère ; région fixée au niveau du compte et non modifiable ensuite |
| Cloudflare R2 | juridiction européenne disponible | S3 partiel, chiffrement automatique, cycle de vie et verrouillage propres à R2 ; sortie gratuite | 0,015 $ par Go/mois en Standard | écarté comme stockage principal : les opérations S3 de lecture et configuration du versionnement sont indiquées non implémentées |

## Projection simple de coût

Avec une montée progressive de 9 à 18 Go de nouveaux originaux par mois, le stock brut atteint
environ 162 Go après douze mois. Un scénario conservateur à 18 Go chaque mois atteint 216 Go. Chez
Scaleway Standard Multi-AZ Paris, le seul stockage représenterait alors environ 2,60 à 3,47 € par
mois. Avec une marge de 100 % pour versions, aperçus et sauvegardes, l’ordre de grandeur reste
inférieur à 7 € par mois, hors sorties au-delà de la franchise et options complémentaires.

Cette projection ne constitue ni un devis ni un budget contractuel. Elle montre que, pour le volume
prévu, les garanties de droits, restauration et résidence priment sur l’écart de prix unitaire.

## Recommandation conditionnelle

Qaegis peut apporter une solution de stockage ou une offre intégrée. Faute de documentation
technique officielle publiquement identifiable sous ce nom lors de l’étude, cette option ne peut
pas encore être comparée ni réputée compatible. Elle devient le **candidat prioritaire à
qualifier** au moyen du [questionnaire Qaegis](QUESTIONNAIRE_QAEGIS_STOCKAGE_T34A.md).

Scaleway constitue la **référence technique et la solution de repli**, pas un choix de fournisseur
définitif. Si Qaegis satisfait tous les critères éliminatoires et la même preuve de restauration,
son offre pourra être retenue par une décision ultérieure sans modifier le contrat `objectStorage`.

### Préproduction

À défaut d’une offre Qaegis qualifiée à temps, utiliser **Scaleway Object Storage Standard Multi-AZ
en région Paris** dans un projet et un compartiment privés dédiés à la préproduction, avec :

- versionnement activé dès la création ;
- chiffrement serveur et TLS ;
- identifiants limités au seul compartiment et à la seule fonction nécessaire ;
- aucune URL publique permanente ;
- règles de cycle de vie conformes à DEC-020 ;
- inventaire comprenant clé opaque, version, taille et SHA-256 ;
- exercice de suppression et de restauration sur données fictives.

### Production

Ne retenir Qaegis ou Scaleway en production qu’après réussite de la même preuve de préproduction.
La production utilise un projet, un compartiment et des identifiants distincts.
Une seconde copie protégée, séparée du compartiment principal, doit être testée avant activation.
Le mécanisme précis de copie ou réplication et sa région restent à vérifier pendant la preuve ; ils
ne sont pas supposés disponibles par cette étude.

Object Lock ne doit pas être activé globalement sans vérifier son caractère difficilement
réversible et sa compatibilité avec DEC-020. Le gel juridique peut être porté par un compartiment ou
une politique dédiée après recette.

## Preuve obligatoire avant décision de production

1. créer un environnement fictif privé, sans donnée personnelle réelle ;
2. vérifier l’isolation des droits et le refus d’accès anonyme ;
3. envoyer, versionner, supprimer logiquement et restaurer un jeu de fichiers autorisés ;
4. appliquer les cycles de vie aux transferts incomplets, quarantaines et aperçus ;
5. rapprocher inventaire PostgreSQL simulé, versions objet, tailles et empreintes ;
6. restaurer depuis la copie séparée et confirmer qu’un objet purgé ne réapparaît pas ;
7. mesurer latence, erreurs, volume, requêtes, sorties et coût ;
8. documenter le retour arrière et la révocation des identifiants.

## Sources officielles

- [Scaleway — tarification du stockage](https://www.scaleway.com/en/pricing/storage/)
- [Scaleway — fonctionnalités Object Storage](https://www.scaleway.com/en/object-storage/)
- [Scaleway — versionnement](https://www.scaleway.com/en/docs/object-storage/how-to/use-bucket-versioning/)
- [Scaleway — cycle de vie](https://www.scaleway.com/en/docs/object-storage/api-cli/lifecycle-rules-api/)
- [Scaleway — Object Lock et gel légal](https://www.scaleway.com/en/docs/object-storage/api-cli/object-lock/)
- [OVHcloud — prix Public Cloud](https://www.ovhcloud.com/en/public-cloud/prices/)
- [OVHcloud — versionnement Object Storage](https://help.ovhcloud.com/csm/es-public-cloud-storage-s3-versioning?id=kb_article_view&sysparm_article=KB0063862)
- [OVHcloud — FAQ Object Storage et chiffrement](https://help.ovhcloud.com/csm/en-ca-public-cloud-storage-s3-faq?id=kb_article_view&sysparm_article=KB0059673)
- [Backblaze — prix B2](https://www.backblaze.com/cloud-storage/pricing)
- [Backblaze — régions de données](https://www.backblaze.com/docs/cloud-storage-data-regions)
- [Backblaze — versions de fichiers](https://www.backblaze.com/docs/cloud-storage-file-versions)
- [Cloudflare — prix R2](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare — juridiction des données R2](https://developers.cloudflare.com/r2/reference/data-location/)
- [Cloudflare — compatibilité de l’API S3](https://developers.cloudflare.com/r2/api/s3/api/)
