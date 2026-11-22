import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emailSchema,
  LIST_TITLE_MAX,
  listTitleSchema,
  newPasswordSchema,
  optionalUrlSchema,
} from "./formSchemas.ts";

const firstError = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message;

describe("emailSchema", () => {
  it("accepte une adresse valide et refuse le reste", () => {
    assert.equal(emailSchema.safeParse("camille@example.com").success, true);
    assert.equal(emailSchema.safeParse("camille").success, false);
  });
});

describe("listTitleSchema", () => {
  it("refuse un titre vide ou fait d'espaces", () => {
    assert.equal(
      firstError(listTitleSchema.safeParse("   ")),
      "Le nom de la liste est obligatoire",
    );
  });

  it("limite la longueur", () => {
    assert.equal(
      listTitleSchema.safeParse("a".repeat(LIST_TITLE_MAX)).success,
      true,
    );
    assert.equal(
      listTitleSchema.safeParse("a".repeat(LIST_TITLE_MAX + 1)).success,
      false,
    );
  });
});

describe("optionalUrlSchema", () => {
  it("accepte un lien http(s), une chaîne vide ou rien", () => {
    for (const value of [
      "https://example.com",
      "http://example.com",
      "",
      undefined,
    ]) {
      assert.equal(optionalUrlSchema.safeParse(value).success, true, value);
    }
  });

  it("refuse les autres protocoles", () => {
    for (const value of ["javascript:alert(1)", "ftp://example.com"]) {
      assert.equal(optionalUrlSchema.safeParse(value).success, false, value);
    }
  });
});

describe("newPasswordSchema", () => {
  it("accepte un mot de passe qui suit la politique", () => {
    assert.equal(newPasswordSchema.safeParse("Cadeau-2026!").success, true);
  });

  it("explique la règle manquante", () => {
    const cases: [string, string][] = [
      ["Court-1!", "Le mot de passe doit contenir au moins 10 caractères"],
      ["CADEAU-2026!", "Le mot de passe doit contenir une minuscule"],
      ["cadeau-2026!", "Le mot de passe doit contenir une majuscule"],
      ["Cadeau-deux!", "Le mot de passe doit contenir un chiffre"],
    ];
    for (const [password, message] of cases) {
      assert.equal(firstError(newPasswordSchema.safeParse(password)), message);
    }
  });

  it("exige un caractère spécial", () => {
    assert.match(
      firstError(newPasswordSchema.safeParse("Cadeau2026x")) ?? "",
      /caractère spécial/,
    );
  });
});
