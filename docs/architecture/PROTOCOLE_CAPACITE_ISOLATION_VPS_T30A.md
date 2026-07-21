# Protocole de capacité et d’isolation du VPS — T-30A

> Protocole d’observation — 20 juillet 2026.
>
> **Statut : exécution partielle.** La campagne au repos est terminée ; activité normale et pointe
> restent à mesurer. Ce document n’autorise ni installation, ni modification, ni création de
> ressource, ni déploiement.

La campagne au repos est désormais consignée dans le
[rapport du 20 juillet 2026](RAPPORT_CAPACITE_ISOLATION_VPS_T30A_2026-07-20.md). Les campagnes
d’activité normale et de pointe restent à exécuter.

## 1. Objet et décision attendue

DEC-038 autorise le VPS actuel pour le lot R1 uniquement si sa capacité et son isolation sont
démontrées avant toute création. Le présent protocole produit l’une des conclusions suivantes :

- **admissible sous conditions** : toutes les preuves sont disponibles et tous les seuils bloquants
  sont respectés ; la préparation détaillée de R1 peut alors être proposée séparément ;
- **VPS dédié obligatoire** : une preuve manque, un seuil bloquant échoue ou l’isolation ne peut pas
  être garantie sans toucher à la production ou à la prévisualisation.

Une conclusion favorable n’autorise pas le déploiement. Elle lève seulement la condition de
capacité posée par DEC-038.

## 2. Périmètre et garde-fous

L’observation porte sur le VPS actuel et ses services déjà actifs. Elle est strictement en lecture
seule.

Sont interdits pendant la mesure :

- toute commande de création, suppression, redémarrage, arrêt, mise à jour ou nettoyage ;
- toute installation de paquet ou activation de service ;
- la lecture de `.env`, secrets, clés, jetons, mots de passe, variables d’environnement ou fichiers
  d’identifiants ;
- `docker inspect`, `docker compose config`, les journaux applicatifs et les dumps de base, car ils
  peuvent exposer des données ou des secrets ;
- tout test de charge, scan externe ou trafic synthétique sans autorisation distincte ;
- l’écriture des sorties brutes dans le dépôt.

Si une commande manque, elle est notée **indisponible** : aucun outil n’est installé pour la
remplacer. Les sorties sont conservées hors dépôt, expurgées des identifiants techniques inutiles,
et seules les mesures agrégées sont reportées dans le compte rendu.

## 3. Conditions d’exécution

Trois campagnes sont requises :

1. **repos** : services actifs, sans opération d’administration connue ;
2. **activité normale** : utilisation habituelle de production ;
3. **pointe représentative** : période réelle plus chargée, sans provoquer artificiellement de
   charge.

Chaque campagne consigne la date, le créneau, le nombre de cœurs et les éventuels incidents connus.
Les campagnes normale et de pointe durent au moins cinq minutes pour CPU, mémoire et I/O. Une seule
capture instantanée ne suffit pas à conclure.

## 4. Relevé système en lecture seule

Les commandes ci-dessous sont à exécuter depuis une session d’administration autorisée. Elles ne
doivent pas être regroupées avec des redirections vers le dépôt.

### 4.1 Identité technique et charge générale

```sh
date --iso-8601=seconds
uname -srmo
nproc
uptime
free -b
vmstat 5 60
```

`vmstat 5 60` observe cinq minutes. Conserver les colonnes CPU `us`, `sy`, `id`, `wa`, les colonnes
mémoire et les colonnes de swap `si` et `so`, sans recopier d’autre donnée non nécessaire.

Pour produire une synthèse qui ignore les en-têtes répétés par `vmstat` :

```sh
vmstat 5 60 | awk '$1 ~ /^[0-9]+$/ {n++; idle+=$15; wa+=$16; if($16>maxwa)maxwa=$16; si+=$7; so+=$8; if($1>maxr)maxr=$1} END {printf "samples=%d avg_idle=%.1f%% avg_wa=%.1f%% max_wa=%d%% swap_in=%d swap_out=%d max_run_queue=%d\n", n,idle/n,wa/n,maxwa,si,so,maxr}'
```

### 4.2 Disque, inodes et Docker

```sh
df -B1 / /var/lib/docker
df -i / /var/lib/docker
docker system df
docker stats --no-stream
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

Si `/var/lib/docker` n’est pas un point de montage distinct, la duplication de la ligne `/` est
attendue. `docker system df` est un inventaire : ne jamais enchaîner avec `prune`.

### 4.3 I/O facultatives si l’outil existe déjà

```sh
command -v iostat
iostat -xz 5 60
```

Si `iostat` est absent, la preuve I/O repose sur `vmstat` et les observations d’exploitation. Son
absence n’autorise pas l’installation de `sysstat` pendant ce protocole.

## 5. Relevé d’isolation en lecture seule

```sh
docker compose ls
docker network ls --format 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}'
docker volume ls --format 'table {{.Name}}\t{{.Driver}}'
ss -lntup
sudo ufw status verbose
```

Si `ufw` n’est pas le pare-feu actif, noter ce fait sans modifier sa configuration. La revue vérifie
uniquement les métadonnées visibles :

- absence de noms de projet, réseaux ou volumes ambigus entre production, prévisualisation et
  future recette ;
- possibilité de réserver un nom de projet R1 unique sans `container_name` global ;
- possibilité de garder Grist, PostgreSQL et Mailpit sur un réseau interne ;
- absence d’obligation de publier leurs ports natifs ;
- seuls les futurs frontend et backend auraient besoin du réseau partagé avec Traefik ;
- capacité à cibler une future remise à zéro par nom et labels de projet, sans cible générique.

La commande `ss` sert à relever les ports déjà publiés. Son résultat ne doit pas être transformé en
scan réseau ni conduire à une modification du pare-feu dans la même intervention.

## 6. Seuils de décision

Ces seuils sont des garde-fous de projet pour un premier POC R1, pas des garanties universelles de
performance. Le cas le plus défavorable des trois campagnes fait foi.

| Dimension | Condition d’admissibilité | Condition bloquante |
|---|---|---|
| CPU | charge à 1 et 5 minutes inférieure à 70 % du nombre de cœurs et au moins 30 % d’inactivité moyenne | charge durable au niveau du nombre de cœurs, moins de 20 % d’inactivité ou saturation observée |
| Mémoire | au moins 4 Gio et 30 % de mémoire disponible avant R1 | moins de 4 Gio disponibles, pression mémoire durable ou activité de swap répétée |
| Disque | au moins 20 Gio et 25 % libres sur le stockage Docker | moins de 20 Gio, moins de 20 % libres ou croissance existante non maîtrisée |
| Inodes | au moins 20 % libres | moins de 15 % libres |
| I/O | attente CPU `wa` généralement sous 10 % ; si disponible, périphérique sous 70 % d’utilisation moyenne | attente durable supérieure à 20 %, saturation ou latence déjà problématique |
| Services existants | tous les conteneurs attendus restent stables et sains pendant les trois campagnes | redémarrage, état dégradé ou incident corrélé à la charge courante |
| Isolation | noms, réseaux, volumes, ports et procédure de ciblage peuvent être distincts | collision, port interne à publier, cible de remise à zéro ambiguë ou dépendance à un secret existant |

Un seuil intermédiaire ou une mesure contradictoire produit un **No-Go conservatoire** jusqu’à une
nouvelle observation. Les ressources théoriquement récupérables par nettoyage ne comptent pas :
aucun nettoyage n’est présumé ni exécuté pour rendre le VPS admissible.

## 7. Budget réservé à R1

Avant avis favorable, le compte rendu doit montrer qu’après les usages existants le VPS peut encore
réserver, sans dépasser les seuils précédents :

- 2 cœurs logiques de marge partageable ;
- 4 Gio de mémoire disponible ;
- 20 Gio de stockage Docker disponible ;
- une marge I/O compatible avec les volumes Grist et PostgreSQL ;
- les réseaux et ports requis sans exposition de Grist, PostgreSQL ou Mailpit.

Ce budget n’est pas une allocation Docker définitive. Les limites exactes des futurs services
seront spécifiées avec le profil R1 après une conclusion favorable.

## 8. Compte rendu attendu

Le compte rendu ne contient aucune sortie brute sensible. Il reprend uniquement :

| Preuve | Repos | Activité normale | Pointe | Verdict |
|---|---:|---:|---:|---|
| Cœurs et charge 1/5/15 min | à mesurer | à mesurer | à mesurer | en attente |
| CPU inactif / attente I/O | à mesurer | à mesurer | à mesurer | en attente |
| Mémoire disponible / swap | à mesurer | à mesurer | à mesurer | en attente |
| Disque Docker libre / inodes | à mesurer | à mesurer | à mesurer | en attente |
| Conteneurs attendus sains | à vérifier | à vérifier | à vérifier | en attente |
| Noms, réseaux et volumes isolables | à vérifier une fois | sans objet | sans objet | en attente |
| Ports internes non publiés | à vérifier une fois | sans objet | sans objet | en attente |

La ligne de conclusion est signée humainement : **VPS actuel admissible sous conditions** ou
**VPS dédié obligatoire**, avec limites et date de validité. En l’absence de pointe représentative
ou de preuve d’isolation complète, la conclusion reste en attente.

## 9. Séquence après mesure

- si le VPS est admissible : proposer les noms techniques, versions épinglées, limites de
  ressources, initialiseur fictif et procédure de remise à zéro de R1 ;
- si le VPS est refusé : préparer le cahier de provisionnement d’un VPS dédié, sans le commander ;
- dans les deux cas : attendre une autorisation explicite avant connexion de mise en œuvre, DNS,
  secret, code d’exploitation, conteneur ou déploiement.
