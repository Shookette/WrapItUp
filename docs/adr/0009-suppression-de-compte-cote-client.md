# 9. Suppression de compte : effacement des données côté client, par les règles

- Statut : acceptée
- Source : `src/repository/AccountRepository.ts`

## Contexte

La suppression d'un compte doit effacer ses données (audit §8, RGPD). L'application n'a pas de backend (pas de Cloud Functions).

## Décision

Avant `deleteUser`, `deleteAccountData` efface, en passant par les règles Firestore comme n'importe quelle écriture :

1. ses listes (en tant que propriétaire) ;
2. dans les listes où il ou elle est invité·e : ses réservations sont annulées, puis son uid est retiré de `allowedUsers` (« quitter la liste ») ;
3. son profil.

Firebase exige une connexion récente pour supprimer un compte : le mot de passe est redemandé (`reauthenticateWithCredential`).

## Conséquences

- L'effacement n'est pas atomique : une erreur au milieu laisse des données partielles, mais le compte n'est supprimé qu'en cas de succès, et l'opération peut être relancée.
- Toute nouvelle donnée liée à un·e utilisateurice doit être ajoutée à `deleteAccountData`.
