import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), deno()],
  optimizeDeps: {
    include: ["react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});
