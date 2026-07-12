# CDC.md — Cahier des charges fonctionnel & technique orIAna

> Document de référence (version 2.0). Remplace le CDC initial. Porte la vision fonctionnelle et
> technique complète. **Le détail exécutable (schéma de données précis, endpoints) est dans
> SPEC.md, qui fait foi côté code.** Ce document ne duplique pas le schéma pour éviter toute
> divergence. En cas d'écart sur un point technique, SPEC.md prime.

## Articulation documentaire (règle anti-divergence)

| Document | Rôle | Fait foi sur |
|---|---|---|
| CDC.md (ce fichier) | Vision fonctionnelle et technique | le « pourquoi » et le « quoi » métier |
| SPEC.md | Spécification exécutable | schéma de données et endpoints |
| PLAN.md | Séquence de développement | l'ordre des tâches |
| AGENTS.md | Règles opératoires | sécurité et conventions de code |

---

## Partie A — Fonctionnel

### A.1 Vision
orIAna capte des données dispersées, les structure, active des agents d'intelligence, et
transforme la donnée en décisions puis en transactions (capter → structurer → enrichir →
accélérer → fiabiliser → transformer). Valeur par niveau : équipes (moins de répétitif, aide à
la décision), management (pilotage, traçabilité), business (réactivité, transformation).

### A.2 Rôles
- **consultant** (interne, phase 1) — ses propres données uniquement.
- **manager** (interne, phase 1) — toute l'agence.
- **admin** (interne, phase 1) — agence + gestion utilisateurs et référentiels.
- **client** (externe, ultérieur) — annonces publiques + ses demandes.

Un utilisateur peut cumuler plusieurs rôles. Lorsqu'il en possède plusieurs, il choisit son
**rôle actif** à la connexion ; les droits appliqués pendant la session sont exclusivement ceux
de ce rôle actif.

### A.3 Domaines fonctionnels
1. **Auth/session** : login email+mdp, session sécurisée, inactif = pas de connexion, reset par
   admin en phase 1.
2. **Patrimoine** : Site → Bâtiment → Cellule → Lot. Lot = 1+ cellules ou terrain nu. Juridique :
   parcelles, cadastre, divisibilité, servitudes, copropriété (tantièmes, charges), destination
   PLU, décret tertiaire, ERP/IGH.
3. **Qualification métier** : formulaire dynamique filtré par famille (logistique, activité,
   bureaux, commerce, terrain) et par niveau. Caractéristiques en table de référence (ajout sans
   modif de structure). Famille commerce : emplacement, linéaire vitrine, flux, licence, droit au
   bail, pas-de-porte, zone de chalandise.
4. **Commercialisation** : Offre met un Lot sur le marché ; vente et/ou location simultanées avec
   conditions distinctes ; fiche dépend de l'offre. Mandats + honoraires.
5. **Baux/occupation** (phase 2) : preneur, loyer, échéances, indexation → calcul de rendement.
6. **CRM** : Sociétés (SIRENE), Contacts, Demandes. Interactions + Actions en phase 2.
7. **Matching** : score demande↔lot calculé par Grist (35/30/20/15) ; l'app affiche et trie, ne
   recalcule pas.
8. **Fonds de commerce** (cible réservée) : entité distincte, actif incorporel + corporel,
   rattachable à un bail.
9. **Administration** : gestion utilisateurs et référentiels.

### A.4 Agents n8n
Toute fonction intelligente est déléguée à un agent n8n (jamais codée dans le front). 23 agents,
7 familles, orchestrés par un agent central. Phase 1 : un agent branché en démonstration ; le
contrat d'intégration est posé dès le socle.

### A.5 Règles de gestion
1. Cloisonnement par rôle appliqué côté serveur.
2. agence_id sur toute donnée métier (préparation multi-agences).
3. Validation humaine obligatoire pour tout document juridique produit par un agent.
4. Grist = source de vérité.

---

## Partie B — Technique

### B.1 Architecture
- Front : React + Vite + Tailwind.
- Backend-proxy : Node.js + Express (détient les secrets, applique les droits).
- Grist (API REST) : base, existant. n8n (webhooks) : agents, existant.

**Règle fondatrice** : clé Grist et droits ne vivent jamais dans le navigateur. Le backend-proxy
détient la clé, vérifie le rôle à chaque requête, filtre par agence_id avant tout renvoi. Aucun
secret dans le dépôt (variables d'environnement uniquement).

### B.2 Flux
Front → Backend (jeton) → Grist (clé, filtré par droits) → retour filtré. Action intelligente :
Backend → webhook n8n (asynchrone) → n8n écrit dans Grist → front lit le statut jusqu'à terminé.

### B.3 Sécurité
Secrets côté backend via env ; bcrypt (jamais de mdp en clair ni loggé) ; droits côté serveur
avec test de cloisonnement obligatoire ; HTTPS ; webhooks n8n à secret partagé ; rien de sensible
dans le dépôt.

### B.4 Phases
- Phase 1 (à coder) : auth, droits, patrimoine, qualification, offres, mandats, CRM de base,
  matching, 1 agent.
- Phase 2 (modélisé) : baux, diagnostics, documents, transactions, historique CRM, copropriété.
- Cible (réservé) : POI automatisés, fonds de commerce, portail client, inter-agences.

---

## Partie C — Charte graphique (modifiable)

Documentée ici ET techniquement modifiable via des design tokens centralisés dans
`tailwind.config`. Changer une valeur là met à jour toute l'app.

### C.1 Palette
- Fond principal `#1A0E24` · Fond alt `#0B050E`
- Aubergine (titres) `#3D1E4D` · Violet (accent) `#9C27B0`
- Lavande moyen `#CE93D8` · Lavande clair `#B39DDB` · Lavande très clair `#F3E5F5`
- **Interdits** : bleu, rouge, vert, orange. **Jamais** d'image externe pour les fonds (CSS/SVG).

### C.2 Logo & typo
- Logo « or**IA**na » : « or »/« na » blanc, « IA » dégradé lavande. Signature « FROM DATA TO
  DEALS » lettres espacées lavande.
- Titres serif (Georgia) ; corps sans-serif (Arial).

### C.3 Design tokens (à implémenter)
```js
// tailwind.config — theme.extend.colors
oriana: {
  fond:         '#1A0E24',
  fondAlt:      '#0B050E',
  aubergine:    '#3D1E4D',
  violet:       '#9C27B0',
  lavande:      '#B39DDB',
  lavandeClair: '#F3E5F5',
}
// theme.extend.fontFamily
titre: ['Georgia', 'serif']
corps: ['Arial', 'sans-serif']
```
Les composants utilisent les tokens (`bg-oriana-fond`, `text-oriana-violet`), jamais une valeur
hexadécimale en dur. Pour changer la charte : modifier uniquement ce fichier.

---

## Partie D — Complexité & risques (franc)

Risques concentrés sur : (1) les droits d'accès — tester le cloisonnement ; (2) l'auth maison —
à renforcer pour le commercial ; (3) le découplage n8n — jamais bloquant ; (4) l'EAV — lourd à
grande échelle ; (5) l'ambition solo — socle atteignable, produit vendable multi-agences au-delà
d'une personne seule.

Ordre : champ mdp Grist → backend socle + auth + droits → ressources métier → front (charte,
login, écrans) → contrat n8n → revue sécurité → phase 2.

Le vrai coût n'est pas le CRUD ni l'affichage, mais l'infrastructure invisible (auth, droits,
n8n) et la discipline de ne pas laisser le code diverger de ce document.
