import React from "react";
import ReactDOM from "react-dom/client";
import "./main.scss";
import WithFirestore from "./components/WithFirestore.tsx";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { createRouter, RouterProvider } from "@tanstack/react-router";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WithFirestore>
      <RouterProvider router={router} />
    </WithFirestore>
  </React.StrictMode>,
);
