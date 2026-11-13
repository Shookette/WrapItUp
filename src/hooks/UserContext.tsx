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

import { FirebaseError } from "firebase/app";
import { setProfil } from "#/repository/ProfilRepository.ts";
import { UpdateUser } from "#/interfaces/Profil.ts";
const FIREBASE_ERROR_AUTH_INVALID_CREDENTIAL =
  "Firebase: Error (auth/invalid-credential).";

export const EMAIL_NOT_VERIFIED_ERROR =
  "Votre email n'est pas encore vérifié : cliquez sur le lien reçu par email, puis reconnectez-vous.";

type UserProvider = {
  user: User | null;
  login: (email: string, password: string) => Promise<null | string>;
  resendVerificationEmail: (email: string, password: string) => Promise<void>;
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

// Ancien cache de session (contenait les jetons Firebase) : on le supprime
// chez celles et ceux qui l'ont encore. Firebase persiste déjà la session.
localStorage.removeItem("wrapitup.user");

const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Vrai tant que Firebase n'a pas restauré (ou non) la session.
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user?.emailVerified ? user : null);
      setIsLoading(false);
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
        if (!user.emailVerified) {
          await signOut(auth);
          return EMAIL_NOT_VERIFIED_ERROR;
        }
        setUser(user);
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

  const resendVerificationEmail = useCallback(
    async (email: string, password: string) => {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      try {
        await sendEmailVerification(user);
      } finally {
        await signOut(auth);
      }
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
          id: crypto.randomUUID(),
        });
        await sendEmailVerification(userCredential.user);
        // L'inscription connecte automatiquement : on attend la vérification.
        await signOut(auth);
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
    },
    [user],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
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
    resendVerificationEmail,
    register,
    logout,
    resetPassword,
    updateUser,
    deleteCurrentUser,
  };

  return (
    <UserContext.Provider value={userProviderValue}>
      {isLoading ? null : children}
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
