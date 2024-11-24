import {
  collection,
  CollectionReference,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getFirestore,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";

const transformCollectionToArray = <T>(collection: QuerySnapshot): T[] => {
  const array: T[] = [];
  collection.forEach((item: QueryDocumentSnapshot) => {
    array.push(item.data() as T);
  });
  return array;
};

const sortList = <T extends object>(
  listObject: T[],
  filteredParameter: string,
  orderByAsc = true,
): void => {
  listObject.sort((a: T, b: T) =>
    orderByAsc
      ? sortByAsc<T>(a, filteredParameter, b)
      : sortByDesc<T>(a, filteredParameter, b),
  );
};

const sortByAsc = <T extends object>(
  a: T,
  filteredParameter: string,
  b: T,
): number => {
  return a[filteredParameter as keyof T] > b[filteredParameter as keyof T]
    ? 1
    : -1;
};

const sortByDesc = <T extends object>(
  a: T,
  filteredParameter: string,
  b: T,
): number => {
  return a[filteredParameter as keyof T] < b[filteredParameter as keyof T]
    ? 1
    : -1;
};

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

export { transformCollectionToArray, sortList, getDocRef, getCollectionRef };
