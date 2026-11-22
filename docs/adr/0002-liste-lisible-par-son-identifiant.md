# 2. Une liste est lisible par toute personne connectée qui connaît son identifiant

- Statut : acceptée
- Source : en-tête de `firestore.rules`

## Contexte

Une personne est invitée par un lien `/invite/$listId`. Avant de rejoindre la liste, elle n'est pas dans `allowedUsers` : les règles ne peuvent donc pas réserver la lecture aux invité·es.

## Décision

`allow get` sur `lists/{listId}` pour toute personne connectée avec un email vérifié. L'identifiant (uuid aléatoire) joue le rôle de secret du lien d'invitation. Les requêtes (`allow list`) restent limitées aux listes dont on est propriétaire ou invité·e : on ne peut pas énumérer les listes.

## Conséquences

- Quiconque obtient le lien peut lire la liste (comme un lien de partage).
- Révoquer un lien demande de recréer la liste : pas de jeton d'invitation séparé.
