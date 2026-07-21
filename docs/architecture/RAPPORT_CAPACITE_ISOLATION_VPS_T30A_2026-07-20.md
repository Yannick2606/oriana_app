# Rapport de capacité et d’isolation du VPS — T-30A

> Relevé du 20 juillet 2026.
>
> **Statut : campagne « repos » réussie, verdict final en attente.** Les campagnes en activité
> normale et en pointe représentative restent nécessaires. Ce rapport n’autorise aucun
> déploiement.

## 1. Cadre

Le relevé applique le
[protocole de capacité et d’isolation](PROTOCOLE_CAPACITE_ISOLATION_VPS_T30A.md) associé à DEC-038.
Les commandes ont été exécutées manuellement par l’opérateur dans une session SSH ouverte par lui.
Aucun secret, fichier d’environnement, journal applicatif, dump, inspection Docker ou changement
de configuration n’a été demandé.

## 2. Résultats agrégés au repos

| Preuve | Résultat observé | Seuil du protocole | Verdict au repos |
|---|---:|---:|---|
| Cœurs logiques | 2 | budget partageable de 2 | conforme sous réserve des campagnes en charge |
| Charge 1 / 5 / 15 min | 0,00 / 0,01 / 0,00 | inférieure à 70 % des 2 cœurs | conforme |
| CPU inactif moyen | environ 98,5 % sur environ 5 minutes, après exclusion des en-têtes répétés | au moins 30 % | conforme |
| Attente I/O moyenne / maximale | 0,0 % / 0 % | généralement sous 10 % / blocage au-dessus de 20 % | conforme |
| Activité de swap | aucune ; aucun swap configuré | aucune pression répétée | conforme au repos |
| Mémoire totale | environ 7,75 Gio | information | — |
| Mémoire disponible | environ 6,46 Gio | au moins 4 Gio et 30 % | conforme |
| Stockage total | environ 95,8 Gio | information | — |
| Stockage disponible | environ 88,5 Gio ; 8 % utilisés | au moins 20 Gio et 25 % libres | conforme |
| Inodes disponibles | environ 12,6 millions ; 3 % utilisés | au moins 20 % libres | conforme |
| File d’exécution maximale | 0 pendant le relevé | absence de saturation | conforme |

La première synthèse `vmstat` a indiqué 64 échantillons alors que la commande en demandait 60 : les
quatre en-têtes répétés avaient été comptés comme des lignes à zéro. Le taux initial de 92,3 % était
donc sous-estimé ; la correction donne environ 98,5 % d’inactivité. Un second contrôle tardif au
repos a reproduit le défaut (`64` lignes, 91,9 % affichés), soit environ 98,0 % après correction,
avec attente I/O, swap et file d’exécution toujours nuls. Ce second contrôle n’est pas qualifié
d’activité normale, car l’application n’était pas utilisée.

Le protocole filtre désormais les seules lignes numériques. Les futures campagnes doivent afficher
exactement 60 échantillons.

## 3. Services et consommation Docker

Les projets Compose observés sont distincts : application principale, Grist, prévisualisation et
socle Traefik/n8n. Les conteneurs applicatifs, PostgreSQL et les deux conteneurs de prévisualisation
étaient déclarés sains. Les autres services attendus étaient actifs sans redémarrage visible.

Au moment de la capture, la consommation CPU des conteneurs visibles était nulle ou voisine de
zéro. La mémoire visible restait très inférieure à la mémoire disponible ; Grist était le plus gros
consommateur visible, autour de 417 Mio. La sortie complète de `docker system df` n’étant pas
visible dans la preuve transmise, aucune valeur agrégée d’images ou de volumes n’est revendiquée.

## 4. Isolation logique

Les noms de projets, réseaux et volumes existants permettent de réserver un préfixe propre au futur
lot R1. Les réseaux applicatifs existants sont distincts. Les volumes persistants métier portent
des noms identifiables. Le volume au nom automatique observé a été attribué, par filtre Docker en
lecture seule, au conteneur de sauvegarde PostgreSQL de production. Il est donc explicitement hors
périmètre de toute remise à zéro T-30A.

Le relevé des écoutes montre :

- SSH sur le port 22, HTTP sur 80 et HTTPS sur 443, sur IPv4 et IPv6 ;
- n8n sur le port 5678 limité à la boucle locale ;
- la résolution système limitée à la boucle locale ;
- aucune publication directe observée des ports natifs de Grist ou PostgreSQL.

Cette topologie est compatible avec le principe DEC-038 : seuls les futurs frontend et backend de
R1 auraient à rejoindre le réseau partagé avec Traefik ; Grist, PostgreSQL et Mailpit peuvent rester
internes.

## 5. Protection réseau confirmée

`ufw` a répondu `inactive`, mais la console Hostinger montre un pare-feu réseau actif associé au
VPS. Ses quatre règles sont, dans l’ordre :

1. accepter TCP 22 depuis toute source ;
2. accepter TCP 80 depuis toute source ;
3. accepter TCP 443 depuis toute source ;
4. bloquer tout autre protocole, port et source.

Cette politique correspond aux écoutes attendues et empêche la publication externe de n8n, Grist,
PostgreSQL ou Mailpit. Aucune règle n’a été modifiée. L’ouverture SSH à toute source reste un point
de durcissement possible ; sa restriction éventuelle nécessite une décision d’exploitation séparée
tenant compte de l’adresse d’administration ou d’un accès de secours.

## 6. Verdict provisoire

La **campagne au repos est conforme** aux seuils de capacité et l’isolation logique de R1 paraît
réalisable. Le verdict DEC-038 reste toutefois **en attente** parce que :

- l’activité normale n’a pas encore été mesurée ;
- une pointe réelle représentative n’a pas encore été mesurée.

Conformément au protocole, l’état demeure un **No-Go conservatoire pour tout déploiement R1**, sans
conclure à ce stade que le VPS dédié est obligatoire.

## 7. Prochaine preuve

Répéter le relevé CPU, mémoire et I/O pendant une période réelle d’activité normale, puis pendant
une pointe représentative. Aucun trafic artificiel n’est généré. Le verdict final prendra le cas le
plus défavorable et intégrera la preuve de protection réseau.
