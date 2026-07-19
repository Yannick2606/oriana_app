# Constitution orIAna

> Invariants non négociables — version 2.0 — 19 juillet 2026.

## Article 1 — Primauté de la finalité

La technologie sert la Vision, BORÉAL et ORMO. Une contrainte technique peut conduire à un
arbitrage explicite ; elle ne redéfinit jamais silencieusement la finalité.

## Article 2 — Autorité humaine

L’IA ne modifie pas seule la Vision, le patrimoine officiel, le plan, le code ou la production.
Elle ne publie, n’envoie, ne contracte, ne décide d’un droit ni n’écrit une donnée engageante sans
la validation définie pour cet acte.

## Article 3 — Source de vérité

PostgreSQL est la source de vérité métier cible. Tant que la bascule T-30 n’est pas validée, Grist
reste la source opérationnelle historique de production. Cette transition n’autorise ni double
écriture durable ni bascule sans sauvegarde, rapprochement, restauration testée et retour arrière.

## Article 4 — Sécurité par conception

Les secrets restent hors du dépôt et du navigateur. Les autorisations, périmètres d’agence et
rôles sont contrôlés côté serveur à chaque requête. Les mots de passe sont hachés ; les données et
instructions externes sont considérées non fiables ; les journaux excluent secrets et contenus
métier sensibles.

## Article 5 — Souveraineté et réversibilité

Les fournisseurs de modèles, n8n, Grist, les outils marketing et les futurs connecteurs sont
remplaçables. Les connaissances, prompts, formats, évaluations, règles et données de référence
restent gouvernés par orIAna.

## Article 6 — Traçabilité

Toute décision significative possède une source, un statut, une autorité de validation, une date
et des impacts identifiables. Toute action IA importante conserve le contexte, le modèle ou la
classe de modèle, le coût, le résultat, la validation et les erreurs selon une politique à définir.

## Article 7 — Explicabilité et contestabilité

Une recommandation distingue les faits, les sources, le niveau de confiance et l’interprétation.
Elle doit pouvoir être comprise, corrigée ou refusée. Aucun score opaque ne sert à sanctionner une
personne.

## Article 8 — Protection du patrimoine

La documentation officielle précède ou accompagne toute évolution qui modifie une décision, une
capacité, une règle métier, un modèle ou une architecture. Les doublons et contradictions sont
traités comme une dette à résorber.

## Article 9 — Modularité

Le socle commun porte identité, habilitations, audit, fichiers, notifications, consentements,
préférences, tâches, capture et connecteurs. Les modules métier dépendent de contrats du socle,
pas directement de fournisseurs externes. Le monolithe modulaire reste la forme cible tant qu’une
séparation de service n’est pas justifiée par une décision d’architecture.

## Article 10 — Qualité vérifiable

Une capacité n’est pas « terminée » sans critères d’acceptation, contrôles de sécurité, tests
proportionnés et mise à jour du statut. Une preuve d’implémentation ne vaut pas validation
stratégique, métier ou architecturale.
