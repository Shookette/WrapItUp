import { createFileRoute, useRouter } from "@tanstack/react-router";
import { IconGift, IconLogout2 } from "@tabler/icons-react";
import { useState } from "react";
import { getLists, setList } from "#/repository/ListRepository.ts";
import { isAuthenticated } from "#/utils/routeUtils.ts";
import { plural } from "#/utils/plural.ts";
import { FullList } from "#/interfaces/List.ts";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { useToast } from "#/components/Toast/toastContext.ts";
import PrivateLayout from "#/components/PrivateLayout.tsx";
import Title from "#/components/Title/Title.tsx";
import Button from "#/components/Button/Button.tsx";
import ListItem, { ListItems } from "#/components/ListItem/ListItem.tsx";
import EmptyState from "#/components/EmptyState/EmptyState.tsx";

export const Route = createFileRoute("/lists")({
  component: ListsComponent,
  loader: ({ context }) => {
    const user = context.auth?.user;

    if (!user) {
      return [];
    }

    return getLists(user?.uid);
  },
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function ListsComponent() {
  const lists = Route.useLoaderData();
  const { user } = useUserContext();
  const router = useRouter();
  const toast = useToast();
  const [leavingListId, setLeavingListId] = useState<string>();

  const leaveList = async (list: FullList) => {
    if (!window.confirm(`Quitter la liste « ${list.title} » ?`)) {
      return;
    }

    setLeavingListId(list.id);
    try {
      await setList({
        ...list,
        allowedUsers: list.allowedUsers.filter(
          (allowedUser) => allowedUser.userUID !== user?.uid,
        ),
      });
      await router.invalidate();
      toast.show({
        type: "success",
        message: `Vous avez quitté la liste « ${list.title} »`,
      });
    } catch (error: unknown) {
      console.error("erreur en quittant la liste :", error);
      toast.show({
        type: "danger",
        message: "La liste n'a pas pu être quittée, veuillez réessayer",
      });
    } finally {
      setLeavingListId(undefined);
    }
  };

  return (
    <PrivateLayout>
      <Title
        subtitle={
          lists.length > 0 &&
          "Les listes de vos proches, auxquelles vous avez été invité·e"
        }
        variant="page"
      >
        Invitations
      </Title>

      {lists.length === 0 ? (
        <EmptyState
          icon={<IconGift size={32} stroke={1.75} />}
          title="Aucune invitation pour l'instant"
        >
          Quand un·e proche vous enverra le lien de sa liste, elle apparaîtra
          ici.
        </EmptyState>
      ) : (
        <ListItems>
          {lists.map((list) => (
            <ListItem
              action={
                <Button
                  ariaLabel={`Quitter la liste « ${list.title} »`}
                  icon={<IconLogout2 size={20} stroke={1.75} />}
                  loading={leavingListId === list.id}
                  type="danger"
                  onClick={() => leaveList(list)}
                />
              }
              key={list.id}
              listId={list.id}
              subtitle={`Liste de ${list.username ?? "…"} · ${plural(list.presents?.length ?? 0, "cadeau", "cadeaux")}`}
              title={list.title}
              to="/list/$listId"
            />
          ))}
        </ListItems>
      )}
    </PrivateLayout>
  );
}
