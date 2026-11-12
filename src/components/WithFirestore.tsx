import initFirebase from "#/firebaseLoader.ts";
import { FC, PropsWithChildren } from "react";

const WithFirestore: FC<PropsWithChildren> = ({ children }) => {
  // Idempotent : seul le premier appel initialise Firebase et App Check.
  initFirebase();

  return <>{children}</>;
};

export default WithFirestore;
