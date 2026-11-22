# 6. App Check en mode debug hors production

- Statut : acceptée
- Source : `src/firebaseLoader.ts`, `src/vite-env.d.ts`, `.env`

## Contexte

App Check utilise reCAPTCHA Enterprise, dont la clé de site n'autorise que les domaines de production. En local et sur les canaux de preview des PR (domaine différent à chaque PR), reCAPTCHA n'est pas utilisable.

## Décision

- Hors du mode `production`, `self.FIREBASE_APPCHECK_DEBUG_TOKEN` est défini avant `initializeAppCheck` : le SDK passe en mode debug.
- Sans `VITE_APPCHECK_DEBUG_TOKEN`, le SDK génère un jeton par navigateur et l'affiche dans la console : il faut l'enregistrer dans la console Firebase (App Check → Applications → Gérer les jetons de débogage).
- Un jeton fixe peut être mis dans `.env.local` (non versionné), **jamais** dans un fichier versionné ni dans la CI : le dépôt et les previews sont publics, ce serait un contournement d'App Check ouvert à tous.

## Conséquences

Chaque navigateur de développement et chaque testeur·se de preview doit faire enregistrer son jeton tant que l'application forcée d'App Check est activée.
