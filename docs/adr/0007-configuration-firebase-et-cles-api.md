# 7. Configuration Firebase versionnée, une clé API par environnement

- Statut : acceptée
- Source : `.env`, `.env.production`, `.github/workflows/firebase-hosting-pull-request.yml`

## Contexte

La configuration du client Firebase finit de toute façon dans le JS envoyé au navigateur : elle n'est pas secrète. La sécurité repose sur les règles Firestore, App Check et les restrictions des clés API (console Google Cloud).

## Décision

- Les variables `VITE_FIREBASE_*` et `VITE_RECAPTCHA_SITE_KEY` sont versionnées.
- `.env` (chargé dans tous les modes) porte la clé « Dev / previews » : restreinte aux API Identity Toolkit, Token Service, Cloud Firestore et Firebase App Check, **sans restriction de site** (localhost et canaux de preview, dont le domaine change à chaque PR).
- `.env.production` surcharge la clé par la « Browser key », restreinte aux mêmes API **et** aux domaines de production (liste dans `CLAUDE.md`, section Déploiement).
- La CI des PR construit en mode `preview` (`npm run build:preview`) : le domaine d'un canal de preview n'est pas autorisé sur la clé de production.

## Conséquences

Un nouveau domaine de production doit être ajouté aux restrictions de la « Browser key », sinon la connexion y échoue (`API_KEY_HTTP_REFERRER_BLOCKED`).
