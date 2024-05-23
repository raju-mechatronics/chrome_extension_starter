import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "extension",
    minify: false,
    rollupOptions: {
      external: ["pdfjs-dist"],
      input: {
        content: "src/content.ts",
        background: "src/background.ts",
        popup: "src/popup.ts",
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
