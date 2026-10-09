import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {normalizeBase, pagesAssets} from "./scripts/pages-assets.mjs";

const base = normalizeBase(process.env.PAGES_BASE_PATH || '/');

export default defineConfig({
  base,
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [pagesAssets(base), react()],
});
