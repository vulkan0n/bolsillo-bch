import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// need to 'include' pg-format because of a weird problem with the require it has
export default defineConfig({
  optimizeDeps: {
    include: ["pg-format"],
  },
  plugins: [
    react(),
    nodePolyfills(),
    topLevelAwait({
      promiseExportName: "__tla",
      promiseImportName: (i) => `__tla_${i}`,
    }),
  ],
});
