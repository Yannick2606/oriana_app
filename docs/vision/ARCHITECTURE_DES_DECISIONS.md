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

## Modèle pour une nouvelle décision

Une entrée comporte : identifiant, titre, contexte, options, décision, statut, autorité, date,
conséquences, documents touchés, preuves et décision remplacée le cas échéant.
