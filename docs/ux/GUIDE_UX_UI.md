# Guide UX/UI orIAna

> Référence d’expérience — version 2.0 — 19 juillet 2026.

Le [Design System](../../DESIGN_SYSTEM.md) porte les tokens et composants implémentés. Ce guide
porte les règles d’expérience à appliquer à tous les modules. La
[charte d’interface](CHARTE_INTERFACE_ORIANA.md) précise la direction visuelle et la composition
attendue des écrans métier.

## Principes

- Montrer l’essentiel et le prochain geste utile avant le détail.
- Ne jamais présenter une fonction fictive comme disponible.
- Expliquer tout état vide, délai, échec ou interdiction et proposer une issue réaliste.
- Préserver clavier, focus visible, libellés accessibles, lecteurs d’écran et réduction des
  animations.
- Concevoir d’abord les parcours prioritaires pour bureau et smartphone.
- Une action IA affiche son état, sa source ou justification disponible, son caractère proposé et
  le contrôle humain attendu.
- Une recommandation distingue fait, interprétation et proposition.
- Les droits sont reflétés par l’interface mais décidés par le backend.

## États obligatoires

Chargement, succès, absence de données, validation, erreur récupérable, erreur bloquante,
interdiction, fonctionnement dégradé, attente d’un traitement asynchrone et fonctionnalité non
disponible. Aucun bouton visible ne reste sans effet.

## Parcours IA

1. l’utilisateur comprend ce qui sera transmis et pourquoi ;
2. le traitement est déclenché via le backend ;
3. l’interface reste utilisable et expose l’avancement ;
4. le résultat indique son statut de proposition et ses limites ;
5. l’utilisateur valide, corrige ou refuse ;
6. l’action et le retour d’expérience sont traçables selon la politique applicable.

## Identité visuelle actuelle

La palette aubergine/lavande, les thèmes clair/sombre, Georgia pour les titres et Arial/système
pour le corps restent la référence implémentée. Les interdits historiques bleu/rouge/vert/orange
sont des contraintes de marque actuelles ; une évolution exige une décision de marque et la mise à
jour coordonnée du Design System.

## Critères de recette

Les parcours prioritaires sont testés au clavier, à la souris et sur smartphone ; les messages ne
divulguent aucune donnée sensible ; les actions irréversibles demandent confirmation ; la langue
est compréhensible sans connaître l’architecture technique.
