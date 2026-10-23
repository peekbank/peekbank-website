import { defineMiddleware } from "astro:middleware";

// starlight-llms-txt pads every markdown table cell to the widest cell in its
// column, and the codebook's long descriptions turn that into mostly spaces.
const tableRow = /^\s*\|.*\|$/;
const delimiterRow = /^\s*\|(\s*:?-+:?\s*\|)+$/;

function compactTables(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => {
      if (delimiterRow.test(line)) return line.replace(/-{3,}/g, "---");
      if (tableRow.test(line)) return line.replace(/(?<=\S) {2,}(?=\|)/g, " ");
      return line;
    })
    .join("\n");
}

// Starlight's heading anchors, empty <a name> targets and relative links only
// work on the site. Relative links resolve against the page's own URL, so in
// a .txt file they point nowhere; their text is kept.
function stripSiteLinks(markdown: string) {
  return markdown
    .replace(/\s*\[Section titled “[^”]*”\]\(#[^)]*\)/g, "")
    .replace(/(?<!!)\[\]\([^)]*\)/g, "")
    .replace(/(?<!!)\[([^\]]*)\]\((?:#|\/|\.\.?\/)[^)]*\)/g, "$1");
}

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!context.url.pathname.endsWith(".txt")) return response;
  return new Response(stripSiteLinks(compactTables(await response.text())), response);
});
