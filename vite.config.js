import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "html-transform",
      transformIndexHtml(html) {
        return html.replace(
          "%VITE_KAKAO_JAVASCRIPT_KEY%",
          process.env.VITE_KAKAO_JAVASCRIPT_KEY || ""
        );
      },
    },
  ],
  server: {
    cors: true,
  },
});
