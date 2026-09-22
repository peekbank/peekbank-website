// Proportion of looks to the target image over time, by age band, pooled across
// every dataset in the release. Reads the slices at build time and ships the curves 
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * What the child was fixating in one sample:
 * 0 target, 1 distractor, 2 other, 3 missing.
 */
type Aoi = 0 | 1 | 2 | 3;
const TARGET = 0;
const DISTRACTOR = 1;

/** Consecutive samples with the same fixation, STEP_MS apart. */
type Run = [aoi: Aoi, samples: number];

/** One dataset, in the shape scripts/build_slices.py writes. */
interface Slice {
  admins: [id: number, ageMonths: number | null, subjectId: number][];
  trials: [id: number, order: number, typeId: number, excluded: 0 | 1][];
  runs: [administrationId: number, trialId: number, startMs: number, runs: Run[]][];
}

/** Milliseconds from target-word onset. */
type TimeMs = number;

/** Running totals for one timepoint to create a proportion. */
interface LookCounts {
  counted: number;
  onTarget: number;
}

/** One age band's running totals, keyed by timepoint. */
type BandCounts = Map<TimeMs, LookCounts>;

export interface CurvePoint {
  t: TimeMs;
  /** Looks at the target, as a share of target-plus-distractor looks. */
  proportion: number;
}

const STEP_MS = 25;

export const T_LO = -500;
export const T_HI = 3000;

// Bounds are exclusive, youngest band first.
const BANDS: [upTo: number, label: string][] = [
  [18, "under 18"],
  [24, "18-24"],
  [30, "24-30"],
  [Infinity, "30 and up"],
];

// Proportions wobble from sample to sample; a centred nine-sample (225 ms)
// average settles the line without shifting the peak.
const SMOOTH_RADIUS = 4;

const dir = fileURLToPath(
  new URL("../../viz_src/slices/datasets", import.meta.url),
);

function smooth(values: number[]) {
  return values.map((_, i) => {
    const lo = Math.max(0, i - SMOOTH_RADIUS);
    const hi = Math.min(values.length - 1, i + SMOOTH_RADIUS);
    let sum = 0;
    for (let k = lo; k <= hi; k += 1) sum += values[k]!;
    return sum / (hi - lo + 1);
  });
}

function pooledCurves(): { label: string; points: CurvePoint[] }[] {
  // One entry per band, in BANDS order.
  const counts: BandCounts[] = BANDS.map(() => new Map());

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const slice: Slice = JSON.parse(readFileSync(`${dir}/${file}`, "utf8"));
    const excluded = new Set(
      slice.trials
        .filter(([, , , isExcluded]) => isExcluded === 1)
        .map(([trialId]) => trialId),
    );
    const ageOf = new Map(slice.admins.map(([id, ageMonths]) => [id, ageMonths]));

    for (const [adminId, trialId, startMs, runs] of slice.runs) {
      if (excluded.has(trialId)) continue;
      const age = ageOf.get(adminId);
      if (age == null) continue;
      const band = counts[BANDS.findIndex(([upTo]) => age < upTo)]!;

      let t = startMs;
      for (const [aoi, samples] of runs) {
        for (let i = 0; i < samples; i += 1, t += STEP_MS) {
          // Looks elsewhere and missing samples count towards neither side,
          // so the proportion is target out of target-plus-distractor.
          if (aoi > DISTRACTOR) continue;
          if (t < T_LO || t > T_HI) continue;
          let at = band.get(t);
          if (!at) band.set(t, (at = { counted: 0, onTarget: 0 }));
          at.counted += 1;
          if (aoi === TARGET) at.onTarget += 1;
        }
      }
    }
  }

  return BANDS.map(([, label], i) => {
    const times = [...counts[i]!.keys()].sort((a, b) => a - b);
    const proportions = smooth(
      times.map((t) => {
        const { counted, onTarget } = counts[i]!.get(t)!;
        return onTarget / counted;
      }),
    );
    return {
      label,
      points: times.map((t, k) => ({ t, proportion: proportions[k]! })),
    };
  });
}

export const lookingCurves = pooledCurves();
