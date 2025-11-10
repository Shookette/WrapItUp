import { createFileRoute, Link } from "@tanstack/react-router";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Center,
  Container,
  Paper,
  PasswordInput,
  SimpleGrid,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { z } from "zod";
import Button from "../components/Button/Button.tsx";
import Input from "../components/Input/Input.tsx";
import Banner from "../components/Banner/Banner.tsx";
import { IconExclamationCircle } from "@tabler/icons-react";

const productSearchSchema = z.object({
  redirect: z.optional(z.string()),
});

export const Route = createFileRoute("/login")({
  component: LoginComponent,
  validateSearch: productSearchSchema,
});

export type FormLogin = {
  email: string;
  password: string;
};

function LoginComponent() {
  const { login, user } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const navigate = Route.useNavigate();

  const handleOnSubmit: SubmitHandler<FormLogin> = async (data) => {
    setLoading(true);
    const loginResponse = await login(data.email, data.password);
    setError(loginResponse);
    setLoading(false);
  };
  const { redirect } = Route.useSearch();

  useEffect(() => {
    if (user) {
      navigate({ to: redirect ?? "/" });
    }
  }, [user]);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormLogin>({
    defaultValues: { email: "", password: "" },
  });

  return (
    <Container>
      <Center>
        <Paper
          withBorder
          shadow="md"
          p={30}
          mt={30}
          radius="md"
          miw="320"
          w="50%"
        >
          <Title order={1}>Connexion</Title>
          <Space h="md" />
          {error && (
            <Banner iconPrefix={<IconExclamationCircle />} type="danger">
              {error}
            </Banner>
          )}

          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <Stack gap="xs">
              <Controller
                name="email"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <Input
                    error={!!errors.email}
                    errorMessage="L'adresse email est obligatoire"
                    id="email"
                    label="Email"
                    name={name}
                    placeholder="Email"
                    required
                    type="email"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field: { onChange, name } }) => (
                  <PasswordInput
                    error={errors.password && "Le mot de passe est obligatoire"}
                    label="Mot de passe"
                    name={name}
                    placeholder="Mot de passe"
                    type="password"
                    withAsterisk
                    onChange={onChange}
                  />
                )}
              />
              <Link
                to="/reset-password"
                style={{
                  fontSize: ".8em",
                  marginLeft: "auto",
                  textDecoration: "none",
                }}
              >
                <span>Mot de passe oublié</span>
              </Link>
              <SimpleGrid>
                <Button isSubmit loading={loading} type="success">
                  Connexion
                </Button>
              </SimpleGrid>
            </Stack>
          </form>
          <Space h="xl" />
          <SimpleGrid cols={1}>
            <Button
              type="primary"
              onClick={() => navigate({ to: "/register" })}
            >
              <span>Inscription</span>
            </Button>
          </SimpleGrid>
        </Paper>
      </Center>
    </Container>
  );
}
