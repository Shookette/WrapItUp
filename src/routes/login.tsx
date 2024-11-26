import { createFileRoute } from "@tanstack/react-router";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Button,
  Center,
  Container,
  Paper,
  PasswordInput,
  SimpleGrid,
  Space,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

export type FormLogin = {
  email: string;
  password: string;
};

function LoginComponent() {
  const { login, user } = useUserContext();

  const navigate = Route.useNavigate();

  const handleOnSubmit: SubmitHandler<FormLogin> = async (data) => {
    await login(data.email, data.password);
  };

  useEffect(() => {
    if (user) {
      navigate({ to: "/" });
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
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={1}>Connexion</Title>
          <Space h="md" />
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <Stack>
              <Controller
                name="email"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <TextInput
                    id="email"
                    name={name}
                    value={value}
                    onChange={onChange}
                    label="Email"
                    type="email"
                    withAsterisk
                    error={errors.email && "L'adresse mail est obligatoire"}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field: { onChange, name } }) => (
                  <PasswordInput
                    name={name}
                    onChange={onChange}
                    type="password"
                    label="Mot de Passe"
                    withAsterisk
                    error={errors.password && "Le mot de passe est obligatoire"}
                  />
                )}
              />
              <SimpleGrid>
                <Button type="submit">Connexion</Button>
              </SimpleGrid>
            </Stack>
          </form>
          <Space h="md" />
          <SimpleGrid cols={2}>
            <Button
              type="button"
              color="green"
              onClick={() => navigate({ to: "/register" })}
            >
              <span>Inscription</span>
            </Button>
            <Button
              type="button"
              color="red"
              onClick={() => navigate({ to: "/reset-password" })}
            >
              <span>Mot de passe oublié</span>
            </Button>
          </SimpleGrid>
        </Paper>
      </Center>
    </Container>
  );
}
