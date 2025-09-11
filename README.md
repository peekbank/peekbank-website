# Peekbank Website + Documentation

This repository contains the source code for the Peekbank website and documentation page.

## Deployment

We use Github Pages to deploy this site, so pushing to the main branch will update the live page.

## Development

To install the dependencies and run the dev server, you need an installation of [Node and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

After cloning the repository, run

```
npm i
```

in the root of the repository.

Then, start the dev server using

```
npm run dev
```

which makes the site accessible at `localhost:4321`.

### Project Structure

This project is built with [Astro](https://docs.astro.build/en/getting-started/), [Starlight](https://starlight.astro.build/), the [Starlight Nova Theme](https://starlight-theme-nova.pages.dev/), [Tailwind](https://tailwindcss.com/docs/styling-with-utility-classes), and [React](https://react.dev/)

Inside of this Astro + Starlight project, you'll see the following folders and files:

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
└── package.json
```

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

Images can be added to `src/assets/` and embedded in Markdown with a relative link.


### npm/Astro Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

### Random Notes/Oddities

* The nova starlight theme likes to apply top marginsof 1 rem to a various of elements. If you have a row of elements and they are misalinged, be sure to explicity set a (top) margin via tailwind to override this.