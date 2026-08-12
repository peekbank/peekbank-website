// Build the interactive explorers from the Quarto viz project (viz/
// submodule) into flat Astro-embeddable pieces — no iframes.
//
// For each explorer page this harvests, from Quarto's rendered HTML:
//   - the <main> content (markup with the ojs-cell-* anchor divs)
//   - the <script type="ojs-module-contents"> tag (base64 OJS cell sources)
// into src/components/viz/<slug>.fragment.html, and copies the shared
// runtime assets into public/viz/:
//   - quarto-ojs-runtime.js + quarto-ojs.css (the OJS runtime)
//   - slices/** (the pre-built data the explorers fetch at runtime)
//
// The VizExplorer.astro component injects a fragment and boots the runtime.
//
// Usage: node scripts/build-viz.mjs [--no-render]
//   --no-render      reuse viz/_site instead of running `quarto render`
//   VIZ_SRC=<path>   viz project root (default: viz)

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vizSrc = path.resolve(root, process.env.VIZ_SRC || "viz");
const site = path.join(vizSrc, "_site");
const fragmentsDir = path.join(root, "src", "components", "viz");
const publicViz = path.join(root, "public", "viz");

const SLUGS = ["accuracy", "rt", "longitudinal", "cdi", "items", "reliability"];

if (!fs.existsSync(vizSrc)) {
  console.error(`viz project not found at ${vizSrc} — run: git submodule update --init`);
  process.exit(1);
}

if (!process.argv.includes("--no-render")) {
  console.log(`rendering quarto project in ${vizSrc} ...`);
  execFileSync("quarto", ["render"], { cwd: vizSrc, stdio: "inherit" });
} else if (!fs.existsSync(site)) {
  console.error(`--no-render given but ${site} does not exist`);
  process.exit(1);
}

fs.mkdirSync(fragmentsDir, { recursive: true });
fs.mkdirSync(publicViz, { recursive: true });

for (const slug of SLUGS) {
  const html = fs.readFileSync(path.join(site, `${slug}.html`), "utf8");

  const mainOpen = html.indexOf("<main");
  const mainClose = html.indexOf("</main>");
  if (mainOpen < 0 || mainClose < 0) throw new Error(`${slug}: no <main> found`);
  const main = html.slice(html.indexOf(">", mainOpen) + 1, mainClose);

  const mod = html.match(
    /<script type="ojs-module-contents">[\s\S]*?<\/script>/
  );
  if (!mod) throw new Error(`${slug}: no ojs-module-contents script found`);

  const fragment = `<div class="pb-viz">\n${main}\n</div>\n${mod[0]}\n`;
  fs.writeFileSync(path.join(fragmentsDir, `${slug}.fragment.html`), fragment);
  console.log(`harvested ${slug} (${(fragment.length / 1024).toFixed(0)} kB)`);
}

const copies = [
  ["site_libs/quarto-ojs/quarto-ojs-runtime.js", "quarto-ojs-runtime.js"],
  ["site_libs/quarto-ojs/quarto-ojs.css", "quarto-ojs.css"],
  ["slices", "slices"],
];
for (const [from, to] of copies) {
  fs.cpSync(path.join(site, from), path.join(publicViz, to), {
    recursive: true,
  });
  console.log(`copied ${from} -> public/viz/${to}`);
}
console.log("done");
