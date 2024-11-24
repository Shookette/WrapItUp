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
  sortList,
  transformCollectionToArray,
} from "./utils";
import { Present } from "../interfaces/Present.ts";

const COLLECTION_REF = "presents";

const getPresents = async (listUID: string): Promise<Present[]> => {
  const result: QuerySnapshot = await getDocs(
    query(getCollectionRef(COLLECTION_REF), where("listUID", "!=", listUID)),
  );

  const resultArray = transformCollectionToArray<Present>(result);
  sortList(resultArray, "title");

  return resultArray;
};

const setPresent = async (present: Present): Promise<void> => {
  const presentCollection = getCollectionRef(COLLECTION_REF);
  const presentDocument = doc(presentCollection, present.id);
  await setDoc<DocumentData, DocumentData>(presentDocument, present);
};

const deletePresent = async (id: string): Promise<void> => {
  return await deleteDoc(getDocRef(COLLECTION_REF, id));
};

export { deletePresent, getPresents, setPresent };
