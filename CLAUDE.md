# Wrap It Up — Guide du projet

Application web de **listes de cadeaux partagées**. Un·e utilisateurice crée une liste, y ajoute des cadeaux, puis partage un lien d'invitation. Les invité·es peuvent consulter la liste et **réserver** des cadeaux ; le ou la propriétaire de la liste ne voit pas ce qui est réservé (« C'est un secret »).

> Les sections marquées **À préciser** sont des points que le code ne permet pas de trancher : à compléter au fil de l'eau.

## Stack

- **React 18** + **TypeScript** + **Vite 5**
- **TanStack Router** (routage par fichiers, plugin Vite) — `src/routeTree.gen.ts` est **généré automatiquement, ne jamais le modifier à la main**
- **Firebase 11** : Auth (email / mot de passe), Firestore, Hosting
- **react-hook-form** pour tous les formulaires (`Controller` + composants `Input` maison)
- **Mantine 7** (en cours de suppression, voir plus bas), icônes **@tabler/icons-react**
- `uuid` pour générer les identifiants, `dayjs` pour les dates, `classnames` pour les classes CSS

## Commandes

```bash
npm run dev      # serveur de développement Vite
npm run build    # tsc + vite build (sortie dans dist/)
npm run lint     # oxlint sur src/, 0 warning toléré (--deny-warnings)
npm run preview  # prévisualiser le build
```

Il n'y a **aucun test** dans le projet pour l'instant. Après une modification, vérifier au minimum `npm run build` (le typage TS fait office de garde-fou) et `npm run lint`.

Le lint (oxlint) passe sans erreur ni warning et **est lancé par la CI** avant le build (`npm ci && npm run lint && npm run build`) : un warning fait échouer le déploiement. Le build affiche un avertissement : bundle JS > 500 kB.

## Déploiement

- **Push sur `main` → déploiement automatique en production** sur Firebase Hosting (`.github/workflows/firebase-hosting-merge.yml`).
- Chaque **pull request** déploie un canal de prévisualisation (`firebase-hosting-pull-request.yml`).
- Projet Firebase : `wrap-it-up-2d42a`. La config client est dans `src/firebaseLoader.ts` (clé API publique par nature côté web).
- Les règles Firestore (`firestore.rules`) ne sont **pas** déployées par la CI : il faut passer par `firebase deploy --only firestore:rules`.

## Arborescence

```
src/
  main.tsx              # point d'entrée : providers (Mantine, Firebase, UserProvider) + routeur
  firebaseLoader.ts     # initialisation Firebase
  theme.css             # variables CSS globales (couleurs, tailles, espacements)
  routes/               # une route = un fichier (TanStack Router)
  components/           # composants UI (maison + layouts)
  hooks/UserContext.tsx # contexte d'authentification
  repository/           # TOUT accès à Firestore passe par ici
  interfaces/           # types métier (List, Present, Profil)
  utils/routeUtils.ts   # garde d'authentification des routes
```

## Routes

| Route | Rôle | Accès |
|---|---|---|
| `/` | « Mes listes » : listes dont je suis propriétaire | connecté |
| `/lists` | « Listes de cadeaux » : listes auxquelles j'ai été invité·e | connecté |
| `/new` | Création d'une liste (titre seul, puis redirection vers `/edit`) | connecté |
| `/edit/$listId` | Édition : onglets Cadeaux / Utilisateurices / Danger zone | propriétaire uniquement |
| `/list/$listId` | Consultation et réservation des cadeaux | invité·e uniquement |
| `/invite/$listId` | Page d'invitation, bouton « Rejoindre la liste » | connecté |
| `/login`, `/register`, `/reset-password` | Authentification | public |
| `/account` | Compte utilisateurice | connecté |

## Modèle de données Firestore

### Collection `lists`
Identifiant du document = `list.id` (uuid).

```ts
{
  id: string;
  title: string;
  userUID: string;        // uid Firebase Auth du ou de la propriétaire
  createdAt: string;      // "YYYY-MM-DD"
  presents: Present[];    // les cadeaux sont IMBRIQUÉS dans la liste
  allowedUsers: string[]; // uids des invité·es (le ou la propriétaire n'y figure PAS)
}
```

- En base, `allowedUsers` est un tableau d'uids. Côté app, on manipule un `FullList` où `allowedUsers` est enrichi en `{ userUID, username }` ; `setList()` refait la conversion avant l'écriture.
- `username` (nom du ou de la propriétaire) est ajouté à la lecture par le repository et ne fait pas partie du modèle de base.
- Une réservation = modifier `status` (`"available"` / `"reserved"`) et `reservedBy` (uid) du cadeau, puis réécrire **toute la liste** avec `setList()`.

### Collection `profils`
```ts
{ id: string; userUID: string; username: string }
```
Attention : l'identifiant du document (`id`, uuid aléatoire) **n'est pas** l'uid de l'utilisateurice. On retrouve un profil via `where("userUID", "==", uid)` (`getById` dans `ProfilRepository`).

### Code mort à connaître
- `PresentRepository.ts` (collection `presents` séparée) et `FileRepository.ts` (Firebase Storage) **ne sont utilisés nulle part**. Les cadeaux vivent dans `lists.presents`. **À préciser** : vestiges à supprimer ou migration prévue ?
- Le champ `Present.listUID` est rempli mais n'est utile que pour cette ancienne collection.

## Architecture et conventions

- **Accès aux données** : uniquement via `src/repository/`. Les composants et les routes n'importent jamais `firebase/firestore` directement.
- **Chargement des données** : via le `loader` de la route ; après une écriture, rafraîchir avec `router.invalidate()`.
- **Protection des routes** : `beforeLoad: ({ context, location }) => isAuthenticated(context, location)`. Le contexte du routeur contient `auth` (le `UserProvider`), injecté dans `main.tsx`.
- **Contrôle propriétaire / invité·e** : fait dans le composant (redirection vers `/` si l'accès n'est pas autorisé).
- **Authentification** (`hooks/UserContext.tsx`) : l'utilisateurice Firebase est mis·e en cache dans `localStorage` (clé `wrapitup.user`). L'email doit être vérifié pour que la session soit restaurée. L'inscription crée aussi un document `profils`.
- **Formulaires** : react-hook-form + `Controller` + composant `Input` maison ; listes dynamiques avec `useFieldArray`.
- **Textes de l'interface en français**, en **écriture inclusive** avec le point médian (« utilisateurice », « invité·e », « supprimé•e »).
- **Formatage** : Prettier avec la config par défaut (`.prettierrc` vide). Lint avec **oxlint** (`.oxlintrc.json`, ESLint a été retiré le 8 novembre 2026) : catégories `correctness` (error) et `suspicious` (warn), plugins `typescript`, `react` (inclut les règles hooks et fast refresh), `import`, `promise`, `unicorn`, `oxc`. `no-shadow` et `promise/always-return` sont désactivées ; `react/only-export-components` est coupée dans `src/routes/**` (les fichiers de route exportent `Route`). `src/routeTree.gen.ts` est ignoré. Pour ignorer une règle ponctuellement : `// oxlint-disable-next-line <règle>` avec un commentaire qui explique pourquoi.
- **Nommage** : les noms d'entités suivent le code existant (`Profil` et non `Profile`, `Present` pour un cadeau).

## Migration hors de Mantine (en cours)

Objectif affiché dans `todo.md` : **supprimer Mantine**.

- Les composants maison se trouvent dans `src/components/<Nom>/<Nom>.tsx` + `<Nom>.css` : `Button`, `Input`, `Tabs`, `Banner`, `Table` (début : `Td.tsx` existe, `Table.tsx` et `Tr.tsx` sont encore vides).
- Style : CSS simple, classes au format **BEM** (`button__type--danger`, `button__size--small`) construites avec `classnames`, et variables de `src/theme.css` (`--primary-color`, `--danger-color`, `--padding-medium`…).
- Variantes communes : `type: "primary" | "danger" | "success"`, `size: "small" | "medium" | "large"`.
- Pour tout nouveau code, **privilégier les composants maison** plutôt que Mantine.
- **À préciser** : par quoi remplacer `notifications`, `Menu`, `ActionIcon` et les primitives de mise en page (`Container`, `Paper`, `Flex`, `SimpleGrid`, `Space`…) ?

## Points d'attention connus

- **Sécurité Firestore** : les règles autorisent tout·e utilisateurice connecté·e à lire et écrire **tous** les documents. Le secret des réservations n'est donc garanti que par l'interface. Le durcissement est détaillé dans `docs/security-audit.md` (§1).
- **`zod`** est importé dans `routes/login.tsx` mais n'apparaît pas dans `package.json` (il est probablement présent en dépendance transitive) : à ajouter explicitement.
- Bug connu (todo) : rejoindre une liste via `/invite/$listId` sans être connecté·e. La redirection passe par `/login?redirect=...`.
- Redirection dans le rendu d'un composant : utiliser `<Navigate to="/" />` (TanStack Router) plutôt que `return navigate(...)`, et appeler tous les hooks **avant** tout `return` conditionnel (vérifié par `react/rules-of-hooks`).

## Todo / feuille de route

Les chantiers de fond sont suivis dans `docs/`, avec leur ordre de traitement et leur avancement (cases à cocher) : les tenir à jour à chaque PR.

- `docs/upgrade-plan.md` : **plan d'upgrade des dépendances**, une étape = une PR (oxlint fait ; suivant : suppression des paquets inutilisés). Inclut la migration react-hook-form → TanStack Form et la suppression de Mantine.
- `docs/security-audit.md` : **audit de sécurité** du 8 novembre 2026, priorisé (🔴 règles Firestore ouvertes, XSS via l'URL d'un cadeau ; 🟠 jetons dans `localStorage`, email non vérifié au login, dépendances vulnérables, réservations concurrentes ; 🟡 config Firebase, en-têtes HTTP, CI…).

Certains points se recoupent (dépendances vulnérables, `zod`, paquets inutilisés, lint en CI) : cocher dans les deux fichiers.

Petites tâches, voir `todo.md`. À ce jour :
- Améliorer les pages hors `PrivateLayout` avec le nouveau composant `Page` (CSS)
- Supprimer Mantine (étape 5 du plan d'upgrade)
- Revoir l'UX du formulaire d'ajout de cadeaux (à faire avec l'étape 4 du plan d'upgrade)
- Corriger le bug quand on veut rejoindre une liste sans être connecté·e
