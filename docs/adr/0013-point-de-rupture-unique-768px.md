# 13. Un seul point de rupture, 768 px, écrit en dur

- Statut : acceptée
- Source : `docs/redesign-plan.md`, fichiers CSS des composants (`@media (min-width: 768px)`)

## Contexte

La refonte graphique est pensée mobile d'abord : le CSS de base vise le téléphone, la version bureau s'ajoute au-dessus d'une largeur. Les variables CSS (`var(--…)`) ne sont pas utilisables dans la condition d'une media query, et le projet n'a pas de préprocesseur CSS.

## Décision

Un seul point de rupture pour toute l'application : `@media (min-width: 768px)`, écrit en dur dans chaque fichier CSS qui en a besoin. En dessous : téléphone (barre de navigation en bas, contenus sur une colonne) ; au-dessus : tablette et ordinateur.

Quand un composant doit choisir en JavaScript (par exemple un formulaire dans un dialog ou dans la page), il utilise la même valeur : `matchMedia("(min-width: 768px)")`.

## Conséquences

- Chercher `768px` pour retrouver toutes les adaptations bureau.
- Changer le point de rupture veut dire remplacer la valeur partout, dans le CSS et le JavaScript.
- Un deuxième point de rupture ne s'ajoute que si une maquette l'exige, par un nouvel ADR.
