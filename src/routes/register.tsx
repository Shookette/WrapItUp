import { createFileRoute, Link } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { useAppForm } from "#/hooks/useAppForm.ts";
import {
  emailSchema,
  newPasswordSchema,
  PASSWORD_RULES,
  usernameSchema,
} from "#/utils/formSchemas.ts";
import { redirectSearchSchema } from "#/utils/redirect.ts";
import Banner from "#/components/Banner/Banner.tsx";
import AuthLayout from "#/components/AuthLayout/AuthLayout.tsx";
import { useToast } from "#/components/Toast/toastContext.ts";

export const Route = createFileRoute("/register")({
  component: RegisterComponent,
  validateSearch: redirectSearchSchema,
});

const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: newPasswordSchema,
});

function RegisterComponent() {
  const { register: userRegister, user } = useUserContext();
  const [error, setError] = useState<null | string>(null);
  const toast = useToast();

  const navigate = Route.useNavigate();
  const { redirect } = Route.useSearch();

  useEffect(() => {
    if (user) {
      navigate({ to: redirect ?? "/" });
    }
  }, [user, navigate, redirect]);

  const form = useAppForm({
    defaultValues: { email: "", username: "", password: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: registerSchema },
    onSubmit: async ({ value }) => {
      const registerError = await userRegister(
        value.email,
        value.password,
        value.username.trim(),
      );
      setError(registerError);
      if (registerError) {
        return;
      }
      toast.show({
        type: "success",
        message: `Un email de vérification a été envoyé à ${value.email} : cliquez sur le lien qu'il contient avant de vous connecter`,
      });
      await navigate({ to: "/login", search: { redirect } });
    },
  });

  return (
    <AuthLayout
      footer={
        <>
          Déjà un compte ?{" "}
          <Link search={{ redirect }} to="/login">
            Se connecter
          </Link>
        </>
      }
      title="Créer un compte"
    >
      {error && (
        <Banner iconPrefix={<IconExclamationCircle />} type="danger">
          {error}
        </Banner>
      )}
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
          <form.AppField name="username">
            {(field) => (
              <field.TextField
                autoComplete="name"
                description="Vos proches le verront sur vos listes"
                label="Prénom et nom"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField
                autoComplete="new-password"
                description={PASSWORD_RULES}
                label="Mot de passe"
                required
                type="password"
              />
            )}
          </form.AppField>
          <form.SubmitButton>Créer mon compte</form.SubmitButton>
        </form.Form>
      </form.AppForm>
    </AuthLayout>
  );
}
