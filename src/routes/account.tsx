import { createFileRoute } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { notifications } from "@mantine/notifications";
import { z } from "zod";

import { isAuthenticated } from "../utils/routeUtils";
import { requiredString } from "../utils/formSchemas.ts";
import { useUserContext } from "../hooks/UserContext";
import { useAppForm } from "../hooks/useAppForm.ts";

import PrivateLayout from "../components/PrivateLayout.tsx";
import Page from "../components/Page/Page.tsx";
import Title from "../components/Title/Title.tsx";

export const Route = createFileRoute("/account")({
  component: AccountComponent,
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

const accountSchema = z.object({
  displayName: requiredString("Le nom et le prénom sont obligatoires"),
});

function AccountComponent() {
  const { user, updateUser } = useUserContext();

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
        notifications.show({
          color: "green",
          position: "top-right",
          message: `Les informations ont été modifiées`,
        });
      } catch {
        notifications.show({
          color: "red",
          position: "top-right",
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
    </PrivateLayout>
  );
}
