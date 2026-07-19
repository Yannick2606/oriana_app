# Charte d’interface orIAna

> Direction UI/UX validée — 19 juillet 2026. Cette charte guide les développements frontend ;
> elle ne signifie pas que tous les écrans décrits sont déjà implémentés.

Le [Guide UX/UI](GUIDE_UX_UI.md) porte les règles d’expérience transverses et le
[Design System](../../DESIGN_SYSTEM.md) porte les tokens et composants techniques. Le présent
document fixe la direction visuelle et la composition attendue des écrans métier.

## Identité et composition générale

- La marque complète **orIAna** reste visible dans tous les contextes, y compris lorsque la
  navigation latérale est repliée. Une abréviation ou une icône seule ne remplace pas l’identité.
- La navigation latérale utilise un aubergine très sombre et constitue le repère stable de
  l’application.
- Le thème sombre est la présentation par défaut validée. L’espace métier utilise un aubergine
  profond et des surfaces légèrement plus claires afin de préserver la lecture et le travail
  prolongé ; le thème clair reste une option utilisateur.
- La sidebar demeure plus sombre que l’espace métier et légèrement translucide. Ses libellés et
  icônes conservent un contraste renforcé afin que le menu reste immédiatement lisible.
- Les cartes sont sobres, compactes et finement délimitées. Elles structurent l’information sans
  transformer chaque donnée en bloc décoratif.
- Le violet est réservé aux actions importantes, aux sélections, au focus et aux états actifs. Il
  ne doit pas concurrencer le contenu métier.
- Les titres utilisent Georgia et le corps Arial ou la police système, conformément aux tokens
  existants. La hiérarchie typographique reste discrète, lisible et cohérente.

Les images ou captures historiques ne sont pas des écrans à reproduire artificiellement. Les
anciennes fiches Alliance, LOGI PRO et CAKE O’CLOCK sont des références de contenu et
d’organisation fonctionnelle, jamais des modèles graphiques.

## Densité et hiérarchie métier

L’interface doit être dense mais intuitive : elle montre d’abord l’identité de l’objet, son état,
sa priorité et la prochaine action utile. Les informations secondaires restent accessibles sans
surcharger le premier niveau.

Une fiche métier privilégie :

1. un en-tête compact avec identité, statut et actions réellement disponibles ;
2. une navigation interne stable entre les vues de la fiche ;
3. un résumé immédiatement exploitable ;
4. des tableaux ou listes compacts pour les collections ;
5. des panneaux latéraux ou dialogues pour les modifications bornées, sans perdre le contexte.

Aucun indicateur, volume, alerte, rattachement ou résultat n’est simulé. Un écran incomplet expose
clairement ce qui est indisponible au lieu de présenter une capacité fictive.

## Responsive et accessibilité

- Les parcours prioritaires sont conçus pour desktop et smartphone, sans simple réduction de la
  version bureau.
- Sur smartphone, les informations essentielles et l’action suivante précèdent les détails ; les
  tableaux deviennent des cartes ou listes lisibles lorsque nécessaire.
- Les cibles tactiles, libellés accessibles, focus visible, ordre de tabulation et fermeture par
  `Échap` sont vérifiés.
- La navigation, les onglets et les actions restent utilisables au clavier et avec un lecteur
  d’écran.
- Chargement, succès, absence de données, erreur, interdiction et attente asynchrone sont toujours
  explicites.

## Critères de recette visuelle

- l’identité orIAna complète reste présente dans la navigation ouverte et repliée ;
- la séparation entre navigation presque noire et espace métier aubergine est immédiatement
  perceptible dans le thème par défaut ;
- le violet signale les actions ou états importants sans envahir l’écran ;
- statut, priorité et prochaine action se comprennent sans ouvrir tous les détails ;
- les fiches restent utilisables sur smartphone, au clavier et avec zoom ;
- aucune donnée ou fonction fictive n’est présentée comme réelle ;
- les composants emploient les tokens du Design System et n’introduisent pas de couleur de marque
  en dur.
