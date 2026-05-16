import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;
// During `vite build` (publishing) we shouldn't require runtime env vars.
// Only server/preview needs them; build only needs `base`.
const port = Number(rawPort ?? "3000");
const basePath = process.env.BASE_PATH ?? "/";


export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (runtimeErrorOverlay as any)({
      filter(error: Error) {
        if (!error?.stack) return true;
        const atLines = error.stack
          .split("\n")
          .filter((l) => /^\s+at\s/.test(l));
        // Suppress errors where every frame is a blob: URL —
        // those come from Vite/Replit plugin infrastructure, not app code.
        if (atLines.length > 0 && atLines.every((l) => l.includes("blob:"))) {
          return false;
        }
        return true;
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
