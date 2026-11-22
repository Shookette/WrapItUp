# 13. Un seul point de rupture, `--desktop` (768 px)

- Statut : acceptée
- Source : `src/media.css`, `vite.config.ts`, fichiers CSS des composants (`@media (--desktop)`)

## Contexte

La refonte graphique est pensée mobile d'abord : le CSS de base vise le téléphone, la version bureau s'ajoute au-dessus d'une largeur. Les variables CSS (`var(--…)`) ne sont pas utilisables dans la condition d'une media query, et répéter `768px` dans chaque fichier rend la valeur difficile à changer.

## Décision

Un seul point de rupture pour toute l'application, nommé avec `@custom-media` (CSS Media Queries niveau 5) dans `src/media.css` :

```css
@custom-media --desktop (min-width: 768px);
```

Les fichiers CSS écrivent `@media (--desktop) { … }`. Les navigateurs ne comprennent pas encore `@custom-media` : au build et en dev, deux plugins PostCSS (configurés dans `vite.config.ts`) remplacent `(--desktop)` par la vraie condition :

- `@csstools/postcss-global-data` rend `src/media.css` visible depuis chaque fichier CSS (sans rien ajouter à la sortie) ;
- `postcss-custom-media` fait le remplacement.

Quand un composant doit choisir en JavaScript (par exemple un formulaire dans un dialog ou dans la page), il utilise la même condition : `matchMedia("(min-width: 768px)")`.

## Conséquences

- Changer le point de rupture : `src/media.css`, plus les `matchMedia` éventuels.
- Un deuxième point de rupture ne s'ajoute que si une maquette l'exige, dans `src/media.css`.
- Le jour où les navigateurs gèrent `@custom-media`, les deux plugins pourront être retirés sans toucher aux fichiers CSS.
