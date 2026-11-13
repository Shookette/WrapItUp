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

// Codes d'erreur Firebase Auth de l'inscription.
const REGISTER_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "Un compte existe déjà avec cet email",
  "auth/invalid-email": "L'email n'est pas valide",
  "auth/weak-password": "Le mot de passe est trop faible",
  "auth/too-many-requests":
    "Trop de tentatives : réessayez dans quelques minutes",
  default: "Une erreur est survenue lors de l'inscription, veuillez réessayer",
};

export const EMAIL_NOT_VERIFIED_ERROR =
  "Votre email n'est pas encore vérifié : cliquez sur le lien reçu par email, puis reconnectez-vous.";

type UserProvider = {
  user: User | null;
  login: (email: string, password: string) => Promise<null | string>;
  resendVerificationEmail: (email: string, password: string) => Promise<void>;
  /** Renvoie un message d'erreur, ou `null` si l'inscription a réussi. */
  register: (
    email: string,
    password: string,
    userName: string,
  ) => Promise<null | string>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: UpdateUser) => Promise<void>;
  logout: () => Promise<void>;
  /** Supprime le compte et toutes ses données, après ressaisie du mot de passe. */
  deleteAccount: (password: string) => Promise<void>;
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
        // Sans profil, le compte est inutilisable : on l'annule pour que
        // l'inscription puisse être refaite avec le même email.
        console.error("erreur lors de la création du profil :", error);
        await deleteUser(user).catch(() => signOut(auth));
        return REGISTER_ERRORS.default;
      }

      try {
        await sendEmailVerification(user);
      } catch (error: unknown) {
        // Le compte existe : l'email pourra être renvoyé depuis la connexion.
        console.error(
          "erreur lors de l'envoi de l'email de vérification :",
          error,
        );
      }
      // L'inscription connecte automatiquement : on attend la vérification.
      await signOut(auth);
      return null;
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

  const deleteAccount = useCallback(
    async (password: string) => {
      const currentUser = auth.currentUser;
      if (!currentUser?.email) {
        return;
      }
      // Firebase exige une connexion récente pour supprimer un compte.
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
