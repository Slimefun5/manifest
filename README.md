# manifest

Auto-detected source of truth for the Slimefun5 organization's core, libraries, and addons.

This repo contains a small zero-dependency Node detector that scans every repo in the
`Slimefun5` GitHub org, reads each repo's `plugin.yml` and `build.gradle`/`build.gradle.kts`
on its default branch, and classifies each repo as the core plugin, a library, or an addon.
The result is written to `addons.json` at the repo root.

## addons.json schema

```json
{
  "generatedAt": "2026-08-10T00:00:00Z",
  "core": {
    "id": "slimefun",
    "repo": "Slimefun5/Slimefun5",
    "name": "Slimefun",
    "kind": "core",
    "dependencies": [],
    "pluginName": "Slimefun",
    "defaultBranch": "experimental",
    "branches": ["experimental", "stable"]
  },
  "libraries": [
    {
      "id": "infinitylib",
      "repo": "Slimefun5/InfinityLib",
      "name": "InfinityLib",
      "kind": "library",
      "dependencies": [],
      "pluginName": null,
      "defaultBranch": "experimental",
      "branches": ["experimental"]
    }
  ],
  "addons": [
    {
      "id": "networks",
      "repo": "Slimefun5/Networks",
      "name": "Networks",
      "kind": "addon",
      "dependencies": ["infinitylib"],
      "pluginName": "Networks",
      "defaultBranch": "experimental",
      "branches": ["experimental"]
    }
  ]
}
```

- `id` is the lowercased repo name.
- `repo` is the `Owner/Repo` string.
- `dependencies` lists the ids of other entries this one depends on (from `plugin.yml`
  `depend:` and github-gradle library coordinates).
- `addons` is topologically sorted: an addon always appears after every addon or library
  it depends on.
- A few org repos are never classified: `web`, `manifest`, `builds`, `wiki`, `workflows`,
  `gradle`, `.github`, `bot`, `Slimefun5.github.io`, and any repo whose name ends in
  `.wiki`.

## How it is generated

`addons.json` is not hand-edited. It is produced by `node src/detect.mjs`, which needs a
`GITHUB_TOKEN` environment variable with read access to the org's repos. A GitHub Actions
workflow (`.github/workflows/generate.yml`) regenerates the file on a daily schedule, on
manual dispatch, and on a `refresh-manifest` repository dispatch event, and commits it back
to `main` only when it changed.

## How consumers read it

Any tool that needs the current addon/library/core list can fetch the raw file from the
default branch, for example:

```
https://raw.githubusercontent.com/Slimefun5/manifest/main/addons.json
```

No authentication is required to read it, since it is a public file committed to the repo.

## Development

```
npm test        # runs node --test over the whole test/ directory
npm run generate # requires GITHUB_TOKEN, regenerates addons.json
```

All logic is pure functions over injected strings/fetchers, so the test suite never hits
the network.
