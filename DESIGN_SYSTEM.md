# Design System orIAna

Le Design System constitue la fondation visuelle commune de l'application. Il privilégie la
lisibilité, la progression guidée et des composants réutilisables sans logique métier.

## Principes

- Information avant décoration ; chaque écran indique la prochaine action utile.
- Divulgation progressive : montrer d'abord l'essentiel, détailler à la demande.
- Aucun écran vide sans explication ni action.
- Animations brèves et fonctionnelles, avec respect de `prefers-reduced-motion`.
- Sécurité et autorisations toujours décidées par le backend.

## Tokens

Les couleurs sémantiques, typographies, rayons et ombres sont définis dans
`frontend/tailwind.config.js`. Les valeurs dépendantes du thème sont centralisées dans
`frontend/src/styles.css`. Les composants ne doivent pas introduire de couleurs hexadécimales.

Deux thèmes sont disponibles via `data-theme="dark|light"`. Les titres utilisent Georgia et le
corps Arial ou la police système. L'accent violet et les lavandes sont réservés aux actions,
repères et états ; aucun bleu, rouge, vert ou orange n'est utilisé.

## Architecture

- `src/components/ui/` : composants génériques, accessibles et sans connaissance métier.
- `src/components/AppShell.jsx` : layout universel Header / Sidebar / Content / Footer.
- `src/components/Logo.jsx` : marque remplaçable sans modifier le layout.
- `src/api/` : client HTTP unique, configuré uniquement par `VITE_API_BASE_URL`, avec cookies.
- `src/hooks/useTheme.js` : changement instantané de thème.

Le layout réserve une structure stable pour un futur mode Focus : le contenu reste indépendant
de la sidebar et des widgets, qui pourront être masqués sans modifier les pages métier.

## Catalogue T13

Button, Card, Input, Textarea, Select, Checkbox, Radio, Toggle, Badge, Tooltip, Modal, Drawer,
Table, Pagination, Avatar, SearchBar, Notification, Loader, Skeleton, EmptyState, Tabs, Accordion,
Toolbar, Breadcrumb, PageHeader et HelpButton.

L'assistant IA est uniquement représenté par un bouton flottant sans connexion métier ou n8n.

## Règles d'usage

- Utiliser les tokens `oriana-*`, jamais une valeur de charte en dur dans un composant.
- Fournir un libellé accessible à chaque bouton icône.
- Préserver la navigation clavier, les états focus et les contrastes.
- Utiliser le client `api` pour tout appel ; le navigateur ne contacte jamais Grist ou n8n.
- Garder les composants métier dans les futures pages et les primitives dans `components/ui`.
