# Flat Quarto viz embedding (PoC)

This branch (`datapage-flat`) demonstrates the no-iframe integration
proposed by Adrian: the interactive explorers are authored in Quarto/OJS in
the [peekbank-datapage](https://github.com/peekbank/peekbank-datapage)
repo (here as the `viz/` submodule), rendered by Quarto during the site
build, and mounted **flat** into Astro pages as HTML/JS components.

## How it works

```
viz/                      datapage repo (submodule) — the viz source of truth
  accuracy.qmd …            explorer pages (Quarto + Observable JS)
  components/_*.qmd          shared OJS modules (data loading, stats, slider)
  slices/                    pre-built data the explorers fetch at runtime

scripts/build-viz.mjs     the build step:
  1. quarto render viz/
  2. per explorer, harvest from viz/_site/<slug>.html:
       - the <main> markup (contains the ojs-cell-* anchor divs)
       - the <script type="ojs-module-contents"> tag (the OJS cell sources)
     -> src/components/viz/<slug>.fragment.html
  3. copy runtime assets -> public/viz/
       quarto-ojs-runtime.js, quarto-ojs.css, slices/**

src/components/VizExplorer.astro   mounts a fragment:
  - sets window.PEEKBANK_DATA_BASE = <base>/viz/slices/
    (the explorers read this; standalone they default to relative slices/)
  - injects the fragment (set:html)
  - loads quarto-ojs-runtime.js and calls interpretFromScriptTags()
    (the same bootstrap Quarto emits on its own pages)
  - ~15 lines replacing bootstrap's Tab plugin for Quarto tabsets

src/styles/viz-embed.css   the datapage theme's viz rules, scoped under
                           .pb-viz, plus minimal tab/button styles standing
                           in for bootstrap (which we deliberately don't load)

src/content/docs/analyses/<slug>.mdx   one Starlight splash page per explorer
```

To rebuild after changing anything in `viz/`:

```
npm run build:viz     # or: node scripts/build-viz.mjs [--no-render]
npm run build         # or npm run dev
```

For convenience this PoC branch commits the generated fragments and
`public/viz/` so `npm install && npm run dev` works without Quarto
installed. If merged, the cleaner setup is to gitignore both and run
`build:viz` in CI before `astro build` (add
`quarto-dev/quarto-actions/setup@v2` to the deploy workflow, plus
`submodules: true` on actions/checkout).

## Why this shape

- **Single source of truth.** Explorers stay authored/validated in the
  datapage repo (which has a numeric parity harness against the original
  Shiny computations — `scripts/validate_viz.{mjs,R}` there). The website
  consumes build artifacts; nobody maintains generated code by hand.
- **No iframes.** The viz is part of the page: shared header, fonts, one
  scroll context, normal anchors/history.
- **Data stays static.** Explorers fetch pre-built JSON slices
  (`public/viz/slices/`, ~17 MB for all 45 datasets, loaded per-dataset on
  demand) — no server, works on GitHub Pages.

## Things to know (learned the hard way)

- The harvest relies on two stable Quarto output features: the `<main>`
  element and the `<script type="ojs-module-contents">` tag. Both are
  long-standing, but a Quarto major upgrade warrants re-checking
  `build-viz.mjs`'s assumptions.
- The OJS runtime schedules work on animation frames: in a **hidden/
  backgrounded tab** cells may not evaluate until the tab is shown. Don't
  debug "it's stuck" in an unfocused headless window.
- One OJS syntax error kills that page's whole module silently — check the
  browser console for `.observablehq--error` if a page renders prose but
  no controls.
- Starlight's global styles cascade into the fragments (that's flat
  embedding). `viz-embed.css` handles layout/tabs/tables; if Starlight is
  upgraded and something looks off, look there first.
- `d3`/`Plot` are resolved by the Observable stdlib from jsDelivr at
  runtime (same as on the standalone datapage) — the pages need network
  access to that CDN.
