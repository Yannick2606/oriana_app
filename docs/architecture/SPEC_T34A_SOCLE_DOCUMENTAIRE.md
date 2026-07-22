# Spécification T-34A — Socle documentaire

> **Statut : cible partiellement validée, lot 1 implémenté — 20 juillet 2026.** Cette annexe
> précise T-34A sans créer de schéma, de route, de fournisseur ni d’autorisation de production.
> Le choix du stockage objet reste différé.

## 1. Périmètre et dépendances

T-34A définit les métadonnées, droits, versions, empreintes, états de quarantaine, règles de
conservation et ports internes du socle documentaire. Les lots suivants restent séparés :

- T-34B : brouillons multi-appareil et conflits ;
- T-34C : téléversement résilient et reprise ;
- T-34D : antivirus, OCR, transcription et analyse asynchrones ;
- T-34E : soumission et validation humaine mobile.

Après le Go T-30, PostgreSQL porte les métadonnées et le stockage objet privé compatible S3 porte
les octets. Grist ne reçoit ni nouvelle table ni double écriture. Avant le Go T-30, seuls des
doubles de test, une base isolée et un stockage privé de préproduction peuvent être utilisés.

## 2. Catalogues métier

### Types de capture

- `signal_terrain` ;
- `article_document` ;
- `carte_visite`.

### Rattachements proposés

DEC-021 autorise le premier lot à rattacher une capture à Société, Contact, Demande ou Offre.
DEC-040 étend la cible validée à Mandat pour conserver notamment son original signé. Le
backend vérifie que la cible existe et qu’elle est visible et autorisée pour le rôle actif, l’agence
et les rattachements de l’utilisateur.

Territoire, Opportunité, Tâche et Idée éditoriale peuvent rester des intentions non résolues dans un
brouillon. Elles ne sont pas validables tant que leurs contrats, leur persistance et leurs droits ne
sont pas implémentés. Les termes génériques `client` et `opportunite` ne sont jamais traduits
silencieusement en un objet canonique.

### Formats documentaires validés

Les formats acceptés sont PDF, XLS, XLSX, JPG/JPEG, PNG, WEBP et HEIC, avec une limite de 20 Mo par
fichier. Le backend vérifie conjointement extension, type déclaré, signature détectée et taille.
Le nom fourni est conservé pour l’affichage après neutralisation ; il ne devient jamais une clé de
stockage.

Le premier parcours « mandat signé » est plus restrictif : il accepte uniquement un PDF de 20 Mo
maximum, rattaché directement au Mandat. Cette restriction métier n'élargit pas les formats du
socle et n'autorise aucune conversion silencieuse d'une image en original contractuel.

La capture vocale accepte `audio/webm` et `audio/mp4`, dans la limite de 5 minutes et 20 Mo. Le
backend contrôle le type réel, conserve l’original et produit la version de travail de façon
asynchrone. Une alternative textuelle reste disponible. La transcription exige un antivirus
terminé et une action explicite de l’utilisateur. Une recette sur les smartphones et navigateurs
ciblés reste obligatoire avant activation. Les quotas par capture, utilisateur et agence restent
bornés par DEC-019 : 10 fichiers ou 100 Mo par capture, 100 fichiers ou 2 Go par utilisateur et par
jour, puis 500 fichiers ou 10 Go par agence et par jour. Une alerte est émise à 80 %. Les seuils
sont configurés côté serveur et aucune valeur illimitée n’est appliquée par défaut.
Les unités `Mo` et `Go` sont décimales : un Mo vaut 1 000 000 octets et un Go 1 000 000 000 octets.

## 3. Métadonnées logiques

### Capture

Chaque capture porte au minimum :

- un identifiant opaque ;
- `agence_id` et auteur imposés par la session serveur ;
- le type, l’état et une provenance ;
- un commentaire borné, traité comme une donnée externe non fiable ;
- un rattachement proposé facultatif ;
- une géolocalisation absente par défaut ;
- une version de concurrence optimiste ;
- des dates serveur de création et de modification ;
- une politique de conservation et, si applicable, une échéance de purge.

### Fichier

Chaque version de fichier porte au minimum :

- ses identifiants de fichier, capture et agence ;
- sa catégorie : `original_document`, `photo_originale` ou `apercu` ;
- son nom d’affichage neutralisé, son extension et ses types MIME déclaré et détecté ;
- sa taille, son empreinte SHA-256 et son numéro de version ;
- une clé de stockage interne non exposée ;
- son état de cycle de vie et le statut de l’analyse antivirus ;
- ses dates serveur, sa politique de conservation, son échéance de purge et un éventuel gel légal.

La catégorie audio suit le profil accepté par DEC-018 et conserve le type réellement détecté.

## 4. États et droits

Les transitions suivent le contrat transverse Capture/Fichier. Toute commande protégée vérifie le
rôle actif, `agence_id`, le rattachement, la propriété et la version attendue côté serveur.

| Acteur | Brouillon privé | Capture soumise | Contenu d’une autre agence |
|---|---|---|---|
| Consultant | lecture/écriture de ses brouillons | lecture selon son périmètre | interdit |
| Master consultant | ses brouillons ; pas ceux de l’équipe | lecture de l’équipe rattachée | interdit |
| Directeur ou administrateur d’agence | ses brouillons ; pas ceux d’autrui | lecture/validation dans l’agence | interdit |
| Super administrateur | aucun accès métier implicite | métadonnées techniques non sensibles seulement | aucun accès métier implicite |

Les traitements automatisés sont des tâches backend bornées. Ils ne disposent jamais d’un accès
direct et général à PostgreSQL ou au stockage objet.

## 5. Conservation et suppression

DEC-020 fixe la matrice initiale suivante :

| Classe | Déclencheur | Durée | Sortie |
|---|---|---:|---|
| `transfert_incomplet` | dernière partie reçue | 24 heures | purge des parties et métadonnée minimale d’audit |
| `quarantaine` | verdict d’échec ou fichier non analysable | 7 jours | purge de l’objet ; verdict normalisé et empreinte selon la règle d’audit |
| `brouillon_prive` | dernière activité | 90 jours | avertissement préalable, puis purge contrôlée |
| `capture_rejetee` | rejet humain | 30 jours | purge des médias et extractions ; audit non sensible |
| `original_valide` | validation humaine | vie du parent métier | archivage ou purge selon la règle opposable du parent |
| `apercu_regenerable` | dernière consultation ou nouvelle version | 30 jours | purge, puis régénération à la demande |

Un gel juridique suspend toute purge. En production, une catégorie sans politique applicable est
refusée. Une suppression métier produit une trace d’audit non sensible et lance une purge contrôlée
des objets et versions concernés. Les sauvegardes ne doivent pas remettre en circulation un objet
déjà purgé. Les durées restent soumises à validation métier et juridique avant activation.

## 6. Ports internes et frontières

Les services métier dépendent uniquement des ports suivants :

- `captureRepository` ;
- `fileRepository` ;
- `objectStorage` ;
- `malwareScanner` ;
- `previewGenerator` ;
- `retentionExecutor`.

La composition choisit les adaptateurs. Aucun SDK, nom de compartiment, URL sensible, secret,
chemin local ou message brut de fournisseur ne traverse le domaine ni l’API publique.

## 7. Responsabilités API par lot

Les futures routes restent placées sous `/socle` conformément aux contrats transverses :

- T-34A : catalogues, politiques et contrats, sans route active ;
- T-34B : création/reprise de brouillon, lecture et modification avec version attendue ;
- T-34C : préparation, transfert, reprise, finalisation et annulation ;
- T-34D : lancement et consultation des analyses asynchrones ;
- T-34E : soumission, validation et rejet humain.

Une version obsolète produit un conflit `409`, jamais un écrasement silencieux. Les réponses
n’exposent ni clé de stockage, empreinte interne, verdict antivirus brut, chemin, URL permanente ou
identifiant de fournisseur.

## 8. Sauvegarde et restauration

La restauration est validée conjointement pour PostgreSQL et le stockage objet à un point cohérent.
La recette compare inventaire, versions, empreintes, objets orphelins, droits, quarantaines et
purges en attente. Elle confirme que le stockage restauré reste privé. Une sauvegarde de
métadonnées sans objets, ou l’inverse, ne satisfait pas T-34A.

## 9. Vérifications minimales

Les tests couvrent au minimum : formats autorisés jusqu’à 20 Mo, signature falsifiée, dépassement,
doublon d’empreinte, quarantaine, accès inter-agences, absence de privilège métier implicite du
super administrateur, concurrence de version et restauration isolée vérifiée.

Le port `malwareScanner` suit DEC-022 : l’adaptateur de preuve est ClamAV `clamd` en conteneur
isolé. Il reçoit un flux borné et retourne `sain`, `infecte`, `non_analysable`, `erreur` ou
`indisponible`. Seul `sain` permet la suite ; aucun diagnostic brut du moteur ne traverse l’API.
HEIC, WebM et MP4 restent soumis au POC, comme la capacité minimale de 3 Gio de RAM et la cible
préférée de 4 Gio. Le scanner ne peut être activé avant la recette de charge, d’indisponibilité et de
fraîcheur des signatures.

## 10. Arbitrage restant avant persistance ou activation

1. adaptateur de stockage objet, chiffrement, versionnement et procédure de restauration ;

Les options de stockage, recommandations de départ et conséquences sont préparées dans le
[support d’arbitrage T-34A](ARBITRAGES_T34A_SOCLE_DOCUMENTAIRE.md). La décision fournisseur reste
reportée à la qualification Qaegis. Les conditions antivirus de DEC-022 sont des critères de preuve
et d’activation, pas un nouvel arbitrage de fournisseur.
