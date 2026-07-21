# Audit de couverture automatisée T-30A

> État observé le 20 juillet 2026 sur le commit
> `5dcded28e14e639050d2a85750b3c1378a474715` et le lot local non commité.
>
> **Portée : preuve de non-régression seulement.** Cet audit ne remplace pas la recette humaine
> définie dans la [matrice T-30A](MATRICE_RECETTE_T30A.md) et n’autorise ni R1, ni T-30.

## 1. Résultat global

| Zone | Vérification | Résultat |
|---|---|---:|
| Frontend | ESLint | Réussi |
| Frontend | Vitest | 57 / 57 réussis, 11 fichiers |
| Frontend | Build Vite de production | Réussi |
| Backend | Frontières architecturales | Réussi |
| Backend | ESLint | Réussi |
| Backend | Tests Node | 161 / 162 réussis ; 1 intégration PostgreSQL ignorée comme prévu |

Le premier lancement global du backend a dépassé la fenêtre d’exécution de deux minutes sans
échec fonctionnel observé. Il a été rejoué avec une fenêtre adaptée : résultat final vert en
environ 56 secondes.

## 2. Couverture par famille de scénarios

| Famille | Preuves automatisées principales | Couverture acquise | Limite humaine restante |
|---|---|---|---|
| Authentification | `frontend/src/auth/Session.test.jsx`, `ResetPasswordPage.test.jsx`, tests backend d’authentification et de session | session, multirôle, mot de passe initial, oubli, refus, déconnexion et absence de fuite du hash | cinq comptes réels de recette, navigateurs et appareils ciblés |
| Shell et thème | `frontend/src/App.test.jsx`, `frontend/src/components/ui/index.test.jsx`, `frontend/public/theme-init.js` | sombre avant React par défaut, préférence non sensible conservée, navigation repliée/mobile, clavier, utilitaires explicites, API health | zoom 200 %, gestes tactiles et contrôle visuel multi-viewport |
| Patrimoine et qualification | `frontend/src/patrimoine/PatrimoinePage.test.jsx`, `QualificationPanel.test.jsx`, tests backend Patrimoine/Qualification | hiérarchie, création, modification, droits serveur ; commandes d’écriture absentes et qualification désactivée en prévisualisation | parcours complet smartphone et écritures contre R1 |
| Offres | `frontend/src/offres/OffresPage.test.jsx`, tests backend Offres/Mandats | vues, conditions vente/location séparées, montants exacts, périmètres et refus d’écriture du bac à sable | huit vues au clavier/tactile et erreurs réelles contre R1 |
| CRM et Matching | `frontend/src/crm/CrmPage.test.jsx`, tests backend CRM/Matching | vue progressive, données fictives consultables, écritures masquées, rattachements et cloisonnements serveur | contexte/retour sur appareils réels et écritures contre R1 |
| Agents IA | `frontend/src/agents/AgentsPage.test.jsx`, `frontend/src/App.test.jsx`, tests backend Agents/n8n | traitement asynchrone hors bac à sable ; indisponibilité explicite sans appel ni simulation dans la prévisualisation ; callbacks protégés | n8n isolé R2, attente réelle, panne et faux callback en recette |
| Auto-formation | `frontend/src/formation/FormationExperience.test.jsx`, tests backend Formation | progression par rôle et mode prévisualisation sans enregistrement | cinq rôles et reprise réelle sur appareils ciblés |
| Administration | `frontend/src/administration/AdministrationPage.test.jsx`, `frontend/src/App.test.jsx`, tests backend Utilisateurs/Autorisations | recherche, filtres, rattachement, compte protégé et politiques serveur ; gestion masquée en prévisualisation | cinq rôles par appels directs et mutations contre R1 |

## 3. Fermeture des écarts locaux certains

L’audit a trouvé trois surfaces qui s’appuyaient uniquement sur le refus serveur du bac à sable et
présentaient encore des commandes d’écriture trompeuses :

1. Patrimoine permettait d’ouvrir les formulaires de création, modification et qualification ;
2. Administration affichait les commandes de gestion des habilitations ;
3. Agents IA chargeait les demandes et proposait un déclenchement sans connecteur de recette.

Le lot local introduit un mode `readOnly` explicite pour ces trois modules, câblé depuis `App.jsx`.
Les données restent consultables, les commandes d’écriture disparaissent, les champs de
qualification sont désactivés et Agents IA n’appelle aucun connecteur dans la prévisualisation.
Cette défense ergonomique complète le refus serveur `SANDBOX_READ_ONLY` ; elle ne le remplace pas.

Le thème est initialisé avant le montage React par `frontend/public/theme-init.js`. La seule valeur
conservée dans `localStorage` est la préférence non sensible `oriana-theme`, conformément à la
limite d’architecture qui interdit d’y stocker des données sensibles.

## 4. Écarts que l’automatisation ne ferme pas

T-30A reste active et non validée, car les preuves suivantes exigent encore une exécution humaine :

- matrice complète avec les cinq rôles, clavier, souris et smartphone tactile ;
- contrôle visuel à 320 px, 375 px et zoom 200 % ;
- créations, modifications, rattachements et erreurs contre R1 isolé et réinitialisable ;
- Agents IA et callbacks contre un n8n R2 isolé, après autorisation distincte ;
- refus directs sur le commit et l’environnement effectivement recettés ;
- campagne de capacité VPS en activité normale et en pointe représentative ;
- décision humaine explicite `GO T-30A`.

## 5. Conclusion

La couverture automatisée locale est cohérente et verte. Les écarts certains de lecture seule ont
été corrigés sans modifier le backend, la persistance, un secret ou l’infrastructure. Le statut de
T-30A ne change pas : la préparation de R1 reste soumise à la preuve de capacité et à une
autorisation explicite ; T-30 reste bloquée.
