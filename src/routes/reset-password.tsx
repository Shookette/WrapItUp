import { createFileRoute, Link } from "@tanstack/react-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useUserContext } from "../hooks/UserContext.tsx";
import {
  Center,
  Container,
  Paper,
  SimpleGrid,
  Space,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import Button from "../components/Button/Button.tsx";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordComponent,
});

export type FormResetPassword = {
  email: string;
};

function ResetPasswordComponent() {
  const { resetPassword } = useUserContext();
  const navigate = Route.useNavigate();

  const handleOnSubmit: SubmitHandler<FormResetPassword> = async (data) => {
    await resetPassword(data.email);
    navigate({ to: "/login" });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormResetPassword>({ defaultValues: { email: "" } });

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
            <Title order={1}>Réinitialiser le mot de passe</Title>
            <Space h="md" />
            <form className="form" onSubmit={handleSubmit(handleOnSubmit)}>
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
                      placeholder="Email"
                      label="Email"
                      type="email"
                      withAsterisk
                      required
                      error={errors.email && "L'adresse mail est obligatoire"}
                    />
                  )}
                />
                <SimpleGrid>
                  <Button type="success" isSubmit>
                    Réinitialiser le mot de passe
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
