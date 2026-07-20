# Arbitrages T-34A — Options et recommandations

> **Support de décision — non normatif — 20 juillet 2026.** Les valeurs ci-dessous sont des
> recommandations de départ. Elles ne deviennent applicables qu’après validation humaine et mise à
> jour des documents d’autorité. Aucun fournisseur n’est retenu par ce document.

## Principes de choix

Les recommandations privilégient un premier lot borné, utile sans IA, compatible avec les
capacités déjà implémentées et révisable par configuration. Elles utilisent les hypothèses
validées de 100 fichiers par jour, 3 Mo en moyenne, 10 consultants au lancement et un doublement du
volume en douze mois.

## Matrice synthétique

| Arbitrage | Recommandation de départ | Alternative prudente | Conséquence à accepter |
|---|---|---|---|
| Audio | **Acceptée — DEC-018** : `audio/webm` et `audio/mp4`, 5 minutes et 20 Mo maximum | limiter à 2 minutes | recette obligatoire sur les navigateurs mobiles ciblés avant activation |
| Quotas | **Acceptée — DEC-019** : 10 fichiers et 100 Mo par capture ; 100 fichiers ou 2 Go par utilisateur et par jour ; 500 fichiers ou 10 Go par agence et par jour | seuils divisés par deux | les limites journalières protègent l’exploitation mais ne remplacent pas un budget de stockage durable |
| Conservation | **Acceptée — DEC-020** : matrice par classe détaillée ci-dessous | durées plus courtes pour tous les objets non validés | validation métier, juridique et sauvegardes obligatoire avant production |
| Cibles initiales | **Acceptée — DEC-021** : Société, Contact, Demande et Offre | Société et Contact seulement | les termes génériques `client` et `opportunite` doivent être remplacés par des objets canoniques |
| Stockage objet | preuve de compatibilité contre le port interne, en région UE, stockage privé, chiffré et versionné | double de test uniquement jusqu’au choix contractuel | aucun fournisseur de production n’est choisi sans revue coût, localisation et restauration |
| Antivirus | **Acceptée — DEC-022** : ClamAV isolé derrière `malwareScanner` pour la preuve | offre managée substituable derrière le même port | seul `sain` libère le traitement ; POC formats, indisponibilité et capacité avant activation |

## 1. Capture vocale

> **Décision acceptée — DEC-018.** Les conditions de recette et d’activation restent obligatoires.

### Recommandation

- accepter `audio/webm` et `audio/mp4` comme conteneurs d’entrée ;
- limiter un commentaire à 5 minutes et 20 Mo ;
- détecter le type réel côté serveur et refuser toute discordance ;
- conserver l’original, puis produire de façon asynchrone une version de travail normalisée ;
- afficher une alternative textuelle lorsque l’enregistrement n’est pas disponible ;
- ne jamais lancer automatiquement une transcription avant l’antivirus et le consentement
  explicite de l’utilisateur.

### Validation requise

Une recette sur les navigateurs et smartphones réellement ciblés doit confirmer les types produits,
la reprise après interruption, la lecture accessible et la qualité utile. WAV n’est pas recommandé
dans le premier lot en raison de sa volumétrie, mais peut être évalué comme format d’import.

## 2. Quotas

> **Décision acceptée — DEC-019.** Les seuils restent configurables et révisables après mesure.

### Recommandation

| Niveau | Limite proposée | Réponse attendue |
|---|---:|---|
| Fichier | 20 Mo | `413` avant stockage durable |
| Capture | 10 fichiers ou 100 Mo | ajout refusé sans invalider les fichiers déjà finalisés |
| Utilisateur / jour | 100 fichiers ou 2 Go | `429` avec limite et prochaine échéance, sans détail sur les autres utilisateurs |
| Agence / jour | 500 fichiers ou 10 Go | `429`, alerte d’exploitation et audit non sensible |

Une alerte est émise à 80 % du seuil. Les valeurs sont configurées côté serveur, jamais fournies par
le navigateur. `Mo` et `Go` sont décimaux : un Mo vaut 1 000 000 octets et un Go
1 000 000 000 octets. Le stockage cumulé par agence doit relever ultérieurement d’un budget contractuel et
d’un tableau de capacité, car les originaux validés ont une conservation métier longue.

## 3. Conservation

> **Décision acceptée — DEC-020.** Les durées restent conditionnées à la validation métier et
> juridique avant production.

### Matrice proposée

| Classe | Déclencheur | Durée proposée | Sortie |
|---|---|---:|---|
| `transfert_incomplet` | dernière partie reçue | 24 heures | purge des parties et métadonnée minimale d’audit |
| `quarantaine` | verdict d’échec ou fichier non analysable | 7 jours | purge de l’objet ; conservation du verdict normalisé et de l’empreinte selon audit |
| `brouillon_prive` | dernière activité | 90 jours | avertissement préalable, puis purge contrôlée |
| `capture_rejetee` | rejet humain | 30 jours | purge des médias et extractions ; audit non sensible conservé |
| `original_valide` | validation humaine | vie du parent métier | archivage/purge selon la règle opposable du parent |
| `apercu_regenerable` | dernière consultation ou nouvelle version | 30 jours | purge libre, puis régénération à la demande |

Les durées proposées ne couvrent pas à elles seules les obligations légales. Le gel juridique
suspend toute purge. La politique doit aussi préciser quand les objets supprimés disparaissent des
sauvegardes et comment une restauration évite de les remettre en circulation.

## 4. Premiers rattachements

> **Décision acceptée — DEC-021.** Toute cible future reste non validable jusqu’à son implémentation
> et à la validation de ses droits.

Le dépôt implémente déjà Société, Contact, Demande et Offre avec un périmètre serveur. Il ne possède
pas encore d’objet canonique `territoire`, `opportunite`, `tache` ou `idee_editoriale` exploitable par
T-34A. La recommandation est donc :

1. activer d’abord Société, Contact, Demande et Offre ;
2. conserver les autres valeurs comme intentions non résolues dans un brouillon ;
3. interdire toute validation vers une cible absente ou hors périmètre ;
4. ajouter chaque cible future seulement après son contrat, sa persistance et ses droits.

Cette proposition doit être rapprochée du vocabulaire métier : `client` peut désigner une Société
ou un Contact, tandis que `opportunite` ne doit pas être assimilée silencieusement à une Demande ou
une Offre.

## 5. Stockage objet

L’[étude datée des solutions compatibles S3](ETUDE_STOCKAGE_OBJET_T34A_2026-07-20.md) qualifie
Qaegis comme candidat prioritaire à instruire et Scaleway Standard Multi-AZ Paris comme référence
technique et solution de repli. Le [questionnaire Qaegis](QUESTIONNAIRE_QAEGIS_STOCKAGE_T34A.md)
doit recevoir une réponse documentée avant toute décision fournisseur.

### Critères éliminatoires proposés

- compatibilité vérifiée avec le port `objectStorage`, sans SDK dans le domaine ;
- région de stockage et sous-traitance acceptées ;
- compartiments privés, chiffrement au repos et en transit ;
- versionnement, règles de cycle de vie et suppression contrôlée ;
- journaux d’accès exploitables sans secret ;
- sauvegarde ou réplication distincte et restauration testable par inventaire et empreintes ;
- coût mesurable pour stockage, requêtes, sortie et versions.

Le développement peut utiliser un double contractuel et une implémentation isolée de test. Le choix
de production exige une comparaison datée des offres et un test réel de restauration ; la seule
compatibilité S3 ne suffit pas.

## 6. Antivirus

> **Décision acceptée — DEC-022.** Le POC formats, charge et indisponibilité reste obligatoire avant
> toute activation.

### Recommandation

L’[étude antivirus datée](ETUDE_ANTIVIRUS_T34A_2026-07-20.md) recommande ClamAV `clamd` en conteneur
isolé derrière `malwareScanner` pour la preuve T-34A. Le backend transmet un flux borné et traduit la
réponse en verdict normalisé. Cette recommandation reste conditionnée au POC formats, à la mesure
des ressources et à une comparaison avec une offre managée avant la production.

Le scanner doit recevoir un flux borné, retourner un verdict normalisé et ne jamais disposer de
droits métier généraux. PDF, documents bureautiques et images sont testés séparément, notamment les
fichiers HEIC, WebM, MP4 et les archives internes des formats Office. Un format « non analysable »,
une erreur ou une indisponibilité maintient le fichier en quarantaine ; seul un verdict `sain` ouvre
le traitement suivant.

## Décisions humaines attendues

Chaque ligne doit recevoir l’un des statuts `acceptée`, `à modifier` ou `reportée`. Une validation
globale est possible uniquement si le vocabulaire des rattachements et les réserves juridiques de
conservation sont explicitement acceptés. Après validation, les décisions retenues seront reportées
dans la spécification T-34A et le registre d’architecture avant tout code.
