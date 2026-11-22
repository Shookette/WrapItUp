import { createFileRoute, Link } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { useAppForm } from "#/hooks/useAppForm.ts";
import { emailSchema } from "#/utils/formSchemas.ts";
import Center from "#/components/Center/Center.tsx";
import Header from "#/components/Header/Header.tsx";
import Page from "#/components/Page/Page.tsx";
import Title from "#/components/Title/Title.tsx";
import { useToast } from "#/components/Toast/toastContext.ts";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordComponent,
});

const resetPasswordSchema = z.object({
  email: emailSchema,
});

function ResetPasswordComponent() {
  const { resetPassword } = useUserContext();
  const navigate = Route.useNavigate();
  const toast = useToast();

  const form = useAppForm({
    defaultValues: { email: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      const error = await resetPassword(value.email);
      if (error) {
        toast.show({ type: "danger", message: error });
        return;
      }
      toast.show({
        type: "success",
        title: "Email envoyé",
        message: `Si un compte existe pour ${value.email}, un lien de réinitialisation vient d'y être envoyé. Pensez à vérifier vos spams.`,
      });
      await navigate({ to: "/login" });
    },
  });

  return (
    <>
      <Header />
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
    </>
  );
}
