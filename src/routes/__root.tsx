import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { RouterContext } from "#/main.tsx";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return <Outlet />;
  },
});
