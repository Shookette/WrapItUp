# Wrap It Up — Guide du projet

Application web de **listes de cadeaux partagées**. Un·e utilisateurice crée une liste, y ajoute des cadeaux, puis partage un lien d'invitation. Les invité·es peuvent consulter la liste et **réserver** des cadeaux ; le ou la propriétaire de la liste ne voit pas ce qui est réservé (« C'est un secret »).

> Les sections marquées **À préciser** sont des points que le code ne permet pas de trancher : à compléter au fil de l'eau.

## Stack

- **Node 24.16.0**, fixé par `.nvmrc` (`nvm use`) et utilisé par la CI (`actions/setup-node`)
- **React 19** + **TypeScript 7** (compilateur natif) + **Vite 8** (bundler Rolldown)
- **TanStack Router** (routage par fichiers, plugin Vite `tanstackRouter`) — `src/routeTree.gen.ts` est **généré automatiquement, ne jamais le modifier à la main**
- **Firebase 13** : Auth (email / mot de passe), Firestore, Hosting
- **TanStack Form** pour tous les formulaires (`useAppForm` + composants maison), validation par schémas **zod**
- Composants et CSS **maison** (voir « Composants et style »), icônes **@tabler/icons-react**
- **zod 4** pour valider les formulaires et les paramètres de recherche des routes (`validateSearch`)
- `crypto.randomUUID()` pour générer les identifiants, `dayjs` pour les dates, `classnames` pour les classes CSS

## Commandes

```bash
npm run dev           # serveur de développement Vite
npm run build         # tsc + vite build (sortie dans dist/)
npm run lint          # oxlint sur src/, 0 warning toléré (--deny-warnings)
npm run format        # oxfmt : formate tout le projet
npm run format:check  # oxfmt --check : vérifie sans modifier
npm run preview       # prévisualiser le build
```

Il n'y a **aucun test** dans le projet pour l'instant. Après une modification, vérifier au minimum `npm run format`, `npm run lint` et `npm run build` (le typage TS fait office de garde-fou).

Le format et le lint **sont vérifiés par la CI** avant le build (`npm ci && npm run format:check && npm run lint && npm run build`) : un fichier mal formaté ou un warning fait échouer le déploiement. Le build affiche un avertissement : bundle JS > 500 kB (~1 Mo, dont 1,3 Mo de sources Firestore).

## Déploiement

- **Push sur `main` → déploiement automatique en production** sur Firebase Hosting (`.github/workflows/firebase-hosting-merge.yml`).
- Chaque **pull request** déploie un canal de prévisualisation (`firebase-hosting-pull-request.yml`).
- Projet Firebase : `wrap-it-up-2d42a`. La config client est dans `src/firebaseLoader.ts` (clé API publique par nature côté web).
- Les règles Firestore (`firestore.rules`) ne sont **pas** déployées par la CI : il faut passer par `firebase deploy --only firestore:rules`.

## Arborescence

```
src/
  main.tsx              # point d'entrée : providers (Toast, Firebase, UserProvider) + routeur
  firebaseLoader.ts     # initialisation Firebase
  theme.css             # variables CSS globales (couleurs, tailles, espacements)
  routes/               # une route = un fichier (TanStack Router)
  components/           # composants UI (maison + layouts)
  hooks/UserContext.tsx # contexte d'authentification
  hooks/useAppForm.ts   # hook de formulaire (TanStack Form createFormHook)
  repository/           # TOUT accès à Firestore passe par ici
  interfaces/           # types métier (List, Present, Profil)
  utils/routeUtils.ts   # garde d'authentification des routes
  utils/formSchemas.ts  # règles zod partagées (email, champ obligatoire, lien http(s))
  utils/url.ts          # isHttpUrl : vérifier un lien avant de l'afficher
```

## Routes

| Route                                    | Rôle                                                             | Accès                   |
| ---------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| `/`                                      | « Mes listes » : listes dont je suis propriétaire                | connecté                |
| `/lists`                                 | « Listes de cadeaux » : listes auxquelles j'ai été invité·e      | connecté                |
| `/new`                                   | Création d'une liste (titre seul, puis redirection vers `/edit`) | connecté                |
| `/edit/$listId`                          | Édition : onglets Cadeaux / Utilisateurices / Danger zone        | propriétaire uniquement |
| `/list/$listId`                          | Consultation et réservation des cadeaux                          | invité·e uniquement     |
| `/invite/$listId`                        | Page d'invitation, bouton « Rejoindre la liste »                 | connecté                |
| `/login`, `/register`, `/reset-password` | Authentification                                                 | public                  |
| `/account`                               | Compte utilisateurice                                            | connecté                |

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
{
  id: string;
  userUID: string;
  username: string;
}
```

Attention : l'identifiant du document (`id`, uuid aléatoire) **n'est pas** l'uid de l'utilisateurice. On retrouve un profil via `where("userUID", "==", uid)` (`getById` dans `ProfilRepository`).

### Vestiges à connaître

- Les cadeaux vivent dans `lists.presents`. Une ancienne collection `presents` séparée (et un `FileRepository` pour Firebase Storage) existait : le code a été supprimé à l'étape 2 du plan d'upgrade.
- Le champ `Present.listUID` est encore rempli mais n'était utile que pour cette ancienne collection.

## Architecture et conventions

- **Accès aux données** : uniquement via `src/repository/`. Les composants et les routes n'importent jamais `firebase/firestore` directement.
- **Chargement des données** : via le `loader` de la route ; après une écriture, rafraîchir avec `router.invalidate()`.
- **Protection des routes** : `beforeLoad: ({ context, location }) => isAuthenticated(context, location)`. Le contexte du routeur contient `auth` (le `UserProvider`), injecté dans `main.tsx`.
- **Contrôle propriétaire / invité·e** : fait dans le composant (redirection vers `/` si l'accès n'est pas autorisé).
- **Authentification** (`hooks/UserContext.tsx`) : l'utilisateurice Firebase est mis·e en cache dans `localStorage` (clé `wrapitup.user`). L'email doit être vérifié pour que la session soit restaurée. L'inscription crée aussi un document `profils`.
- **Formulaires** : TanStack Form via `useAppForm` (`src/hooks/useAppForm.ts`) :
  ```tsx
  const form = useAppForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic(), // valide à l'envoi, puis à chaque saisie
    validators: { onDynamic: z.object({ email: emailSchema }) },
    onSubmit: async ({ value }) => { … },
  });
  <form.AppForm>
    <form.Form>
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" type="email" required />}
      </form.AppField>
      <form.SubmitButton>Envoyer</form.SubmitButton>
    </form.Form>
  </form.AppForm>
  ```
  - `form.Form` désactive la validation native (`noValidate`) : les messages viennent des schémas zod (règles communes dans `utils/formSchemas.ts`). `required` sur un champ n'affiche que l'astérisque.
  - `form.SubmitButton` affiche le chargement pendant `onSubmit` (pas de `useState` de chargement).
  - Tableaux : `<form.Field name="presents" mode="array">` + `pushFieldValue` / `removeValue`, sous-champs `presents[${i}].title`, `key` = `present.id`.
  - Un sous-composant qui reçoit le formulaire se crée avec `withForm` et des options partagées (`formOptions`), voir `ListEdit/listFormOptions.ts`.
  - Un schéma zod doit avoir le même type d'entrée que les valeurs du formulaire : décrire tous les champs, alignés sur `interfaces/` avec `satisfies z.ZodType<T, T>` (le build casse si l'interface change).
- **Imports** : alias natif unique `#/*` → `src/*` (champ `imports` de `package.json`, résolu par TypeScript 7 et Vite sans configuration) : `#/components/Button/Button.tsx`, `#/hooks/UserContext.tsx`, `#/main.tsx`. Toujours **avec l'extension**, l'alias ne la devine pas. Les imports dans le même dossier restent relatifs (`./Button.css`).
- **Composants** : typer `children` avec `PropsWithChildren<…>` plutôt qu'un `children: ReactNode` à la main.
- **Textes de l'interface en français**, en **écriture inclusive** avec le point médian (« utilisateurice », « invité·e », « supprimé•e »).
- **Formatage** : **oxfmt** (`.oxfmtrc.json`, remplace Prettier depuis le 8 novembre 2026, sortie compatible Prettier), largeur 80, `src/routeTree.gen.ts` et `package-lock.json` ignorés. Le commit de reformatage global est listé dans `.git-blame-ignore-revs` (`git config blame.ignoreRevsFile .git-blame-ignore-revs`).
- **Lint** : **oxlint** (`.oxlintrc.json`, ESLint a été retiré le 8 novembre 2026) : catégories `correctness` (error) et `suspicious` (warn), plugins `typescript`, `react` (inclut les règles hooks et fast refresh), `import`, `promise`, `unicorn`, `oxc`. `no-shadow` et `promise/always-return` sont désactivées ; `react/only-export-components` est coupée dans `src/routes/**` (les fichiers de route exportent `Route`). `src/routeTree.gen.ts` est ignoré. Pour ignorer une règle ponctuellement : `// oxlint-disable-next-line <règle>` avec un commentaire qui explique pourquoi.
- **Nommage** : les noms d'entités suivent le code existant (`Profil` et non `Profile`, `Present` pour un cadeau).

## Composants et style

Pas de bibliothèque de composants : Mantine a été retiré (étape 5 du plan d'upgrade). Tout est fait maison.

- Les composants se trouvent dans `src/components/<Nom>/<Nom>.tsx` + `<Nom>.css` :
  - mise en page : `Page` (carte blanche centrale, `size`), `Center`, `Grid`, `Card`, `Title` (prop `actions` pour un bouton à droite), `Header` (bandeau du haut) ;
  - éléments : `Button` (`icon` seul + `ariaLabel` pour un bouton icône), `Badge`, `Banner`, `Tabs`, `Menu` (menu déroulant : `icon`, `label`, `items`) ;
  - `Table` : `headers`, lignes en `children` avec les classes `table__row` / `table__cell` (`table__cell--clickable`), `emptyMessage` affiché quand il n'y a aucune ligne, `striped`, `highlightOnHover` ;
  - `Form` (`Form`, `TextField`, `SubmitButton`), utilisés via `useAppForm` ;
  - `Toast` : notifications. `ToastProvider` est dans `main.tsx` ; dans un composant, `const toast = useToast(); toast.show({ type: "success", title?, message })` (`type` : `info` par défaut, `success`, `danger`).
- Style : CSS simple, classes au format **BEM** (`button__type--danger`, `button__size--small`) construites avec `classnames`, et variables de `src/theme.css` (`--primary-color`, `--padding-medium`, `--font-size-small`, `--shadow-large`…) : pas de valeur d'espacement, de taille de texte, d'arrondi ou d'ombre en dur. Une dimension propre à un composant devient une variable locale sur son bloc (`.header { --header-height: 100px; }`). `theme.css` contient aussi le reset CSS de base (`box-sizing`, police, `body`).
- Le CSS propre à une route va dans un fichier à côté (`routes/login.css`, `routes/list.css`).
- Variantes communes : `type: "primary" | "danger" | "success"`, `size: "small" | "medium" | "large"`.
- `Button` est en `type="button"` par défaut : seul `isSubmit` envoie un formulaire.
- Un lien saisi par un·e utilisateurice ne s'affiche qu'après `isHttpUrl()` (`utils/url.ts`), avec `rel="noopener noreferrer"`.

## Points d'attention connus

- **Sécurité Firestore** : les règles autorisent tout·e utilisateurice connecté·e à lire et écrire **tous** les documents. Le secret des réservations n'est donc garanti que par l'interface. Le durcissement est détaillé dans `docs/security-audit.md` (§1).
- Bug connu (todo) : rejoindre une liste via `/invite/$listId` sans être connecté·e. La redirection passe par `/login?redirect=...`.
- Redirection dans le rendu d'un composant : utiliser `<Navigate to="/" />` (TanStack Router) plutôt que `return navigate(...)`, et appeler tous les hooks **avant** tout `return` conditionnel (vérifié par `react/rules-of-hooks`).

## Todo / feuille de route

Les chantiers de fond sont suivis dans `docs/`, avec leur ordre de traitement et leur avancement (cases à cocher) : les tenir à jour à chaque PR.

- `docs/upgrade-plan.md` : **plan d'upgrade des dépendances**, une étape = une PR (toutes les étapes sont faites).
- `docs/security-audit.md` : **audit de sécurité** du 8 novembre 2026, priorisé (🔴 règles Firestore ouvertes, XSS via l'URL d'un cadeau ; 🟠 jetons dans `localStorage`, email non vérifié au login, dépendances vulnérables, réservations concurrentes ; 🟡 config Firebase, en-têtes HTTP, CI…).

Certains points se recoupent (dépendances vulnérables, `zod`, paquets inutilisés, lint en CI) : cocher dans les deux fichiers.

Petites tâches, voir `todo.md`. À ce jour :

- Améliorer les pages hors `PrivateLayout` avec le nouveau composant `Page` (CSS)
- Revoir l'UX du formulaire d'ajout de cadeaux (à faire avec l'étape 4 du plan d'upgrade)
- Corriger le bug quand on veut rejoindre une liste sans être connecté·e
