import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: mode === "production" ? `/${env.VITE_REPO_NAME}/` : "/",
    plugins: [react(), tailwindcss()],
    server: {
      open: true,
      host: true, // Allow external access via network/tunnels
      allowedHosts: true, // Bypasses host checking for ngrok tunnels
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
