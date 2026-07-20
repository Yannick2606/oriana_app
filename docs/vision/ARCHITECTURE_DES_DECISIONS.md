# Architecture des décisions orIAna

> Registre des décisions structurantes — version 2.0 — 19 juillet 2026.

Ce registre consigne les décisions acceptées. Une décision n’est jamais réécrite pour masquer son
historique : elle est remplacée par une nouvelle entrée qui la référence. Statuts : `acceptée`,
`transition`, `à spécifier`, `remplacée`.

| ID | Décision | Statut | Source | Conséquence principale |
|---|---|---|---|---|
| DEC-001 | orIAna est une plateforme d’organisation augmentée, pas un CRM | acceptée | vision validée, 2026-07-19 | le CRM devient un module |
| DEC-002 | Vision, BORÉAL, ORMO, Plateforme et Patrimoine sont cinq couches distinctes | acceptée | SRC-HIST-2026-07-19-01 | chaque évolution est qualifiée par couche |
| DEC-003 | Le patrimoine documentaire est un actif officiel | acceptée | mission Documentation v2.0 | documentation avant ou avec le code |
| DEC-004 | PostgreSQL est la source de vérité métier cible | transition | T-27 à T-30 | Grist reste autoritaire jusqu’au Go T-30 |
| DEC-005 | Grist n’est pas un référentiel métier cible | acceptée | T-27/T-31 | usage transitoire éditorial possible, connecteur remplaçable |
| DEC-006 | Le backend est l’unique porte d’accès du frontend | implémentée | T-02 à T-04 | secrets et autorisations côté serveur |
| DEC-007 | L’architecture reste un monolithe modulaire | acceptée | T-31 | pas de microservices prématurés |
| DEC-008 | n8n orchestre les traitements asynchrones | implémentée | T-12/T-20 | aucun appel IA bloquant depuis le frontend |
| DEC-009 | Une AI Gateway abstrait fournisseurs et modèles | cible validée | T-42 | routage, coût, confidentialité et secours centralisés |
| DEC-010 | L’Organisation Virtuelle comprend Experts Virtuels, Chief Agent et agents spécialisés | à spécifier | SRC-HIST-2026-07-19-01 | contrats et responsabilités avant code |
| DEC-011 | L’IA ne modifie ni patrimoine ni production sans gouvernance humaine | acceptée | Constitution | propositions séparées des validations |
| DEC-012 | Cinq rôles hiérarchiques structurent les droits actuels | implémentée | T-22A à T-22C | autorisations serveur testées |
| DEC-013 | Les connecteurs externes sont interchangeables | acceptée | T-31/T-42 | contrats internes stables |
| DEC-014 | La traçabilité est bidirectionnelle de la Vision au code | acceptée | SRC-HIST-2026-07-19-01 | référentiels et IDs de décision |
| DEC-015 | Un Expert de veille et d’évolution continue consolide les signaux sans agir seul | cible validée | SRC-HIST-2026-07-19-01 | propositions structurées, arbitrage humain |
| DEC-016 | La maturité patrimoniale doit être mesurée | à spécifier | SRC-HIST-2026-07-19-01 | nom, formule et seuils restent ouverts |
| DEC-017 | Les documents sont stockés hors du serveur applicatif dans un stockage objet privé | cible validée | architecture documentaire, 2026-07-19 | PostgreSQL conserve métadonnées et droits ; fournisseurs remplaçables |
| DEC-018 | La capture vocale accepte WebM et MP4, dans la limite de 5 minutes et 20 Mo | acceptée | arbitrage T-34A, 2026-07-20 | recette mobile, antivirus et action explicite avant transcription |
| DEC-019 | Les quotas initiaux de capture sont bornés et configurables côté serveur | acceptée | arbitrage T-34A, 2026-07-20 | plafonds par fichier, capture, utilisateur et agence ; alerte à 80 % |
| DEC-020 | La conservation documentaire suit une matrice par classe et un gel juridique prioritaire | acceptée | arbitrage T-34A, 2026-07-20 | purge contrôlée et non-réintroduction après restauration |
| DEC-021 | Les premiers rattachements de Capture sont Société, Contact, Demande et Offre | acceptée | arbitrage T-34A, 2026-07-20 | les cibles futures restent des intentions non validables |
| DEC-022 | La preuve antivirus utilise ClamAV isolé derrière `malwareScanner` | acceptée | arbitrage T-34A, 2026-07-20 | seul `sain` libère le traitement ; POC formats et capacité avant activation |
| DEC-023 | La version d’un brouillon Capture commence à `1` et augmente de `1` par mutation réussie | acceptée | arbitrage T-34B, 2026-07-20 | contrôle de concurrence simple, atomique et testable |
| DEC-024 | La version attendue d’un brouillon est transmise dans le JSON du `PATCH` | acceptée | arbitrage T-34B, 2026-07-20 | contrat explicite et cohérent avec le port métier |
| DEC-025 | Un conflit de brouillon visible renvoie la version serveur et ses champs modifiables sûrs | acceptée | arbitrage T-34B, 2026-07-20 | résolution compréhensible sans fuite hors périmètre |
| DEC-026 | Un conflit de brouillon se résout sans forçage global ni fusion automatique | acceptée | arbitrage T-34B, 2026-07-20 | choix humain explicite entre rechargement et réapplication |
| DEC-027 | Le travail local en conflit peut être enregistré comme nouveau brouillon privé | acceptée | arbitrage T-34B, 2026-07-20 | nouvel identifiant et version `1`, sans copie implicite de fichiers |
| DEC-028 | La création d’un brouillon est idempotente pendant 24 heures | acceptée | arbitrage T-34B, 2026-07-20 | une clé aléatoire est bornée à l’utilisateur et à l’agence |
| DEC-029 | Les brouillons privés sont listés par auteur avec un curseur borné | acceptée | arbitrage T-34B, 2026-07-20 | tri récent, 20 résultats par défaut et 50 maximum |
| DEC-030 | Un brouillon expose trois champs modifiables bornés | acceptée | arbitrage T-34B, 2026-07-20 | type, commentaire de 2 000 caractères et rattachement proposé |
| DEC-031 | Le premier lot de brouillons reste strictement en ligne | acceptée | arbitrage T-34B, 2026-07-20 | aucune donnée métier persistée dans le navigateur avant modèle de menace |
| DEC-032 | La géolocalisation est absente du premier contrat de brouillon | acceptée | arbitrage T-34B, 2026-07-20 | ajout ultérieur soumis à consentement, finalité et rétention explicites |
| DEC-033 | Le rattachement proposé utilise quatre références exclusives | cible validée | arbitrage persistance T-34B, 2026-07-20 | intégrité référentielle et détachement sans suppression de la Capture |
| DEC-034 | L’idempotence utilise un registre séparé expirant après 24 heures | cible validée | arbitrage persistance T-34B, 2026-07-20 | empreintes seulement, purge indépendante des Captures |
| DEC-035 | La pagination utilise un curseur chiffré et authentifié valable 15 minutes | cible validée | arbitrage persistance T-34B, 2026-07-20 | position et périmètre non lisibles, droits revérifiés à chaque page |
| DEC-036 | La modification d’un brouillon utilise une transaction et un verrou de ligne | cible validée | arbitrage persistance T-34B, 2026-07-20 | mutation unique ou conflit cohérent issu du même état autorisé |

Les identifiants `SRC-HIST-*` sont décrits dans
[l’audit stratégique](../audit/AUDIT_STRATEGIQUE_PATRIMOINE_ORIANA.md).

## Fiches de décision

### DEC-004 — PostgreSQL et transition Grist

**Contexte.** T-27 à T-29 ont créé, sauvegardé, restauré et alimenté PostgreSQL. La production n’a
pas été basculée. **Décision.** PostgreSQL est la cible normative ; Grist demeure la source
opérationnelle tant que T-30 n’a pas reçu un Go humain. **Interdits.** Annoncer la bascule comme
faite, activer une double écriture durable ou retirer le retour arrière sans nouvelle décision.

### DEC-010 — Organisation Virtuelle

**Contexte.** L’historique conserve au moins 23 agents/Experts et plusieurs familles de veille,
métier, documentation et gouvernance. **Décision.** Préserver ce patrimoine sans imposer 23
workflows séparés. Le Chief Agent orchestre ; les Experts analysent un domaine ; les agents
techniques exécutent des tâches bornées. **Ouvert.** Inventaire canonique, contrats d’entrée/sortie,
mémoire, escalade, droits, coût et niveaux de service.

### DEC-015 — Expert de veille et d’évolution continue

Il surveille les évolutions technologiques, IA, cybersécurité, réglementaires, métier, concurrence,
coûts, usages, difficultés UX et incohérences documentaires. Il produit une proposition sourcée :
signal, confiance, impact, populations concernées, alignement, bénéfices, risques, coûts, documents
et composants touchés, arbitrages et priorité proposée. Il ne modifie rien automatiquement.

### DEC-017 — Stockage documentaire privé et découplé

**Contexte.** Les parcours mobiles doivent supporter des fichiers durables, des interruptions de
réseau et des analyses asynchrones sans saturer le serveur applicatif. **Décision.** Les originaux
et versions optimisées sont conservés dans un stockage objet privé compatible S3 ; PostgreSQL
porte métadonnées, droits, versions, états et audit. Le frontend passe toujours par le backend.
**Ouvert.** Fournisseur, contrats d’envoi résilient, chiffrement, restauration et observabilité
restent à spécifier avant persistance ou activation. Les quotas et la conservation initiale sont
fixés par DEC-019 et DEC-020 ; l’adaptateur antivirus de preuve est fixé par DEC-022.

### DEC-018 — Profil de capture vocale

**Contexte.** T-34 exige un commentaire vocal, mais aucun format ni plafond n’était défini.
**Décision.** Le premier lot accepte les conteneurs `audio/webm` et `audio/mp4`, dans la limite de
5 minutes et 20 Mo par fichier. `Mo` est ici décimal et vaut 1 000 000 octets. Le backend contrôle
le type réel, conserve l’original et produit
la version de travail de façon asynchrone. Une alternative textuelle reste disponible.
**Conditions.** Une recette sur les smartphones et navigateurs ciblés doit confirmer les formats
réellement produits. Aucune transcription ne précède l’antivirus et une action explicite de
l’utilisateur. L’activation de production reste soumise à toutes les conditions T-34 et au Go T-30.

### DEC-019 — Quotas initiaux de capture

**Contexte.** La limite de 20 Mo par fichier était validée, mais aucun plafond agrégé ne protégeait
encore la capacité et les coûts. **Décision.** Une capture accepte au maximum 10 fichiers ou 100 Mo.
Un utilisateur accepte au maximum 100 fichiers ou 2 Go par jour ; une agence, 500 fichiers ou
10 Go par jour. `Mo` et `Go` sont décimaux : un Mo vaut 1 000 000 octets et un Go
1 000 000 000 octets. Une alerte d’exploitation est émise à 80 %.
**Application.** Les seuils sont configurés côté serveur. Un fichier trop volumineux reçoit `413` ;
un quota journalier dépassé reçoit `429`, sans exposer l’activité d’un autre utilisateur. Ces
plafonds sont révisables après mesure réelle et ne remplacent pas le futur budget de stockage
durable par agence.

### DEC-020 — Conservation documentaire par classe

**Contexte.** Les objets temporaires, rejetés, validés et régénérables n’ont pas la même finalité.
**Décision.** Un transfert incomplet est conservé 24 heures, une quarantaine 7 jours, un brouillon
privé 90 jours après sa dernière activité, une capture rejetée 30 jours et un aperçu régénérable
30 jours. Un original validé suit la durée de vie de son parent métier.
**Garanties.** Un gel juridique suspend toute purge. La suppression conserve seulement la preuve
d’audit non sensible prévue. La politique de sauvegarde doit empêcher qu’une restauration remette
en circulation un objet déjà purgé.
**Condition.** Ces durées techniques ne deviennent opposables en production qu’après validation
métier et juridique et vérification de la restauration.

### DEC-021 — Rattachements initiaux de Capture

**Contexte.** Les termes `client`, `opportunite`, `territoire`, `tache` et `idee_editoriale` ne
correspondent pas tous à des objets canoniques actuellement implémentés. **Décision.** Le premier
lot autorise les rattachements vers Société, Contact, Demande et Offre, sous réserve du contrôle
serveur du rôle actif, de l’agence, du rattachement et de la visibilité de la cible.
**Report.** Territoire, Opportunité, Tâche et Idée éditoriale peuvent rester des intentions dans un
brouillon, mais aucune validation ne crée ou ne rattache silencieusement un objet absent. Chaque
nouvelle cible exige d’abord son contrat, sa persistance et ses droits.

### DEC-022 — Antivirus isolé derrière un port remplaçable

**Contexte.** T-34 exige un contrôle antivirus avant toute exposition, OCR, transcription ou
analyse, sans lier le domaine à un fournisseur. **Décision.** La preuve T-34A utilise ClamAV
`clamd` dans un conteneur isolé derrière le port interne `malwareScanner`. Le backend transmet un
flux borné et traduit la réponse en `sain`, `infecte`, `non_analysable`, `erreur` ou `indisponible`.
Seul `sain` autorise l’étape suivante ; tout autre résultat maintient le fichier en quarantaine.
**Sécurité.** Le scanner n’est jamais exposé publiquement, ne reçoit aucun droit métier général et
ses diagnostics bruts ne traversent pas l’API publique. L’antivirus ne remplace ni le contrôle du
type réel, ni l’isolation des parseurs, ni la validation humaine.
**Conditions.** Avant toute activation, le POC doit couvrir chaque format autorisé, notamment HEIC,
WebM et MP4, les erreurs et l’indisponibilité, la fraîcheur des signatures et la charge. La capacité
doit réserver au moins 3 Gio de RAM, 4 Gio de préférence selon l’éditeur, en plus des autres
services. Une comparaison avec une offre managée reste requise avant la production.

### DEC-023 — Version séquentielle des brouillons Capture

**Contexte.** T-34B exige la reprise multi-appareil et interdit tout écrasement silencieux. Une
version stable est nécessaire pour comparer la commande reçue à l’état courant du brouillon.
**Décision.** Un brouillon Capture est créé avec la version entière `1`. Chaque mutation réussie
incrémente atomiquement cette version de `1`. Une commande refusée, invalide ou en conflit ne la
modifie pas. La version appartient à une Capture et ne constitue ni une horloge globale, ni une
preuve d’ordre entre plusieurs objets.
**Suite.** DEC-024 fixe le transport de la version attendue, DEC-025 la charge utile sûre du
conflit et DEC-026 les actions de résolution humaine.

### DEC-024 — Version attendue dans la commande JSON

**Contexte.** Le backend doit recevoir la version sur laquelle l’utilisateur a commencé sa
modification afin de détecter une écriture concurrente. Le contrat peut employer `If-Match` ou une
propriété métier explicite. **Décision.** Chaque `PATCH` de brouillon transmet obligatoirement
`version_attendue` dans son corps JSON. Le backend valide un entier positif et le transmet au port
`updateWithExpectedVersion`. L’absence ou l’invalidité de cette propriété refuse la commande avant
toute mutation. **Suite.** DEC-025 fixe la charge utile sûre du conflit. Les actions de résolution
restent ouvertes.

### DEC-025 — Réponse sûre au conflit de brouillon

**Contexte.** Pour résoudre un conflit sans écrasement silencieux, l’utilisateur doit comprendre
l’état courant du serveur. Une réponse trop pauvre ne permet pas la comparaison ; une réponse trop
large peut révéler des données ou métadonnées techniques. **Décision.** Après contrôle complet de
la session, du rôle actif, de l’agence, de l’auteur et de l’état privé, une version obsolète renvoie
`409` avec le code stable `CAPTURE_VERSION_CONFLICT`, la version serveur et uniquement les champs
du brouillon autorisés en modification. Un objet absent ou non visible ne divulgue aucune version
ni valeur courante. **Suite.** DEC-026 fixe les actions de résolution et interdit la fusion
automatique comme l’écrasement forcé.

### DEC-026 — Résolution humaine sans écrasement forcé

**Contexte.** La résolution d’un conflit doit préserver le travail sans masquer quelle version fait
autorité. Un écrasement global ou une fusion automatique pourrait perdre ou combiner des données
sans compréhension suffisante. **Décision.** L’utilisateur choisit soit d’abandonner ses changements
locaux et de charger la version serveur, soit de réappliquer manuellement des champs choisis sur
cette version avant une nouvelle commande portant sa version courante. Aucun bouton de forçage
global et aucune fusion automatique ne sont autorisés. **Exigence UX.** Les deux versions sont
distinguées clairement et le choix reste utilisable au clavier comme au toucher. La duplication en
nouveau brouillon est fixée par DEC-027.

### DEC-027 — Sauvegarde du conflit dans un nouveau brouillon

**Contexte.** L’utilisateur peut préférer préserver ses valeurs locales plutôt que les réappliquer
immédiatement sur la version serveur. **Décision.** L’action explicite « Enregistrer comme nouveau
brouillon » appelle le contrat normal de création avec les seuls champs modifiables choisis. Le
backend impose un nouvel identifiant, l’auteur, l’agence, l’état `brouillon_prive`, la version `1`
et les dates serveur. Aucun fichier, état technique, géolocalisation ou rattachement non autorisé
n’est copié implicitement. **Sécurité.** L’accès au brouillon en conflit est revérifié avant de
présenter l’action. DEC-028 fixe l’idempotence afin qu’une réponse réseau perdue ne produise pas
plusieurs copies.

### DEC-028 — Création idempotente des brouillons

**Contexte.** Une réponse réseau perdue peut conduire le navigateur à répéter une création et à
produire plusieurs brouillons identiques. **Décision.** Chaque création porte une clé d’idempotence
aléatoire générée par l’application, bornée à l’utilisateur et à son agence pendant 24 heures. La
même clé avec les mêmes données retourne le brouillon déjà créé sans nouvelle mutation. La même clé
avec des données différentes est refusée par un conflit stable. Passé le délai, la clé technique
peut être purgée selon une tâche contrôlée. **Sécurité.** La clé n’accorde aucun droit, ne remplace
pas la session et ne permet jamais de retrouver le brouillon d’un autre périmètre.

### DEC-029 — Liste bornée des brouillons de l’auteur

**Contexte.** La reprise sur un autre appareil exige une liste serveur sans élargir la visibilité
aux brouillons privés de l’équipe ou de l’agence. Une pagination par position serait instable quand
les brouillons sont modifiés simultanément. **Décision.** Le port `captureRepository` est étendu par
`listByAuthor`. Il reçoit l’auteur et l’agence imposés par la session, un curseur opaque et une
limite. Il restitue uniquement les Captures `brouillon_prive` de cet auteur, triées par date de
modification décroissante avec un départage stable par identifiant. La limite vaut 20 par défaut et
50 au maximum. **Sécurité.** Aucun rôle hiérarchique ne peut élargir cette liste ; le super
administrateur ne reçoit aucun accès métier implicite. Le curseur ne contient aucune donnée métier
lisible ni autorisation réutilisable.

### DEC-030 — Champs modifiables d’un brouillon

**Contexte.** Le premier lot doit permettre de corriger les métadonnées utiles d’une capture sans
ouvrir la modification des attributs d’autorité, des pièces jointes ou de données sensibles.
**Décision.** Une création exige `type`. Une modification partielle accepte uniquement :

- `type`, facultatif dans la commande et issu du catalogue `CAPTURE_TYPES` lorsqu’il est présent ;
- `commentaire`, facultatif et limité à 2 000 caractères ;
- `rattachement_propose`, facultatif, composé d’un type et d’un identifiant fournis ensemble,
  validés côté serveur et désignant un objet visible par l’auteur.

L’auteur, l’agence, l’état, la version, les dates, les fichiers et la géolocalisation ne sont pas
modifiables par ce contrat. Tout champ inconnu est rejeté plutôt qu’ignoré.

### DEC-031 — Premier lot strictement en ligne

**Contexte.** Le stockage local de brouillons, contacts ou médias créerait une nouvelle surface de
risque sur les terminaux perdus, partagés ou révoqués. Aucun modèle de menace validé ne définit
encore leur chiffrement, leur rétention et leur effacement.
**Décision.** Le premier lot T-34B assure uniquement la reprise en ligne depuis l’autorité serveur.
Il ne persiste aucune donnée métier dans IndexedDB, `localStorage`, `sessionStorage` ou le cache du
navigateur. Un éventuel service worker ne peut mettre en cache que le shell applicatif non sensible.
Le véritable fonctionnement déconnecté est reporté à un lot distinct, après validation d’un modèle
de menace couvrant notamment perte du terminal, révocation, durée de conservation, purge et quotas.

### DEC-032 — Géolocalisation absente du premier contrat

**Contexte.** Un champ nullable ou désactivé intégrerait déjà la géolocalisation au modèle initial
sans finalité, consentement ni durée de conservation validés.
**Décision.** Le premier contrat de création, lecture, liste et modification des brouillons ne
contient aucun champ de géolocalisation. Aucun adaptateur ne collecte, ne déduit, ne transmet ou ne
persiste une position dans ce lot. Une évolution ultérieure exigera une décision distincte précisant
au minimum la finalité, le consentement explicite, la précision nécessaire, la durée de conservation,
les droits d’effacement et les contrôles d’accès.

### DEC-033 — Rattachement relationnel exclusif des brouillons

**Contexte.** Le contrat de domaine expose un rattachement proposé facultatif sous la forme
`{ type, id }`, vers Société, Contact, Demande ou Offre. Un couple générique en base faciliterait
l’ajout de nouvelles cibles, mais ne garantirait pas nativement leur existence.
**Décision.** La future persistance PostgreSQL représente ces quatre cibles par quatre références
facultatives protégées par des clés étrangères. Une contrainte relationnelle impose qu’aucune ou une
seule référence soit renseignée. L’adaptateur Capture traduit cette représentation physique vers le
contrat de domaine unique et refuse toute combinaison invalide.
**Suppression.** La suppression autorisée d’une cible détache le rattachement proposé ; elle ne
supprime ni la Capture ni son brouillon. L’opération reste soumise aux droits et règles propres à la
cible. **Statut.** Cible validée, non implémentée. Cette décision n’autorise ni migration, ni
adaptateur, ni activation et ne change pas le blocage T-30.

### DEC-034 — Registre d’idempotence séparé et temporaire

**Contexte.** DEC-028 borne l’idempotence d’une création à l’auteur et à l’agence pendant 24 heures.
Placer la clé sur Capture mélangerait une donnée technique temporaire au brouillon durable et
compliquerait sa purge.
**Décision.** La future persistance utilise un registre technique distinct. Il conserve uniquement
une empreinte cryptographique de la clé, l’auteur, l’agence, une empreinte déterministe de la
commande canonique, la Capture créée et l’expiration. L’unicité porte sur l’agence, l’auteur et
l’empreinte de clé. La clé brute n’est ni persistée ni journalisée.
**Comportement.** Avant expiration, même clé et même commande retournent la Capture initiale ; une
commande différente est refusée sans mutation. Après 24 heures, l’entrée n’est plus reconnue et
peut être remplacée ou purgée par une tâche contrôlée, sans supprimer la Capture. Toute opération
revérifie la session et les droits ; le registre n’est jamais une autorisation.
**Statut.** Cible validée, non implémentée. Cette décision n’autorise ni table, ni migration, ni
tâche planifiée, ni adaptateur et ne change pas le blocage T-30.

### DEC-035 — Curseur de pagination chiffré, authentifié et temporaire

**Contexte.** DEC-029 impose un curseur opaque et une pagination stable par date de modification
puis identifiant. Un curseur signé mais lisible exposerait sa position et son périmètre ; un état
stocké côté serveur ajouterait une nouvelle persistance temporaire.
**Décision.** Le futur codec serveur produit un jeton chiffré et authentifié contenant uniquement la
version du format, la position `date_mise_a_jour` et `id`, l’auteur, l’agence, les filtres de la
requête et une expiration fixée à 15 minutes. Le matériel cryptographique reste uniquement dans
l’environnement et sa rotation doit être prévue sans inscrire de valeur dans le dépôt.
**Sécurité.** Le curseur ne constitue jamais une autorisation. Chaque page revérifie la session, le
rôle actif, l’agence, l’auteur et l’état privé. Un jeton altéré, expiré ou lié à un autre périmètre
est refusé sans révéler son contenu. La limite reste contrôlée indépendamment selon DEC-029.
**Statut.** Cible validée, non implémentée. Cette décision n’autorise ni secret, ni codec, ni route,
ni migration et ne change pas le blocage T-30.

### DEC-036 — Conflit atomique dans une transaction courte

**Contexte.** Une mise à jour conditionnelle suivie d’une lecture distincte détecte une version
obsolète, mais un autre écrivain peut modifier encore le brouillon avant la construction de la
réponse `409`. La charge de conflit ne représenterait alors pas nécessairement le même état.
**Décision.** Le futur adaptateur Capture ouvre une transaction courte, recherche le brouillon dans
le périmètre identifiant, auteur, agence et état privé, puis verrouille cette ligne. Il compare
`version_attendue` à l’état verrouillé. Une version courante autorise une seule mutation et un seul
incrément ; une version obsolète ne mute rien et produit les champs sûrs de DEC-025 depuis ce même
état. Toute erreur annule la transaction.
**Sécurité.** Un brouillon absent ou non visible ne révèle aucune version ni valeur. Le verrou reste
limité à la ligne autorisée et à la durée de la transaction. Il n’autorise ni nouvelle tentative
automatique, ni fusion, ni forçage et ne remplace aucun contrôle serveur.
**Statut.** Cible validée, non implémentée. Cette décision n’autorise ni migration, ni adaptateur,
ni route et ne change pas le blocage T-30.

## Modèle pour une nouvelle décision

Une entrée comporte : identifiant, titre, contexte, options, décision, statut, autorité, date,
conséquences, documents touchés, preuves et décision remplacée le cas échéant.
