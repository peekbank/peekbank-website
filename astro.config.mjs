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
      title: "Peekbank",
      logo: {
        src: "./src/assets/raccoon.png",
      },
      favicon: "/favicon-32x32.png",
      head: [
        "LibreBaskerville-Regular",
        "LibreBaskerville-Bold",
      ].map((name) => ({
        tag: "link",
        attrs: {
          rel: "preload",
          href: `${base}fonts/${name}.woff2`,
          as: "font",
          type: "font/woff2",
          crossorigin: true,
        },
      })),
      customCss: ["./src/styles/global.css"],
      plugins: [
        starlightThemeNova({
          nav: [
            { label: "Docs", href: `${base}start/gettingstarted` },
            { label: "Analyses", href: `${base}analyses/accuracy` },
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
            {
              label: "Data Access",
              items: [
                { label: "PeekbankR", slug: "start/dataaccess" },
                {
                  label: "PeekbankR Functions",
                  slug: "start/dataaccess/functions",
                },
                { label: "Redivis", slug: "start/dataaccess/redivis" },
              ],
            },
            { label: "Important Links", slug: "start/importantlinks" },
          ],
        },
        {
          label: "Peekbank",
          items: [
            { label: "Data Schema", slug: "peekbank/dataschema" },
            { label: "Codebook", slug: "peekbank/codebook" },
            { label: "Releases", slug: "peekbank/releases" },
            { label: "Framework", slug: "peekbank/framework" },
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
