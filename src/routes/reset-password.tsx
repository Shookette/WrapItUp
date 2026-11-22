import "./reset-password.css";

import { createFileRoute, Link } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { useAppForm } from "#/hooks/useAppForm.ts";
import { emailSchema } from "#/utils/formSchemas.ts";
import { redirectSearchSchema } from "#/utils/redirect.ts";
import AuthLayout from "#/components/AuthLayout/AuthLayout.tsx";
import { useToast } from "#/components/Toast/toastContext.ts";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordComponent,
  validateSearch: redirectSearchSchema,
});

const resetPasswordSchema = z.object({
  email: emailSchema,
});

function ResetPasswordComponent() {
  const { resetPassword } = useUserContext();
  const navigate = Route.useNavigate();
  const { redirect } = Route.useSearch();
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
      await navigate({ to: "/login", search: { redirect } });
    },
  });

  return (
    <AuthLayout
      footer={
        <Link search={{ redirect }} to="/login">
          Retour à la connexion
        </Link>
      }
      title="Mot de passe oublié"
    >
      <p className="reset-password__text">
        Saisissez l'email de votre compte : nous vous enverrons un lien pour
        choisir un nouveau mot de passe.
      </p>
      <form.AppForm>
        <form.Form>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoComplete="email"
                label="Email"
                placeholder="vous@exemple.fr"
                required
                type="email"
              />
            )}
          </form.AppField>
          <form.SubmitButton>Envoyer le lien</form.SubmitButton>
        </form.Form>
      </form.AppForm>
    </AuthLayout>
  );
}
