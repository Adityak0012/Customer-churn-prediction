import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build output goes to the Flask static folder so `python app/app.py` serves the whole app.
export default defineConfig({
  plugins: [react()],
  base: "/static/dist/",
  build: { outDir: "../app/static/dist", emptyOutDir: true },
  server: { proxy: { "/api": "http://127.0.0.1:5000" } },
});
