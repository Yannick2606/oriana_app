# Étude de l’environnement de recette inscriptible T-30A

> Étude d’architecture et d’exploitation — 20 juillet 2026.
>
> **Statut : architecture validée par DEC-038, non implémentée.** Le présent document ne crée
> aucune ressource et n’autorise aucun déploiement.

## 1. Question étudiée

La prévisualisation T-32 reste volontairement en lecture seule. T-30A doit pourtant recetter les
écritures, les erreurs, les rattachements, les courriels de réinitialisation et les traitements
asynchrones. Il faut choisir une composition représentative, réinitialisable et isolée, sans
anticiper la bascule PostgreSQL de T-30.

Le dépôt fournit déjà :

- un backend non sandbox capable d’utiliser `grist` ou `postgres` comme fournisseur métier ;
- PostgreSQL pour les sessions persistantes ;
- un connecteur SMTP injectable ;
- un connecteur n8n qui échoue explicitement lorsqu’il n’est pas configuré ;
- un profil Compose de prévisualisation distinct, dont les garanties doivent être conservées.

## 2. Critères de comparaison

1. fidélité à la source opérationnelle actuelle ;
2. absence d’accès ou d’écriture en production ;
3. réinitialisation déterministe avec données fictives ;
4. couverture des cinq rôles et des refus serveur ;
5. couverture des courriels et traitements asynchrones sans destinataire réel ;
6. effort de mise en œuvre et d’exploitation ;
7. risque de confusion avec T-30 et la future source PostgreSQL ;
8. coût et consommation de ressources proportionnés à une recette temporaire.

## 3. Persistance métier

| Option | Avantages | Limites et risques | Verdict T-30A |
|---|---|---|---|
| **Grist auto-hébergé isolé + PostgreSQL séparé pour les sessions** | Reproduit le fournisseur métier encore autoritaire ; exerce le connecteur réel ; schéma et scripts de préparation déjà connus ; remise à zéro par jeu fictif dédié | Ajoute un conteneur et un volume ; initialisation fictive idempotente à compléter ; API et document doivent avoir des identifiants propres | **Recommandée** |
| PostgreSQL isolé pour sessions et métier | Exerce la cible et les contraintes relationnelles ; sauvegarde/restauration outillées | Anticipe T-30 ; exige un chargement fictif complet et l’intégration PostgreSQL encore ignorée localement ; ne recetterait pas le chemin Grist actuel | À réserver à la répétition T-30 |
| Persistance mémoire rendue inscriptible | Très simple à remettre à zéro ; aucun service supplémentaire | Peu représentative ; contourne sessions, erreurs fournisseur, concurrence et reprise ; impose du code spécifique de recette | Écartée |
| Grist ou PostgreSQL de production avec comptes de test | Aucun nouveau service | Risque direct sur données, droits et opérations réels ; remise à zéro dangereuse | **Interdite** |

### Recommandation de persistance

Utiliser pour T-30A un **Grist de recette auto-hébergé et dédié**, accessible uniquement au backend
de recette. Le backend reste hors mode sandbox et conserve `PERSISTENCE_PROVIDER=grist`. Un
PostgreSQL séparé reste nécessaire pour les sessions applicatives, sans devenir pour autant la
source de vérité métier de cette recette.

Grist documente son exécution conteneurisée avec un volume `/persist`, une URL d’instance explicite
et un secret de session propre. L’instance de recette doit activer le sandboxing recommandé par
Grist, ne réutiliser ni volume, ni document, ni clé API, ni compte de la production. Les images sont
épinglées à une version vérifiée ; aucun tag flottant `latest` n’est retenu dans le futur profil.

Avant toute création, un initialiseur idempotent doit produire le schéma et le jeu fictif requis à
partir de sources maîtrisées. Le document Grist de production ne sert ni de modèle copié, ni de
source de données.

## 4. Messagerie de recette

| Option | Avantages | Limites et risques | Verdict T-30A |
|---|---|---|---|
| **Mailpit interne** | Capture les messages sans les expédier ; image Docker officielle ; SMTP simple ; interface de lecture et API de test | Interface à protéger ; rétention à borner ; ne prouve pas la délivrabilité Internet | **Recommandée** |
| Fournisseur SMTP avec domaine de recette | Plus proche d’un envoi réel | Coût, destinataires, délivrabilité, données sortantes et secrets supplémentaires | Option ultérieure ciblée |
| Google Workspace de production | Configuration déjà connue | Risque d’envoi à de vraies adresses et de confusion avec la production | **Interdite** |
| Aucun SMTP | Aucun service | AUTH-06 reste impossible et le comportement dégradé seul est testé | Insuffisante |

Mailpit utilise par défaut un port SMTP et une interface Web distincts. Le SMTP reste uniquement sur
le réseau interne de recette. L’interface n’est pas publiée sans contrôle d’accès ; un accès
temporaire protégé ou un tunnel administrateur est préféré. Les messages sont fictifs, leur nombre
est borné et ils sont purgés lors de la réinitialisation.

## 5. n8n et Agents IA

| Option | Avantages | Limites et risques | Verdict T-30A |
|---|---|---|---|
| Connecteur absent au premier démarrage | Valide l’état indisponible ; aucune surface supplémentaire | Ne couvre pas le cycle asynchrone réel | **Recommandé pour le lot initial** |
| **Instance n8n dédiée à la recette** | Couvre déclenchement, attente, callback, résultat et erreurs ; secrets et historique séparés | Service, volume, workflow et audit supplémentaires ; activation distincte requise | **Recommandée pour AGT-02 à AGT-05** |
| Double HTTP interne | Rapide et déterministe | Ne prouve pas le comportement réel de n8n | Utile en test automatisé seulement |
| n8n de production | Aucun nouveau service | Mélange workflows, secrets, exécutions et callbacks | **Interdite** |

n8n recommande des instances distinctes entre environnements. La future instance de recette utilise
un volume et une clé de chiffrement propres, un workflow borné aux données fictives et aucun
identifiant de fournisseur IA réel. Elle reste désactivée tant que les scénarios non IA ne sont pas
validés. Avant activation, son audit de sécurité doit contrôler notamment webhooks non protégés,
réglages manquants et nœuds risqués.

Le backend et n8n peuvent communiquer sur le réseau interne de recette. Ni l’interface n8n ni son
port natif n’ont besoin d’être publics pour la recette applicative courante.

## 6. Réinitialisation

### Option recommandée : reconstruction depuis une base fictive versionnée

1. vérifier le nom exact du projet Compose et ses labels ;
2. arrêter uniquement le projet de recette ;
3. supprimer uniquement ses volumes nommés après contrôle de leur préfixe ;
4. recréer Grist, PostgreSQL de sessions et Mailpit ;
5. appliquer les migrations applicatives nécessaires aux sessions ;
6. générer le document Grist de recette avec l’initialiseur idempotent ;
7. contrôler volumes, relations, cinq rôles et absence de données réelles ;
8. si le lot Agents est autorisé, réinstaller le workflow n8n borné puis lancer son audit ;
9. exécuter un test fumée avant ouverture aux testeurs.

Cette reconstruction est préférable à un nettoyage manuel, qui laisserait des sessions,
associations ou exécutions résiduelles. Une sauvegarde de référence peut accélérer la remise à zéro,
mais sa restauration doit être testée et ne doit contenir que des données fictives. Les techniques
de sauvegarde de volumes Docker ou de dump PostgreSQL restent des mécanismes d’exploitation, pas
une autorisation de copier la production.

## 7. Hébergement

| Option | Avantages | Limites et risques | Verdict |
|---|---|---|---|
| **VPS actuel, projet Compose séparé** | Pas de nouvel abonnement ; Traefik et exploitation déjà connus ; mise en place rapide | Isolation logique seulement ; concurrence CPU/RAM/disque ; erreur opérateur possible ; mesure de capacité obligatoire | **Recommandé pour le premier POC sous conditions** |
| VPS dédié de recette | Isolation forte, arrêt et destruction simples, aucune concurrence avec production | Coût et exploitation supplémentaires ; DNS et sauvegardes à créer | Solution de repli ou cible si capacité insuffisante |
| Poste local | Très faible coût et suppression simple | Indisponible pour recette distante stable et smartphone ; dépend du poste | Développement seulement |

Docker Compose utilise le nom de projet pour isoler les ressources d’installations distinctes. Le
futur profil doit donc porter un nom dédié, éviter les `container_name` globaux et utiliser des
volumes et réseaux propres. Seuls frontend et backend rejoignent le réseau Traefik partagé ; Grist,
PostgreSQL, Mailpit et n8n restent sur un réseau interne au projet.

Le VPS Hostinger actuel peut être retenu uniquement après mesure de CPU, mémoire, disque, I/O et
marge pendant une charge représentative. Le fait qu’il soit documenté comme suffisant pour le
démarrage applicatif ne prouve pas qu’il supporte simultanément production, prévisualisation,
Grist, Mailpit et n8n de recette. Si la marge ou l’isolation opératoire n’est pas démontrée, un VPS
distinct devient le choix recommandé avant tout déploiement.

## 8. Composition recommandée

### Lot R1 — parcours métier hors Agents IA

- frontend et backend de recette ;
- PostgreSQL privé réservé aux sessions et structures techniques requises ;
- Grist auto-hébergé isolé comme persistance métier ;
- Mailpit interne ;
- Traefik uniquement pour les deux points d’entrée applicatifs ;
- n8n absent et état `N8N_NOT_CONFIGURED` attendu.

### Lot R2 — parcours Agents IA

- ajout d’une instance n8n dédiée et d’un volume propre ;
- workflow de recette borné, sans fournisseur IA réel par défaut ;
- webhook et callback authentifiés par des secrets propres à la recette ;
- audit n8n et cas AGT-02 à AGT-05 ;
- arrêt ou suppression après la recette selon la durée validée.

Cette progression évite de bloquer les parcours métier sur n8n et limite la surface exposée.

## 9. Conditions avant implémentation

- [x] valider Grist isolé comme fournisseur métier T-30A ;
- [x] valider le VPS actuel sous réserve de capacité, avec bascule vers un VPS dédié si la preuve
  échoue ;
- [ ] définir les noms DNS de recette sans les créer ;
- [ ] spécifier l’initialiseur Grist fictif et la preuve d’absence de données réelles ;
- [ ] spécifier la procédure de réinitialisation avec garde-fous sur les cibles ;
- [ ] épingler les versions d’images après contrôle de compatibilité ;
- [ ] définir l’accès protégé à Mailpit ;
- [ ] autoriser séparément le lot n8n R2 ;
- [ ] exécuter le [protocole de capacité et d’isolation du VPS](PROTOCOLE_CAPACITE_ISOLATION_VPS_T30A.md),
  désormais spécifié mais non exécuté ;
- [ ] réaliser la revue de sécurité du futur profil R1 ;
- [ ] obtenir une autorisation explicite avant code d’exploitation, création DNS, secret ou
  déploiement.

## 10. Décision validée — DEC-038

La décision retient **R1 sur le VPS actuel sous condition d’une preuve de capacité**, avec Grist isolé,
PostgreSQL de sessions et Mailpit interne. Prévoir un VPS dédié comme repli immédiat si la mesure
échoue ou si l’isolation opérationnelle est jugée insuffisante. Reporter n8n au lot R2, autorisé
séparément après validation des parcours non IA.

Cette composition minimise le coût et le code spécifique tout en restant fidèle à la source
opérationnelle actuelle. Elle ne modifie pas DEC-004 : PostgreSQL reste la cible métier et Grist
reste autoritaire jusqu’au GO de T-30.

## 11. Sources officielles consultées

- [Grist — auto-hébergement, Docker, `/persist` et sécurité](https://support.getgrist.com/self-managed/)
- [Docker — isolation par nom de projet Compose](https://docs.docker.com/compose/how-tos/project-name/)
- [Docker — réseaux Compose et réseaux internes](https://docs.docker.com/compose/how-tos/networking/)
- [Docker — sauvegarde et restauration des volumes](https://docs.docker.com/engine/storage/volumes/)
- [Mailpit — image Docker et ports internes](https://mailpit.axllent.org/docs/install/docker/)
- [n8n — installation Docker et volume persistant](https://docs.n8n.io/hosting/installation/docker/)
- [n8n — séparation des environnements](https://docs.n8n.io/source-control-environments/create-environments/)
- [n8n — audit de sécurité](https://docs.n8n.io/hosting/securing/security-audit/)
- [PostgreSQL — sauvegarde et restauration](https://www.postgresql.org/docs/current/backup.html)
