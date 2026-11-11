# Plan d'upgrade des dépendances

Établi le 8 novembre 2026. Une étape = une PR. Le projet n'a aucun test : chaque PR doit passer `npm run lint` et `npm run build` (vérifiés par la CI), puis un test manuel sur le canal de preview Firebase :

- inscription / connexion / mot de passe oublié
- création d'une liste, ajout et suppression de cadeaux
- invitation (`/invite/$listId`) puis réservation d'un cadeau

## Lien avec l'audit de sécurité

Voir `docs/security-audit.md`. Les étapes 2 et 3 traitent une partie du §5 (dépendances vulnérables) et du §11 (surface d'attaque) : lancer `npm audit --omit=dev` à la fin de l'étape 3 et cocher les cases correspondantes dans l'audit.

## Avancement

| #     | Étape                                                                      | Risque                 | État            |
| ----- | -------------------------------------------------------------------------- | ---------------------- | --------------- |
| 1     | ESLint → oxlint + lint dans la CI                                          | faible                 | ✅ fait (PR #2) |
| 1 bis | Prettier → oxfmt + `.nvmrc` (Node 24.16.0) dans la CI                      | faible                 | ✅ fait         |
| 2     | Suppression des paquets inutilisés, déclaration des dépendances manquantes | très faible            | ✅ fait         |
| 3     | Mises à jour mineures                                                      | faible                 | ✅ fait         |
| 4     | react-hook-form → TanStack Form (+ validation zod)                         | moyen                  | ✅ fait         |
| 5     | Suppression de Mantine                                                     | moyen, découpable      | ✅ fait         |
| 6     | React 18 → 19                                                              | faible après l'étape 5 | ✅ fait         |
| 7     | Vite 5 → 8                                                                 | faible à moyen         | ✅ fait         |
| 8     | Firebase 11 → 13                                                           | moyen                  | à faire         |
| 9     | uuid → `crypto.randomUUID`, TypeScript 7                                   | faible                 | à faire         |

Les versions « cibles » ci-dessous sont celles disponibles le 8 novembre 2026 : relancer `npm outdated` avant chaque étape.

---

## 1. ESLint → oxlint ✅

Fait dans la PR #2 : `.oxlintrc.json` remplace `eslint.config.js`, ESLint et ses 10 plugins / configs sont retirés, `npm run lint` (`oxlint --deny-warnings src`) est lancé par les deux workflows avant le build. Détail de la configuration dans `CLAUDE.md`.

Fait en premier pour avoir un garde-fou rapide et strict pendant les migrations suivantes.

## 1 bis. Prettier → oxfmt + `.nvmrc` ✅

- `.oxfmtrc.json` (migré depuis `.prettierrc` avec `oxfmt --migrate=prettier`, largeur 80) ; `prettier`, `.prettierrc` et `.prettierignore` retirés. Prettier reste présent en dépendance transitive (`@tanstack/router-generator`, `stylelint-prettier`).
- Scripts `format` / `format:check`, vérification du format dans les deux workflows.
- Reformatage global en un commit séparé, listé dans `.git-blame-ignore-revs`.
- `.nvmrc` = `24.16.0`, lu par `actions/setup-node` (`node-version-file`) dans les deux workflows : la CI utilise la même version de Node qu'en local.

## 2. Suppression des paquets inutilisés ✅

Fait : 22 paquets retirés (liste ci-dessous), `zod@^4.6.6` déclaré, import `@firebase/util` remplacé par `firebase/app`, `PresentRepository.ts` et `FileRepository.ts` supprimés. Pas de gain sur le bundle (les paquets retirés n'étaient pas importés, donc déjà absents du build) ; le gain est sur `npm ci` et la surface d'attaque.

Paquets **jamais importés** dans `src/` :

```bash
npm rm @mantine/carousel @mantine/charts @mantine/code-highlight @mantine/dates \
  @mantine/dropzone @mantine/form @mantine/modals @mantine/nprogress \
  @mantine/spotlight @mantine/tiptap @tiptap/extension-link @tiptap/pm \
  @tiptap/react @tiptap/starter-kit embla-carousel-react recharts \
  @tanstack/router-devtools sass-embedded \
  stylelint stylelint-config-recommended stylelint-config-standard stylelint-prettier
```

- Seuls `@mantine/core` et `@mantine/notifications` sont réellement utilisés.
- `sass-embedded` : aucun fichier `.scss`.
- `stylelint` : aucune configuration. À garder seulement si on lui écrit une config.

Dépendances **utilisées mais non déclarées** (présentes uniquement en transitif) :

- `npm i zod@^4.6.6` (importé dans `routes/login.tsx`). Directement en v4 : la version ≥ 4.6.6 corrige une vulnérabilité (voir `docs/security-audit.md` §5), et l'unique schéma (`z.object` / `z.optional`) est compatible.
- `@firebase/util` (importé dans `hooks/UserContext.tsx`) : remplacer par `import { FirebaseError } from "firebase/app"`.

Optionnel : supprimer le code mort `src/repository/PresentRepository.ts` et `src/repository/FileRepository.ts` (voir `CLAUDE.md`).

Bonus attendu : réduction du bundle (avertissement > 500 kB au build).

## 3. Mises à jour mineures ✅

Fait avec `npm update --save` + `npm audit fix` (plages de versions remontées dans `package.json`).

- `@tanstack/router-plugin` **épinglé en `~1.168.48`** : à partir de 1.169, le plugin exige Vite ≥ 6. À libérer à l'étape 7 (Vite 8).
- `vite.config.ts` : `tanstackRouter({ target: "react" })`, placé avant le plugin React ; `src/routeTree.gen.ts` régénéré.
- `utils/routeUtils.ts` : le routeur type désormais strictement `to` ; le paramètre `redirect` passe par `search` au lieu d'être concaténé dans l'URL (il est maintenant encodé).
- Bundle : 957 kB → 1 018 kB (nouvelle version du routeur).
- `npm audit --omit=dev` : 45 → 4 vulnérabilités, toutes dans `firebase` → `@grpc/grpc-js` (code Node, absent du bundle navigateur) ; corrigées à l'étape 8 (Firebase 13). Côté dev, `esbuild` (serveur de dev) sera corrigé par l'étape 7.

`npm update` (pas de changement de version majeure) :

| Paquet                                              | Version au 8/11/2026 → cible |
| --------------------------------------------------- | ---------------------------- |
| `@tanstack/react-router`, `@tanstack/router-plugin` | 1.82 → 1.170                 |
| `firebase`                                          | 11.0 → 11.10                 |
| `@tabler/icons-react`                               | 3.22 → 3.51                  |
| `@mantine/core`, `@mantine/notifications`           | 7.14 → 7.17                  |
| `typescript`                                        | 5.7 → 5.9                    |
| `vite`                                              | 5.4.11 → 5.4.21              |
| `dayjs`, `postcss`, `uuid`                          | correctifs                   |

Point d'attention : `@tanstack/router-plugin` a renommé son export Vite (`TanStackRouterVite` → `tanstackRouter`) ; l'ancien nom est déprécié. Mettre à jour `vite.config.ts` et laisser le plugin régénérer `src/routeTree.gen.ts`.

## 4. react-hook-form → TanStack Form ✅

Fait (`@tanstack/react-form` 1.33, `react-hook-form` retiré) :

- `hooks/useAppForm.ts` (`createFormHook`) avec les composants maison `components/Form/` : `Form` (`noValidate`, appelle `handleSubmit`), `TextField` (branché sur `Input`, affiche la première erreur), `SubmitButton` (chargement via `isSubmitting`).
- Validation zod sur tous les formulaires, en `revalidateLogic()` : à l'envoi, puis à chaque saisie. Règles communes dans `utils/formSchemas.ts`. Le lien d'un cadeau doit être vide ou en `http(s)://` (cf. audit §2) : un lien existant sans protocole bloque l'enregistrement de la liste avec un message sur le champ.
- `ListFormPresents` passe par `withForm` + `listFormOptions` partagées avec `ListForm`.
- Mantine retiré au passage de ces fichiers : `SimpleGrid` / `Space` → CSS (`.form`, `.form__actions`, `login.css`), `Table` / `Text` → composant maison `components/Table` (simple, réutilisable pour `ListTable` et `ListUserForm`). Les `notifications` Mantine sont conservées (étape 5).
- `new.tsx` : le formulaire ne contient plus que le titre, la liste est construite à l'envoi.
- `Input` : prop `onBlur`, type `url`, `htmlFor` sur le label, style d'erreur.
- L'UX du formulaire de cadeaux (todo) n'a pas été revue : seule la technique a changé.

Paquet : `@tanstack/react-form` (v1). 7 fichiers, du plus simple au plus complexe :

1. `routes/reset-password.tsx`, `routes/new.tsx`
2. `routes/login.tsx`, `routes/register.tsx`, `routes/account.tsx`
3. `components/ListEdit/ListForm.tsx` + `ListFormPresents.tsx` (tableau dynamique de cadeaux)

Constat : aucune validation react-hook-form n'est utilisée aujourd'hui (pas de `rules`, pas de resolver). `errors.email` / `errors.password` ne sont donc jamais remplis et les messages d'erreur ne s'affichent jamais ; seule la validation HTML (`required`) fonctionne.

Correspondances :

| react-hook-form                                | TanStack Form                                                                                                                                                   |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useForm({ defaultValues })`                   | `useForm({ defaultValues, onSubmit: async ({ value }) => … })`                                                                                                  |
| `<Controller name render>`                     | `<form.Field name>{(field) => <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} />}</form.Field>` |
| `handleSubmit(fn)`                             | `onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}`                                                                                                |
| `useFieldArray` (`fields`, `append`, `remove`) | `<form.Field name="presents" mode="array">` + `field.pushValue()` / `field.removeValue(i)`, sous-champs `presents[${i}].title`                                  |
| `watch("x")`                                   | `useStore(form.store, (s) => s.values.x)`                                                                                                                       |
| `formState.errors`                             | `field.state.meta.errors` + `validators: { onChange: schemaZod }` (Standard Schema, pas d'adaptateur)                                                           |
| `loading` géré à la main                       | `form.state.isSubmitting` via `<form.Subscribe>`                                                                                                                |

Recommandations :

- Créer un `useAppForm` avec `createFormHook` et un champ `TextField` branché sur le composant `Input` maison, pour éviter de répéter le câblage `value` / `onChange` partout.
- Profiter de la migration pour ajouter une vraie validation zod (email, mot de passe, titre obligatoire).
- `ListFormPresents` : utiliser `present.id` (uuid) comme `key` React, `useFieldArray` ne fournissant plus d'`id` interne.
- À combiner avec le point de la todo « Revoir l'UX du formulaire d'ajout de cadeaux ».
- Retirer `react-hook-form` à la fin et mettre à jour `CLAUDE.md` (section Formulaires).

## 5. Suppression de Mantine ✅

Fait en une PR. `@mantine/*`, `postcss`, `postcss-preset-mantine`, `postcss-simple-vars` et `.postcss.config.cjs` retirés.

- Nouveaux composants maison : `Toast` (provider + `useToast`), `Menu`, `Header`, `Card`, `Badge` ; `Title` gagne `actions`, `Table` gagne `striped` / `highlightOnHover`, `Button` gagne `ariaLabel`.
- Reset CSS de base dans `theme.css` (remplace celui de Mantine) ; couleurs de l'en-tête et de la navigation reprises de la palette Mantine pour garder le rendu.
- `Page` : classe `card` renommée `page` (le nom `card` sert au nouveau composant `Card`).
- Correctif : `Button` est en `type="button"` par défaut. Avant, dans un formulaire, « Ajouter un cadeau » et la corbeille soumettaient aussi le formulaire.
- Audit §2 : le lien d'un cadeau n'est affiché que s'il est en http(s), avec `rel="noopener noreferrer"`.
- Bundle : CSS 198 kB → 8 kB, JS 1 042 kB → 890 kB.

Plan initial, pour mémoire :

**Ne pas monter Mantine en 8 / 9** : ce serait migrer du code destiné à disparaître. Le retirer avant React 19.

État au 8/11/2026 : `@mantine/core` importé dans 15 fichiers, `@mantine/notifications` dans 5.

Ordre suggéré (une ou plusieurs PRs) :

1. Primitives de mise en page (`Flex`, `Space`, `SimpleGrid`, `Box`, `Group`) → CSS ou composants maison (`Grid` existe déjà)
2. `Table` → terminer `components/Table` (`Table.tsx` et `Tr.tsx` sont vides)
3. `Text`, `Anchor`, `Badge`, `Card`, `Image`
4. `ActionIcon` → `Button` avec la prop `icon` (déjà utilisé dans `ListFormPresents`)
5. `Menu` → `<details>` ou l'API `popover` native
6. `notifications` → petit composant toast maison + contexte
7. Retirer `MantineProvider` (`main.tsx`), `@mantine/*`, `postcss-preset-mantine`, `postcss-simple-vars` et `.postcss.config.cjs`

Conventions des composants maison : voir la section « Migration hors de Mantine » de `CLAUDE.md`.

## 6. React 18 → 19 ✅

Fait : `react` / `react-dom` 19.3, `@types/react` / `@types/react-dom` 19.3. Le codemod `types-react-codemod preset-19` n'a modifié qu'un fichier (`ReactElement` → `ReactElement<any>` dans `UserContext.tsx`), remplacé par `PropsWithChildren` (oxlint interdit `any`). Pas de `forwardRef`, `defaultProps` ni `propTypes` dans le code. Toutes les dépendances acceptent React 19 sans conflit de peer. Bundle : 890 kB → 971 kB (React 19 est plus lourd).

- `react`, `react-dom`, `@types/react`, `@types/react-dom` en v19
- Codemod : `npx types-react-codemod preset-19`
- Points d'attention : `ref` devient une prop normale (plus besoin de `forwardRef`), `useRef` exige un argument, `defaultProps` supprimé sur les composants fonctions.

## 7. Vite 5 → 8 ✅

Fait : `vite` 8.3, `@vitejs/plugin-react` 6.3, `@tanstack/router-plugin` libéré (`^1.169`, plus d'épinglage). Aucune modification de `vite.config.ts` nécessaire. Build 2,6 s → 0,9 s, JS 971 kB → 819 kB. La vulnérabilité `esbuild` (serveur de dev) disparaît : il ne reste que `@grpc/grpc-js` via Firebase (étape 8).

- `vite@8` (bundler Rolldown) et `@vitejs/plugin-react@6`. Node ≥ 20.19 requis.
- La version de Node est fixée par `.nvmrc` (24.16.0, utilisé par la CI) : compatible.
- Vérifier le build et le plugin TanStack Router.

## 8. Firebase 11 → 13

- Lire les notes de version des v12 et v13 (version minimale de Node, API dépréciées).
- L'app utilise surtout l'auth email / mot de passe et Firestore `doc` / `setDoc` / `getDocs` / `query` / `where`, des API stables.
- Tester à la main : connexion, inscription, vérification de l'email, réservation.

## 9. Le reste

- **uuid** : plutôt que de passer en v14, le supprimer et utiliser `crypto.randomUUID()` (3 usages : `ListForm.tsx`, `UserContext.tsx`, `new.tsx`).
- **TypeScript 7** (compilateur natif en Go) : en dernier. Vérifier d'abord la compatibilité avec le plugin TanStack Router. Rester en 5.9 en attendant.
