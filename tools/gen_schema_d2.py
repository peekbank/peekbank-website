"""Emit D2 source for the peekbank schema, read from the release on Redivis.

Column names and types come from the dataset itself. Relationships do not:
Redivis records no foreign keys, so they are declared below and must be kept in
step with peekbankr/inst/peekbank-schema.json.
"""

import json
import urllib.request

API = "https://redivis.com/api/v1/tables/datapages.peekbank:a3v0"

TABLES = ["datasets", "subjects", "administrations", "trials", "trial_types",
          "stimuli", "aoi_timepoints", "xy_timepoints", "aoi_region_sets"]

FKS = [
    ("administrations.dataset_id", "datasets.dataset_id"),
    ("administrations.subject_id", "subjects.subject_id"),
    ("trials.trial_type_id", "trial_types.trial_type_id"),
    ("trial_types.dataset_id", "datasets.dataset_id"),
    ("trial_types.target_id", "stimuli.stimulus_id"),
    ("trial_types.distractor_id", "stimuli.stimulus_id"),
    ("trial_types.aoi_region_set_id", "aoi_region_sets.aoi_region_set_id"),
    ("stimuli.dataset_id", "datasets.dataset_id"),
    ("aoi_timepoints.administration_id", "administrations.administration_id"),
    ("aoi_timepoints.trial_id", "trials.trial_id"),
    ("xy_timepoints.administration_id", "administrations.administration_id"),
    ("xy_timepoints.trial_id", "trials.trial_id"),
]

# One colour per referenced table, so the edges converging on datasets and
# administrations can be told apart.
TARGET_COLOURS = {
    "datasets": "#c78c00",
    "subjects": "#00a850",
    "administrations": "#1888f8",
    "trials": "#d84838",
    "trial_types": "#7c3aed",
    "stimuli": "#e0529c",
    "aoi_region_sets": "#0f766e",
}


def columns(table):
    with urllib.request.urlopen(f"{API}.{table}/variables") as r:
        return [v["name"] for v in json.load(r)["results"]]


def emit():
    keys = {src for src, _ in FKS} | {dst for _, dst in FKS}
    lines = []

    for table in TABLES:
        lines.append(f"{table}: {{")
        lines.append("  shape: sql_table")
        for i, name in enumerate(columns(table)):
            # Types are dropped: every key is an integer, and the column cost
            # a third of the diagram's width.
            if i == 0:  # every table leads with its primary key
                lines.append(f'  {name}: "" {{constraint: primary_key}}')
            elif f"{table}.{name}" in keys:
                lines.append(f'  {name}: "" {{constraint: foreign_key}}')
            else:
                lines.append(f'  {name}: ""')
        lines.append("}")
        lines.append("")

    for src, dst in FKS:
        colour = TARGET_COLOURS[dst.split(".")[0]]
        lines.append(f'{src} -> {dst}: {{style.stroke: "{colour}"; style.stroke-width: 2}}')

    return "\n".join(lines)


if __name__ == "__main__":
    print(emit())
