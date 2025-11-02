import { createFileRoute, Link } from "@tanstack/react-router";
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
        <Stack gap="xs" mt={30}>
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

          <Paper withBorder shadow="md" p={30} radius="md" miw="320">
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
                      placeholder="Email"
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
                      label="Nom/Prénom"
                      placeholder="Nom/Prénom"
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
                      label="Mot de passe"
                      placeholder="Mot de passe"
                      withAsterisk
                      required
                      error={
                        errors.password && "Le mot de passe est obligatoire"
                      }
                    />
                  )}
                />
                <SimpleGrid>
                  <Button type="success" isSubmit>
                    Inscription
                  </Button>
                </SimpleGrid>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Center>
    </Container>
  );
}
