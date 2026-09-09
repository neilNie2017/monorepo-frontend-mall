import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  server: {
    port: 9001,
  },
  build: {
    outDir: path.resolve(
      __dirname,
      "../../dist" + loadEnv(mode, ".").VITE_BASE
    ),
  },
}));
