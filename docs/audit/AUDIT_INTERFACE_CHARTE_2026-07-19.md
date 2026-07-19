# Audit de l’interface contre la charte orIAna

> Audit statique du 19 juillet 2026 — navigation et structure générale. Aucun correctif applicatif
> n’est inclus dans ce rapport. Le contrôle visuel automatisé n’a pas pu démarrer à cause de
> l’incompatibilité connue de son environnement ; les constats ci-dessous reposent sur le code et
> les tests, et les points visuels restent à confirmer par recette humaine.

Références : [charte d’interface](../ux/CHARTE_INTERFACE_ORIANA.md),
[guide UX/UI](../ux/GUIDE_UX_UI.md) et [Design System](../../DESIGN_SYSTEM.md).

## Suivi des corrections

Le premier lot de correction réalisé après cet audit couvre désormais dans le code :

- l’identité complète `orIAna` en navigation ouverte, repliée et mobile ;
- des tokens de navigation sombres identiques dans les deux thèmes ;
- un en-tête mobile fluide, sans largeur fixe réservée au logo ;
- des noms accessibles et infobulles pour les entrées de navigation repliées ;
- un tiroir mobile qui conserve sa largeur et ses libellés, indépendamment du repli desktop.

Un second lot couvre ensuite :

- le remplacement du statut backend par les états vérification, disponible ou indisponible issus
  d’un appel réel à `/health` ;
- le remplacement du faux champ de recherche desktop par un bouton sémantique ouvrant
  l’explication de disponibilité ;
- l’ajout d’un lien d’évitement « Aller au contenu » vers le contenu principal.

Un troisième lot couvre enfin :

- le focus initial, les flèches, `Début`, `Fin`, `Échap`, le clic extérieur et la restitution du
  focus pour le sélecteur de rôle ;
- le retour à la ligne des actions de `PageHeader` sur petite largeur ou avec zoom ;
- un composant `Tabs` reliant onglets et panneau, avec focus roving et navigation aux flèches.

Un quatrième lot clôt les arbitrages visuels du shell :

- le thème clair devient la présentation initiale conforme à la séparation sidebar sombre / espace
  métier clair ; une préférence `dark` explicite reste respectée et le bouton de thème est conservé ;
- l’assistant non encore disponible utilise une commande secondaire sur surface neutre au lieu du
  dégradé violet et de l’élévation réservés aux actions importantes.

Après recette humaine, le choix du thème par défaut a été **remplacé** : le thème sombre est retenu
comme présentation initiale, le thème clair restant optionnel. La sidebar devient légèrement
translucide et ses libellés sont éclaircis pour améliorer la lecture sans modifier l’identité
visuelle validée.

Lint, 49 tests frontend et build de production réussissent. La recette visuelle à 320 et 375 px
reste nécessaire avant de déclarer la navigation et la structure générale conformes. Les
corrections sont publiées sur la branche `agent/t30a-interactions`, sans fusion dans `main` ni
déploiement de l’application publique.

## Éléments déjà conformes dans le code

- Les tokens aubergine, violet et lavande sont centralisés dans Tailwind et les couleurs de thème
  dans `frontend/src/styles.css`.
- Georgia est utilisée pour les titres et Arial pour le corps.
- Le shell sépare Header, Sidebar, contenu principal et Footer ; le contenu est limité à une
  largeur lisible et s’adapte à la largeur de la sidebar.
- La navigation dépend du rôle actif et les tests couvrent les cinq rôles ; le frontend ne devient
  pas l’autorité de sécurité.
- La navigation mobile dispose d’une ouverture, d’un fond de fermeture et se referme après
  sélection d’un module.
- Les pages principales utilisent une structure cohérente : fil d’Ariane, titre, description,
  actions, états de chargement ou absence de données et panneaux latéraux d’édition.
- Les données fictives du tableau de bord ont été retirées et les utilitaires encore indisponibles
  expliquent leur état au lieu de rester silencieux.
- Les modales et tiroirs réagissent à `Échap`, prennent le focus à l’ouverture et restaurent le
  focus précédent ; la réduction des animations est prise en charge.

## Écarts prioritaires

### P1 — Identité incomplète lorsque la navigation est repliée

`Logo` masque la terminaison `na` lorsque `compact=true` et affiche visuellement `orIA`. La charte
impose l’identité complète **orIAna**, y compris en navigation repliée. Le test actuel vérifie
seulement la présence d’un libellé accessible contenant orIAna et ne détecte pas cette différence
visuelle.

**Correction attendue :** conserver le mot complet dans une composition adaptée à 80 px et ajouter
un test explicite sur le texte visible en mode replié.

### P1 — Navigation latérale claire dans le thème clair

La sidebar utilise `bg-oriana-fondAlt`. Dans le thème sombre, cette valeur est très sombre ; dans
le thème clair, elle devient lavande claire. La charte impose une navigation latérale aubergine
très sombre, distincte de l’espace métier clair.

**Correction attendue :** introduire des tokens de shell dédiés à la navigation et à ses textes,
indépendants du fond métier, puis vérifier les contrastes dans les deux thèmes.

### P1 — État backend présenté comme réel sans mesure

`AppShell` définit `backendStatus='Opérationnel'` par défaut et `App` ne lui transmet aucun état de
santé observé. Le footer affiche donc un statut affirmatif sans preuve, en contradiction avec
l’interdiction de simuler un état.

**Correction attendue :** connecter ce statut à un contrôle backend réel avec états chargement,
disponible, dégradé et indisponible, ou retirer l’indicateur jusqu’à son implémentation.

### P1 — En-tête susceptible de déborder sur smartphone

L’en-tête conserve un bloc logo fixe de 14 rem (`w-56`) en plus du menu mobile et de trois boutons
d’utilité. À la largeur minimale annoncée de 320 px, leur largeur cumulée dépasse l’espace
disponible. Aucun test ne vérifie la géométrie à 320 ou 375 px.

**Correction attendue :** utiliser une grille de shell mobile, dimensionner la zone de marque de
façon fluide et hiérarchiser les utilitaires secondaires dans un menu si nécessaire.

### P1 — Boutons de navigation sans nom en mode replié

Lorsque la sidebar est repliée, le texte des entrées est retiré sans `aria-label` ni infobulle. Les
boutons ne conservent alors que leur icône et perdent leur nom accessible.

**Correction attendue :** conserver un nom accessible permanent et une infobulle visible au
survol et au focus. Tester chaque entrée dans les deux états de la sidebar.

### P1 — Recherche globale visible mais non activable correctement au clavier

La recherche desktop est un champ `readOnly` dont seul le clic ouvre l’explication. Un utilisateur
au clavier peut atteindre le champ, mais aucune gestion d’`Entrée` ou commande sémantique ne
déclenche cette action.

**Correction attendue :** représenter l’action comme un bouton ouvrant un dialogue, ou implémenter
le comportement clavier attendu d’une vraie recherche.

## Écarts secondaires

### P2 — Cohérence du shell entre thème sombre et espace métier clair

Le thème sombre applique un fond sombre à l’ensemble du contenu, alors que la nouvelle charte
demande un espace métier blanc ou très clair. Le Design System conserve toutefois deux thèmes.
Cette divergence doit être arbitrée : thème clair par défaut avec sidebar sombre, ou adaptation
explicitement documentée de la charte pour le mode sombre.

### P2 — Actions d’en-tête non enveloppées

`PageHeader` utilise une ligne d’actions sans `flex-wrap`. Les écrans possédant plusieurs actions
peuvent dépasser sur une petite largeur ou avec un zoom important.

### P2 — Navigation repliée non adaptée au tiroir mobile

Le bouton « Replier » reste disponible dans le tiroir smartphone et partage le même état que la
sidebar desktop. Il peut réduire le tiroir mobile à 80 px et conserver cet état lors du retour sur
desktop, sans parcours mobile spécifique.

### P2 — Menu de changement de rôle incomplet au clavier

Le menu expose des rôles ARIA, mais ne gère ni fermeture avec `Échap`, ni retour du focus, ni
navigation avec les flèches, ni fermeture au clic extérieur.

### P2 — Absence de lien d’évitement

Le contenu principal possède bien l’identifiant `contenu`, mais aucun lien « Aller au contenu »
n’est proposé avant les commandes répétées du header et de la navigation.

### P2 — Onglets incomplets pour les futures fiches

Le composant `Tabs` fournit `tablist` et `tab`, mais pas les relations `id`/`aria-controls`, la
navigation aux flèches ni la gestion explicite du focus. Il doit être renforcé avant les huit vues
de la fiche Offre et les cinq vues CRM.

### P2 — Assistant indisponible visuellement traité comme action majeure

Le bouton flottant de l’assistant utilise le dégradé violet principal et une forte élévation alors
qu’il ouvre uniquement une explication de fonctionnalité future. Cette emphase concurrence les
actions métier réellement disponibles.

## Couverture de tests manquante

- identité visuelle complète en sidebar ouverte et repliée ;
- noms accessibles et infobulles de chaque entrée repliée ;
- en-tête à 320 px, 375 px, zoom 200 % et textes longs ;
- navigation clavier du changement de rôle et des onglets ;
- lien d’évitement et ordre de focus du shell ;
- statut backend fondé sur un état observé ;
- contrastes de la sidebar dédiée dans les deux thèmes.

## Ordre de correction proposé

1. corriger la structure du shell et ses tokens : sidebar sombre, marque complète, en-tête mobile ;
2. supprimer ou connecter le statut backend ;
3. rendre la navigation repliée et la recherche utilisables au clavier ;
4. ajouter lien d’évitement, comportements du sélecteur de rôle et tests responsive ;
5. renforcer `Tabs` avant de construire les fiches métier ;
6. arbitrer puis documenter le comportement exact du thème sombre.

La recette visuelle humaine desktop et smartphone reste nécessaire avant de déclarer la charte
conforme.
