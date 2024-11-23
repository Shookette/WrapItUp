import initFirebase from '../firebaseLoader';
import {FC, ReactNode} from "react";

interface Props {
    children: ReactNode;
}

const WithFirestore: FC<Props> = ({children}) => {
    initFirebase();

    return <>{children}</>;
};

export default WithFirestore;