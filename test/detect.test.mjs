import { test } from "node:test";
import assert from "node:assert/strict";
import { runDetect } from "../src/detect.mjs";

test("runDetect assembles a manifest from a fake client", async () => {
  const client = {
    async listOrgRepos() {
      return [
        { repo: "Slimefun5/Slimefun5", defaultBranch: "experimental" },
        { repo: "Slimefun5/Networks", defaultBranch: "experimental" },
        { repo: "Slimefun5/InfinityLib", defaultBranch: "experimental" },
      ];
    },
    async getFile(repo, path) {
      if (repo === "Slimefun5/Slimefun5" && path === "plugin.yml") return "name: Slimefun\n";
      if (repo === "Slimefun5/Networks" && path === "plugin.yml") return "name: Networks\ndepend: [Slimefun]\n";
      if (repo === "Slimefun5/Networks" && path.startsWith("build.gradle")) return 'githubImplementation("Slimefun5:InfinityLib:1")';
      return null;
    },
    async getBranches(repo) { return [repo === "Slimefun5/Networks" ? "experimental" : "experimental"]; },
  };
  const m = await runDetect({ org: "Slimefun5", client });
  assert.equal(m.core.id, "slimefun");
  assert.deepEqual(m.addons.map((a) => a.id), ["networks"]);
  assert.deepEqual(m.libraries.map((l) => l.id), ["infinitylib"]);
});

test("runDetect refuses to emit an empty manifest", async () => {
  const client = {
    async listOrgRepos() { return []; },
    async getFile() { return null; },
    async getBranches() { return []; },
  };
  await assert.rejects(
    () => runDetect({ org: "Slimefun5", client }),
    /empty manifest/,
  );
});
