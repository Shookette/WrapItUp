import { useState } from "react";
import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import {
  IconExclamationCircle,
  IconGift,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";

import {
  deleteList,
  getListByID,
  setList,
} from "#/repository/ListRepository.ts";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { isAuthenticated } from "#/utils/routeUtils.ts";
import { useToast } from "#/components/Toast/toastContext.ts";
import { useConfirm } from "#/components/Confirm/confirmContext.ts";

import ListForm from "#/components/ListEdit/ListForm.tsx";
import ListUserForm from "#/components/ListEdit/ListUserForm.tsx";
import PrivateLayout from "#/components/PrivateLayout.tsx";
import Button from "#/components/Button/Button.tsx";
import Tabs from "#/components/Tabs/Tabs.tsx";
import Page from "#/components/Page/Page.tsx";
import Title from "#/components/Title/Title.tsx";

export const Route = createFileRoute("/edit/$listId")({
  component: EditComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function EditComponent() {
  const list = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const router = useRouter();

  const { user } = useUserContext();
  const toast = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);

  if (!list || list.userUID !== user?.uid) {
    return <Navigate to="/" />;
  }

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
    return navigate({ to: "/" });
  };

  const removeUser = async (userUID: string) => {
    setLoading(true);

    await setList({
      ...list,
      allowedUsers: list.allowedUsers.filter(
        (user) => user.userUID !== userUID,
      ),
    });
    router.invalidate();
    toast.show({
      type: "success",
      message: "L'invité·e a été retiré·e de la liste",
    });
    setLoading(false);
  };

  const tabs = [
    {
      children: <ListForm list={list} />,
      icon: <IconGift size={20} />,
      key: "presents",
      title: "Cadeaux",
    },
    {
      children: (
        <ListUserForm
          list={list}
          handleOnRemove={removeUser}
          loading={loading}
        />
      ),
      icon: <IconUser size={20} />,
      key: "users",
      title: "Invité·es",
    },
    {
      children: (
        <div>
          <Button
            icon={<IconTrash size={20} />}
            type="danger"
            onClick={() => handleDeleteList()}
          >
            Supprimer la liste
          </Button>
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
      <Page size="lg">
        <Title>Modifier votre liste de cadeau</Title>

        <Tabs label="Modifier la liste" tabs={tabs} />
      </Page>
    </PrivateLayout>
  );
}
