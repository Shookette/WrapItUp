import { z } from "zod";

/** Règles de validation partagées par les formulaires (TanStack Form + zod). */

export const emailSchema = z.email("L'adresse email est invalide");

export const requiredString = (message: string) =>
  z.string().trim().min(1, message);

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
