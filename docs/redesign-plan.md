# Plan de refonte graphique (mobile d'abord)

Établi le 13 novembre 2026, d'après les maquettes : https://claude.ai/artifact/1nKLDwHvpzYVHv2TCGvt4N (téléphone 390 px et pages bureau fluides).

Une étape = une PR. Chaque PR passe `npm run format`, `npm run lint`, `npm run test:rules` et `npm run build`, puis un test manuel sur le canal de preview, **sur un vrai téléphone** (Safari iOS et Chrome Android si possible) et sur ordinateur.

## Avancement

| #   | Étape                                                   | Risque      | État    |
| --- | ------------------------------------------------------- | ----------- | ------- |
| 0   | Assets et `index.html` (favicon, manifest, theme-color) | très faible | ✅ fait |
| 1   | Thème : variables, polices, contrastes                  | faible      | ✅ fait |
| 2   | Mise en page : barre du haut, navigation mobile/bureau  | moyen       | ✅ fait |
| 3   | Composants de base (Button, Tabs, champs, ListItem…)    | moyen       | ✅ fait |
| 4   | « Mes listes » et « Listes de cadeaux »                 | faible      | ✅ fait |
| 5   | Édition : onglets Cadeaux et Invité·es                  | moyen       | ✅ fait |
| 6   | Ajout / modification d'un cadeau (panneau + dialog)     | **élevé**   | ✅ fait |
| 7   | Consultation et réservation (invité·e)                  | moyen       | ✅ fait |
| 8   | Invitation et pages d'authentification                  | faible      | ✅ fait |
| 9   | Nettoyage (anciens composants, variables, assets)       | faible      | ✅ fait |

L'étape 6 est la seule qui change le fonctionnement (voir plus bas) : la faire après les autres écrans d'édition, ou en même temps que la tâche « Revoir l'UX du formulaire d'ajout de cadeaux » de `todo.md`.

---

## Principes communs

- **Mobile d'abord** : le CSS de base vise le téléphone, la version bureau s'ajoute avec `@media (--desktop)` (768 px, défini une fois dans `src/media.css` par `@custom-media`, voir `docs/adr/0013-point-de-rupture-unique-768px.md`). Un seul point de rupture suffit pour toutes les maquettes.
- **Largeur du contenu** : `max-width: 1120px; margin-inline: auto; padding-inline: var(--padding-medium)` au lieu des largeurs en % de `Page` (`35%`, `40%`, `60%`), illisibles sur téléphone.
- **Zones tactiles** : 44 px minimum pour tout ce qui est cliquable (boutons icônes compris).
- **Champs** : `font-size` d'au moins 16 px sur mobile, sinon Safari iOS zoome au focus.
- **Bas d'écran** : la barre de navigation et les barres d'action collées en bas ajoutent `padding-bottom: env(safe-area-inset-bottom)`, et `index.html` passe en `viewport-fit=cover`.
- **Accessibilité** : de vrais `<button>` et `<a>`, jamais de `onClick` sur un `span` (c'est le cas de `Tabs` aujourd'hui), `aria-label` sur les boutons icônes (déjà prévu par `Button`).
- **Textes** : vouvoiement et écriture inclusive, comme aujourd'hui.

---

## 0. Assets et `index.html`

Fichiers ajoutés :

| Fichier                       | Rôle                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| `src/assets/logo.svg`         | logo (cadeau blanc sur carré rouge arrondi), pour l'en-tête et la connexion        |
| `public/favicon.svg`          | favicon (même dessin), remplace `vite.svg`                                         |
| `public/apple-touch-icon.png` | icône d'écran d'accueil iOS, 180×180, sans arrondi (iOS l'applique)                |
| `public/icon-192.png`         | icône Android / PWA                                                                |
| `public/icon-512.png`         | icône Android / PWA (sert aussi de `maskable` : le dessin tient dans la zone sûre) |
| `public/manifest.webmanifest` | nom, couleurs, icônes : permet « Ajouter à l'écran d'accueil »                     |

Le dessin du cadeau est celui de `IconGift` (@tabler/icons-react). Pour l'afficher en blanc sur fond rouge dans l'interface, `IconGift` suffit aussi.

À faire :

- [x] `index.html` :
  ```html
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="theme-color" content="#C8302F" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, viewport-fit=cover"
  />
  <meta
    name="description"
    content="Des listes de cadeaux à partager, sans gâcher la surprise."
  />
  ```
- [x] Supprimer `public/vite.svg` et `src/assets/react.svg` (inutilisés).
- [x] `src/assets/home.png` supprimé avec `Header` (étape 8).

## 1. Thème

### Polices

Inter (texte) et Bricolage Grotesque (titres). **Les héberger soi-même** plutôt que de passer par Google Fonts : rien ne part chez un tiers, et la future CSP (audit §9) n'a pas besoin d'autoriser `fonts.googleapis.com` / `fonts.gstatic.com`.

```bash
npm i @fontsource-variable/inter @fontsource-variable/bricolage-grotesque
```

```ts
// main.tsx, avant theme.css
import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/bricolage-grotesque/index.css";
```

Noms des familles : `"Inter Variable"` et `"Bricolage Grotesque Variable"`. Les deux paquets sont en version 5.3.0 au 13 novembre 2026.

### Variables (`theme.css`)

Valeurs reprises des maquettes. Les commentaires du bloc ci-dessous documentent les valeurs : **ne pas les recopier** dans `theme.css` (règle « pas de commentaires », non lintée pour le CSS). On garde les noms existants autant que possible, pour limiter les changements dans les composants.

```css
:root {
  /* Fonds et texte */
  --background-color: #fff8f5; /* fond des pages (nouveau) */
  --white: #ffffff; /* cartes, panneaux */
  --text-color: #1e1a1d;
  --dimmed-color: #6a6168; /* était #868e96 : contraste 3,3:1, insuffisant */
  --border-color: #d9cbc6; /* bordure des champs et boutons secondaires */
  --divider-color: #f3eae6; /* séparateurs entre lignes (nouveau) */
  --segmented-color: #f3e8e4; /* fond des onglets (nouveau) */

  /* Couleur principale : le rouge du bandeau, assombri pour le texte blanc */
  --primary-color: #c8302f; /* boutons ; était #3da9fc */
  --primary-hover-color: #a3201f;
  --primary-soft-color: #fde7e5; /* fond d'icône, élément de menu actif */
  --link-color: #b4262b;

  /* États */
  --success-color: #06676a; /* « Réservé par vous », bloc d'invitation */
  --success-soft-color: #ddf1ef;
  --info-color: #24427f; /* encart « C'est un secret » */
  --info-soft-color: #e7eefb;
  --warning-color: #8a5a00;
  --warning-soft-color: #fff0d6;
  --danger-color: #b4262b;
  --danger-soft-color: #fff6f5; /* fond d'un champ en erreur */
  --neutral-soft-color: #ede6e3; /* badge « Déjà réservé » */

  /* Polices */
  --font-family:
    "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  --font-family-title: "Bricolage Grotesque Variable", var(--font-family);
  --font-size-title: 1.875rem; /* 30 px, titre de page mobile */
  --font-size-title-large: 2.25rem; /* 36 px, titre de page bureau */

  /* Arrondis */
  --border-radius-small: 10px; /* était 6px */
  --border-radius: 14px; /* champs, boutons ; était 10px */
  --border-radius-large: 20px; /* cartes */
  --border-radius-sheet: 24px; /* panneau du bas */

  /* Ombres (teintées avec la couleur du texte) */
  --shadow-small: 0 1px 3px rgba(30, 26, 29, 0.08);
  --shadow-medium: 0 6px 24px rgba(30, 26, 29, 0.1);
  --shadow-large: 0 12px 40px rgba(30, 26, 29, 0.14); /* Page, Toast */
  --shadow-sheet: 0 -8px 30px rgba(30, 26, 29, 0.18); /* panneau du bas */
  --overlay-color: rgba(30, 26, 29, 0.45);

  /* Tailles des contrôles */
  --touch-target: 44px;
  --control-height: 52px; /* champs et boutons principaux sur mobile */
  --control-height-desktop: 48px;
}
```

- [x] Mettre à jour `theme.css`, `body { background-color: var(--background-color); font-family: var(--font-family); }`, `h1, h2 { font-family: var(--font-family-title); }`, `a { color: var(--link-color); }`.
- [x] `--input-color`, `--placeholder-color`, `--green` et les anciens fonds de `Banner` remplacés (`--border-color`, `--dimmed-color`, `--success-soft-color`, `--danger-soft-color`) ; `--border-width` (1,5 px) ajoutée.
- [x] Supprimer `--header-color`, `--nav-color`, `--nav-link-color` (fait à l'étape 8).

### Actions dangereuses (tranché le 22 novembre 2026)

La couleur principale et `danger` sont toutes deux rouges. Règle : **le rouge plein est réservé à l'action principale, une action dangereuse n'est jamais pleine.**

| Variante               | Apparence                                                   | Exemples                                       |
| ---------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `primary`              | fond rouge plein, texte blanc, une seule par écran          | Ajouter un cadeau, Réserver, Se connecter      |
| `danger`               | fond blanc, bordure et texte rouges, icône à gauche         | Supprimer la liste, Supprimer mon compte       |
| bouton icône dangereux | rond, transparent, icône grise, rouge au survol et au focus | corbeille d'un cadeau, ✕ retirer un·e invité·e |

- Le libellé dit l'action (« Supprimer la liste » plutôt que « Supprimer ») et porte une icône (`IconTrash`, `IconX`, `IconLogout2`) : la différence ne repose pas que sur la couleur.
- Dans un dialog de confirmation, le bouton qui confirme peut être plein : c'est la seule action, la question est juste au-dessus.
- Bandeaux et toasts d'erreur : fond `--danger-soft-color`, texte `--danger-color`, icône. L'onglet « Danger zone » : texte rouge.
- Un état n'est pas une action : le bouton rouge d'un cadeau réservé (`list.$listId.tsx`) devient un badge à l'étape 7.
- [x] `button__type--danger` en contour (étape 1).
- [x] Boutons icônes discrets (étapes 3 et 5), badges de réservation (étape 7).

Contrastes vérifiés : blanc sur `#C8302F` : 5,4:1 ; `#6A6168` sur blanc : 6:1 (5,7:1 sur le fond `#FFF8F5`) ; `#06676A` sur `#DDF1EF` : 5,7:1.

## 2. Mise en page

Aujourd'hui : `Header` (bandeau rouge de 100 px avec `home.png`), puis la barre rose de `PrivateLayout`, puis `Center` (`padding: 4rem`, trop large sur téléphone).

Cible :

| Écran  | < 768 px                                                                                       | ≥ 768 px                                                                        |
| ------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Listes | barre du haut (logo + nom), **barre de navigation en bas** : Mes listes / Invitations / Compte | barre du haut blanche : logo, liens en pastilles, avatar (menu Compte) à droite |
| Détail | barre du haut avec ← retour, titre, action ; **pas** de barre de navigation                    | même barre du haut que les listes, lien « ← Mes listes » au-dessus du titre     |

- [x] Barre du haut (`app-bar`, dans `PrivateLayout`) : sur mobile, logo + nom, ou « ← retour » sur une page de détail ; sur bureau, logo, liens en pastilles et menu Compte (avatar). Pas de composant `AppBar` séparé : le titre et les actions de la page restent dans `Title`, en dessous.
- [x] `BottomNav` mobile (Mes listes / Invitations / Compte), affichée ou cachée en CSS selon la media query.
- [x] Lien actif : `Link activeProps={{ "aria-current": "page" }}`, stylé par `[aria-current="page"]`.
- [x] Pages de détail : prop `back` de `PrivateLayout` (`/edit`, `/new` → Mes listes, `/list` → Invitations) : lien retour, pas de barre du bas.
- [x] `main` : `padding-bottom` = hauteur de la barre du bas + safe area ; largeur `max-width: 1120px`. `Page` passe en `width: 100%` + `max-width` (420 / 640 px, `lg` sans limite) au lieu des largeurs en %.
- [x] « Compte » : en bas sur mobile, menu sur l'avatar sur bureau ; bouton « Se déconnecter » ajouté sur `/account` (sinon inaccessible sur mobile). Variante `secondary` de `Button` ajoutée pour l'occasion.
- [x] `Header` retiré de la racine, gardé provisoirement sur les pages d'authentification jusqu'à l'étape 8.

## 3. Composants de base

- [x] **Button** : hauteur `--control-height` (`--control-height-desktop` au-dessus de 768 px), `small` à 44 px, `border-radius: var(--border-radius)`, `font-weight: 600`, survol et focus visibles, `aria-busy` pendant le chargement. Variante `secondary` (étape 2), prop `fullWidth`. Les classes sont construites par `buttonClassNames()` (`Button/buttonClassNames.ts`), à réutiliser sur un `<Link className={buttonClassNames({ … })}>`.
- [x] **Bouton icône** (`icon` seul + `ariaLabel`) : 44×44, rond, transparent, icône grise ; en `danger`, rouge au survol et au focus. Corbeille d'un cadeau et ✕ « Retirer … » d'un·e invité·e passés dans ce style (le bouton corbeille des cadeaux n'avait pas d'`aria-label`).
- [x] **Tabs → contrôle segmenté** : `role="tablist"`, `<button role="tab" aria-selected>`, panneau `role="tabpanel"`, flèches gauche / droite, Début / Fin. Props `label` (nom du groupe), `danger` (onglet en rouge) et `shortTitle` (libellé sur mobile : « Danger »). Onglet « Utilisateurices » renommé « Invité·es ».
- [x] **Champs** (`Input`, `TextField`) : hauteur `--control-height`, texte à 16 px, bordure 1,5 px, focus rouge avec halo, erreur (`aria-invalid`) en bordure et fond rouges, message avec `IconAlertCircle` lié par `aria-describedby` (avec la description). Prop `autoComplete` ajoutée (servira à l'étape 8).
- [x] **Banner** : fonds doux, variantes `info` (« C'est un secret ») et `warning` en plus de `success` / `danger`.
- [x] **Badge** : fonds doux, casse normale, prop `icon`, variante `neutral` (« Déjà réservé »).
- [x] **Card** : arrondi `--border-radius-large`, bordure `--divider-color`.
- [x] **ListItem / carte de liste** (nouveau, fait à l'étape 4) : icône sur fond doux 48×48, titre + sous-titre, chevron ; c'est un `<Link>` entier, avec une `action` facultative à côté (un bouton ne peut pas être dans un lien).
- [x] **Table** : remplacée par des listes `<ul>` en cartes, composant supprimé à l'étape 6.

Contrastes des fonds doux vérifiés (≥ 4,5:1) : `--primary-color` sur `--primary-soft-color` 4,5:1, `--dimmed-color` sur `--neutral-soft-color` 4,8:1 et sur `--segmented-color` 5:1, `--warning-color` 5,3:1, `--danger-color` 6:1, `--info-color` 8,3:1.

### Icônes

Tout existe dans `@tabler/icons-react`, rien à dessiner :

| Usage                    | Icône                                      |
| ------------------------ | ------------------------------------------ |
| Logo, onglet Invitations | `IconGift`                                 |
| Mes listes               | `IconList`                                 |
| Compte                   | `IconUser`                                 |
| Retour / ouvrir          | `IconChevronLeft` / `IconChevronRight`     |
| Nouvelle liste / ajouter | `IconPlus`                                 |
| Secret                   | `IconLock`                                 |
| Lien externe             | `IconExternalLink`                         |
| Renommer / modifier      | `IconPencil`                               |
| Supprimer                | `IconTrash`                                |
| Plus d'actions           | `IconDotsVertical`                         |
| Copier / partager        | `IconCopy` / `IconShare` (ou `IconShare2`) |
| Retirer, fermer          | `IconX`                                    |
| Réservé                  | `IconCheck`                                |
| Quitter la liste         | `IconLogout2` (ou `IconDoorExit`)          |
| Erreur de champ          | `IconAlertCircle`                          |

Icônes de liste (étoile, gâteau, maison… dans les maquettes) : purement décoratives. Le plus simple : une couleur choisie à partir de l'id de la liste (hash → l'une des 3 teintes `primary` / `success` / `warning`) et `IconGift` pour toutes. Laisser choisir une icône voudrait un nouveau champ Firestore, donc une modification des règles et des tests : hors périmètre.

## 4. « Mes listes » et « Listes de cadeaux »

- [x] `/` : titre + compteur (« 3 listes · 27 cadeaux »), `ListItem` (« 12 cadeaux · 4 invité·es »), pluriels par `utils/plural.ts`.
- [x] Mobile : bouton flottant « Nouvelle liste » au-dessus de la barre du bas. Bureau : bouton à droite du titre, cartes en grille `repeat(auto-fill, minmax(min(100%, 300px), 1fr))`.
- [x] `/lists` : titre « Invitations » (comme la navigation), sous-titre « Liste de Camille · 12 cadeaux ». Bouton « Quitter la liste » sur chaque carte, avec confirmation (`window.confirm`) et toasts de succès / d'erreur (avant : corbeille sans confirmation).
- [x] État vide (composant `EmptyState`) : un texte, et le bouton de création sur « Mes listes ». `Title` a maintenant `variant="page"` (`h1`, grande taille) et `subtitle`.
- [x] `ListTable` supprimé.
- [x] Fenêtre de confirmation maison (`ConfirmProvider` dans `main.tsx`, `const confirm = useConfirm(); if (!(await confirm({ title, message, confirmLabel }))) return;`) : `<dialog>` natif en `showModal()`, panneau du bas sur mobile, centrée sur bureau. Utilisée pour quitter une liste et pour supprimer une liste (Danger zone, qui n'avait aucune confirmation).
- [ ] `/new` : peut rester une page avec un seul champ ; ou devenir le même panneau que l'étape 6 (bonus).

## 5. Édition (`/edit/$listId`)

- [x] En-tête : retour, titre de la liste (« 12 cadeaux · 4 invité·es »), bouton crayon « Renommer la liste » qui ouvre un dialog avec le champ titre. Le champ titre a quitté le formulaire des cadeaux.
- [x] Onglets segmentés Cadeaux / Invité·es / Danger zone, onglet gardé dans l'URL (`?tab=users`, `?tab=danger` ; rien pour Cadeaux), `Tabs` contrôlable (`activeKey`, `onChange`).
- [x] Nouveau composant `Dialog` (`<dialog>` natif, panneau du bas sur mobile, centré sur bureau, bouton ✕) ; `ConfirmProvider` s'appuie dessus. Il servira au formulaire de cadeau de l'étape 6.
- [x] **Cadeaux** : encart « C'est un secret », liste de cadeaux en lecture seule, ⋮ / crayon + corbeille, barre d'action « Partager » + « Ajouter un cadeau » sur mobile : **fait à l'étape 6**, puisqu'il faut le formulaire d'un cadeau pour modifier. En attendant, le tableau de champs reste, mais n'enregistre plus que les cadeaux : il réécrivait aussi le titre et les invité·es tels qu'au chargement de la page (un·e invité·e retiré·e entre-temps revenait).
- [x] **Invité·es** : bloc vert « Inviter des proches » avec le lien `/invite/$listId` affiché, « Copier le lien » (toast de succès ou d'erreur) et « Partager » (`navigator.share`, seulement s'il existe) ; liste des invité·es avec initiale dans une pastille, ✕ « Retirer … » avec confirmation et chargement sur la seule ligne concernée.
- [x] **Danger zone** : texte d'explication, bouton à contour rouge, confirmation (étape 4), toast « Liste supprimée ».

## 6. Ajout et modification d'un cadeau ⚠️ change le fonctionnement

**Aujourd'hui**, `ListFormPresents` affiche **tous** les cadeaux dans un tableau de champs modifiables, enregistré en une fois par le formulaire de la liste (`presents` en `mode="array"`). Ce n'est pas utilisable sur un téléphone.

**Cible** : la liste est en lecture seule, et on ajoute ou modifie **un cadeau à la fois** dans un formulaire séparé, qui enregistre tout de suite.

- [x] `PresentForm` (`useAppForm`, titre obligatoire, description, lien http(s) ; schémas `presentTitleSchema` / `presentDescriptionSchema` / `optionalUrlSchema`), pour l'ajout **et** la modification.
- [x] Calculs purs et testés dans `utils/presents.ts` : `addPresent` (cadeau disponible ajouté à la fin), `updatePresent` (ne remplace que `title`, `description`, `url` : garde `status`, `reservedBy`, `listUID`), `removePresent`, `urlHost` (domaine affiché sous le cadeau).
- [x] Enregistrement par `updateList()` : **transaction** Firestore qui relit la liste avant d'écrire, pour ne pas écraser une réservation faite entre-temps (même chose pour renommer et retirer un·e invité·e). Tests des règles ajoutés : ajout seul, modification d'un cadeau réservé en gardant la réservation, suppression, écriture par transaction.
- [x] **Mobile** : `Dialog` en panneau du bas (« Nouveau cadeau » / « Modifier le cadeau »), Annuler + Ajouter le cadeau / Enregistrer ; barre d'action collée en bas « Partager » (ouvre l'onglet Invité·es) + « Ajouter un cadeau ».
- [x] **Bureau** : carte « Ajouter un cadeau » à droite de la liste, toujours visible ; après un ajout le formulaire se vide, la ligne ajoutée porte un badge « Ajouté » 4 secondes. « Vider » remet le formulaire à zéro.
- [x] Choix mobile / bureau en JS par `useIsDesktop()` (`hooks/useMediaQuery.ts`, `matchMedia` + `useSyncExternalStore`, même condition que `--desktop`). La modification passe par le `Dialog` sur les deux tailles.
- [x] Liste des cadeaux en lecture seule (`ListPresents`) : encart « C'est un secret », « N cadeaux », titre, description sur une ligne, domaine du lien ; ⋮ (Modifier, Supprimer) sur mobile, crayon et corbeille sur bureau. Suppression avec confirmation, message neutre (secret des réservations).
- [x] `ListForm`, `ListFormPresents`, `listFormOptions.ts` et le composant `Table` supprimés.

## 7. Consultation et réservation (`/list/$listId`)

- [x] En-tête : retour, titre, « Liste de Camille », bouton « Quitter la liste » (confirmation, puis retour aux invitations).
- [x] Filtres en pastilles Tous · n / Disponibles · n / Mes réservations · n (`aria-pressed`), gardés dans l'URL (`?filter=available`, `?filter=mine`), rangée qui défile sur mobile. Message adapté quand un filtre ne donne rien.
- [x] Carte de cadeau selon l'état (`presentState` : `available` / `mine` / `taken`) : « Réserver » ; badge vert « Réservé par vous » + ✕ « Annuler la réservation de … » ; carte grisée et badge « Déjà réservé ». Grille de cartes sur bureau.
- [x] « Voir le cadeau » seulement si `isHttpUrl()`, `target="_blank" rel="noopener noreferrer"`.
- [x] Chargement sur le seul bouton concerné.
- [x] Réservations concurrentes (audit §6) : transaction qui vérifie que le cadeau est encore libre ; sinon toast « Ce cadeau vient d'être réservé par quelqu'un d'autre » et la liste se recharge. Fonctions pures testées (`reservePresent`, `cancelReservation`, `countByState`), tests des règles pour la réservation et le départ par transaction.
- [x] Composants `Card` et `Grid` supprimés (plus utilisés).

## 8. Invitation et authentification

- [x] `/invite/$listId` : grand pictogramme cadeau, « Camille vous invite à rejoindre », titre, nombre de cadeaux, encart sur le secret des réservations, « Rejoindre la liste », « Connecté·e en tant que … ». Liste introuvable : message et retour à l'accueil.
- [x] **Bug de `todo.md` corrigé** (rejoindre sans être connecté·e) : la page d'invitation est publique et propose « Se connecter » / « Créer un compte » au lieu de renvoyer sans explication vers la connexion. Le `redirect` suit d'une page à l'autre (connexion ⇄ inscription ⇄ mot de passe oublié) : avant, passer par l'inscription perdait l'invitation. Rejoindre passe par une transaction (`joinList`), le ou la propriétaire est renvoyé·e vers l'édition.
- [x] `/login`, `/register`, `/reset-password` : composant `AuthLayout` (bandeau rouge, logo, « Wrap It Up ! », phrase d'accroche ; carte du formulaire qui chevauche le bandeau ; lien en bas). Messages existants gardés.
- [x] Sur ordinateur, la même carte centrée (`max-width` 420 px). Tâche de `todo.md` « Améliorer les pages hors `PrivateLayout` » cochée.
- [x] `autocomplete` : `email`, `current-password`, `new-password`, `name`.

## 9. Nettoyage

- [x] Supprimer `Header` et `src/assets/home.png`, et les composants devenus inutiles : `Header`, `Center` (étape 8), `Table` (étape 6), `Card` et `Grid` (étape 7). `Page` reste (`/new`, `/account`).
- [x] Supprimer les variables de l'ancien thème (`--header-color`, `--nav-color`, `--nav-link-color`, et `--font-size-extra-small`, `--padding-extra-large` devenues inutiles).
- [x] Mettre à jour `CLAUDE.md` (section « Composants et style ») et cocher `todo.md`.
- [x] Lighthouse mobile (13.5.0, 22 novembre 2026) : **accessibilité 100** sur `/login`, `/register`, `/reset-password` et `/invite/…` (build local et production). Les pages connectées n'ont pas été passées (Lighthouse n'a pas de session) : à faire depuis Chrome (DevTools → Lighthouse) une fois connecté·e.
- Relevé au passage, hors refonte (production, `/login`) :
  - CSP en `Report-Only` : `frame-src` n'autorise pas `https://wrap-it-up-2d42a.firebaseapp.com` (iframe de Firebase Auth) et `script-src` n'autorise pas `https://apis.google.com` (chargé par cette iframe). À ajouter **avant** de passer la CSP en bloquant (audit §9) ;
  - pas de `robots.txt` : la réécriture SPA renvoie `index.html` ;
  - performance 69 à 76 : bundle JS d'environ 1 Mo (Firestore), déjà connu.
