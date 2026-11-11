import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";

import WithFirestore from "./components/WithFirestore.tsx";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import UserProvider, { useUserContext } from "./hooks/UserContext.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import ToastProvider from "./components/Toast/ToastProvider.tsx";

import "./theme.css";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  context: {
    auth: undefined,
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export type RouterContext = {
  auth?: UserProvider;
};

const InnerApp = () => {
  const auth = useUserContext();
  const context: RouterContext = useMemo(() => {
    return { auth };
  }, [auth]);

  // Volontaire : on relance les loaders quand l'authentification change.
  useEffect(() => {
    router.invalidate();
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [context]);

  return <RouterProvider router={router} context={context} />;
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider>
      <WithFirestore>
        <UserProvider>
          <InnerApp />
        </UserProvider>
      </WithFirestore>
    </ToastProvider>
  </React.StrictMode>,
);
