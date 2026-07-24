# Arbitrages T-34B — Brouillons multi-appareil

> **Support de décision non normatif — complété le 24 juillet 2026.** Les dix réponses initiales et
> deux arbitrages complémentaires ont été acceptés et inscrits sous DEC-023 à DEC-032, DEC-043 et
> DEC-044 dans le registre des décisions, qui seul fait autorité.

## Synthèse validée

| Sujet | Recommandation | Alternative | Conséquence principale |
|---|---|---|---|
| Version | **Acceptée — DEC-023** : entier initial `1`, incrément de `1` à chaque mutation réussie | version opaque aléatoire | entier simple à tester ; ne doit pas être interprété comme une chronologie globale |
| Transport | **Acceptée — DEC-024** : `version_attendue` obligatoire dans le corps du `PATCH` | en-tête HTTP `If-Match` et ETag | cohérent avec `updateWithExpectedVersion` ; moins standard qu’ETag |
| Conflit | **Acceptée — DEC-025** : `409 CAPTURE_VERSION_CONFLICT` avec version serveur et champs modifiables sûrs après contrôle des droits | retourner seulement la version | permet une comparaison compréhensible ; charge utile plus riche à sécuriser |
| Résolution | **Acceptée — DEC-026** : recharger ou réappliquer manuellement des champs choisis, sans forçage global | écrasement forcé ou fusion automatique | aucune perte silencieuse ; demande une interface de comparaison |
| Duplication | **Acceptée — DEC-027** : proposer « enregistrer comme nouveau brouillon », sans copie implicite des fichiers | exclure définitivement la duplication | préserve un travail local important ; peut créer des doublons métier |
| Création | **Acceptée — DEC-028** : clé d’idempotence aléatoire, bornée à l’auteur et à l’agence pendant 24 heures | accepter le risque de doublon puis dédoublonner | évite les doublons après réponse réseau perdue ; ajoute une donnée technique temporaire |
| Liste | **Acceptée — DEC-029** : ajouter `listByAuthor`, curseur opaque, tri récent, 20 résultats par défaut et 50 maximum | réutiliser un port générique de recherche | contrat minimal et cloisonné ; opération supplémentaire à maintenir |
| Champs | **Acceptée — DEC-030** : type, commentaire facultatif limité à 2 000 caractères et rattachement proposé contrôlé | autoriser aussi fichiers, état ou géolocalisation | sépare correctement T-34B de T-34C/T-34E et réduit la surface sensible |
| Hors ligne | **Acceptée — DEC-031** : aucun stockage local persistant dans le premier lot ; seul le shell non sensible pourra être mis en cache | IndexedDB dès T-34B | permet d’avancer sans modèle de menace ; le vrai mode déconnecté reste différé |
| Géolocalisation | **Acceptée — DEC-032** : champ entièrement absent du premier contrat | champ nullable désactivé par défaut | absence vérifiable ; une évolution ultérieure exigera consentement, finalité et rétention explicites |
| Titre | **Acceptée — DEC-043** : titre facultatif, normalisé et limité à 160 caractères | titre obligatoire ou absence de titre | facilite la reprise parmi de nombreux brouillons sans ralentir une capture rapide |
| Complétude | **Acceptée — DEC-044** : « À compléter / Prêt à traiter » calculé dans l’interface, jamais persisté | nouveaux états serveur | guide l’auteur sans créer une machine d’état concurrente ni simuler une soumission |

## Réponses validées

1. **Accepté — DEC-023** : la version commence à `1` et s’incrémente strictement d’une unité.
2. **Accepté — DEC-024** : `version_attendue` est transmis dans le JSON plutôt que dans `If-Match`.
3. **Accepté — DEC-025** : le conflit retourne les champs courants sûrs après contrôle complet des droits.
4. **Accepté — DEC-026** : tout écrasement forcé et toute fusion automatique sont exclus.
5. **Accepté — DEC-027** : la duplication est proposée sans copie implicite des fichiers.
6. **Accepté — DEC-028** : la création utilise une clé d’idempotence bornée pendant 24 heures.
7. **Accepté — DEC-031** : le premier lot reste strictement en ligne, sans IndexedDB ni média local persistant.
8. **Accepté — DEC-032** : la géolocalisation reste totalement absente du premier contrat.
9. **Accepté — DEC-029** : le port liste par curseur uniquement les brouillons privés de l’auteur.
10. **Accepté — DEC-030** : les champs modifiables sont limités au type, au commentaire facultatif de 2 000 caractères maximum et au rattachement proposé contrôlé.
11. **Accepté — DEC-043** : le titre est facultatif, normalisé et limité à 160 caractères.
12. **Accepté — DEC-044** : la complétude est une aide d’interface calculée ; l’état serveur reste
    `brouillon_prive`.

## Recommandation de lot

Les douze réponses sont validées. Les deux lots déjà livrés restent limités aux politiques pures,
au code de conflit, à l’extension du contrat de port, au titre et à la règle pure de complétude.
Ils ne nécessitent ni PostgreSQL, ni stockage objet, ni navigateur et restent réversibles. La
persistance et les routes viennent dans un lot distinct après revue de ce noyau.
