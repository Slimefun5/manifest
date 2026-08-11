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

test("a non-404 failure throws instead of being treated as absent", async () => {
  const fetchImpl = async () => ({ ok: false, status: 403, json: async () => ({}), text: async () => "" });
  const c = makeClient({ fetchImpl });
  await assert.rejects(() => c.getFile("Slimefun5/x", "plugin.yml", "main"), /GitHub 403/);
});

test("getFile decodes base64 content on success", async () => {
  const fetchImpl = async () => ({ ok: true, status: 200, headers: { get: () => null }, json: async () => ({ content: Buffer.from("hello").toString("base64") }) });
  const c = makeClient({ fetchImpl });
  assert.equal(await c.getFile("Slimefun5/x", "plugin.yml", "main"), "hello");
});

test("listOrgRepos concatenates a full page and a following short page", async () => {
  const fullPage = Array.from({ length: 100 }, (_, i) => ({ full_name: `Slimefun5/Repo${i}`, default_branch: "main" }));
  const shortPage = [{ full_name: "Slimefun5/Last", default_branch: "main" }];
  const fetchImpl = stub({
    "https://api.github.com/orgs/Slimefun5/repos?per_page=100&page=1": fullPage,
    "https://api.github.com/orgs/Slimefun5/repos?per_page=100&page=2": shortPage,
  });
  const c = makeClient({ fetchImpl });
  const repos = await c.listOrgRepos("Slimefun5");
  assert.equal(repos.length, 101);
  assert.equal(repos[100].repo, "Slimefun5/Last");
});
