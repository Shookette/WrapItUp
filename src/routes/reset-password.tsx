import { createFileRoute, Link } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";
import { useUserContext } from "#hooks/UserContext.tsx";
import { useAppForm } from "#hooks/useAppForm.ts";
import { emailSchema } from "#utils/formSchemas.ts";
import Center from "#components/Center/Center.tsx";
import Page from "#components/Page/Page.tsx";
import Title from "#components/Title/Title.tsx";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordComponent,
});

const resetPasswordSchema = z.object({
  email: emailSchema,
});

function ResetPasswordComponent() {
  const { resetPassword } = useUserContext();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      await resetPassword(value.email);
      await navigate({ to: "/login" });
    },
  });

  return (
    <Center>
      <Link
        to="/login"
        style={{
          fontSize: ".8em",
          marginLeft: "1em",
          textDecoration: "none",
        }}
      >
        {"< "}
        Retour à la page de connexion
      </Link>
      <Page size="md">
        <Title>Réinitialiser le mot de passe</Title>
        <form.AppForm>
          <form.Form>
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email"
                  placeholder="Email"
                  required
                  type="email"
                />
              )}
            </form.AppField>
            <form.SubmitButton type="success">
              Réinitialiser le mot de passe
            </form.SubmitButton>
          </form.Form>
        </form.AppForm>
      </Page>
    </Center>
  );
}
