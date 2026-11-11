import { z } from "zod";

/** Règles de validation partagées par les formulaires (TanStack Form + zod). */

export const emailSchema = z.email("L'adresse email est invalide");

export const requiredString = (message: string) =>
  z.string().trim().min(1, message);

// Longueurs maximales, alignées sur firestore.rules.
export const LIST_TITLE_MAX = 200;
export const USERNAME_MAX = 100;

export const listTitleSchema = requiredString(
  "Le nom de la liste est obligatoire",
).max(LIST_TITLE_MAX, `${LIST_TITLE_MAX} caractères maximum`);

export const usernameSchema = requiredString(
  "Le nom et le prénom sont obligatoires",
).max(USERNAME_MAX, `${USERNAME_MAX} caractères maximum`);

/** Lien optionnel : vide, ou URL en http(s) (bloque `javascript:`…). */
export const optionalUrlSchema = z
  .union([
    z.literal(""),
    z.url({
      protocol: /^https?$/,
      message: "Le lien doit commencer par http:// ou https://",
    }),
  ])
  .optional();
