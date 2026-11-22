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
  getFirestore,
  runTransaction,
} from "firebase/firestore";
import {
  getCollectionRef,
  getDocRef,
  sortList,
  transformCollectionToArray,
} from "./utils";
import { AllowedUser, FullList, List } from "#/interfaces/List.ts";
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
  const { username: _username, ...listData } = list;
  const newList: List = {
    ...listData,
    allowedUsers: list.allowedUsers.map((allowedUser) => allowedUser.userUID),
  };

  const listCollection = getCollectionRef(COLLECTION_REF);
  const listDocument = doc(listCollection, newList.id);
  await setDoc<DocumentData, DocumentData>(listDocument, newList);
};

const updateList = async (
  id: string,
  change: (list: List) => List,
): Promise<void> => {
  const listDocument = getDocRef(COLLECTION_REF, id);
  await runTransaction(getFirestore(), async (transaction) => {
    const snapshot = await transaction.get(listDocument);
    if (!snapshot.exists()) {
      throw new Error("La liste n'existe plus");
    }
    const { username: _username, ...current } = snapshot.data() as List;
    transaction.set(listDocument, change(current));
  });
};

const leaveList = (id: string, userUID: string): Promise<void> =>
  updateList(id, (list) => ({
    ...list,
    allowedUsers: (list.allowedUsers ?? []).filter((uid) => uid !== userUID),
  }));

const deleteList = async (id: string): Promise<void> => {
  return await deleteDoc(getDocRef(COLLECTION_REF, id));
};

export {
  getLists,
  getMyLists,
  getListByID,
  setList,
  updateList,
  leaveList,
  deleteList,
};
