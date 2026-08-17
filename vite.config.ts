import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so a production build also runs when opened straight from disk.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
