import {
  FC,
  ReactElement,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateCurrentUser,
  updateProfile,
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

import { FirebaseError } from "@firebase/util";
import { setProfil } from "../repository/ProfilRepository.ts";

type UserProvider = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    userName: string,
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  deleteCurrentUser: (user: User) => Promise<void>;
  isAuthenticated: boolean;
};

type UserProviderProps = {
  children: ReactElement;
};
type hookUserContext = () => UserProvider;

const UserContext = createContext<UserProvider | null>(null);

const key = "wrapitup.user";

function getStoredUser() {
  const storedUser = localStorage.getItem(key);
  if (!storedUser) {
    return null;
  }
  return JSON.parse(storedUser) as User;
}

function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem(key, JSON.stringify(user));
  } else {
    localStorage.removeItem(key);
  }
}

const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const auth = getAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setUser(user);
        setStoredUser(user);
      }
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      let userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      setUser(user);
      setStoredUser(user);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error(`erreur lors de la connexion: ${error.message}`);
      }
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, userName: string) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;
        await updateProfile(user, { displayName: userName });
        await setProfil({
          userUID: user.uid,
          username: userName,
          id: uuidv4(),
        });
        await sendEmailVerification(userCredential.user);
      } catch (error: unknown) {
        if (error instanceof FirebaseError) {
          console.error(`erreur lors de l'inscription: ${error.message}`);
        }
      }
    },
    [],
  );

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        console.error(
          `erreur lors de la réinitialisation du mot de passe: ${error.message}`,
        );
      }
    }
  }, []);

  const updateUser = useCallback(
    async (user: User) => {
      await updateProfile(user, { displayName: user.displayName });
      await updateCurrentUser(auth, user)
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setStoredUser(null);
    return setUser(null);
  }, []);

  const deleteCurrentUser = useCallback(async (user: User) => {
    await deleteUser(user);
    return setUser(null);
  }, []);

  const userProviderValue: UserProvider = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    updateUser,
    deleteCurrentUser,
  };

  return (
    <UserContext.Provider value={userProviderValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext: hookUserContext = () => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("userContext has to bed used within UserProvider");
  }

  return userContext;
};

export default UserProvider;
