import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { RouterContext } from "../main.tsx";
import Header from "#components/Header/Header.tsx";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <>
        <Header />
        <Outlet />
      </>
    );
  },
});
