# 4. Ne pas révéler si un compte existe pour un email

- Statut : acceptée
- Source : `src/hooks/UserContext.tsx` (`RESET_PASSWORD_ERRORS`), `src/routes/reset-password.tsx`

## Contexte

La protection contre l'énumération des emails est activée dans Firebase Auth : `sendPasswordResetEmail` ne renvoie pas d'erreur pour un email inconnu (et n'envoie rien).

## Décision

Le message de confirmation reste conditionnel (« Si un compte existe pour …, un lien vient d'y être envoyé ») et aucune erreur « compte inconnu » n'est prévue.

## Conséquences

Une personne qui se trompe d'adresse n'est pas prévenue : le message l'invite à vérifier ses spams, et l'adresse saisie est rappelée.
