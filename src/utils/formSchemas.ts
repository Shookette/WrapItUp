import { z } from "zod";

export const emailSchema = z.email("L'adresse email est invalide");

export const requiredString = (message: string) =>
  z.string().trim().min(1, message);

export const LIST_TITLE_MAX = 200;
export const USERNAME_MAX = 100;

export const listTitleSchema = requiredString(
  "Le nom de la liste est obligatoire",
).max(LIST_TITLE_MAX, `${LIST_TITLE_MAX} caractères maximum`);

export const usernameSchema = requiredString(
  "Le nom et le prénom sont obligatoires",
).max(USERNAME_MAX, `${USERNAME_MAX} caractères maximum`);

export const optionalUrlSchema = z
  .union([
    z.literal(""),
    z.url({
      protocol: /^https?$/,
      message: "Le lien doit commencer par http:// ou https://",
    }),
  ])
  .optional();

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 4096;
const PASSWORD_SPECIAL_CHARACTERS = /[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`-]/;

export const PASSWORD_RULES = `Au moins ${PASSWORD_MIN} caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial (! ? @ # % & * - _ …)`;

export const newPasswordSchema = z
  .string()
  .min(
    PASSWORD_MIN,
    `Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères`,
  )
  .max(PASSWORD_MAX, `${PASSWORD_MAX} caractères maximum`)
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre")
  .regex(
    PASSWORD_SPECIAL_CHARACTERS,
    "Le mot de passe doit contenir un caractère spécial parmi ^ $ * . [ ] { } ( ) ? \" ! @ # % & / \\ , > < ' : ; | _ ~ ` -",
  );
