import { useCallback, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { createFileRoute } from "@tanstack/react-router";
import {
  SimpleGrid,
  Space,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { isAuthenticated } from "../utils/routeUtils";
import { useUserContext } from "../hooks/UserContext";
import { UpdateUser } from "../interfaces/Profil.ts";

import Button from "../components/Button/Button.tsx";
import PrivateLayout from "../components/PrivateLayout.tsx";
import Input from "../components/Input/Input.tsx";
import Page from "../components/Page/Page.tsx";

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
      displayName: user?.displayName ?? "",
    },
  });

  const handleOnSubmit: SubmitHandler<UpdateUser> = useCallback(
    async (userData) => {
      if (!user) {
        return;
      }

      setLoading(true);
      await updateUser({ displayName: userData.displayName })
        .then(() => {
          notifications.show({
            color: "green",
            position: "top-right",
            message: `Les informations ont été modifiées`,
          });
        })
        .catch(() => {
          notifications.show({
            color: "red",
            position: "top-right",
            message: `Une erreur est survenue`,
          });
        });
      setLoading(false);
    },
    [],
  );

  return (
    <PrivateLayout>
      <Page size="md">
        <Title order={2}>Informations personnelles</Title>
        <form onSubmit={handleSubmit(handleOnSubmit)}>
          <Controller
            name="displayName"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <Input
                id="displayName"
                label="Nom / Prénom"
                placeholder="Nom / Prénom"
                name={name}
                required
                value={value ?? ""}
                onChange={onChange}
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
      </Page>
    </PrivateLayout>
  );
}
