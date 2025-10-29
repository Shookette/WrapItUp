import { createFileRoute } from "@tanstack/react-router";
import {
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
import { useCallback, useState } from "react";
import PrivateLayout from "../components/PrivateLayout.tsx";
import Button from "../components/Button/Button.tsx";
import { UpdateUser } from "../interfaces/Profil.ts";

export const Route = createFileRoute("/account")({
  component: AccountComponent,
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function AccountComponent() {
  const { user, updateUser } = useUserContext();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<UpdateUser>({
    defaultValues: {
      displayName: user?.displayName ?? ''
    },
  });

  const handleOnSubmit: SubmitHandler<UpdateUser> = useCallback(async (userData) => {
    if (!user) {
      return;
    }

    setLoading(true);
    await updateUser({ ...user, displayName: userData.displayName });
    setLoading(false);
  }, []);

  return (
    <PrivateLayout>
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
                <Button isSubmit loading={loading}>
                  Envoyer
                </Button>
              </SimpleGrid>
            </form>
          </Paper>
        </Center>
      </Container>
    </PrivateLayout>
  );
}
