// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import starlight from "@astrojs/starlight";
import starlightThemeNova from "starlight-theme-nova";
import starlightLlmsTxt from "starlight-llms-txt";

import react from "@astrojs/react";

const base = process.env.ASTRO_BASE || "/";

export default defineConfig({
  site: "https://peekbank.github.io",
  base,
  vite: {
    plugins: [tailwindcss()],
    // Before Astro 7.4.2, `astro build` pre-bundles React for production into the
    // same cache a running dev server reads from (withastro/astro#18449).
    cacheDir: `node_modules/.vite/${process.env.NODE_ENV}`,
  },
  markdown: {
    shikiConfig: {
      transformers: [
        {
          // starlight-llms-txt reads a code block's language from a
          // language-* class on <code>, which Shiki doesn't set.
          code(node) {
            this.addClassToHast(node, `language-${this.options.lang}`);
          },
        },
      ],
    },
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
      routeMiddleware: "./src/routeData.ts",
      plugins: [
        starlightLlmsTxt({
          description:
            "Peekbank is an open database of looking-while-listening eye-tracking data from young children, converted from many labs into one shared schema and loaded in R with the peekbankr package.",
          promote: ["start/gettingstarted", "start/**", "peekbank/**"],
        }),
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
        ThemeProvider: "./src/components/overrides/DisableDark.astro",
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
                { label: "Redivis", slug: "start/dataaccess/redivis" },
              ],
            },
            { label: "PeekbankR API", slug: "start/peekbankrapi" },
            { label: "External Links", slug: "start/externallinks" },
          ],
        },
        {
          label: "Peekbank",
          items: [
            { label: "Data Schema", slug: "peekbank/dataschema" },
            { label: "Codebook", slug: "peekbank/codebook" },
            { label: "Releases", slug: "peekbank/releases" },
          ],
        },
        {
          label: "Project",
          items: [
            { label: "How to Cite", slug: "misc/howtocite" },
            { label: "Sharing Data", slug: "misc/sharing" },
            { label: "About", slug: "misc/about" },
          ],
        },
        {
          label: "Contribute",
          items: [
            { label: "Task Index", slug: "contribute/tasks" },
            { label: "Dataset Lifecycle", slug: "contribute/lifecycle" },
          ],
        },
      ],
    }),
    react(),
  ],
});
