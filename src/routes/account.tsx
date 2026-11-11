import { createFileRoute } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";

import { isAuthenticated } from "#/utils/routeUtils.ts";
import { usernameSchema } from "#/utils/formSchemas.ts";
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

function AccountComponent() {
  const { user, updateUser } = useUserContext();
  const toast = useToast();

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
    </PrivateLayout>
  );
}
