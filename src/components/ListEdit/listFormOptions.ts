import { formOptions, revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";
import { FullList } from "../../interfaces/List.ts";
import { optionalUrlSchema, requiredString } from "../../utils/formSchemas.ts";

// Seuls les champs saisis sont validés. Les autres sont acceptés tels quels
// (`z.any()`) : une erreur sur un champ non affiché bloquerait l'envoi sans
// message. Ils restent listés pour que le type d'entrée du schéma
// corresponde à `FullList`.
const presentSchema = z.object({
  id: z.any(),
  title: requiredString("Le nom du cadeau est obligatoire"),
  description: z.any(),
  url: optionalUrlSchema,
  image: z.any(),
  status: z.any(),
  reservedBy: z.any(),
  listUID: z.any(),
});

const listSchema = z.object({
  id: z.any(),
  title: requiredString("Le nom de la liste est obligatoire"),
  userUID: z.any(),
  username: z.any(),
  createdAt: z.any(),
  presents: z.array(presentSchema),
  allowedUsers: z.any(),
});

/** Options partagées par `ListForm` et `ListFormPresents` (`withForm`). */
export const listFormOptions = formOptions({
  defaultValues: {} as FullList,
  validationLogic: revalidateLogic(),
  validators: { onDynamic: listSchema },
});
