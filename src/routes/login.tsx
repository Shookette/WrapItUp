import { createFileRoute, Link } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { IconExclamationCircle } from "@tabler/icons-react";
import { FirebaseError } from "firebase/app";
import {
  EMAIL_NOT_VERIFIED_ERROR,
  useUserContext,
} from "#/hooks/UserContext.tsx";
import { useAppForm } from "#/hooks/useAppForm.ts";
import { emailSchema, requiredString } from "#/utils/formSchemas.ts";
import Button from "#/components/Button/Button.tsx";
import Banner from "#/components/Banner/Banner.tsx";
import Center from "#/components/Center/Center.tsx";
import Page from "#/components/Page/Page.tsx";
import Title from "#/components/Title/Title.tsx";
import { useToast } from "#/components/Toast/toastContext.ts";
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

// Codes d'erreur Firebase Auth du renvoi de l'email de vérification.
const resendErrorMessages: Record<string, string> = {
  "auth/too-many-requests": `Un email de vérification vient déjà d'être envoyé : attendez quelques minutes avant d'en redemander un`,
  "auth/invalid-credential": `L'email ou le mot de passe est incorrect`,
  default: `L'email n'a pas pu être envoyé, réessayez dans quelques minutes`,
};

function LoginComponent() {
  const { login, resendVerificationEmail, user } = useUserContext();
  const [error, setError] = useState<null | string>(null);
  const [isResending, setIsResending] = useState(false);
  const toast = useToast();

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

  const resend = async () => {
    const { email, password } = form.state.values;
    setIsResending(true);
    try {
      await resendVerificationEmail(email, password);
      toast.show({
        type: "success",
        message: `Un nouvel email de vérification a été envoyé à ${email}`,
      });
    } catch (error: unknown) {
      const code = error instanceof FirebaseError ? error.code : null;
      console.error("renvoi de l'email de vérification :", error);
      toast.show({
        type: "danger",
        message: resendErrorMessages[code ?? ""] ?? resendErrorMessages.default,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Center>
      <Page size="sm">
        <Title>Connexion</Title>
        {error && (
          <Banner iconPrefix={<IconExclamationCircle />} type="danger">
            {error}
          </Banner>
        )}
        {error === EMAIL_NOT_VERIFIED_ERROR && (
          <div className="login__resend">
            <Button size="small" loading={isResending} onClick={resend}>
              Renvoyer l'email de vérification
            </Button>
          </div>
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
