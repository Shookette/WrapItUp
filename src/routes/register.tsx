import { createFileRoute, Link } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { useEffect } from "react";
import { z } from "zod";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useAppForm } from "../hooks/useAppForm.ts";
import { emailSchema, requiredString } from "../utils/formSchemas.ts";
import Center from "../components/Center/Center.tsx";
import Page from "../components/Page/Page.tsx";
import Title from "../components/Title/Title.tsx";

export const Route = createFileRoute("/register")({
  component: RegisterComponent,
});

const registerSchema = z.object({
  email: emailSchema,
  username: requiredString("Le nom et le prénom sont obligatoires"),
  // minimum imposé par Firebase Auth
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

function RegisterComponent() {
  const { register: userRegister, user } = useUserContext();

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
      await userRegister(value.email, value.password, value.username.trim());
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
