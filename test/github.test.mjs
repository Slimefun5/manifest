import { test } from "node:test";
import assert from "node:assert/strict";
import { makeClient } from "../src/github.mjs";

function stub(routes) {
  return async (url) => {
    const body = routes[url];
    if (body === undefined) return { ok: false, status: 404, json: async () => ({}), text: async () => "" };
    return { ok: true, status: 200, headers: { get: () => null }, json: async () => body };
  };
}

test("listOrgRepos maps repo full names and default branches", async () => {
  const fetchImpl = stub({
    "https://api.github.com/orgs/Slimefun5/repos?per_page=100&page=1":
      [{ full_name: "Slimefun5/Networks", default_branch: "experimental" }],
  });
  const c = makeClient({ fetchImpl });
  const repos = await c.listOrgRepos("Slimefun5");
  assert.deepEqual(repos, [{ repo: "Slimefun5/Networks", defaultBranch: "experimental" }]);
});

test("getFile returns null on 404", async () => {
  const c = makeClient({ fetchImpl: stub({}) });
  assert.equal(await c.getFile("Slimefun5/x", "plugin.yml", "main"), null);
});
