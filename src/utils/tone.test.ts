import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickByHash } from "./tone.ts";

const tones = ["primary", "success", "info", "warning"] as const;

describe("pickByHash", () => {
  it("renvoie toujours la même valeur pour le même identifiant", () => {
    const id = "3f9c2a61-0b7e-4d7a-9a51-6b1f0c2d8e44";
    assert.equal(pickByHash(id, tones), pickByHash(id, tones));
  });

  it("renvoie une des valeurs proposées", () => {
    for (const id of ["a", "uid-1", "Zm9vYmFy", "😀", "3f9c2a61"]) {
      assert.ok(tones.includes(pickByHash(id, tones)));
    }
  });

  it("répartit les identifiants sur plusieurs valeurs", () => {
    const picked = new Set(
      ["a", "b", "c", "d", "e", "f", "g", "h"].map((id) =>
        pickByHash(id, tones),
      ),
    );
    assert.equal(picked.size, tones.length);
  });

  it("accepte un identifiant vide", () => {
    assert.equal(pickByHash("", tones), tones[0]);
  });
});
