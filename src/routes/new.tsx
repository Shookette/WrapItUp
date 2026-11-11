import { createFileRoute, useRouter } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import dayjs from "dayjs";
import { z } from "zod";
import { setList } from "#/repository/ListRepository.ts";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { useAppForm } from "#/hooks/useAppForm.ts";
import { isAuthenticated } from "#/utils/routeUtils.ts";
import { listTitleSchema } from "#/utils/formSchemas.ts";
import PrivateLayout from "#/components/PrivateLayout.tsx";
import Page from "#/components/Page/Page.tsx";
import Title from "#/components/Title/Title.tsx";

export const Route = createFileRoute("/new")({
  component: NewComponent,
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

const newListSchema = z.object({
  title: listTitleSchema,
});

function NewComponent() {
  const { navigate } = useRouter();
  const { user } = useUserContext();

  const form = useAppForm({
    defaultValues: { title: "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: newListSchema },
    onSubmit: async ({ value }) => {
      const listId = crypto.randomUUID();
      await setList({
        id: listId,
        userUID: user!.uid,
        createdAt: dayjs().format("YYYY-MM-DD"),
        title: value.title.trim(),
        presents: [],
        allowedUsers: [],
      });
      await navigate({ to: "/edit/$listId", params: { listId } });
    },
  });

  return (
    <PrivateLayout>
      <Page size="md">
        <Title>Ajouter une nouvelle liste de cadeau</Title>
        <form.AppForm>
          <form.Form>
            <form.AppField name="title">
              {(field) => (
                <field.TextField
                  label="Nom de la liste"
                  placeholder="Nom de la liste"
                  required
                />
              )}
            </form.AppField>
            <form.SubmitButton type="primary">Envoyer</form.SubmitButton>
          </form.Form>
        </form.AppForm>
      </Page>
    </PrivateLayout>
  );
}
