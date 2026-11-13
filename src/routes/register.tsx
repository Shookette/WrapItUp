import { createFileRoute, Link } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { useAppForm } from "#/hooks/useAppForm.ts";
import { emailSchema, usernameSchema } from "#/utils/formSchemas.ts";
import Banner from "#/components/Banner/Banner.tsx";
import Center from "#/components/Center/Center.tsx";
import Page from "#/components/Page/Page.tsx";
import Title from "#/components/Title/Title.tsx";
import { useToast } from "#/components/Toast/toastContext.ts";

export const Route = createFileRoute("/register")({
  component: RegisterComponent,
});

const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  // minimum imposé par Firebase Auth
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

function RegisterComponent() {
  const { register: userRegister, user } = useUserContext();
  const [error, setError] = useState<null | string>(null);
  const toast = useToast();

  const navigate = Route.useNavigate();

  useEffect(() => {
    if (user) {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

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
        <Title>Inscription</Title>
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
                  label="Email"
                  placeholder="Email"
                  required
                  type="email"
                />
              )}
            </form.AppField>
            <form.AppField name="username">
              {(field) => (
                <field.TextField
                  label="Nom/Prénom"
                  placeholder="Nom/Prénom"
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  label="Mot de passe"
                  placeholder="Mot de passe"
                  required
                  type="password"
                />
              )}
            </form.AppField>
            <form.SubmitButton type="success">Inscription</form.SubmitButton>
          </form.Form>
        </form.AppForm>
      </Page>
    </Center>
  );
}
