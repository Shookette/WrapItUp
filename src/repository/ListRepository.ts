import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  QuerySnapshot,
  DocumentSnapshot,
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
import { List } from "../interfaces/List";
import { getById } from "./ProfilRepository.ts";
import { getPresents } from "./PresentRepository.ts";

const COLLECTION_REF = "lists";

const getLists = async (): Promise<List[]> => {
  const result: QuerySnapshot = await getDocs(getCollectionRef(COLLECTION_REF));

  const resultArray = transformCollectionToArray<List>(result);
  sortList(resultArray, "title");

  for (const list of resultArray) {
    const profil = await getById(list.userUID);
    list.username = profil?.username;
  }

  return resultArray;
};

const getMyLists = async (userUID: string): Promise<List[]> => {
  const result: QuerySnapshot = await getDocs(
    query(getCollectionRef(COLLECTION_REF), where("userUID", "==", userUID)),
  );

  const resultArray = transformCollectionToArray<List>(result);
  sortList(resultArray, "title");

  return resultArray;
};

const getListByID = async (id: string): Promise<List | null> => {
  const result: DocumentSnapshot = await getDoc(getDocRef(COLLECTION_REF, id));
  const list = result.exists() ? (result.data() as List) : null;

  if (list) {
    list.presents = await getPresents(list.userUID);
  }

  return list;
};

const setList = async (list: List): Promise<void> => {
  const listCollection = getCollectionRef(COLLECTION_REF);
  const listDocument = doc(listCollection, list.id);
  await setDoc<DocumentData, DocumentData>(listDocument, list);
};

const deleteList = async (id: string): Promise<void> => {
  return await deleteDoc(getDocRef(COLLECTION_REF, id));
};

export { getLists, getMyLists, getListByID, setList, deleteList };
