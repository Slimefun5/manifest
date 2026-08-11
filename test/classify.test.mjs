import { test } from "node:test";
import assert from "node:assert/strict";
import { classify } from "../src/classify.mjs";

test("classifies core, addon, and referenced library", () => {
  const repos = ["Slimefun5/Slimefun5", "Slimefun5/Networks", "Slimefun5/InfinityLib", "Slimefun5/web"];
  const files = {
    "Slimefun5/Slimefun5": { pluginYml: "name: Slimefun\n", buildGradle: null },
    "Slimefun5/Networks": {
      pluginYml: "name: Networks\ndepend: [Slimefun]\n",
      buildGradle: 'githubImplementation("Slimefun5:InfinityLib:1")',
    },
    "Slimefun5/InfinityLib": { pluginYml: null, buildGradle: "plugins { java }" },
    "Slimefun5/web": { pluginYml: null, buildGradle: null },
  };
  const r = classify(repos, files);
  assert.equal(r.core.id, "slimefun");
  assert.deepEqual(r.addons.map((a) => a.id), ["networks"]);
  assert.equal(r.addons[0].dependencies.includes("infinitylib"), true);
  assert.deepEqual(r.libraries.map((l) => l.id), ["infinitylib"]);
  assert.equal(r.libraries[0].kind, "library");
});

test("ignore-list repos never classified", () => {
  const repos = ["Slimefun5/builds", "Slimefun5/manifest"];
  const files = { "Slimefun5/builds": { pluginYml: null, buildGradle: null }, "Slimefun5/manifest": { pluginYml: null, buildGradle: null } };
  const r = classify(repos, files);
  assert.deepEqual(r.addons, []);
  assert.deepEqual(r.libraries, []);
});

test("a github dependency on core itself never appears as a phantom slimefun5 dependency", () => {
  const repos = ["Slimefun5/Networks"];
  const files = {
    "Slimefun5/Networks": {
      pluginYml: "name: Networks\ndepend: [Slimefun]\n",
      buildGradle: 'githubImplementation("Slimefun5:Slimefun5:1")',
    },
  };
  const r = classify(repos, files);
  assert.equal(r.addons[0].dependencies.includes("slimefun5"), false);
});

test("plugin.yml without a slimefun depend is still an addon when the build carries a slimefun signal", () => {
  const repos = ["Slimefun5/SensibleToolbox"];
  const files = {
    "Slimefun5/SensibleToolbox": {
      pluginYml: "name: SensibleToolbox\n",
      buildGradle: 'apply(from = "../gradle/slimefun-addon.gradle")',
    },
  };
  const r = classify(repos, files);
  assert.deepEqual(r.addons.map((a) => a.id), ["sensibletoolbox"]);
  assert.equal(r.libraries.length, 0);
});
