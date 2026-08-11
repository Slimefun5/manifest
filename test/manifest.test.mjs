import { test } from "node:test";
import assert from "node:assert/strict";
import { buildManifest, topoSort } from "../src/manifest.mjs";

test("topoSort orders dependents after dependencies", () => {
  const entries = [
    { id: "networks", dependencies: ["infinitylib", "infinityexpansion"] },
    { id: "infinityexpansion", dependencies: ["infinitylib"] },
    { id: "infinitylib", dependencies: [] },
  ];
  const order = topoSort(entries).map((e) => e.id);
  assert.ok(order.indexOf("infinitylib") < order.indexOf("infinityexpansion"));
  assert.ok(order.indexOf("infinityexpansion") < order.indexOf("networks"));
});

test("buildManifest stamps meta and shapes output", () => {
  const classified = {
    core: { id: "slimefun", repo: "Slimefun5/Slimefun5", name: "Slimefun", kind: "core", dependencies: [], pluginName: "Slimefun" },
    libraries: [{ id: "infinitylib", repo: "Slimefun5/InfinityLib", name: "InfinityLib", kind: "library", dependencies: [], pluginName: null }],
    addons: [{ id: "networks", repo: "Slimefun5/Networks", name: "Networks", kind: "addon", dependencies: ["infinitylib"], pluginName: "Networks" }],
  };
  const meta = {
    defaultBranch: { "Slimefun5/Slimefun5": "experimental", "Slimefun5/InfinityLib": "experimental", "Slimefun5/Networks": "experimental" },
    branches: { "Slimefun5/Networks": ["experimental", "stable"] },
  };
  const m = buildManifest(classified, meta);
  assert.equal(m.core.defaultBranch, "experimental");
  assert.deepEqual(m.addons[0].branches, ["experimental", "stable"]);
});

test("buildManifest output is deterministic: sorted libraries, branches, and dependencies", () => {
  const classified = {
    core: { id: "slimefun", repo: "Slimefun5/Slimefun5", name: "Slimefun", kind: "core", dependencies: [], pluginName: "Slimefun" },
    libraries: [
      { id: "zeta", repo: "Slimefun5/Zeta", name: "Zeta", kind: "library", dependencies: [], pluginName: null },
      { id: "alpha", repo: "Slimefun5/Alpha", name: "Alpha", kind: "library", dependencies: [], pluginName: null },
    ],
    addons: [
      { id: "networks", repo: "Slimefun5/Networks", name: "Networks", kind: "addon", dependencies: ["zeta", "alpha"], pluginName: "Networks" },
    ],
  };
  const meta = {
    defaultBranch: { "Slimefun5/Slimefun5": "experimental", "Slimefun5/Zeta": "experimental", "Slimefun5/Alpha": "experimental", "Slimefun5/Networks": "experimental" },
    branches: { "Slimefun5/Networks": ["stable", "experimental"] },
  };
  const m = buildManifest(classified, meta);
  assert.deepEqual(m.libraries.map((l) => l.id), ["alpha", "zeta"]);
  assert.deepEqual(m.addons[0].dependencies, ["alpha", "zeta"]);
  assert.deepEqual(m.addons[0].branches, ["experimental", "stable"]);
});
