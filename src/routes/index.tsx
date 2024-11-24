import { createFileRoute, Link } from "@tanstack/react-router";
import { getLists } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";

export const Route = createFileRoute("/")({
  component: Index,
  loader: () => getLists(),
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});

function Index() {
  const lists = Route.useLoaderData();

  return (
    <div className="p-2">
      <h2>Liste de cadeaux des utilisateurs</h2>
      <ul>
        {lists.map((list) => (
          <li>
            <Link to={`/list/$listId`} params={{ listId: list.id }}>
              {list.title} - {list.username} - {list.createdAt}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
