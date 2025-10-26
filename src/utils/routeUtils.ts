import { RouterContext } from "../main.tsx";
import { ParsedLocation, redirect } from "@tanstack/react-router";

const isAuthenticated = (context: RouterContext, location: ParsedLocation) => {
  if (!context.auth?.isAuthenticated) {
    throw redirect({
      to: `/login${location.pathname !== "/" ? `?redirect=${location.pathname}` : ""}`,
    });
  }
};

export { isAuthenticated };
