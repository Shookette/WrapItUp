import { createFileRoute } from "@tanstack/react-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useEffect } from "react";
import {
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
import Button from "../components/Button/Button.tsx";

export const Route = createFileRoute("/register")({
  component: RegisterComponent,
});

export type FormRegister = {
  email: string;
  username: string;
  password: string;
};

function RegisterComponent() {
  const { register: userRegister, user } = useUserContext();

  const navigate = Route.useNavigate();

  const handleOnSubmit: SubmitHandler<FormRegister> = async (data) => {
    await userRegister(data.email, data.password, data.username);
    navigate({ to: "/login" });
  };

  useEffect(() => {
    if (user) {
      navigate({ to: "/" });
    }
  }, [user]);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormRegister>({
    defaultValues: { email: "", username: "", password: "" },
  });

  return (
    <Container>
      <Center>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={1}>Inscription</Title>
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
                    required
                    error={errors.email && "L'adresse mail est obligatoire"}
                  />
                )}
              />
              <Controller
                name="username"
                control={control}
                render={({ field: { onChange, value, name } }) => (
                  <TextInput
                    id="username"
                    name={name}
                    value={value}
                    onChange={onChange}
                    label="Nom/Prenom"
                    withAsterisk
                    required
                    error={
                      errors.username && "Le nom et le prénom est obligatoire"
                    }
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
                    required
                    error={errors.password && "Le mot de passe est obligatoire"}
                  />
                )}
              />
              <SimpleGrid>
                <Button isSubmit>Inscription</Button>
              </SimpleGrid>
            </Stack>
          </form>
          <Space h="md" />
          <SimpleGrid cols={2}>
            <Button type="success" onClick={() => navigate({ to: "/login" })}>
              Connexion
            </Button>
            <Button
              type="danger"
              onClick={() => navigate({ to: "/reset-password" })}
            >
              Réinitialiser le mot de passe
            </Button>
          </SimpleGrid>
        </Paper>
      </Center>
    </Container>
  );
}
