# viz_src

The Quarto sources for the explorers under `/analyses`. `scripts/build-viz.mjs`
renders them and lifts the result into the Astro site; see the README in the
repo root for how to run it.

## Adding an explorer

Write `<slug>.qmd` here and add a line to `explorers.js`. That list controls the
routes, the switcher, and what the build renders (including order and labels)

## Things to look out for

Fetch data through `window.PEEKBANK_DATA_BASE`, the way `components/_pbdata.qmd`
does. `FileAttachment()` and OJS `import` of local files both rely on paths that
do not survive the harvest into the site.

Only one explorer can be mounted per page: cell ids restart at `ojs-cell-1-1` in
every fragment, so two on one page would collide.
