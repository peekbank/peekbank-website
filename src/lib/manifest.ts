// The dataset release manifest
// Needs `npm run viz:pull` to be run prior.
export interface Dataset {
  name: string;
  cite: string;
  n_subjects: number;
  n_trials: number;
  age_min: number;
  age_max: number;
  languages: string[];
}

export interface Manifest {
  version: string;
  datasets: Dataset[];
}

// cannot be a variable due to vite workings, has to be hardcoded string
const manifests = import.meta.glob("../../viz_src/slices/manifest.json", {
  import: "default",
  eager: true,
});

export const manifest = manifests["../../viz_src/slices/manifest.json"] as
  | Manifest
  | undefined;

if (!manifest && import.meta.env.PROD) {
  throw new Error("No dataset manifest — run: npm run viz:pull");
}

export const datasets = manifest?.datasets ?? [];

export const total = (key: "n_subjects" | "n_trials") =>
  datasets.reduce((n, d) => n + d[key], 0);

export const languageCount = new Set(datasets.flatMap((d) => d.languages)).size;

export const fmt = (n: number) => n.toLocaleString("en-US");
