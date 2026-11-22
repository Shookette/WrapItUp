import "./edit.css";

import { useState } from "react";
import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";
import {
  IconExclamationCircle,
  IconGift,
  IconPencil,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";

import {
  deleteList,
  getListByID,
  setList,
} from "#/repository/ListRepository.ts";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { useAppForm } from "#/hooks/useAppForm.ts";
import { isAuthenticated } from "#/utils/routeUtils.ts";
import { listTitleSchema } from "#/utils/formSchemas.ts";
import { plural } from "#/utils/plural.ts";
import { useToast } from "#/components/Toast/toastContext.ts";
import { useConfirm } from "#/components/Confirm/confirmContext.ts";

import ListForm from "#/components/ListEdit/ListForm.tsx";
import ListUserForm from "#/components/ListEdit/ListUserForm.tsx";
import PrivateLayout from "#/components/PrivateLayout.tsx";
import Button from "#/components/Button/Button.tsx";
import Dialog from "#/components/Dialog/Dialog.tsx";
import Tabs from "#/components/Tabs/Tabs.tsx";
import Page from "#/components/Page/Page.tsx";
import Title from "#/components/Title/Title.tsx";

const tabKeys = ["presents", "users", "danger"] as const;

const editSearchSchema = z.object({
  tab: z.enum(tabKeys).optional().catch(undefined),
});

export const Route = createFileRoute("/edit/$listId")({
  component: EditComponent,
  validateSearch: editSearchSchema,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function EditComponent() {
  const list = Route.useLoaderData();
  const { tab = "presents" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const { user } = useUserContext();
  const toast = useToast();
  const confirm = useConfirm();
  const [removingUserUID, setRemovingUserUID] = useState<string>();
  const [isRenaming, setIsRenaming] = useState(false);

  const renameForm = useAppForm({
    defaultValues: { title: list?.title ?? "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: z.object({ title: listTitleSchema }) },
    onSubmit: async ({ value }) => {
      if (!list) {
        return;
      }
      await setList({ ...list, title: value.title });
      await router.invalidate();
      setIsRenaming(false);
      toast.show({ type: "success", message: "Liste renommée" });
    },
  });

  if (!list || list.userUID !== user?.uid) {
    return <Navigate to="/" />;
  }

  const openRename = () => {
    renameForm.reset({ title: list.title });
    setIsRenaming(true);
  };

  const handleDeleteList = async () => {
    const confirmed = await confirm({
      title: `Supprimer « ${list.title} » ?`,
      message:
        "La liste, ses cadeaux et leurs réservations seront supprimés pour tout le monde. Cette action est définitive.",
      confirmLabel: "Supprimer la liste",
    });
    if (!confirmed) {
      return;
    }

    await deleteList(list.id);
    toast.show({ type: "success", message: "Liste supprimée" });
    return navigate({ to: "/" });
  };

  const removeUser = async (userUID: string) => {
    const guest = list.allowedUsers.find((user) => user.userUID === userUID);
    const confirmed = await confirm({
      title: `Retirer ${guest?.username ?? "cet·te invité·e"} ?`,
      message:
        "Cette personne ne verra plus la liste. Elle pourra la rejoindre à nouveau avec le lien d'invitation.",
      confirmLabel: "Retirer",
    });
    if (!confirmed) {
      return;
    }

    setRemovingUserUID(userUID);
    try {
      await setList({
        ...list,
        allowedUsers: list.allowedUsers.filter(
          (user) => user.userUID !== userUID,
        ),
      });
      await router.invalidate();
      toast.show({
        type: "success",
        message: "L'invité·e a été retiré·e de la liste",
      });
    } catch (error: unknown) {
      console.error("retrait d'un·e invité·e :", error);
      toast.show({
        type: "danger",
        message: "L'invité·e n'a pas pu être retiré·e, veuillez réessayer",
      });
    } finally {
      setRemovingUserUID(undefined);
    }
  };

  const tabs = [
    {
      children: <ListForm key={list.id} list={list} />,
      icon: <IconGift size={20} />,
      key: "presents",
      title: "Cadeaux",
    },
    {
      children: (
        <ListUserForm
          list={list}
          removingUserUID={removingUserUID}
          onRemove={removeUser}
        />
      ),
      icon: <IconUser size={20} />,
      key: "users",
      title: "Invité·es",
    },
    {
      children: (
        <div className="edit-danger">
          <h3 className="edit-danger__title">Supprimer la liste</h3>
          <p className="edit-danger__text">
            La liste, ses cadeaux et leurs réservations seront supprimés pour
            tout le monde, invité·es compris. Cette action est définitive.
          </p>
          <div>
            <Button
              icon={<IconTrash size={20} />}
              type="danger"
              onClick={() => handleDeleteList()}
            >
              Supprimer la liste
            </Button>
          </div>
        </div>
      ),
      danger: true,
      icon: <IconExclamationCircle size={20} />,
      key: "danger",
      shortTitle: "Danger",
      title: "Danger zone",
    },
  ];

  return (
    <PrivateLayout back={{ label: "Mes listes", to: "/" }}>
      <Title
        actions={
          <Button
            ariaLabel="Renommer la liste"
            icon={<IconPencil size={22} />}
            type="secondary"
            onClick={openRename}
          />
        }
        subtitle={`${plural(list.presents?.length ?? 0, "cadeau", "cadeaux")} · ${plural(list.allowedUsers.length, "invité·e", "invité·es")}`}
        variant="page"
      >
        {list.title}
      </Title>

      <Page size="lg">
        <Tabs
          activeKey={tab}
          label="Modifier la liste"
          tabs={tabs}
          onChange={(key) => {
            const nextTab = editSearchSchema.shape.tab.parse(key);
            void navigate({
              replace: true,
              search: { tab: nextTab === "presents" ? undefined : nextTab },
            });
          }}
        />
      </Page>

      <Dialog
        open={isRenaming}
        title="Renommer la liste"
        onClose={() => setIsRenaming(false)}
      >
        <renameForm.AppForm>
          <renameForm.Form>
            <renameForm.AppField name="title">
              {(field) => <field.TextField label="Nom de la liste" required />}
            </renameForm.AppField>
            <renameForm.SubmitButton>Renommer</renameForm.SubmitButton>
          </renameForm.Form>
        </renameForm.AppForm>
      </Dialog>
    </PrivateLayout>
  );
}
