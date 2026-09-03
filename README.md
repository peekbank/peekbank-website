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

### The interactive analyses

The explorers under `/analyses` are authored in Quarto (`viz_src/`) and built
into the site, so working on these requires a bit of extra setup.
These steps aren't needed if you are editing other pages.

#### Prerequisites

You need the following things for local dev:

* [uv](https://docs.astral.sh/uv/) installed on your machine.

* [Quarto](https://quarto.org/docs/get-started/) installed on your machine

* **A Redivis token, for the data.** Copy `.env.template` to `.env.local` and
add your own read-only Redivis token:

    ```
    REDIVIS_API_TOKEN=your-token-here
    ```

#### Creating the visualisations

Fetch the data slices from Redivis using:

```
npm run viz:pull
```


Afterwards (or whenever you make changes to the visualisation code), rerender and ingest the Quarto output via

```
npm run build:viz
```

If you are working on the Quarto viz code, you can preview directly by running

```
quarto preview
```

in the `viz_src` directory.

#### Where the data ends up

Both the slice data and the Quarto output are gitignored and are to be recreated on a dev machine.
To enable both Quarto preview and Astro consuming the data during runtime via the exported Quarto fragments, the data ends up in multiple places
on dev machines, as illustrated below:

```
Redivis ──viz:pull──> viz_src/slices ──quarto render──> viz_src/_site/slices
                            └────────build:viz────────> public/viz/slices ──> dist/
```


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