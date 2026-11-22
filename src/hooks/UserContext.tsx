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
  EmailAuthProvider,
  reauthenticateWithCredential,
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
import { deleteAccountData } from "#/repository/AccountRepository.ts";
import { UpdateUser } from "#/interfaces/Profil.ts";
const FIREBASE_ERROR_AUTH_INVALID_CREDENTIAL =
  "Firebase: Error (auth/invalid-credential).";

const REGISTER_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "Un compte existe déjà avec cet email",
  "auth/invalid-email": "L'email n'est pas valide",
  "auth/weak-password": "Le mot de passe est trop faible",
  "auth/password-does-not-meet-requirements":
    "Le mot de passe ne respecte pas les règles de sécurité",
  "auth/too-many-requests":
    "Trop de tentatives : réessayez dans quelques minutes",
  default: "Une erreur est survenue lors de l'inscription, veuillez réessayer",
};

const RESET_PASSWORD_ERRORS: Record<string, string> = {
  "auth/invalid-email": "L'email n'est pas valide",
  "auth/too-many-requests":
    "Trop de demandes : réessayez dans quelques minutes",
  "auth/network-request-failed":
    "Problème de connexion réseau, veuillez réessayer",
  default:
    "L'email de réinitialisation n'a pas pu être envoyé, veuillez réessayer",
};

export const PASSWORD_OUTDATED_ERROR =
  "Votre mot de passe ne respecte plus les règles de sécurité : choisissez-en un nouveau avec « Mot de passe oublié ».";

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
  ) => Promise<null | string>;
  resetPassword: (email: string) => Promise<null | string>;
  updateUser: (data: UpdateUser) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  isAuthenticated: boolean;
};

type hookUserContext = () => UserProvider;

const UserContext = createContext<UserProvider | null>(null);

localStorage.removeItem("wrapitup.user");

const UserProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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
          } else if (
            error.code === "auth/password-does-not-meet-requirements"
          ) {
            errorMessage = PASSWORD_OUTDATED_ERROR;
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
      let user: User;
      try {
        ({ user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        ));
      } catch (error: unknown) {
        console.error("erreur lors de l'inscription :", error);
        const code = error instanceof FirebaseError ? error.code : "";
        return REGISTER_ERRORS[code] ?? REGISTER_ERRORS.default;
      }

      try {
        await updateProfile(user, { displayName: userName });
        await setProfil({
          userUID: user.uid,
          username: userName,
          id: crypto.randomUUID(),
        });
      } catch (error: unknown) {
        console.error("erreur lors de la création du profil :", error);
        await deleteUser(user).catch(() => signOut(auth));
        return REGISTER_ERRORS.default;
      }

      try {
        await sendEmailVerification(user);
      } catch (error: unknown) {
        console.error(
          "erreur lors de l'envoi de l'email de vérification :",
          error,
        );
      }
      await signOut(auth);
      return null;
    },
    [auth],
  );

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        await sendPasswordResetEmail(auth, email);
        return null;
      } catch (error: unknown) {
        console.error(
          "erreur lors de la réinitialisation du mot de passe :",
          error,
        );
        const code = error instanceof FirebaseError ? error.code : "";
        return RESET_PASSWORD_ERRORS[code] ?? RESET_PASSWORD_ERRORS.default;
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

  const deleteAccount = useCallback(
    async (password: string) => {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) {
        return;
      }
      await reauthenticateWithCredential(
        currentUser,
        EmailAuthProvider.credential(currentUser.email, password),
      );
      await deleteAccountData(currentUser.uid);
      await deleteUser(currentUser);
      setUser(null);
    },
    [auth],
  );

  const userProviderValue: UserProvider = {
    user,
    isAuthenticated,
    login,
    resendVerificationEmail,
    register,
    logout,
    resetPassword,
    updateUser,
    deleteAccount,
  };

  return (
    <UserContext.Provider value={userProviderValue}>
      {isLoading ? null : children}
    </UserContext.Provider>
  );
};

// oxlint-disable-next-line react/only-export-components -- #26
export const useUserContext: hookUserContext = () => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error("userContext has to bed used within UserProvider");
  }

  return userContext;
};

export default UserProvider;
