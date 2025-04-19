import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      manifest: {
        display: "standalone",
        display_override: ["window-controls-overlay"],
        lang: "es-ES",
        name: "Image Organizer",
        short_name: "Organizer",
        description:
          "Aplicacion para organizar imágenes en carpetas segun el instructivo",
        theme_color: "#ffffff",
        background_color: "#d4d4d4",
        start_url: "/",
        id: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "pdfjs-dist/build/pdf.worker.entry": path.resolve(
        __dirname,
        "node_modules/pdfjs-dist/build/pdf.worker.min.js"
      ),
    },
  },
});
