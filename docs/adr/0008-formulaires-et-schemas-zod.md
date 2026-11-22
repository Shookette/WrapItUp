# 8. Formulaires validés par des schémas zod alignés sur les interfaces

- Statut : acceptée
- Source : `src/components/Form/Form.tsx`, `src/components/ListEdit/listFormOptions.ts`

## Contexte

Les formulaires utilisent TanStack Form. La validation native du navigateur afficherait ses propres bulles, dans la langue du navigateur et avec des règles différentes de celles de l'application.

## Décision

- `form.Form` pose `noValidate` : tous les messages viennent des schémas zod (règles communes dans `utils/formSchemas.ts`) ; `required` ne sert qu'à afficher l'astérisque.
- Un schéma décrit **tous** les champs de la valeur du formulaire et est vérifié avec `satisfies z.ZodType<T, T>` contre l'interface de `interfaces/` : le build échoue si l'interface change sans que le schéma suive.
- Seuls les champs saisis par l'utilisateurice portent des messages d'erreur ; les autres (identifiants, statut…) sont écrits par l'application.

## Conséquences

Ajouter un champ à une interface oblige à mettre à jour le schéma du formulaire correspondant.
