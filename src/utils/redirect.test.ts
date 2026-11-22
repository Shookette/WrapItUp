import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isInternalPath, redirectSearchSchema } from "./redirect.ts";

describe("isInternalPath", () => {
  it("accepte un chemin de l'application", () => {
    assert.equal(isInternalPath("/"), true);
    assert.equal(isInternalPath("/invite/3f9c2a61"), true);
    assert.equal(isInternalPath("/list/abc?filter=mine"), true);
  });

  it("refuse un autre site", () => {
    for (const path of [
      "//evil.example",
      "/\\evil.example",
      "https://evil.example",
      "javascript:alert(1)",
      "evil.example",
      "",
    ]) {
      assert.equal(isInternalPath(path), false, path);
    }
  });
});

describe("redirectSearchSchema", () => {
  it("garde un chemin interne", () => {
    assert.deepEqual(redirectSearchSchema.parse({ redirect: "/invite/x" }), {
      redirect: "/invite/x",
    });
  });

  it("ignore un chemin externe ou invalide au lieu d'échouer", () => {
    for (const search of [{ redirect: "//evil" }, { redirect: 42 }, {}]) {
      assert.equal(redirectSearchSchema.parse(search).redirect, undefined);
    }
  });
});
