# 11. Le plugin TanStack Router passe avant le plugin React

- Statut : acceptée
- Source : `vite.config.ts`

## Contexte

Le plugin `tanstackRouter` génère `src/routeTree.gen.ts` et découpe les fichiers de route. Il doit transformer ces fichiers avant le plugin React (documentation de TanStack Router).

## Décision

`plugins: [tanstackRouter({ target: "react" }), react()]`, dans cet ordre.

## Conséquences

Ne pas réordonner ni insérer de plugin de transformation JSX avant `tanstackRouter`.
