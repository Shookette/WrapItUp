import { formOptions, revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";
import { AllowedUser, FullList } from "#/interfaces/List.ts";
import { Present } from "#/interfaces/Present.ts";
import {
  listTitleSchema,
  optionalUrlSchema,
  requiredString,
} from "#/utils/formSchemas.ts";

const presentSchema = z.object({
  id: z.string(),
  title: requiredString("Le nom du cadeau est obligatoire"),
  description: z.string().optional(),
  url: optionalUrlSchema,
  image: z.string().optional(),
  status: z.enum(["available", "reserved"]),
  reservedBy: z.string().optional(),
  listUID: z.string().optional(),
}) satisfies z.ZodType<Present, Present>;

const allowedUserSchema = z.object({
  userUID: z.string(),
  username: z.string().optional(),
}) satisfies z.ZodType<AllowedUser, AllowedUser>;

const listSchema = z.object({
  id: z.string(),
  title: listTitleSchema,
  userUID: z.string(),
  username: z.string().optional(),
  createdAt: z.string(),
  presents: z.array(presentSchema),
  allowedUsers: z.array(allowedUserSchema),
}) satisfies z.ZodType<FullList, FullList>;

export const listFormOptions = formOptions({
  defaultValues: {} as FullList,
  validationLogic: revalidateLogic(),
  validators: { onDynamic: listSchema },
});
