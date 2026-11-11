import { createFileRoute, Link } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useAppForm } from "../hooks/useAppForm.ts";
import { emailSchema, requiredString } from "../utils/formSchemas.ts";
import Button from "../components/Button/Button.tsx";
import Banner from "../components/Banner/Banner.tsx";
import Center from "../components/Center/Center.tsx";
import Page from "../components/Page/Page.tsx";
import Title from "../components/Title/Title.tsx";
import "./login.css";

const loginSearchSchema = z.object({
  redirect: z.optional(z.string()),
});

export const Route = createFileRoute("/login")({
  component: LoginComponent,
  validateSearch: loginSearchSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: requiredString("Le mot de passe est obligatoire"),
});

function LoginComponent() {
  const { login, user } = useUserContext();
  const [error, setError] = useState<null | string>(null);

  const navigate = Route.useNavigate();
  const { redirect } = Route.useSearch();

  useEffect(() => {
    if (user) {
      navigate({ to: redirect ?? "/" });
    }
  }, [user, navigate, redirect]);

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: loginSchema },
    onSubmit: async ({ value }) => {
      setError(await login(value.email, value.password));
    },
  });

  return (
    <Center>
      <Page size="sm">
        <Title>Connexion</Title>
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
            <Link className="login__forgotten-password" to="/reset-password">
              Mot de passe oublié
            </Link>
            <form.SubmitButton type="success">Connexion</form.SubmitButton>
          </form.Form>
        </form.AppForm>
        <div className="login__register">
          <Button type="primary" onClick={() => navigate({ to: "/register" })}>
            Inscription
          </Button>
        </div>
      </Page>
    </Center>
  );
}
