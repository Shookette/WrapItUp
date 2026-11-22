# 3. Email vérifié obligatoire, sauf pour créer son profil à l'inscription

- Statut : acceptée
- Source : `firestore.rules` (`signedIn`, création des `profils`), `src/hooks/UserContext.tsx` (`register`)

## Contexte

Firebase Auth crée un compte pour n'importe quelle adresse : un email non vérifié peut être celui de quelqu'un d'autre (audit §4).

## Décision

- `signedIn()` exige `request.auth.token.email_verified == true` : toutes les lectures et écritures en dépendent.
- Seule exception : la création de son document `profils`, faite à l'inscription, avant la vérification.
- L'inscription, côté client :
  1. crée le compte (Firebase connecte automatiquement) ;
  2. crée le profil ; en cas d'échec, **supprime le compte** : sans profil il est inutilisable, et le supprimer permet de refaire l'inscription avec le même email ;
  3. envoie l'email de vérification ; un échec n'annule pas l'inscription, l'email pourra être renvoyé depuis la page de connexion ;
  4. **déconnecte** : la session ne s'ouvre qu'une fois l'email vérifié (`login` refuse un email non vérifié).

## Conséquences

- Un compte peut exister sans email vérifié : il ne voit et ne modifie rien.
- La page de connexion doit proposer de renvoyer l'email de vérification.
