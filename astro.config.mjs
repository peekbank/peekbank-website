// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import starlight from "@astrojs/starlight";
import starlightThemeNova from "starlight-theme-nova";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  // Set your production site and base for GitHub Pages project site
  site: "https://peekbank.github.io",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    starlight({
      title: "peekbank",
      logo: {
        src: "./src/assets/raccoon.png",
      },
      favicon: "/favicon-32x32.png",
      customCss: ["./src/styles/global.css"],
      plugins: [
        starlightThemeNova({
          nav: [
            { label: "Docs", href: "start/gettingstarted" },
            { label: "Shiny", href: "shiny" },
          ],
        }),
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/peekbank",
        },
      ],
      components: {
        ThemeProvider: "./src/components/_disabledark.astro",
      },
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Getting Started", slug: "start/gettingstarted" },
            { label: "Data Access", slug: "start/dataaccess" },
          ],
        },
        {
          label: "Peekbank",
          items: [
            { label: "Framework", slug: "peekbank/framework" },
            { label: "Data Schema", slug: "peekbank/dataschema" },
            { label: "Codebook", slug: "peekbank/codebook" },
            { label: "Main Repos", slug: "peekbank/mainrepos" },
          ],
        },
        {
          label: "Misc",
          items: [
            { label: "How to Cite", slug: "misc/howtocite" },
            { label: "About", slug: "misc/about" },
          ],
        },
      ],
    }),
    react(),
  ],
});
