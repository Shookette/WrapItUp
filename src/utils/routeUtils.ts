import { RouterContext } from "../main.tsx";
import { redirect } from "@tanstack/react-router";

const isAuthenticated = (context: RouterContext) => {
  if (!context.auth?.isAuthenticated) {
    throw redirect({
      to: "/login",
    });
  }
};

export { isAuthenticated };
