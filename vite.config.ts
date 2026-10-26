import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import {
  VitePWA,
} from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],

      manifest: {
        name: "SellSys",
        short_name: "SellSys",

        description:
          "Sistema de ventas e inventario",

        start_url: "/",

        display: "standalone",

        background_color:
          "#4B2AA8",

        theme_color:
          "#4B2AA8",

        orientation:
          "portrait",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});