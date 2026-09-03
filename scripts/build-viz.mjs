// Builds  the explorers from the Quarto project in viz_src/ into flat pieces the
// Astro site embeds.
//
// Rough overview of what this script does:
//   quarto render viz_src/ files      -> viz_src/_site/<slug>.html
//   harvest <main> + the OJS sources  -> src/components/viz_autogen/<slug>.fragment.html
//   copy the runtime                  -> public/viz/
//   scope Quarto's compiled bootstrap under .pb-viz, append viz-embed.css
//                                     -> public/viz/viz.css
//
// Usage: node scripts/build-viz.mjs [--no-render]
//   --no-render   reuse a previously rendered viz_src/_site/ instead of rendering again

import { execFileSync } from "node:child_process";
import postcss from "postcss";
import prefixSelector from "postcss-prefix-selector";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import explorers from "../viz_src/explorers.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "viz_src");
const site = path.join(src, "_site");
const fragments = path.join(root, "src", "components", "viz_autogen");
const publicViz = path.join(root, "public", "viz");

if (!process.argv.includes("--no-render")) {
  execFileSync("quarto", ["render"], { cwd: src, stdio: "inherit" });
}

fs.mkdirSync(fragments, { recursive: true });
fs.mkdirSync(publicViz, { recursive: true });


const stripNonContent = (html) => {
  const out = html
    // Quarto's execute.echo only hides the cell's source code but still includes it in the code, we strip it to save size
    .replace(/<div class="sourceCode[^"]*"[^>]*>[\s\S]*?<\/div>/g, "")
    // remove Quarto's added the front-matter title
    .replace(/<header id="title-block-header"[^>]*>[\s\S]*?<\/header>/, "");
  const balance = (s) => (s.match(/<div\b/g) ?? []).length - (s.match(/<\/div>/g) ?? []).length;
  if (balance(out) !== balance(html)) throw new Error("stripping unbalanced the markup");
  return out;
};

for (const { slug } of explorers) {
  const html = fs.readFileSync(path.join(site, `${slug}.html`), "utf8");

  // Extract the relevant content from the Quarto renders

  // the page: prose, layout, and the empty ojs-cell-* anchors
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!main) throw new Error(`${slug}: no <main> in rendered output`);

  // the module script: base64 OJS cell sources, which the runtime later mounts into those anchors.
  const mod = html.match(/<script type="ojs-module-contents">[\s\S]*?<\/script>/);
  if (!mod) throw new Error(`${slug}: no ojs-module-contents script`);

  const markup = main[1]; // get the inner html from the capture group
  const moduleScript = mod[0]; // whole tag

  const out = `<div class="pb-viz">\n${stripNonContent(markup)}\n</div>\n${moduleScript}\n`;
  fs.writeFileSync(path.join(fragments, `${slug}.fragment.html`), out);
}

// The slices live in viz_src/slices after pulling so Quarto can serve a 
// standalone `quarto preview` in development. For Quarto to acces them, 
// we need to move a copy of the data to the public folder
const slices = path.join(src, "slices");
if (!fs.existsSync(slices)) {
  console.warn("no viz_src/slices; run: npm run viz:pull (needs a Redivis token)");
} else {
  const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
  const pinned = readJson(path.join(src, "release.json")).release;
  const pulled = readJson(path.join(slices, "manifest.json")).version;
  if (pulled !== pinned) throw new Error(`slices are release ${pulled}, release.json pins ${pinned} — run: npm run viz:pull`);
  const dest = path.join(publicViz, "slices");
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(slices, dest, { recursive: true });
}

for (const f of ["quarto-ojs-runtime.js", "quarto-ojs.css"]) {
  fs.cpSync(path.join(site, "site_libs", "quarto-ojs", f), path.join(publicViz, f));
}

// bootstrap:
// Quarto compiles bootstrap + the theme .scss into one hashed file. Prefixing
// every selector with .pb-viz confines it to the explorer so it does not collide with Starlight styling
const bootstrapDir = path.join(site, "site_libs", "bootstrap");
const cssName = fs.readdirSync(bootstrapDir).find((f) => /^bootstrap-.*\.min\.css$/.test(f));
if (!cssName) throw new Error("no compiled bootstrap css in " + bootstrapDir);

const scoped = postcss([
  prefixSelector({
    prefix: ".pb-viz",
    transform(prefix, selector, prefixed) {
      // page-level selectors have no counterpart inside the fragment: we map them
      // onto the scope's root prefix itself, so bootstrap's --bs-* custom properties and
      // base typography still work with the explorer.
      if (/^(:root|html|body)$/.test(selector)) return prefix;
      return prefixed;
    },
  }),
]).process(fs.readFileSync(path.join(bootstrapDir, cssName), "utf8"), { from: undefined }).css;

// appended overrides to the css fle to fix the cascade order from here
const overrides = fs.readFileSync(path.join(src, "theme", "viz-embed.css"), "utf8");
fs.writeFileSync(path.join(publicViz, "viz.css"), scoped + "\n" + overrides);

fs.cpSync(path.join(bootstrapDir, "bootstrap.min.js"), path.join(publicViz, "bootstrap.min.js"));
