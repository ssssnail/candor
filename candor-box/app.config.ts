import { defineConfig } from "@tanstack/start/config";

export default defineConfig({
  ssr: false,
  server: {
    preset: "static",
  },
});
