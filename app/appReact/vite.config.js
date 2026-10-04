import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
      {
        find: "@components",
        replacement: path.resolve(__dirname, "../../packages/components"),
      },
    ],
  },
  server: {
    host: "0.0.0.0",
    port: 9000,
    // 开发环境代理到真实后端,避免跨域(后端统一 /api/* 前缀)
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: path.resolve(
      __dirname,
      "../../dist" + loadEnv(mode, ".").VITE_BASE
    ),
  },
}));
