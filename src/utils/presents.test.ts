import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Present } from "#/interfaces/Present.ts";
import {
  addPresent,
  removePresent,
  updatePresent,
  urlHost,
} from "./presents.ts";

const reserved: Present = {
  id: "p1",
  title: "Casque",
  description: "Sans fil",
  url: "https://boutique.fr/casque",
  status: "reserved",
  reservedBy: "guest-uid",
  listUID: "list-1",
};

const available: Present = {
  id: "p2",
  title: "Plaid",
  status: "available",
  listUID: "list-1",
};

describe("addPresent", () => {
  it("ajoute un cadeau disponible à la fin, sans toucher aux autres", () => {
    const presents = [reserved];
    const result = addPresent(
      presents,
      { title: "  Livre  ", description: " Illustré ", url: "" },
      { id: "p3", listUID: "list-1" },
    );

    assert.deepEqual(result, [
      reserved,
      {
        id: "p3",
        listUID: "list-1",
        title: "Livre",
        description: "Illustré",
        url: "",
        status: "available",
      },
    ]);
    assert.deepEqual(presents, [reserved]);
  });
});

describe("updatePresent", () => {
  it("ne remplace que le titre, la description et le lien", () => {
    const result = updatePresent([reserved, available], "p1", {
      title: "Casque audio",
      description: "",
      url: "https://autre.fr",
    });

    assert.deepEqual(result, [
      {
        ...reserved,
        title: "Casque audio",
        description: "",
        url: "https://autre.fr",
      },
      available,
    ]);
  });

  it("garde la réservation en cours", () => {
    const [updated] = updatePresent([reserved], "p1", { title: "Casque" });
    assert.equal(updated.status, "reserved");
    assert.equal(updated.reservedBy, "guest-uid");
    assert.equal(updated.listUID, "list-1");
  });

  it("ne change rien si l'identifiant est inconnu", () => {
    assert.deepEqual(updatePresent([available], "x", { title: "Autre" }), [
      available,
    ]);
  });
});

describe("removePresent", () => {
  it("retire le cadeau, même réservé", () => {
    assert.deepEqual(removePresent([reserved, available], "p1"), [available]);
  });
});

describe("urlHost", () => {
  it("renvoie le domaine sans www", () => {
    assert.equal(
      urlHost("https://www.boutique-audio.fr/casque?x=1"),
      "boutique-audio.fr",
    );
    assert.equal(urlHost("http://librairie.fr"), "librairie.fr");
  });

  it("renvoie undefined pour un lien vide ou invalide", () => {
    assert.equal(urlHost(""), undefined);
    assert.equal(urlHost(undefined), undefined);
    assert.equal(urlHost("pas un lien"), undefined);
  });
});
