import { createFileRoute } from "@tanstack/react-router";
import { getLists } from "../repository/ListRepository.ts";

export const Route = createFileRoute("/")({
  component: Index,
  loader: () => getLists("1234"),
});

function Index() {
  const lists = Route.useLoaderData();

  console.log("Lists", lists);

  return (
    <div className="p-2">
      <h2>Liste de cadeaux des utilisateurs</h2>
      <ul>
        {lists.map((list) => (
          <li>
            {list.title} - {list.username} - {list.createdAt}
          </li>
        ))}
      </ul>
    </div>
  );
}
