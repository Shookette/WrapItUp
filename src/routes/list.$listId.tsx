import { createFileRoute } from "@tanstack/react-router";
import { getListByID } from "../repository/ListRepository.ts";
import { isAuthenticated } from "../utils/routeUtils.ts";

export const Route = createFileRoute("/list/$listId")({
  component: RouteComponent,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context }) => {
    isAuthenticated(context);
  },
});

function RouteComponent() {
  const list = Route.useLoaderData();
  const navigate = Route.useNavigate();

  if (!list) {
    return navigate({ to: "/" });
  }

  return (
    <section>
      <h2>{list.title}</h2>
      <div>
        <ul>
          {(list.presents ?? []).map((present) => (
            <li key={present.id}>
              {present.title} - {present.description}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
