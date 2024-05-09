import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "extension",
    minify: false,
    rollupOptions: {
      input: {
        content: "src/index.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
    watch: {
      include: "src/**",
      clearScreen: true,
    },
  },
});
