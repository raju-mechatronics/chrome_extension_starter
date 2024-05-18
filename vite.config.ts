import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "extension",
    minify: false,
    rollupOptions: {
      input: {
        content: "src/content.ts",
        background: "src/background.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
    watch: {
      include: ["src/**", "public/**"],
      clearScreen: true,
    },
  },
});
