import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";
import { FirebaseError } from "firebase/app";

import { isAuthenticated } from "#/utils/routeUtils.ts";
import { requiredString, usernameSchema } from "#/utils/formSchemas.ts";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { useAppForm } from "#/hooks/useAppForm.ts";
import { useToast } from "#/components/Toast/toastContext.ts";

import PrivateLayout from "#/components/PrivateLayout.tsx";
import Page from "#/components/Page/Page.tsx";
import Title from "#/components/Title/Title.tsx";

export const Route = createFileRoute("/account")({
  component: AccountComponent,
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

const accountSchema = z.object({
  displayName: usernameSchema,
});

const deleteAccountSchema = z.object({
  password: requiredString("Le mot de passe est obligatoire"),
});

// Codes d'erreur Firebase Auth de la ressaisie du mot de passe.
const deleteAccountErrors: Record<string, string> = {
  "auth/invalid-credential": "Le mot de passe est incorrect",
  "auth/wrong-password": "Le mot de passe est incorrect",
  "auth/too-many-requests":
    "Trop de tentatives : réessayez dans quelques minutes",
  default:
    "Le compte n'a pas pu être supprimé, veuillez réessayer dans quelques minutes",
};

function AccountComponent() {
  const { user, updateUser, deleteAccount } = useUserContext();
  const toast = useToast();
  const navigate = useNavigate();

  const deleteForm = useAppForm({
    defaultValues: { password: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: deleteAccountSchema },
    onSubmit: async ({ value }) => {
      try {
        await deleteAccount(value.password);
        toast.show({
          type: "success",
          message: `Votre compte et toutes ses données ont été supprimés`,
        });
        await navigate({ to: "/login" });
      } catch (error: unknown) {
        console.error("erreur lors de la suppression du compte :", error);
        const code = error instanceof FirebaseError ? error.code : "";
        toast.show({
          type: "danger",
          message: deleteAccountErrors[code] ?? deleteAccountErrors.default,
        });
      }
    },
  });

  const form = useAppForm({
    defaultValues: { displayName: user?.displayName ?? "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: accountSchema },
    onSubmit: async ({ value }) => {
      if (!user) {
        return;
      }

      try {
        await updateUser({ displayName: value.displayName.trim() });
        toast.show({
          type: "success",
          message: `Les informations ont été modifiées`,
        });
      } catch {
        toast.show({
          type: "danger",
          message: `Une erreur est survenue`,
        });
      }
    },
  });

  return (
    <PrivateLayout>
      <Page size="md">
        <Title>Informations personnelles</Title>
        <form.AppForm>
          <form.Form>
            <form.AppField name="displayName">
              {(field) => (
                <field.TextField
                  label="Nom / Prénom"
                  placeholder="Nom / Prénom"
                  required
                />
              )}
            </form.AppField>
            <form.SubmitButton>Envoyer</form.SubmitButton>
          </form.Form>
        </form.AppForm>
      </Page>

      <Page size="md">
        <Title>Supprimer mon compte</Title>
        <p>
          Vos listes, votre profil et vos réservations seront supprimés, et vous
          serez retiré·e des listes auxquelles vous avez été invité·e. Cette
          action est définitive.
        </p>
        <deleteForm.AppForm>
          <deleteForm.Form>
            <deleteForm.AppField name="password">
              {(field) => (
                <field.TextField
                  label="Mot de passe (confirmation)"
                  placeholder="Mot de passe"
                  required
                  type="password"
                />
              )}
            </deleteForm.AppField>
            <deleteForm.SubmitButton type="danger">
              Supprimer définitivement mon compte
            </deleteForm.SubmitButton>
          </deleteForm.Form>
        </deleteForm.AppForm>
      </Page>
    </PrivateLayout>
  );
}
