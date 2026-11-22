import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { plural } from "./plural.ts";

describe("plural", () => {
  it("met au singulier 0 et 1, comme en français", () => {
    assert.equal(plural(0, "cadeau", "cadeaux"), "0 cadeau");
    assert.equal(plural(1, "cadeau", "cadeaux"), "1 cadeau");
  });

  it("met au pluriel à partir de 2", () => {
    assert.equal(plural(2, "cadeau", "cadeaux"), "2 cadeaux");
    assert.equal(plural(27, "invité·e", "invité·es"), "27 invité·es");
  });
});
