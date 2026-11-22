import initFirebase from "#/firebaseLoader.ts";
import { FC, PropsWithChildren } from "react";

const WithFirestore: FC<PropsWithChildren> = ({ children }) => {
  initFirebase();

  return <>{children}</>;
};

export default WithFirestore;
