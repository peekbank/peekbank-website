import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

// A heading repeated in a second tab gets its id suffixed with "-1". List each
// heading once in the table of contents; CodebookToc points the entry at the
// copy in the open tab.
export const onRequest = defineRouteMiddleware((context) => {
  const { toc } = context.locals.starlightRoute;
  if (!toc) return;
  const slugs = new Set(toc.items.map((item) => item.slug));
  toc.items = toc.items.filter(
    (item) => !(item.slug.endsWith("-1") && slugs.has(item.slug.slice(0, -2))),
  );
});
