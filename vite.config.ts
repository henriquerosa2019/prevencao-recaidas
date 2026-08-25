import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // 📱 Torna o app instalável (PWA): gera o manifest.webmanifest e o
    // service worker automaticamente a partir da configuração abaixo.
    // Ao abrir a URL publicada (Vercel) no Chrome (ou qualquer navegador
    // compatível), o usuário verá a opção "Instalar app" / "Adicionar à
    // tela inicial", passando a rodar como um app nativo (ícone próprio,
    // sem barra de endereço, funciona com cache offline básico).
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "icons/favicon-32.png",
        "icons/apple-touch-icon.png",
        "robots.txt",
      ],
      manifest: {
        id: "/",
        name: "Prevenção Recaídas",
        short_name: "Recaídas",
        description:
          "App de apoio à recuperação e prevenção de recaídas. Registre gatilhos, visualize padrões e fortaleça seu autocontrole.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#1a163e",
        theme_color: "#1a163e",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            // Nunca cachear chamadas ao Supabase — os dados precisam vir
            // sempre da rede (o registro de fissuras é sensível a estar
            // sempre atualizado).
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
