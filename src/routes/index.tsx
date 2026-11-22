import "./index.css";

import { createFileRoute, Link } from "@tanstack/react-router";
import { IconList, IconPlus } from "@tabler/icons-react";
import { getMyLists } from "#/repository/ListRepository.ts";
import { isAuthenticated } from "#/utils/routeUtils.ts";
import { plural } from "#/utils/plural.ts";
import PrivateLayout from "#/components/PrivateLayout.tsx";
import Title from "#/components/Title/Title.tsx";
import ListItem, { ListItems } from "#/components/ListItem/ListItem.tsx";
import EmptyState from "#/components/EmptyState/EmptyState.tsx";
import { buttonClassNames } from "#/components/Button/buttonClassNames.ts";

export const Route = createFileRoute("/")({
  component: IndexComponent,
  loader: ({ context }) => {
    const user = context.auth?.user;

    if (!user) {
      return [];
    }

    return getMyLists(user?.uid);
  },
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

const newListLink = (
  <Link className={buttonClassNames()} to="/new">
    <IconPlus aria-hidden size={20} />
    Nouvelle liste
  </Link>
);

function IndexComponent() {
  const lists = Route.useLoaderData();
  const presentCount = lists.reduce(
    (count, list) => count + (list.presents?.length ?? 0),
    0,
  );

  return (
    <PrivateLayout>
      <Title
        actions={
          lists.length > 0 && (
            <div className="my-lists__new--desktop">{newListLink}</div>
          )
        }
        subtitle={
          lists.length > 0 &&
          `${plural(lists.length, "liste", "listes")} · ${plural(presentCount, "cadeau", "cadeaux")}`
        }
        variant="page"
      >
        Mes listes
      </Title>

      {lists.length === 0 ? (
        <EmptyState
          action={newListLink}
          icon={<IconList size={32} stroke={1.75} />}
          title="Pas encore de liste"
        >
          Créez votre première liste de cadeaux, puis partagez-la avec vos
          proches.
        </EmptyState>
      ) : (
        <>
          <ListItems>
            {lists.map((list) => (
              <ListItem
                key={list.id}
                listId={list.id}
                subtitle={`${plural(list.presents?.length ?? 0, "cadeau", "cadeaux")} · ${plural(list.allowedUsers.length, "invité·e", "invité·es")}`}
                title={list.title}
                to="/edit/$listId"
              />
            ))}
          </ListItems>

          <div className="my-lists__fab">{newListLink}</div>
        </>
      )}
    </PrivateLayout>
  );
}
