import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Present } from "#/interfaces/Present.ts";
import {
  addPresent,
  cancelReservation,
  countByState,
  favoritesFirst,
  highlightFavorites,
  presentState,
  removePresent,
  reserverName,
  ReservationError,
  reservePresent,
  toggleFavorite,
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
        favorite: false,
        status: "available",
      },
    ]);
    assert.deepEqual(presents, [reserved]);
  });

  it("ajoute un coup de cœur", () => {
    const [added] = addPresent(
      [],
      { title: "Livre", favorite: true },
      { id: "p3", listUID: "list-1" },
    );
    assert.equal(added.favorite, true);
  });
});

describe("updatePresent", () => {
  it("ne remplace que le titre, la description, le lien et le coup de cœur", () => {
    const result = updatePresent([reserved, available], "p1", {
      title: "Casque audio",
      description: "",
      url: "https://autre.fr",
      favorite: true,
    });

    assert.deepEqual(result, [
      {
        ...reserved,
        title: "Casque audio",
        description: "",
        url: "https://autre.fr",
        favorite: true,
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

const favorite: Present = {
  id: "p3",
  title: "Vélo",
  status: "available",
  favorite: true,
  listUID: "list-1",
};

const reservedFavorite: Present = {
  ...reserved,
  id: "p4",
  title: "Montre",
  favorite: true,
};

describe("toggleFavorite", () => {
  it("bascule le coup de cœur du seul cadeau visé, sans toucher à la réservation", () => {
    assert.deepEqual(toggleFavorite([reserved, available], "p1"), [
      { ...reserved, favorite: true },
      available,
    ]);
    assert.deepEqual(toggleFavorite([favorite], "p3"), [
      { ...favorite, favorite: false },
    ]);
  });
});

describe("favoritesFirst", () => {
  it("met les coups de cœur en tête, en gardant l'ordre de chaque groupe", () => {
    assert.deepEqual(
      favoritesFirst([reserved, favorite, available, reservedFavorite]),
      [favorite, reservedFavorite, reserved, available],
    );
  });
});

describe("highlightFavorites", () => {
  it("met en avant les coups de cœur encore disponibles", () => {
    assert.deepEqual(
      highlightFavorites(
        [reserved, favorite, available, reservedFavorite],
        "other-uid",
      ),
      {
        highlighted: [favorite],
        others: [reservedFavorite, reserved, available],
      },
    );
  });

  it("ne met rien en avant sans coup de cœur disponible", () => {
    assert.deepEqual(highlightFavorites([reserved, available], "guest-uid"), {
      highlighted: [],
      others: [reserved, available],
    });
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

describe("presentState", () => {
  it("distingue disponible, réservé par moi et réservé par quelqu'un d'autre", () => {
    assert.equal(presentState(available, "guest-uid"), "available");
    assert.equal(presentState(reserved, "guest-uid"), "mine");
    assert.equal(presentState(reserved, "other-uid"), "taken");
    assert.equal(presentState(reserved, undefined), "taken");
  });

  it("considère un ancien cadeau libéré (reservedBy vide) comme disponible", () => {
    assert.equal(
      presentState({ ...available, reservedBy: "" }, "guest-uid"),
      "available",
    );
  });
});

describe("countByState", () => {
  it("compte les cadeaux par état", () => {
    assert.deepEqual(countByState([reserved, available], "guest-uid"), {
      available: 1,
      mine: 1,
      taken: 0,
    });
    assert.deepEqual(countByState([reserved, available], "other-uid"), {
      available: 1,
      mine: 0,
      taken: 1,
    });
  });
});

describe("reservePresent", () => {
  it("réserve un cadeau disponible au nom de l'invité·e", () => {
    const [, updated] = reservePresent(
      [reserved, available],
      "p2",
      "other-uid",
    );
    assert.equal(updated.status, "reserved");
    assert.equal(updated.reservedBy, "other-uid");
  });

  it("refuse un cadeau déjà réservé, même par soi", () => {
    assert.throws(
      () => reservePresent([reserved], "p1", "other-uid"),
      (error) => error instanceof ReservationError && error.reason === "taken",
    );
    assert.throws(
      () => reservePresent([reserved], "p1", "guest-uid"),
      ReservationError,
    );
  });

  it("refuse un cadeau qui n'existe plus", () => {
    assert.throws(
      () => reservePresent([available], "x", "guest-uid"),
      (error) =>
        error instanceof ReservationError && error.reason === "missing",
    );
  });
});

describe("cancelReservation", () => {
  it("libère sa propre réservation", () => {
    const [updated] = cancelReservation([reserved], "p1", "guest-uid");
    assert.equal(updated.status, "available");
    assert.equal(updated.reservedBy, "");
    assert.equal(updated.title, reserved.title);
  });

  it("refuse d'annuler la réservation de quelqu'un d'autre", () => {
    assert.throws(
      () => cancelReservation([reserved], "p1", "other-uid"),
      (error) =>
        error instanceof ReservationError && error.reason === "not-mine",
    );
  });
});

describe("reserverName", () => {
  const allowedUsers = [
    { userUID: "guest-uid", username: "Camille" },
    { userUID: "other-uid", username: "  " },
  ];

  it("donne le nom de l'invité·e qui a réservé", () => {
    assert.equal(reserverName(reserved, allowedUsers), "Camille");
  });

  it("ne donne rien pour un cadeau disponible", () => {
    assert.equal(
      reserverName({ ...available, reservedBy: "guest-uid" }, allowedUsers),
      undefined,
    );
  });

  it("ne donne rien si la personne n'est plus invitée ou n'a pas de nom", () => {
    assert.equal(reserverName(reserved, []), undefined);
    assert.equal(
      reserverName({ ...reserved, reservedBy: "other-uid" }, allowedUsers),
      undefined,
    );
  });
});
