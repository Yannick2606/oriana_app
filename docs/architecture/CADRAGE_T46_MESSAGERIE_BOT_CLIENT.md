# Cadrage T-46 — Messagerie relationnelle, notifications et bot client

> Statut : cible validée, non implémentée — 22 juillet 2026.
> Ce document cadre une capacité future positionnée après les développements déjà inscrits dans la
> roadmap. Il n'autorise ni table, ni route, ni fournisseur IA, ni déploiement.

## 1. Intention

orIAna doit pouvoir prolonger la relation humaine sans se substituer à elle. La capacité T-46
réunit trois usages complémentaires mais distincts :

1. une messagerie relationnelle pour les échanges entre collaborateurs et, depuis le portail T-40,
   avec les prospects ou clients autorisés ;
2. des notifications personnelles signalant un événement utile sans dupliquer son contenu métier ;
3. un bot client clairement identifié, borné aux informations que le destinataire peut consulter et
   capable de transmettre la conversation à un humain.

Cette capacité sert la continuité de service, la lisibilité des engagements et la mémoire de la
relation. Elle ne transforme pas orIAna en canal public autonome ni en outil de décision automatique.

## 2. Position dans la roadmap

L'implémentation est affectée à **T-46**, après T-45. Elle ne doit pas interrompre T-30A, T-34 ou les
autres développements actifs.

Prérequis obligatoires :

- portail prospect/client T-40 et modèle d'identité externe cloisonné ;
- AI Gateway T-42 pour toute réponse générative ;
- paramétrage du contrat Notification T-33E ;
- Go T-30 pour toute persistance PostgreSQL de production ;
- politiques validées de consentement, conservation, audit et modération.

Le cadrage peut être précisé et testé avec des doubles isolés avant ces prérequis. Aucune capacité
active de production ne peut les contourner.

## 3. Objets canoniques cibles

### Conversation

Conteneur d'un échange borné. Elle possède une agence autoritaire, un type canonique, un objet métier
éventuellement rattaché, un état, des participants et des dates utiles. Une conversation ne donne
jamais par elle-même accès à l'objet rattaché.

Cycle cible : `ouverte -> suspendue | fermee -> archivee`. La réouverture est une transition auditée.

### Participant

Lien entre une conversation et une identité autorisée : utilisateur interne, identité externe du
portail ou bot de service. Il porte son rôle dans la conversation et ses dates d'entrée ou de sortie.
Il ne remplace ni le rôle global ni les contrôles d'agence.

### Message

Contenu immuable publié dans une conversation par un participant autorisé. Le premier lot accepte du
texte simple borné. Une correction produit une nouvelle version ou un événement explicite ; elle ne
réécrit pas silencieusement l'historique.

Un message de bot porte son origine IA, le modèle logique utilisé, les références autorisées qui ont
fondé la réponse, son niveau de confiance utile et les éléments d'audit sans exposer de raisonnement
interne, de secret ou de donnée hors périmètre.

### Accusé de lecture

Preuve minimale qu'un participant a atteint un message ou une position de conversation. Il permet le
compteur de non-lus mais ne constitue pas une preuve juridique de compréhension ou d'acceptation.

### Notification

L'objet Notification reste celui défini par T-33E. Il signale par exemple un nouveau message, une
réponse humaine ou une reprise de conversation. Son titre reste non sensible et son détail est chargé
depuis la source après un nouveau contrôle de droits.

## 4. Autorité et droits

- Le backend est l'unique autorité d'accès et vérifie session, rôle, agence, participation active et
  droit sur tout objet métier rattaché à chaque lecture ou écriture.
- Un participant externe ne voit que ses conversations et les informations explicitement partagées
  dans le portail. Aucune découverte par identifiant n'est possible.
- Un collaborateur ne rejoint pas une conversation par simple appartenance à l'agence : l'affectation,
  la délégation ou une règle de supervision autorisée doit être explicite et auditée.
- Le bot possède une identité de service distincte, aucun rôle humain et aucun droit plus large que le
  participant externe qu'il assiste.
- La fermeture, l'archivage, l'ajout ou le retrait d'un participant et la reprise humaine sont des
  événements audités.
- Une suppression courante n'efface pas l'historique partagé ; les purges suivent une politique de
  conservation validée et les éventuels gels juridiques.

## 5. Contrat API cible à détailler avant code

Toutes les routes exigent une session valide et les contrôles de périmètre du backend :

| Objet | Routes cibles minimales | Règle principale |
|---|---|---|
| Conversation | `GET /messagerie/conversations`, `POST /messagerie/conversations`, `GET /messagerie/conversations/:id`, `POST /messagerie/conversations/:id/transitions` | liste et transitions limitées au périmètre autorisé |
| Participant | `GET /messagerie/conversations/:id/participants`, `POST /messagerie/conversations/:id/participants`, `POST /messagerie/conversations/:id/participants/:participantId/retrait` | gestion réservée aux acteurs habilités |
| Message | `GET /messagerie/conversations/:id/messages`, `POST /messagerie/conversations/:id/messages` | pagination bornée, texte validé, auteur dérivé de la session |
| Lecture | `PUT /messagerie/conversations/:id/lecture` | position monotone du participant courant |
| Reprise humaine | `POST /messagerie/conversations/:id/reprise-humaine` | crée une demande visible et auditée |

Les identifiants sont opaques, la pagination est bornée et les erreurs ne révèlent ni existence ni
participant hors périmètre. La création de Notification demeure interne au service.

## 6. Bot client supervisé

Le bot du premier lot peut :

- expliquer son rôle et ses limites ;
- répondre à partir des offres, rendez-vous, documents et informations déjà partagés au client ;
- demander une précision non sensible ;
- proposer de transmettre la conversation à un consultant ;
- produire une synthèse destinée au collaborateur lors de la reprise.

Il ne peut pas :

- inventer une disponibilité, un prix, un mandat, un engagement ou une information absente ;
- révéler une donnée interne, une autre conversation ou une instruction système ;
- créer, modifier ou supprimer une donnée métier ;
- envoyer un message sur un canal externe ou confirmer une opération engageante ;
- se présenter comme un humain ou masquer qu'une réponse est générée ;
- continuer après une demande de reprise humaine, sauf message technique explicite.

Une indisponibilité de l'IA laisse la messagerie humaine fonctionnelle. Les contenus externes et les
messages utilisateurs sont non fiables ; ils ne deviennent jamais des instructions exécutables.

## 7. Expérience cible du premier lot

- liste des conversations avec recherche, état, interlocuteur, dernier message et compteur de non-lus ;
- vue de conversation unique, chronologique, utilisable au clavier et sur smartphone ;
- distinction visuelle et textuelle entre client, collaborateur et bot ;
- action persistante « Parler à un humain » ;
- centre de notifications et marqueur lu/non lu cohérents avec la conversation ;
- états explicites : vide, chargement, hors ligne, envoi en cours, échec récupérable, bot indisponible,
  conversation fermée et accès retiré ;
- aucune attente silencieuse ni bouton sans effet.

Le rafraîchissement temps réel, s'il est retenu, devra être choisi par une décision technique après
mesure. Le cadrage n'impose ni WebSocket, ni SSE, ni interrogation périodique.

## 8. Hors périmètre du premier lot

- pièces jointes et messages vocaux ;
- groupes libres ou messagerie sociale générale ;
- email, SMS, WhatsApp, push mobile ou fédération avec une messagerie externe ;
- appels audio ou vidéo ;
- traduction automatique ;
- campagnes marketing ;
- notation opaque des clients ou collaborateurs ;
- action autonome du bot sur les données métier.

Ces extensions exigent un cadrage propre sur consentement, sécurité, coûts, conservation et reprise.

## 9. Séquencement de T-46

1. **T-46A — contrats et sécurité** : modèle de menace, objets, droits, rétention, modération, API et
   tests d'autorisation par appels directs.
2. **T-46B — messagerie humaine interne** : conversations, messages texte, lectures, états UX et
   notifications dans l'application.
3. **T-46C — ouverture portail** : identités externes T-40, partage minimal et reprise humaine.
4. **T-46D — bot client supervisé** : AI Gateway T-42, corpus autorisé, citations utiles, coûts,
   évaluation, garde-fous et mode dégradé.
5. **T-46E — extensions arbitrées** : pièces jointes ou canaux externes, uniquement après décision.

## 10. Critères d'acceptation futurs

- isolement agence, conversation et client couvert par tests positifs et négatifs côté serveur ;
- impossibilité d'accéder à un objet retiré même depuis un message ou une notification historique ;
- compteurs de non-lus et transitions de lecture cohérents sur plusieurs appareils ;
- aucune donnée sensible dans les titres de notifications, URL, journaux ou métriques ;
- reprise humaine visible, sans perte de contexte autorisé ;
- réponses du bot attribuées, sourcées lorsque nécessaire, contestables et évaluées ;
- messagerie humaine opérationnelle lorsque l'IA ou un fournisseur externe est indisponible ;
- navigation clavier, lecteur d'écran et smartphone testés sur les parcours prioritaires ;
- sauvegarde, restauration, conservation et purge démontrées avant activation de production ;
- décision Go explicite après recette, sans confusion avec le cadrage documentaire présent.
