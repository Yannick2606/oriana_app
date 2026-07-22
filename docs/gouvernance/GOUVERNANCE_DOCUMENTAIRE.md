# Gouvernance documentaire orIAna

> Règles de gestion du patrimoine — version 2.0 — 19 juillet 2026.

## Objectif

Maintenir une référence compréhensible, traçable et exploitable par les humains comme par les
futurs Experts Virtuels, sans sacrifier la lisibilité à un format machine.

## Qualification d’un changement

Tout changement significatif est classé : Vision, Méthode, Modèle, Architecture, Capacité,
Fonctionnel, Technique ou Exploitation. Il indique aussi les validations requises : stratégique,
métier, architecture et/ou technique.

| Niveau | Document d’autorité | Validation minimale |
|---|---|---|
| Vision/invariant | ADN, Constitution, Charte | stratégique |
| Méthode | BORÉAL | stratégique + métier |
| Modèle | ORMO, référentiels | métier + architecture |
| Architecture | registre des décisions | architecture |
| Capacité/exigence | CDC | métier |
| Contrat technique | SPEC | technique + architecture selon impact |
| Ordonnancement | PLAN | pilotage |
| État/preuve | STATUS, audits | responsable de la vérification |

## Sas de décision

Avant toute décision stratégique, métier, fonctionnelle, UX, architecturale ou relative à l’IA,
le décideur ou l’agent relit obligatoirement :

1. l’ADN, la Constitution et la Charte des dix principes ;
2. la Méthode BORÉAL ;
3. ORMO et les référentiels concernés ;
4. les décisions d’architecture déjà acceptées sur le sujet.

La décision est ensuite confrontée au CDC, à la SPEC, au PLAN, au STATUS et au code selon son
niveau. Une contradiction avec une fondation n’est jamais résolue silencieusement par le document
le plus récent ou le plus technique : le travail s’arrête et l’arbitrage requis est demandé.

Une opération technique ou d’exploitation qui n’introduit aucune décision structurante peut se
limiter aux autorités directement concernées, mais elle vérifie toujours l’absence de contradiction
avec les invariants et règles de sécurité. Une commande de contrôle, un test ou une exécution déjà
autorisée ne constitue pas à elle seule une nouvelle décision produit.

## Cycle de modification

1. franchir le sas de décision lorsqu’il s’applique, puis lire les autres documents d’autorité et
   l’état Git ;
2. identifier source, statut et contradictions ;
3. enregistrer ou mettre à jour la décision avant l’implémentation ;
4. modifier le document d’autorité, puis les liens dépendants ;
5. vérifier liens, termes, doublons, sécurité et cohérence cible/réel ;
6. mettre à jour PLAN et STATUS ;
7. faire relire et valider ;
8. produire un commit documentaire identifiable après autorisation.

## Règles anti-divergence

- Enrichir le document qui fait autorité ; ne pas créer un second récit concurrent.
- Lier vers le détail au lieu de recopier schémas, endpoints ou décisions.
- Qualifier chaque énoncé important : implémenté, transition, cible, à spécifier, exploratoire ou
  historique.
- Ne jamais présenter une intention ou une conversation comme une preuve d’implémentation.
- Conserver l’historique dans Git et STATUS ; ne pas maintenir de changelog parallèle sans besoin.
- Une information absente reste absente : l’inconnu est visible et soumis à arbitrage.

## Maturité patrimoniale

Le principe de mesure est validé. La formule reste à spécifier. Les dimensions candidates sont :
couverture documentaire, cohérence, traçabilité des décisions, qualité des référentiels, alignement
Vision–Architecture–Code, réutilisabilité, exploitabilité par les Experts, niveaux de validation,
dette documentaire, couverture des capacités et capitalisation des retours d’expérience.

## Revue minimale

- tous les liens Markdown locaux résolvent ;
- les termes canoniques concordent avec le Glossaire ;
- aucune contradiction non signalée entre source normative et état ;
- aucune valeur de secret ni contenu de `.env` ;
- aucun changement de code ou déploiement caché dans une tâche documentaire ;
- PLAN et STATUS reflètent le même prochain travail.
