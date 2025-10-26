import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
  Button,
  Center,
  Container,
  Paper,
  SimpleGrid,
  Space,
  TextInput,
  Title,
} from "@mantine/core";
import { isAuthenticated } from "../utils/routeUtils";
import { useUserContext } from "../hooks/UserContext";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { User } from "firebase/auth";
import { useCallback, useMemo } from "react";

export const Route = createFileRoute("/account")({
  component: AccountComponent,
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function AccountComponent() {
  const { user, updateUser } = useUserContext();

  const defaultUser = useMemo(
    () => ({
      ...user,
    }),
    [user],
  );

  const { control, handleSubmit } = useForm<User>({
    defaultValues: defaultUser,
  });

  const handleOnSubmit: SubmitHandler<User> = useCallback(async (user) => {
    await updateUser(user);
    Navigate({
      to: "/",
    });
  }, []);

  return (
    <Container>
      <Center>
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title order={2}>Informations personnelles</Title>
          <form onSubmit={handleSubmit(handleOnSubmit)}>
            <Controller
              name="displayName"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <TextInput
                  id="displayName"
                  name={name}
                  value={value ?? ""}
                  placeholder="Nom / Prénom"
                  onChange={onChange}
                  label="Nom / Prénom"
                  autoFocus
                  withAsterisk
                  required
                />
              )}
            />

            <Space h="md" />
            <SimpleGrid>
              <Button type="submit">Envoyer</Button>
            </SimpleGrid>
          </form>
        </Paper>
      </Center>
    </Container>
  );
}
