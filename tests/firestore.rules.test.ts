// Tests des règles Firestore (firestore.rules) dans l'émulateur.
// Lancer avec `npm run test:rules` (démarre l'émulateur, puis node --test).
import { after, before, beforeEach, describe, test } from "node:test";
import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const OWNER = "owner-uid";
const GUEST = "guest-uid";
const STRANGER = "stranger-uid";
const LIST_ID = "list-1";

const present = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: `Cadeau ${id}`,
  description: "",
  url: "",
  status: "available",
  listUID: LIST_ID,
  ...extra,
});

const baseList = {
  id: LIST_ID,
  title: "Noël",
  userUID: OWNER,
  createdAt: "2026-11-11",
  presents: [present("p1"), present("p2")],
  allowedUsers: [GUEST],
};

let env: RulesTestEnvironment;

// Par défaut, une personne connectée a vérifié son email.
const db = (uid?: string, { emailVerified = true } = {}) =>
  uid
    ? env
        .authenticatedContext(uid, { email_verified: emailVerified })
        .firestore()
    : env.unauthenticatedContext().firestore();

const unverifiedDb = (uid: string) => db(uid, { emailVerified: false });

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-wrap-it-up",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const admin = context.firestore();
    await setDoc(doc(admin, "lists", LIST_ID), baseList);
    await setDoc(doc(admin, "profils", "profil-owner"), {
      id: "profil-owner",
      userUID: OWNER,
      username: "Propriétaire",
    });
  });
});

const listRef = (uid?: string) => doc(db(uid), "lists", LIST_ID);

describe("lists : lecture", () => {
  test("anonyme : refusé", async () => {
    await assertFails(getDoc(listRef()));
  });

  test("lecture par id (lien d'invitation) : toute personne connectée", async () => {
    await assertSucceeds(getDoc(listRef(STRANGER)));
  });

  test("« Mes listes » (where userUID == moi) : autorisé", async () => {
    const q = query(
      collection(db(OWNER), "lists"),
      where("userUID", "==", OWNER),
    );
    await assertSucceeds(getDocs(q));
  });

  test("« Listes de cadeaux » (where allowedUsers contient moi) : autorisé", async () => {
    const q = query(
      collection(db(GUEST), "lists"),
      where("allowedUsers", "array-contains", GUEST),
    );
    await assertSucceeds(getDocs(q));
  });

  test("lister toutes les listes : refusé", async () => {
    await assertFails(getDocs(collection(db(STRANGER), "lists")));
  });

  test("lister les listes de quelqu'un d'autre : refusé", async () => {
    const q = query(
      collection(db(STRANGER), "lists"),
      where("userUID", "==", OWNER),
    );
    await assertFails(getDocs(q));
  });
});

describe("lists : création", () => {
  const newList = (uid: string) => ({
    ...baseList,
    id: "list-2",
    userUID: uid,
    presents: [],
    allowedUsers: [],
  });

  test("créer sa propre liste : autorisé", async () => {
    await assertSucceeds(
      setDoc(doc(db(STRANGER), "lists", "list-2"), newList(STRANGER)),
    );
  });

  test("créer une liste au nom de quelqu'un d'autre : refusé", async () => {
    await assertFails(
      setDoc(doc(db(STRANGER), "lists", "list-2"), newList(OWNER)),
    );
  });

  test("id du document différent de list.id : refusé", async () => {
    await assertFails(
      setDoc(doc(db(STRANGER), "lists", "autre-id"), newList(STRANGER)),
    );
  });

  test("titre vide : refusé", async () => {
    await assertFails(
      setDoc(doc(db(STRANGER), "lists", "list-2"), {
        ...newList(STRANGER),
        title: "",
      }),
    );
  });
});

describe("lists : modification par le ou la propriétaire", () => {
  test("modifier titre et cadeaux : autorisé", async () => {
    await assertSucceeds(
      setDoc(listRef(OWNER), {
        ...baseList,
        title: "Anniversaire",
        presents: [present("p1")],
      }),
    );
  });

  test("retirer un·e invité·e : autorisé", async () => {
    await assertSucceeds(updateDoc(listRef(OWNER), { allowedUsers: [] }));
  });

  test("donner la liste à quelqu'un d'autre : refusé", async () => {
    await assertFails(updateDoc(listRef(OWNER), { userUID: STRANGER }));
  });

  test("supprimer : autorisé", async () => {
    await assertSucceeds(deleteDoc(listRef(OWNER)));
  });
});

describe("lists : invité·e", () => {
  test("réserver un cadeau : autorisé", async () => {
    await assertSucceeds(
      setDoc(listRef(GUEST), {
        ...baseList,
        presents: [
          present("p1", { status: "reserved", reservedBy: GUEST }),
          present("p2"),
        ],
      }),
    );
  });

  test("réécriture avec `username` (anciens documents) : autorisé", async () => {
    await assertSucceeds(
      setDoc(listRef(GUEST), {
        ...baseList,
        username: "Propriétaire",
        presents: [
          present("p1", { status: "reserved", reservedBy: GUEST }),
          present("p2"),
        ],
      }),
    );
  });

  test("ajouter ou supprimer un cadeau : refusé", async () => {
    await assertFails(updateDoc(listRef(GUEST), { presents: [present("p1")] }));
  });

  test("modifier le titre : refusé", async () => {
    await assertFails(updateDoc(listRef(GUEST), { title: "Piraté" }));
  });

  test("ajouter quelqu'un d'autre : refusé", async () => {
    await assertFails(
      updateDoc(listRef(GUEST), { allowedUsers: [GUEST, STRANGER] }),
    );
  });

  test("quitter la liste : autorisé", async () => {
    await assertSucceeds(updateDoc(listRef(GUEST), { allowedUsers: [] }));
  });

  test("supprimer la liste : refusé", async () => {
    await assertFails(deleteDoc(listRef(GUEST)));
  });
});

describe("lists : non invité·e", () => {
  test("rejoindre via le lien d'invitation : autorisé", async () => {
    await assertSucceeds(
      setDoc(listRef(STRANGER), {
        ...baseList,
        allowedUsers: [GUEST, STRANGER],
      }),
    );
  });

  test("rejoindre en modifiant autre chose : refusé", async () => {
    await assertFails(
      setDoc(listRef(STRANGER), {
        ...baseList,
        title: "Piraté",
        allowedUsers: [GUEST, STRANGER],
      }),
    );
  });

  test("rejoindre en retirant quelqu'un : refusé", async () => {
    await assertFails(
      updateDoc(listRef(STRANGER), { allowedUsers: [STRANGER] }),
    );
  });

  test("réserver sans être invité·e : refusé", async () => {
    await assertFails(
      updateDoc(listRef(STRANGER), {
        presents: [
          present("p1", { status: "reserved", reservedBy: STRANGER }),
          present("p2"),
        ],
      }),
    );
  });

  test("supprimer : refusé", async () => {
    await assertFails(deleteDoc(listRef(STRANGER)));
  });
});

describe("profils", () => {
  test("lire les profils (noms affichés) : toute personne connectée", async () => {
    const q = query(
      collection(db(STRANGER), "profils"),
      where("userUID", "==", OWNER),
    );
    await assertSucceeds(getDocs(q));
  });

  test("anonyme : refusé", async () => {
    await assertFails(getDocs(collection(db(), "profils")));
  });

  test("créer son profil à l'inscription : autorisé", async () => {
    await assertSucceeds(
      setDoc(doc(db(STRANGER), "profils", "profil-stranger"), {
        id: "profil-stranger",
        userUID: STRANGER,
        username: "Moi",
      }),
    );
  });

  test("créer le profil de quelqu'un d'autre : refusé", async () => {
    await assertFails(
      setDoc(doc(db(STRANGER), "profils", "faux"), {
        id: "faux",
        userUID: OWNER,
        username: "Usurpation",
      }),
    );
  });

  test("modifier le profil de quelqu'un d'autre : refusé", async () => {
    await assertFails(
      updateDoc(doc(db(STRANGER), "profils", "profil-owner"), {
        username: "Piraté",
      }),
    );
  });

  test("supprimer le profil de quelqu'un d'autre : refusé", async () => {
    await assertFails(deleteDoc(doc(db(STRANGER), "profils", "profil-owner")));
  });

  test("supprimer son propre profil (suppression du compte) : autorisé", async () => {
    await assertSucceeds(deleteDoc(doc(db(OWNER), "profils", "profil-owner")));
  });

  test("modifier son propre profil : autorisé", async () => {
    await assertSucceeds(
      updateDoc(doc(db(OWNER), "profils", "profil-owner"), {
        username: "Nouveau nom",
      }),
    );
  });
});

describe("suppression du compte d'un·e invité·e", () => {
  test("annuler ses réservations puis quitter la liste : autorisé", async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore(), "lists", LIST_ID), {
        presents: [
          present("p1", { status: "reserved", reservedBy: GUEST }),
          present("p2"),
        ],
      });
    });
    await assertSucceeds(
      updateDoc(listRef(GUEST), {
        presents: [present("p1", { reservedBy: "" }), present("p2")],
      }),
    );
    await assertSucceeds(
      updateDoc(listRef(GUEST), { allowedUsers: arrayRemove(GUEST) }),
    );
  });
});

describe("email non vérifié", () => {
  test("lire une liste par id : refusé", async () => {
    await assertFails(getDoc(doc(unverifiedDb(GUEST), "lists", LIST_ID)));
  });

  test("« Mes listes » : refusé", async () => {
    const q = query(
      collection(unverifiedDb(OWNER), "lists"),
      where("userUID", "==", OWNER),
    );
    await assertFails(getDocs(q));
  });

  test("créer une liste : refusé", async () => {
    await assertFails(
      setDoc(doc(unverifiedDb(STRANGER), "lists", "list-2"), {
        ...baseList,
        id: "list-2",
        userUID: STRANGER,
      }),
    );
  });

  test("rejoindre une liste : refusé", async () => {
    await assertFails(
      updateDoc(doc(unverifiedDb(STRANGER), "lists", LIST_ID), {
        allowedUsers: [GUEST, STRANGER],
      }),
    );
  });

  test("lire les profils : refusé", async () => {
    await assertFails(getDocs(collection(unverifiedDb(STRANGER), "profils")));
  });

  test("créer son profil à l'inscription : autorisé", async () => {
    await assertSucceeds(
      setDoc(doc(unverifiedDb(STRANGER), "profils", "profil-stranger"), {
        id: "profil-stranger",
        userUID: STRANGER,
        username: "Moi",
      }),
    );
  });

  test("créer le profil de quelqu'un d'autre : refusé", async () => {
    await assertFails(
      setDoc(doc(unverifiedDb(STRANGER), "profils", "faux"), {
        id: "faux",
        userUID: OWNER,
        username: "Usurpation",
      }),
    );
  });
});

describe("autres collections", () => {
  test("collection inconnue : refusé", async () => {
    await assertFails(
      setDoc(doc(db(OWNER), "presents", "x"), { title: "ancienne collection" }),
    );
  });
});
