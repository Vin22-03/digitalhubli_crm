import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/auth":          "http://localhost:5000",
      "/admin": {
        target: "http://localhost:5000",
        // HTML navigation requests (hard refresh) should fall back to index.html,
        // not be forwarded to Express which has no HTML route for /admin/...
        bypass(req) {
          if (req.headers.accept?.includes("text/html")) return "/index.html";
        },
      },
      "/subscriptions": "http://localhost:5000",
      "/templates":     "http://localhost:5000",
      "/leads":         "http://localhost:5000",
      "/contacts":      "http://localhost:5000",
      "/dashboard":     "http://localhost:5000",
      "/profile":       "http://localhost:5000",
      "/resources":     "http://localhost:5000",
      "/uploads":       "http://localhost:5000",
    },
  },
});