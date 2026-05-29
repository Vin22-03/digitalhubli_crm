import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/auth": "http://localhost:5000",
      "/admin": "http://localhost:5000",
      "/templates": "http://localhost:5000",
      "/leads": "http://localhost:5000",
      "/contacts": "http://localhost:5000",
      "/dashboard": "http://localhost:5000",
      "/profile": "http://localhost:5000",
      "/resources": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
});