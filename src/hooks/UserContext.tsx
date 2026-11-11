import {
  FC,
  PropsWithChildren,
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
  updateProfile,
} from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

import { FirebaseError } from "firebase/app";
import { setProfil } from "#repository/ProfilRepository.ts";
import { UpdateUser } from "#interfaces/Profil.ts";
const FIREBASE_ERROR_AUTH_INVALID_CREDENTIAL =
  "Firebase: Error (auth/invalid-credential).";

type UserProvider = {
  user: User | null;
  login: (email: string, password: string) => Promise<null | string>;
  register: (
    email: string,
    password: string,
    userName: string,
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: UpdateUser) => Promise<void>;
  logout: () => Promise<void>;
  deleteCurrentUser: (user: User) => Promise<void>;
  isAuthenticated: boolean;
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

const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const auth = getAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setUser(user);
        setStoredUser(user);
      }
    });
    return unsubscribe;
  }, [auth]);

  const login = useCallback(
    async (email: string, password: string) => {
      let errorMessage = null;
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;
        setUser(user);
        setStoredUser(user);
      } catch (error: unknown) {
        if (error instanceof FirebaseError) {
          if (error.message === FIREBASE_ERROR_AUTH_INVALID_CREDENTIAL) {
            errorMessage = `L'email ou le mot de passe est incorrect`;
          } else {
            errorMessage = `Une erreur est survenue lors de la connexion, veuillez réessayer`;
          }
        }
      }

      return errorMessage;
    },
    [auth],
  );

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
    [auth],
  );

  const resetPassword = useCallback(
    async (email: string): Promise<void> => {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error: unknown) {
        if (error instanceof FirebaseError) {
          console.error(
            `erreur lors de la réinitialisation du mot de passe: ${error.message}`,
          );
        }
      }
    },
    [auth],
  );

  const updateUser = useCallback(
    async (data: UpdateUser) => {
      const auth = getAuth();
      if (!auth.currentUser || !user) {
        return;
      }

      await updateProfile(auth.currentUser, { displayName: data.displayName });

      setStoredUser({
        ...user,
        displayName: data.displayName,
      });
    },
    [user],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setStoredUser(null);
    setUser(null);
  }, [auth]);

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

// Le hook partage le fichier du provider : seul le rechargement à chaud (HMR) est concerné.
// oxlint-disable-next-line react/only-export-components
export const useUserContext: hookUserContext = () => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("userContext has to bed used within UserProvider");
  }

  return userContext;
};

export default UserProvider;
