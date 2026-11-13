import {
  arrayRemove,
  deleteDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getCollectionRef } from "./utils";
import { List } from "#/interfaces/List.ts";

// Supprime toutes les données Firestore d'un compte avant sa suppression
// (audit §8, RGPD). Chaque étape passe par les règles Firestore :
// - ses listes : supprimées (propriétaire) ;
// - les listes où il ou elle est invité·e : réservations annulées, puis
//   uid retiré de `allowedUsers` (quitter la liste) ;
// - son profil : supprimé.
const deleteAccountData = async (userUID: string): Promise<void> => {
  const lists = getCollectionRef("lists");

  const myLists = await getDocs(query(lists, where("userUID", "==", userUID)));
  await Promise.all(myLists.docs.map((list) => deleteDoc(list.ref)));

  const invitedLists = await getDocs(
    query(lists, where("allowedUsers", "array-contains", userUID)),
  );
  await Promise.all(
    invitedLists.docs.map(async (listDoc) => {
      const { presents = [] } = listDoc.data() as List;
      if (presents.some((present) => present.reservedBy === userUID)) {
        await updateDoc(listDoc.ref, {
          presents: presents.map((present) =>
            present.reservedBy === userUID
              ? { ...present, status: "available", reservedBy: "" }
              : present,
          ),
        });
      }
      await updateDoc(listDoc.ref, { allowedUsers: arrayRemove(userUID) });
    }),
  );

  const profils = await getDocs(
    query(getCollectionRef("profils"), where("userUID", "==", userUID)),
  );
  await Promise.all(profils.docs.map((profil) => deleteDoc(profil.ref)));
};

export { deleteAccountData };
