# 1. Décisions dans des ADR, pas de commentaires dans le code

- Statut : acceptée
- Date : 22 novembre 2026

## Contexte

Le code contenait une centaine de commentaires. Un inventaire (PR « supprimer les commentaires ») les a classés en quatre catégories :

- **tautologies** : répètent ce que le code dit déjà (`// Create a new router instance`) ;
- **obsolètes** : décrivent un état passé (« remplacent ceux de Mantine », alors que Mantine a été retiré) ;
- **excuses** : justifient un contournement (« on tolère qu'il change »), qui reste alors en place et se recopie ;
- **décisions** : expliquent un choix important et non évident.

Seules les décisions ont de la valeur, et un commentaire est un mauvais support pour elles : on ne le retrouve pas sans lire le fichier, il n'a pas de date ni de statut, et il dérive en silence quand le code change.

## Décision

- Pas de commentaire dans le code. La règle oxlint `wrap-it-up/no-comments` (`lint/plugin.ts`) l'impose sur `src/`, `tests/`, `lint/` et `vite.config.ts`.
- Une décision va dans un ADR de `docs/adr/` (un fichier numéroté par décision).
- Un contournement va dans une issue GitHub (étiquette `tech-debt`).
- Exceptions techniques : directives `oxlint-disable…` / `@ts-expect-error`, **justifiées** par `-- #<issue>` ou `-- docs/adr/<fichier>.md`, `/// <reference … />`, et la version après le SHA d'une action GitHub (`# v4.4.0`, ADR 12).
- Les fichiers que le lint ne couvre pas (`firestore.rules`, CSS, workflows, `.env`) suivent la même règle, vérifiée à la main avec `/delete-comment`.

Adoption progressive (ratchet) : l'option `allowed` de la règle (`.oxlintrc.json`) tolère un nombre de commentaires par fichier. Ce nombre ne peut que baisser : un fichier qui en a moins fait échouer le lint tant que `npm run lint:ratchet` n'a pas figé le progrès. `npm run lint:ratchet -- --accept` augmente les tolérances : à réserver à l'extension du lint à de nouveaux dossiers.

## Conséquences

- Le pourquoi d'un choix se cherche dans `docs/adr/` et dans les issues, pas dans le code.
- Le nom des fonctions, des variables et des tests doit porter l'intention que portaient les commentaires.
- Les tests et les types prennent le relais des commentaires « à garder aligné » (voir #24, #28, #29).
