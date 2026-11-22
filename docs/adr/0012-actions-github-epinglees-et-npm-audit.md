# 12. Actions GitHub épinglées par SHA, `npm audit` au seuil « critical »

- Statut : acceptée
- Date : 22 novembre 2026
- Source : `.github/workflows/`, `docs/security-audit.md` §10

## Contexte

Les workflows reçoivent la clé du compte de service qui déploie en production, et un push sur `main` déploie. Une étiquette (`@v4`, `@v0`) peut être déplacée vers un autre commit : si le dépôt d'une action est compromis, le workflow exécute le nouveau code sans que rien ne change ici (cas de `tj-actions/changed-files`, mars 2025).

`npm audit --omit=dev` signale 4 failles « high », toutes via `firebase` → `@grpc/grpc-js` : Firestore épingle `@grpc/grpc-js ~1.9`, qui ne sert qu'à sa version Node et n'est pas dans le bundle navigateur (audit §5).

## Décision

- Chaque action est épinglée par le SHA complet de son commit, suivi de sa version : `uses: actions/checkout@<sha> # v4.4.0`. Ce `# vX.Y.Z` est la seule exception à l'ADR 1 dans les workflows : il dit quelle version le SHA désigne, pour savoir quand le mettre à jour.
- Pas de Dependabot pour les versions : les SHA se mettent à jour à la main (`gh api repos/<action>/commits/<tag> --jq .sha`), en changeant le SHA et la version ensemble.
- La CI lance `npm audit --omit=dev --audit-level=critical` avant le build. Le seuil « high » bloquerait chaque déploiement à cause de `@grpc/grpc-js`.

## Conséquences

- Une nouvelle action s'ajoute directement par SHA.
- Une faille « high » réelle dans une dépendance du navigateur ne bloque pas la CI : elle doit venir des alertes Dependabot (activées sur le dépôt). Quand Firestore ne dépendra plus d'un `@grpc/grpc-js` vulnérable, repasser le seuil à « high ».
