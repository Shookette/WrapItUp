import {
  doc,
  setDoc,
  getDocs,
  QuerySnapshot,
  DocumentData,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import {
  getCollectionRef,
  getDocRef,
  transformCollectionToArray,
} from "./utils";
import { Profil } from "../interfaces/Profil.ts";

const COLLECTION_REF = "profils";

const getById = async (userUID: string): Promise<Profil | undefined> => {
  const result: QuerySnapshot = await getDocs(
    query(getCollectionRef(COLLECTION_REF), where("userUID", "==", userUID)),
  );

  const resultArray = transformCollectionToArray<Profil>(result);

  if (resultArray.length) {
    return resultArray[0];
  }

  return undefined;
};

const setProfil = async (profil: Profil): Promise<void> => {
  const profilCollection = getCollectionRef(COLLECTION_REF);
  const profilDocument = doc(profilCollection, profil.id);
  await setDoc<DocumentData, DocumentData>(profilDocument, profil);
};

const deleteProfil = async (id: string): Promise<void> => {
  return await deleteDoc(getDocRef(COLLECTION_REF, id));
};

export { getById, setProfil, deleteProfil };
