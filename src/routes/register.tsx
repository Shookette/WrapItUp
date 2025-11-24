import { createFileRoute, Link } from "@tanstack/react-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useUserContext } from "../hooks/UserContext.tsx";
import { useEffect } from "react";
import {
  SimpleGrid,
  Space,
} from "@mantine/core";
import Button from "../components/Button/Button.tsx";
import Input from "../components/Input/Input.tsx";
import Center from "../components/Center/Center.tsx";
import Page from "../components/Page/Page.tsx";
import Title from "../components/Title/Title.tsx";

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
        <Space h="md" />
        <form style={{ display: 'flex', gap: '15px', flexDirection: 'column' }} onSubmit={handleSubmit(handleOnSubmit)}>
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <Input
                error={!!errors.email}
                errorMessage={"L'adresse mail est obligatoire"}
                id="email"
                label="Email"
                name={name}
                placeholder="Email"
                type="email"
                required
                value={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            name="username"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <Input
                error={!!errors.username}
                errorMessage={"Le nom et le prénom est obligatoire"}
                id="username"
                label="Nom/Prénom"
                name={name}
                placeholder="Nom/Prénom"
                required
                value={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, name, value } }) => (
              <Input
                error={!!errors.password}
                errorMessage={"Le mot de passe est obligatoire"}
                label="Mot de passe"
                name={name}
                placeholder="Mot de passe"
                required
                type="password"
                value={value}
                onChange={onChange}
              />
            )}
          />
          <SimpleGrid>
            <Button type="success" isSubmit>
              Inscription
            </Button>
          </SimpleGrid>
        </form>
      </Page>
    </Center >
  );
}
