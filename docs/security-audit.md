# Audit de sécurité — Wrap It Up

> Audit réalisé le 8 novembre 2026 (commit `3e8ac54`).
> Cocher les cases au fur et à mesure. Chaque point est indépendant, sauf mention contraire.

**Légende** : 🔴 critique · 🟠 important · 🟡 bonne pratique

---

## Ordre de traitement conseillé

1. [ ] Règles Firestore + tests émulateur + profils indexés par uid → [§1](#1--règles-firestore-ouvertes-à-tous)
2. [ ] Validation des URLs, `emailVerified` au login, nettoyage du `localStorage` → [§2](#2--xss-via-lurl-dun-cadeau), [§3](#3--jetons-de-connexion-copiés-dans-localstorage), [§4](#4--vérification-de-lemail-contournable)
3. [ ] `npm audit fix`, Dependabot, en-têtes HTTP → [§5](#5--dépendances-vulnérables), [§9](#9--en-têtes-http-de-sécurité)
4. [ ] Sous-collection de réservations (migration de données) → [§1.3](#13-secret-des-réservations-changement-de-modèle), [§6](#6--écritures-concurrentes--réservations-perdues)

---

## 🔴 1. Règles Firestore ouvertes à tous

**Fichier** : `firestore.rules`

```
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

**Risque** : tout compte connecté (l'inscription est ouverte) peut, depuis la console du navigateur :

- lire **toutes** les listes (`getDocs(collection(db, "lists"))`), sans invitation ;
- modifier ou supprimer **n'importe quelle** liste ;
- réécrire le profil (pseudo) de quelqu'un d'autre ;
- en tant que propriétaire, lire `reservedBy` / `status` → le « C'est un secret » n'est assuré que par l'affichage.

### 1.1 Collection `lists`

- [ ] Lecture : propriétaire **ou** uid présent dans `allowedUsers`.
- [ ] Création : `request.resource.data.userUID == request.auth.uid`.
- [ ] Modification complète et suppression : propriétaire uniquement.
- [ ] Un·e invité·e peut uniquement **s'ajouter** à `allowedUsers` (pour `/invite/$listId`) :
  - `request.resource.data.diff(resource.data).affectedKeys().hasOnly(['allowedUsers'])`
  - la nouvelle valeur vaut l'ancienne + son propre uid (et rien d'autre).
- [ ] Un·e invité·e peut modifier les réservations (tant qu'elles sont imbriquées, cf. §1.3) sans toucher au reste.
- [ ] Valider le schéma (types, longueurs max de `title`, `description`, `url`).

> ⚠️ Lire la liste depuis `/invite/$listId` (pour afficher titre et propriétaire) ne sera plus possible pour un non-invité. Prévoir soit une lecture autorisée « par id seulement » (`get` autorisé, `list` interdit), soit un petit document public `invitations/{listId}` avec juste le titre et le nom du propriétaire.

Ébauche :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null && request.auth.token.email_verified == true; }
    function isOwner(data) { return signedIn() && data.userUID == request.auth.uid; }
    function isGuest(data) { return signedIn() && request.auth.uid in data.allowedUsers; }

    match /lists/{listId} {
      allow get: if signedIn();                       // nécessaire pour /invite, à affiner
      allow list: if isOwner(resource.data) || isGuest(resource.data);
      allow create: if isOwner(request.resource.data);
      allow update: if isOwner(resource.data) && request.resource.data.userUID == resource.data.userUID
                    || joiningList();
      allow delete: if isOwner(resource.data);

      function joiningList() {
        return signedIn()
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['allowedUsers'])
          && request.resource.data.allowedUsers == resource.data.allowedUsers.concat([request.auth.uid]);
      }
    }

    match /profils/{uid} {
      allow read: if signedIn();
      allow write: if signedIn() && request.auth.uid == uid;
    }
  }
}
```

### 1.2 Collection `profils`

- [ ] Utiliser **l'uid comme identifiant de document** (au lieu d'un uuid aléatoire) → règle `request.auth.uid == profilId` possible.
- [ ] Adapter `setProfil` / `getById` dans `src/repository/ProfilRepository.ts` (simple `getDoc` au lieu d'une requête `where`).
- [ ] Script de migration des profils existants.

### 1.3 Secret des réservations (changement de modèle)

Tant que les cadeaux sont imbriqués dans `lists.presents`, impossible de cacher `reservedBy` au propriétaire : Firestore ne filtre pas un champ à l'intérieur d'un document.

- [ ] Sortir les réservations dans une sous-collection `lists/{listId}/reservations/{presentId}` (`{ reservedBy, reservedAt }`).
- [ ] Règles : lecture/écriture par les invité·es uniquement, **jamais** par le propriétaire ; suppression seulement par `reservedBy`.
- [ ] Migrer les réservations existantes, puis retirer `status` / `reservedBy` de `Present`.

### 1.4 Outillage

- [ ] Tests des règles avec l'émulateur (`@firebase/rules-unit-testing` + `firebase emulators:exec`).
- [ ] Déployer les règles depuis la CI (aujourd'hui manuel : `firebase deploy --only firestore:rules`).
- [ ] `storage.rules` est verrouillé (`if false`) mais **non référencé** dans `firebase.json` : l'ajouter, ou supprimer le fichier si `FileRepository` disparaît.

---

## 🔴 2. XSS via l'URL d'un cadeau

**Fichier** : `src/routes/list.$listId.tsx:82` — `<Anchor href={present.url} target="_blank">`

**Risque** : React 18 affiche un simple avertissement mais **rend** les liens `javascript:...`. Avec les règles actuelles, n'importe qui peut injecter un tel lien dans n'importe quelle liste → exécution de code au clic de la victime, vol de session.

- [ ] Valider le protocole à l'affichage : n'afficher le lien que si `new URL(url).protocol` vaut `http:` ou `https:`.
- [ ] Valider aussi à l'enregistrement (`ListFormPresents.tsx`, règle `pattern` de react-hook-form).
- [ ] Valider dans les règles Firestore (`url.matches('^https?://.*')`).
- [ ] Ajouter `rel="noopener noreferrer"` sur les liens externes.

---

## 🟠 3. Jetons de connexion copiés dans `localStorage`

**Fichier** : `src/hooks/UserContext.tsx` (`setStoredUser`)

`JSON.stringify(user)` appelle `User.toJSON()`, qui inclut `stsTokenManager` → **accessToken et refreshToken** copiés dans `wrapitup.user`. Cette clé :

- n'est pas vidée par `deleteCurrentUser` ;
- n'est pas invalidée quand Firebase termine la session (`onAuthStateChanged(null)` est ignoré).

- [ ] Ne plus stocker l'objet `User` complet. Au mieux `{ uid, displayName, email }`.
- [ ] Mieux : supprimer ce cache et attendre le premier `onAuthStateChanged` (état « chargement ») avant de rendre le routeur. Firebase persiste déjà la session (IndexedDB).
- [ ] Gérer `onAuthStateChanged(null)` → `setUser(null)`.
- [ ] Vider le cache dans `deleteCurrentUser`.

---

## 🟠 4. Vérification de l'email contournable

**Fichier** : `src/hooks/UserContext.tsx:372` (`login`)

`login()` fait `setUser(user)` **sans tester `emailVerified`**. Seule la restauration de session vérifie. On peut donc utiliser l'app avec un email non vérifié (donc celui de quelqu'un d'autre).

- [ ] Tester `user.emailVerified` dans `login`, sinon `signOut` + message (« vérifiez votre email », avec bouton de renvoi).
- [ ] Imposer `request.auth.token.email_verified == true` dans les règles (sinon le contrôle reste contournable).

---

## 🟠 5. Dépendances vulnérables

`npm audit` (dépendances de prod) : **45 vulnérabilités** — 2 critiques, 12 hautes, 31 modérées.

- Directe : `@tanstack/react-router` (1.56.2 – 1.85.5).
- Transitives notables : `protobufjs`, `websocket-driver` (critiques), `zod`, `lodash`, `@grpc/grpc-js`, `prosemirror-view`, `markdown-it`, `js-yaml`…

- [x] `npm audit fix`, puis mettre à jour `@tanstack/react-router` / `@tanstack/router-plugin` (étape 3 du plan d'upgrade : 45 → 4 vulnérabilités de prod, toutes via `firebase` → `@grpc/grpc-js`, à traiter avec Firebase 13).
- [x] Vérifier `npm run build` et `npm run lint` après mise à jour (fait par la CI depuis la PR #2).
- [ ] Activer **Dependabot** (`.github/dependabot.yml`) pour npm et GitHub Actions.
- [x] Ajouter `zod` explicitement dans `package.json` (importé dans `login.tsx`, absent des dépendances), version ≥ 4.6.6.

---

## 🟠 6. Écritures concurrentes : réservations perdues

Chaque réservation réécrit **toute la liste** via `setDoc` (`list.$listId.tsx` → `setList`). Deux invité·es qui réservent en même temps, ou un·e invité·e qui réserve pendant que le propriétaire édite → la dernière écriture écrase l'autre. Deux personnes peuvent croire avoir réservé le même cadeau.

- [ ] Court terme : `runTransaction` (relire, vérifier que le cadeau est libre, écrire).
- [ ] Long terme : documents de réservation séparés (cf. §1.3), avec règle « création uniquement si le document n'existe pas ».

---

## 🟡 7. Configuration Firebase / Google Cloud

- [ ] Restreindre la **clé API** (console Google Cloud → Identifiants) :
  - référents HTTP : `wrap-it-up-2d42a.web.app/*`, `wrap-it-up-2d42a.firebaseapp.com/*`, `localhost`, canaux de preview ;
  - API autorisées : Identity Toolkit, Token Service, Firestore.
- [ ] Activer **Firebase App Check** (reCAPTCHA Enterprise) et l'imposer sur Firestore.
- [ ] Firebase Auth :
  - [ ] activer la protection contre l'énumération des emails ;
  - [ ] définir une politique de mot de passe (longueur minimale, etc.) ;
  - [ ] éventuellement un quota d'inscriptions par IP.

---

## 🟡 8. Authentification et parcours utilisateurice

- [ ] **Paramètre `?redirect=`** (`login.tsx`) passé tel quel à `navigate({ to: redirect })`. Valider qu'il commence par `/` et pas par `//` (prévention d'une redirection ouverte — non vérifié si TanStack Router l'accepte, mais autant fermer la porte).
- [ ] **Inscription** (`register`) : si `setProfil` échoue après `createUserWithEmailAndPassword`, le compte existe sans profil, l'erreur est juste loguée. Afficher l'erreur et/ou réessayer.
- [ ] `register.tsx` redirige vers `/login` même en cas d'échec : remonter l'erreur à l'écran.
- [ ] **Suppression de compte (RGPD)** : `deleteCurrentUser` existe mais n'est appelé nulle part. Ajouter le bouton dans `/account`, et supprimer aussi les listes et le profil (et retirer l'uid des `allowedUsers` des autres listes). Une Cloud Function `auth.user().onDelete` est la solution la plus fiable.
- [ ] Mettre `lang="fr"` dans `index.html` (accessibilité, pas sécurité).

---

## 🟡 9. En-têtes HTTP de sécurité

**Fichier** : `firebase.json`, section `hosting.headers`

- [ ] `Content-Security-Policy` (limite fortement l'impact d'une XSS). Point de départ à ajuster :
      `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com; frame-src https://wrap-it-up-2d42a.firebaseapp.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] `Strict-Transport-Security` (Firebase Hosting le met déjà, à vérifier)

Exemple :

```json
"headers": [
  {
    "source": "**",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
      { "key": "Content-Security-Policy", "value": "..." }
    ]
  }
]
```

Tester d'abord en `Content-Security-Policy-Report-Only` sur un canal de preview.

---

## 🟡 10. CI / GitHub Actions

**Fichiers** : `.github/workflows/firebase-hosting-merge.yml`, `firebase-hosting-pull-request.yml`

- [ ] Épingler les actions par SHA (`actions/checkout@<sha>`, `FirebaseExtended/action-hosting-deploy@<sha>`) : `@v0` est une étiquette mobile.
- [ ] Ajouter un bloc `permissions:` minimal au workflow de merge (`contents: read`, `checks: write`).
- [ ] Vérifier que le compte de service `FIREBASE_SERVICE_ACCOUNT_WRAP_IT_UP_2D42A` n'a que le rôle **Firebase Hosting Admin** (+ Firebase Rules Admin si les règles sont déployées par la CI).
- [x] Lancer `npm run lint` dans la CI avant le déploiement (fait, PR #2 : oxlint).
- [ ] Lancer `npm audit --audit-level=high --omit=dev` dans la CI avant le déploiement.
- [ ] Protéger la branche `main` (PR obligatoire, checks verts) puisqu'un push déploie en production.

---

## 🟡 11. Réduction de la surface d'attaque

- [x] Supprimer `src/repository/PresentRepository.ts` et `src/repository/FileRepository.ts` (inutilisés).
- [ ] Supprimer `Present.listUID` si la collection `presents` est abandonnée.
- [x] Retirer les dépendances Mantine/tiptap inutilisées : `@mantine/carousel`, `charts`, `code-highlight`, `dates`, `dropzone`, `form`, `modals`, `nprogress`, `spotlight`, `tiptap`, `@tiptap/*`, `embla-carousel-react`, `recharts` (vérifié le 8/11/2026 : aucun import ; voir l'étape 2 de `docs/upgrade-plan.md`). Fait à l'étape 2 ; pas d'effet sur le bundle, ces paquets n'étaient pas importés.
- [x] ~~Déplacer `eslint-config-prettier` dans `devDependencies`~~ : retiré avec ESLint (PR #2).
- [ ] Retirer les `console.error` qui affichent les messages Firebase bruts en production (ou passer par un vrai suivi d'erreurs).

---

## Hors périmètre / à décider

- Comportement accepté pour la confidentialité des listes (usage entre proches) : cet audit part du principe qu'il faut **durcir** (cf. `CLAUDE.md`, « Points d'attention connus »).
- Monitoring : alertes de facturation Firebase et quotas Firestore, en cas d'abus de la base ouverte.
