import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isHttpUrl } from "./url.ts";

describe("isHttpUrl", () => {
  it("accepte les liens http et https", () => {
    assert.equal(isHttpUrl("https://example.com/cadeau?id=1"), true);
    assert.equal(isHttpUrl("http://example.com"), true);
  });

  it("refuse les autres protocoles", () => {
    assert.equal(isHttpUrl("javascript:alert(1)"), false);
    assert.equal(isHttpUrl("JavaScript:alert(1)"), false);
    assert.equal(isHttpUrl("data:text/html,<script>alert(1)</script>"), false);
    assert.equal(isHttpUrl("ftp://example.com"), false);
  });

  it("refuse un texte qui n'est pas un lien, vide ou absent", () => {
    assert.equal(isHttpUrl("example.com"), false);
    assert.equal(isHttpUrl(""), false);
    assert.equal(isHttpUrl(undefined), false);
  });
});
