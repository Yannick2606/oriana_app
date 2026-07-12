# STATUS.md — Journal et état vivant du projet orIAna

> Fichier tenu à jour par l'agent à CHAQUE tâche. C'est la mémoire partagée : décisions prises,
> ce qui est fait, ce qui reste, points bloquants. Ne pas effacer l'historique, ajouter en tête.

## Checklist humaine préalable (à confirmer avant T-03)
- [ ] Ajouter le champ `mot_de_passe_hash` (texte) à la table Utilisateurs dans Grist.
- [ ] Renseigner un hash bcrypt pour au moins un compte de test par rôle (consultant, manager, admin).
- [ ] Fournir les valeurs réelles dans un `.env` local (jamais commité) : clés Grist, secret n8n, etc.

## État par phase
- PHASE 1 : non démarrée.
- PHASE 2 : non planifiée (ne pas coder).
- CIBLE : réservé (ne pas coder).

## Journal (le plus récent en haut)
- **2026-07-12 — T-00 en cours**
  - Arborescence `backend/` et `frontend/` initialisée avec un paquet npm privé minimal dans chaque zone.
  - Fichiers racine installés ; `.gitignore` protège `.env`, les dépendances et les sorties de build.
  - Exigence complémentaire enregistrée : préparer ultérieurement un jeu de données Grist bac à sable suffisamment volumineux pour tester les parcours, les droits et le matching, principalement dans le Val-d'Oise (95) et la Seine-et-Marne (77). Données entièrement fictives, reproductibles et sans doublons.
  - Aucun développement PHASE 2 ou CIBLE engagé ; aucune base locale ne sera créée, Grist restant la source de vérité.
  - Dépôt GitHub `Yannick2606/oriana_app` connecté ; contrôles T-00 réussis et tâche synchronisée sur la branche `main`.
