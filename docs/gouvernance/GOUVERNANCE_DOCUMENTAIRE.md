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

## Cycle de modification

1. lire les documents d’autorité et l’état Git ;
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
