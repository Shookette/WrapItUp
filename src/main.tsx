import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";

import WithFirestore from "#/components/WithFirestore.tsx";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import UserProvider, { useUserContext } from "#/hooks/UserContext.tsx";

import { routeTree } from "./routeTree.gen";
import ToastProvider from "#/components/Toast/ToastProvider.tsx";

import "./theme.css";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  context: {
    auth: undefined,
  },
});

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

  useEffect(() => {
    router.invalidate();
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- #27
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
