import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  DocumentReference,
  CollectionReference,
  QuerySnapshot,
  DocumentSnapshot,
  Firestore,
  DocumentData,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { sortList, transformCollectionToArray } from "./utils";
import { List } from "../interfaces/List";

const getDocRef = (collectionName: string, id: string): DocumentReference => {
  const db = getFirestore();
  return doc(db, collectionName, id);
};

const getCollectionRef = (
  collectionName: string,
): CollectionReference<DocumentData> => {
  const db: Firestore = getFirestore();
  return collection(db, collectionName);
};

const getLists = async (userUID: string): Promise<List[]> => {
  const result: QuerySnapshot = await getDocs(
    query(getCollectionRef("lists"), where("userUID", "!=", userUID)),
  );

  const resultArray = transformCollectionToArray<List>(result);
  sortList(resultArray, "title");

  return resultArray;
};

const getMyLists = async (userUID: string): Promise<List[]> => {
  const result: QuerySnapshot = await getDocs(
    query(getCollectionRef("lists"), where("userUID", "==", userUID)),
  );

  const resultArray = transformCollectionToArray<List>(result);
  sortList(resultArray, "title");

  return resultArray;
};

const getListByID = async (id: string): Promise<List | null> => {
  const result: DocumentSnapshot = await getDoc(getDocRef("lists", id));
  return result.exists() ? (result.data() as List) : null;
};

const setList = async (list: List): Promise<void> => {
  const listCollection = getCollectionRef("lists");
  const listDocument = doc(listCollection, list.id);
  await setDoc<DocumentData, DocumentData>(listDocument, list);
};

const deleteList = async (id: string): Promise<void> => {
  return await deleteDoc(getDocRef("lists", id));
};

export { getLists, getMyLists, getListByID, setList, deleteList };
