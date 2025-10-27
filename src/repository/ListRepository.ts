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
import { AllowedUser, FullList, List } from "../interfaces/List";
import { getById } from "./ProfilRepository.ts";

const COLLECTION_REF = "lists";

const fetchAllowedUsersFromList = async (list: List): Promise<FullList> => {
  const allowedUsers = await Promise.all(
    (list.allowedUsers ?? []).map(async (userUID) => {
      const profilUserAllowed = await getById(userUID);
      const allowedUser: AllowedUser = {
        userUID,
        username: profilUserAllowed?.username,
      };
      return allowedUser;
    }),
  );

  return {
    ...list,
    allowedUsers,
  };
};

const getLists = async (userUID: string): Promise<FullList[]> => {
  const result: QuerySnapshot = await getDocs(
    query(
      getCollectionRef(COLLECTION_REF),
      where("allowedUsers", "array-contains", userUID),
    ),
  );

  const resultArray = transformCollectionToArray<List>(result);
  sortList(resultArray, "title");

  return Promise.all(
    resultArray.map(async (list) => {
      const profil = await getById(list.userUID);
      list.username = profil?.username;

      return fetchAllowedUsersFromList(list);
    }),
  );
};

const getMyLists = async (userUID: string): Promise<FullList[]> => {
  const result: QuerySnapshot = await getDocs(
    query(getCollectionRef(COLLECTION_REF), where("userUID", "==", userUID)),
  );

  const resultArray = transformCollectionToArray<List>(result);
  sortList(resultArray, "title");

  return Promise.all(
    resultArray.map(async (list) => {
      const profil = await getById(list.userUID);
      list.username = profil?.username;

      return fetchAllowedUsersFromList(list);
    }),
  );
};

const getListByID = async (id: string): Promise<FullList | null> => {
  const result: DocumentSnapshot = await getDoc(getDocRef(COLLECTION_REF, id));
  const list = result.exists() ? (result.data() as List) : null;

  if (!list) {
    return null;
  }

  const profil = await getById(list.userUID);
  list.username = profil?.username;

  return fetchAllowedUsersFromList(list);
};

const setList = async (list: FullList): Promise<void> => {
  const newList: List = {
    ...list,
    allowedUsers: list.allowedUsers.map((allowedUser) => allowedUser.userUID),
  };

  const listCollection = getCollectionRef(COLLECTION_REF);
  const listDocument = doc(listCollection, newList.id);
  await setDoc<DocumentData, DocumentData>(listDocument, newList);
};

const deleteList = async (id: string): Promise<void> => {
  return await deleteDoc(getDocRef(COLLECTION_REF, id));
};

export { getLists, getMyLists, getListByID, setList, deleteList };
