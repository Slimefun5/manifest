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
    generatedAt: "2026-08-10T00:00:00Z",
    defaultBranch: { "Slimefun5/Slimefun5": "experimental", "Slimefun5/InfinityLib": "experimental", "Slimefun5/Networks": "experimental" },
    branches: { "Slimefun5/Networks": ["experimental", "stable"] },
  };
  const m = buildManifest(classified, meta);
  assert.equal(m.generatedAt, "2026-08-10T00:00:00Z");
  assert.equal(m.core.defaultBranch, "experimental");
  assert.deepEqual(m.addons[0].branches, ["experimental", "stable"]);
});
