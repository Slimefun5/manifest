import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePluginYml } from "../src/pluginYml.mjs";

test("reads name and inline depend list", () => {
  const yml = 'name: Networks\nversion: 1.0\ndepend: [Slimefun, InfinityExpansion]\n';
  const r = parsePluginYml(yml);
  assert.equal(r.name, "Networks");
  assert.deepEqual(r.depend, ["slimefun", "infinityexpansion"]);
  assert.deepEqual(r.softdepend, []);
});

test("reads block-form depend and softdepend", () => {
  const yml = 'name: Supreme\ndepend:\n  - Slimefun\nsoftdepend:\n  - PlaceholderAPI\n';
  const r = parsePluginYml(yml);
  assert.equal(r.name, "Supreme");
  assert.deepEqual(r.depend, ["slimefun"]);
  assert.deepEqual(r.softdepend, ["placeholderapi"]);
});

test("missing fields yield null name and empty arrays", () => {
  const r = parsePluginYml("version: 3\n");
  assert.equal(r.name, null);
  assert.deepEqual(r.depend, []);
  assert.deepEqual(r.softdepend, []);
});
