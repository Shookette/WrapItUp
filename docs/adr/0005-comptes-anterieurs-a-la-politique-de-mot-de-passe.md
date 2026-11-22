# 5. Comptes créés avant la politique de mot de passe

- Statut : acceptée
- Source : `src/hooks/UserContext.tsx` (`login`)

## Contexte

La politique de mot de passe de Firebase Auth est en mode « Exiger » (10 caractères, majuscule, minuscule, chiffre, caractère spécial). Firebase refuse alors la connexion d'un compte dont le mot de passe, antérieur à la politique, ne la respecte pas (`auth/password-does-not-meet-requirements`).

## Décision

Cette erreur affiche un message dédié (`PASSWORD_OUTDATED_ERROR`) qui invite à réinitialiser le mot de passe, plutôt qu'un échec de connexion générique.

## Conséquences

Pas de migration à prévoir : chaque compte concerné change son mot de passe à sa prochaine connexion. La politique est recopiée côté client (voir #29).
