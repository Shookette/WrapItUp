import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  // le plugin TanStack Router doit être placé avant le plugin React
  plugins: [tanstackRouter({ target: "react" }), react()],
});
