# Matrice de navigation par rôle

> Référence fonctionnelle de l'interface — décision DEC-041 — 22 juillet 2026.

## Finalité

La navigation présente le prochain geste utile au rôle actif sans laisser croire qu'un écran
visible constitue une autorisation. Le backend reste l'unique autorité pour les droits, le
périmètre d'agence et l'accès aux données.

Le rôle actif est sélectionné à un seul endroit : le profil situé dans l'en-tête. La barre
latérale peut rappeler ce rôle sans proposer une seconde commande de changement.

## Matrice

| Vue | Consultant | Master consultant | Directeur d'agence | Administrateur d'agence | Super administrateur |
|---|:---:|:---:|:---:|:---:|:---:|
| Accueil | oui | oui | oui | oui | oui |
| Patrimoine | oui | oui | oui | non | non |
| Offres | oui | oui | oui | non | non |
| CRM | oui | oui | oui | non | non |
| Matching | oui | oui | oui | non | non |
| Agents IA | oui | oui | oui | non | non |
| Auto-formation | oui | oui | oui | oui | oui |
| Administration | non | non | oui | oui | oui |

## Interprétation

- Le Consultant travaille sur ses données métier.
- Le Master consultant travaille sur ses données et consulte celles de son équipe active.
- Le Directeur d'agence pilote l'activité métier et organise son équipe.
- L'Administrateur d'agence gère les comptes et habilitations des niveaux inférieurs de son agence ;
  les modules métier ne lui sont pas proposés dans la navigation.
- Le Super administrateur gère la plateforme sans accès métier implicite.

Masquer une vue améliore l'orientation mais ne remplace jamais un refus serveur. Une URL, une
requête forgée ou une ancienne session ne doit pas permettre de contourner le rôle actif.

## Critères de recette

- un seul sélecteur de rôle interactif est exposé ;
- le changement de rôle actualise immédiatement le menu et ramène vers une vue autorisée si
  nécessaire ;
- l'Auto-formation reste accessible aux cinq rôles ;
- aucun module métier n'est visible pour Administrateur d'agence ou Super administrateur ;
- les contrôles serveur existants restent verts pour les cinq rôles.
