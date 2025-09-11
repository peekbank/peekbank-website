// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import starlight from "@astrojs/starlight";
import starlightThemeNova from "starlight-theme-nova";

import react from "@astrojs/react";

const base = process.env.ASTRO_BASE || "/";

export default defineConfig({
  site: "https://peekbank.github.io",
  base,
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
            { label: "Docs", href: `${base}start/gettingstarted` },
            { label: "Shiny", href: `${base}shiny` },
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
            { label: "Data Access - PeekbankR", slug: "start/dataaccess" },
            { label: "Data Access - SQL", slug: "start/dataaccesssql" },
            { label: "Important Links", slug: "start/importantlinks" },
          ],
        },
        {
          label: "Peekbank",
          items: [
            { label: "Framework", slug: "peekbank/framework" },
            { label: "Data Schema", slug: "peekbank/dataschema" },
            { label: "Codebook", slug: "peekbank/codebook" },
            { label: "Releases", slug: "peekbank/releases" },
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
