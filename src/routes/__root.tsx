import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { RouterContext } from "../main.tsx";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <nav className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Listes de cadeaux
        </Link>
        <Link to="/list-new" className="[&.active]:font-bold">
          Ajouter une liste
        </Link>
      </nav>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
