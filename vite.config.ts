import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import postcssGlobalData from "@csstools/postcss-global-data";
import postcssCustomMedia from "postcss-custom-media";

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcssGlobalData({ files: ["src/media.css"] }),
        postcssCustomMedia(),
      ],
    },
  },
  plugins: [tanstackRouter({ target: "react" }), react()],
});
