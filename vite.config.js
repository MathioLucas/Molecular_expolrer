// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // or whichever framework you're using

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["lcfg27-4321.csb.app"],
  },
});
